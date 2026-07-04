# SignalLoop

AI-powered product analytics tool that analyzes product screens, detects missing tracking events, and generates a ready-to-implement event list for engineering teams.

Built for the Google x NVIDIA Hackathon.

---

## What it does

1. **Upload Flow** — Upload screenshots of your product screens
2. **Recommended Events** — Gemini AI analyzes the screens and suggests analytics events to track, with properties and priority
3. **Upload Events** — Upload your existing events from GA4, Mixpanel, Amplitude, or any platform to compare coverage
4. **Recommendations** — Get behavioral insights, friction points, and next steps

GPU-accelerated data processing via NVIDIA cuDF (RAPIDS) on Google Cloud Run.

---

## Tech Stack

- **Frontend** — Vue 3, TypeScript, Vite, Tailwind CSS v4
- **Backend** — Node.js, Express, TypeScript
- **AI** — Google Gemini (via Vertex AI / Agent Platform)
- **GPU** — NVIDIA cuDF (RAPIDS) on Cloud Run with L4 GPU
- **Storage** — Google Cloud Storage, BigQuery
- **Deploy** — Google Cloud Run

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/canaalex/signal-loop.git
cd signal-loop
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run locally

```bash
npm run dev
```

---

## Deploy to Cloud Run

### Frontend + Backend

```bash
gcloud run deploy signalloop \
  --source . \
  --region asia-southeast1 \
  --set-env-vars "GEMINI_API_KEY=your_key,GPU_SERVICE_URL=your_gpu_url" \
  --allow-unauthenticated
```

### GPU Service (NVIDIA cuDF)

```bash
cd gpu_service
gcloud run deploy signalloop-gpu \
  --source . \
  --region asia-southeast1 \
  --gpu=1 \
  --gpu-type=nvidia-l4 \
  --no-cpu-throttling \
  --min-instances=1 \
  --allow-unauthenticated
```

---

## Project Structure

```
src/
├── components/
│   ├── UploadFlowStep.vue
│   ├── RecommendedEventsStep.vue
│   ├── UploadEventsStep.vue
│   └── RecommendationsStep.vue
├── views/
│   ├── HomePage.vue
│   ├── ProjectsPage.vue
│   └── ProjectPage.vue
├── types/
│   └── project.ts
└── router/
    └── index.ts
gpu_service/
├── main.py       (FastAPI + cuDF)
└── Dockerfile
```
