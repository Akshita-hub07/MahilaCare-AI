# 🌸 MahilaCare AI — AI-Powered Women's Healthcare Companion

**MahilaCare AI** is an intelligent, compassionate, and privacy-focused digital health companion designed specifically for women's healthcare needs in India. Built with AI symptom triage, live Google Places healthcare search, distance-aware cheap ride fare models, and an intuitive OPD appointment scheduler.

---

## ✨ Key Features

- **🩺 AI Symptom Assessment & Triage**: Private AI guidance for menstrual health, PCOS/PCOD, pregnancy concerns, and general wellness.
- **🏥 Live Nearby Healthcare Discovery**: Integrated with Google Places API (New) to locate verified hospitals, maternity clinics, and diagnostic centers with distance radius filtering (2 km – 15 km).
- **⭐ Tailored Specialized Services**: Displays 2–3 distinct, specialized medical services tags on every healthcare card (e.g. High-Risk Maternity, PCOS Metabolic Panel, 3D Fetal Ultrasound).
- **🚗 Integrated Medical Transport Assistance**: Direct handoff to Uber, Ola, Rapido, Metro, and 108 Emergency Ambulance with prefilled pickup and destination locations and cheap short-distance fare models (e.g. ₹19–₹23 for Bike, ₹31–₹41 for Auto, ₹49–₹63 for Cab for 0.9 km).
- **📅 In-Card Appointment Booking & Cancellation**: OPD appointment scheduler with doctor selection, date/time slot selection, Google Calendar sync, and integrated cancellation options.
- **📄 Medical Document Explainer**: Upload lab reports or prescription images for plain-language AI summaries.
- **⚡ Dual Live Servers**: Built with Vite dev server and a standalone native Node HTTP server (`server.js`) on port `8000`.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, React Router v7, Tailwind CSS, Lucide React Icons
- **Build Tool**: Vite 5
- **APIs & Services**: Google Places API (New), Google Maps Navigation, Google Calendar API
- **Backend / Live Server**: Node.js HTTP Server (`server.js`)
- **Linting & Quality**: Oxlint

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Akshita-hub07/MahilaCare-AI.git
   cd MahilaCare-AI
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   GOOGLE_PLACES_API_KEY=your_google_places_api_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` or `http://127.0.0.1:5173/` in your browser.

5. **Run Standalone Node Production Server**:
   ```bash
   npm run build
   node server.js
   ```
   Open `http://localhost:8000/` or `http://127.0.0.1:8000/` in your browser.

---

## 📁 Project Structure

```
MahilaCare-AI/
├── api/                        # Serverless API endpoints & Google Places / Transport handlers
├── components/                 # Reusable UI components
│   ├── common/                 # Floating AI chat, modals & cards
│   ├── healthcare/             # Hospital cards, booking & transport modals
│   └── layout/                 # Desktop sidebar, mobile bottom nav, footer
├── pages/                      # Application routes (Dashboard, Nearby, AINavigator, etc.)
├── services/                   # Google Services, Transport Service & LLM Providers
├── utils/                      # Haversine distance calculator & hospital ranking engine
├── dist/                       # Compiled production build
├── server.js                   # Native Node HTTP production server
└── vite.config.js              # Vite build configuration
```

---

## 👩‍💻 Author & Repository

- **GitHub Repository**: [Akshita-hub07/MahilaCare-AI](https://github.com/Akshita-hub07/MahilaCare-AI)
- **Author**: [Akshita-hub07](https://github.com/Akshita-hub07)

---

## 🔒 Privacy & Safety Disclaimer

*MahilaCare AI is designed for informational, educational, and triage assistance purposes. It does not replace professional medical diagnosis or emergency care. For life-threatening medical emergencies, dial 108 immediately.*
