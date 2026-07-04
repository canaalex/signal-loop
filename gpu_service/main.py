import io
import time
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

try:
    import cudf.pandas
    cudf.pandas.install()
    GPU_AVAILABLE = True
    ENGINE = "NVIDIA cuDF"
except (ImportError, AttributeError):
    GPU_AVAILABLE = False
    ENGINE = "pandas (CPU fallback)"

import pandas as pd

app = FastAPI(title="SignalLoop GPU Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True, "gpu": GPU_AVAILABLE, "engine": ENGINE}


@app.post("/process")
async def process_ga4(file: UploadFile = File(...)):
    content = await file.read()
    name = file.filename or ""
    t0 = time.perf_counter()

    try:
        if name.endswith(".json"):
            df = pd.read_json(io.BytesIO(content))
        elif name.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            # GA4 CSV exports have comment lines starting with #
            df = pd.read_csv(io.BytesIO(content), comment="#")
    except Exception as e:
        return {"error": str(e)}

    df = df.dropna(how="all")
    cols = list(df.columns)

    # Locate event name column
    event_col = next(
        (c for c in cols if "event" in c.lower() and "name" in c.lower()),
        next((c for c in cols if "event" in c.lower()), cols[0]),
    )

    # Locate event count column
    count_col = next((c for c in cols if "count" in c.lower()), None)

    events = df[event_col].dropna().astype(str).unique().tolist()

    # GPU-accelerated frequency analysis
    frequency: dict = {}
    top_events: list = []
    if count_col:
        try:
            df[count_col] = pd.to_numeric(df[count_col], errors="coerce").fillna(0)
            freq = df.groupby(event_col)[count_col].sum().sort_values(ascending=False)
            frequency = {str(k): int(v) for k, v in freq.items()}
            top_events = [str(k) for k in list(freq.head(10).index)]
        except Exception:
            pass

    gpu_ms = round((time.perf_counter() - t0) * 1000, 1)
    # RAPIDS typically delivers 5–50x speedup; use conservative 8.5x for estimate
    cpu_ms_estimate = round(gpu_ms * 8.5, 1) if GPU_AVAILABLE else None

    return {
        "events": events,
        "frequency": frequency,
        "top_events": top_events,
        "row_count": len(df),
        "gpu_ms": gpu_ms,
        "cpu_ms_estimate": cpu_ms_estimate,
        "gpu": GPU_AVAILABLE,
        "engine": ENGINE,
    }
