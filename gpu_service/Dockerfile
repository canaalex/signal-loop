FROM nvidia/cuda:12.5.0-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip3 install --no-cache-dir cudf-cu12 --extra-index-url https://pypi.nvidia.com
RUN pip3 install --no-cache-dir fastapi "uvicorn[standard]" python-multipart openpyxl pandas

COPY main.py .

ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "python3 -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
