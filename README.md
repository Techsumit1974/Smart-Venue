# 🏟️ SmartVenue

SmartVenue is a real-time event experience platform designed to improve crowd management and reduce wait times in large-scale venues like stadiums and arenas.

## 🚀 Features

- 🚶 Crowd density monitoring by zone
- ⏱️ Real-time gate wait time tracking
- 🍔 Concession availability & queue insights
- 🚨 Live alerts and announcements
- 📍 Smart entry recommendations
- 📊 Operations dashboard for venue management

## 🛠️ Tech Stack

- Frontend: React
- Backend: Node.js + Express
- Real-time: Socket.IO
- Deployment: Google Cloud Run (Dockerized)

## ☁️ Deployment (Cloud Run)

```bash
gcloud run deploy smartvenue \
  --source . \
  --region us-central1 \
  --allow-unauthenticated