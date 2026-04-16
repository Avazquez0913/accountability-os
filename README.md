# AccountabilityOS

A personal accountability system that tracks daily tasks and awards screen time as a reward.

## Architecture

| Layer | Tech | Location |
|---|---|---|
| Backend API | Node.js + Express | `server/` |
| Database | Redis (Upstash) | cloud |
| Mobile App | React Native (Expo) | `accountability-app/` |
| NLP Pipeline | Python + Flask | `nlp/` |
| Deployment | Railway | `accountability-os-production.up.railway.app` |

---

## Running the Mobile App

### Prerequisites
- [Node.js](https://nodejs.org) 18+
- [Expo Go](https://expo.dev/go) installed on your phone (iOS or Android)
- Mac and phone on the **same WiFi network**

### Steps

```bash
cd accountability-app
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your phone. The app connects to the live Railway backend automatically.

---

## Running the Backend Locally (optional)

The backend is already deployed on Railway. Only do this if you need to test changes locally.

### Prerequisites
- Node.js 18+
- An [Upstash](https://upstash.com) Redis database

### Steps

```bash
npm install
```

Create a `.env` file in the project root:

```
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
NLP_API_URL=http://localhost:5001
```

Start the server:

```bash
node server/index.js
```

Server runs on `http://localhost:3000`.

---

## Running the NLP Pipeline

### Prerequisites
- Python 3.9+

### Setup

```bash
cd nlp
pip install -r requirements.txt
```

### Commands

```bash
# Start the Flask verification API (port 5001)
python api.py

# Run evaluation against the dataset
python evaluate.py

# Generate confusion matrix and score distribution charts
python visualize.py
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/status` | Current unlock state |
| GET | `/timer` | Screen time remaining |
| POST | `/webhook/github` | GitHub push webhook |
| GET | `/api/score` | Today's total score |
| GET | `/api/activities` | Today's activity log |
| POST | `/api/activities/manual` | Log workout / leetcode / job_apply |
| POST | `/api/activities/reading` | Log reading (NLP verified) |
| POST | `/api/activities/verify` | Dry-run NLP verification |
| GET | `/api/level` | Get today's difficulty level |
| POST | `/api/level` | Set today's difficulty level (0-3) |
| GET | `/api/weekly-summary` | Streak and 7-day level history |

---

## Activity Points

| Activity | Points | Screen Time |
|---|---|---|
| GitHub Push | 40 pts | 45 min |
| Workout | 30 pts | 30 min |
| LeetCode | 30 pts | 30 min |
| Job Application | 25 pts | 25 min |
| Reading (verified) | 20 pts | 20 min |

---

## Difficulty Levels

| Level | Name | Requirements |
|---|---|---|
| 0 | Off Day | Rest day |
| 1 | Survival | 1 commit, light movement, 1 career action |
| 2 | Standard | 1 push, workout, 1 career action |
| 3 | Relentless | 2+ sessions, full workout, 2 career actions |

---

## Progress Log

- Day 1: Server and webhook listener, unlockManager
- Day 2: Deployed to Railway at `accountability-os-production.up.railway.app`
- Day 3: Redis persistence via Upstash, timer system, mobile dashboard
- Day 4: Level system (L0-L3), weekly summary, manual activity logging, NLP verification pipeline, tab navigation
