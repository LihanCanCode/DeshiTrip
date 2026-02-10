# 🇧🇩 DesiTrip

<p align="center">
	<img src="apps/web/public/icons/icon-512x512.png" alt="DesiTrip Icon" width="120" />
	<br />
	<strong>DesiTrip</strong>
</p>

DesiTrip is a bilingual travel companion that keeps tour squads organised, uncovers curated Bangladeshi destinations, and syncs shared expenses with offline resilience.

**[Live Demo: deshi-trip.vercel.app](https://deshi-trip.vercel.app)**

---

## � The Pitch

### 📍 The Problem
Tourists in Bangladesh face three major hurdles: **Information Fragmentation**, **Connectivity Gaps** in remote spots (like the Hill Tracts or Sundarbans), and **Language Barriers** when using generic global travel tools that don't understand local nuances or the Bengali language.

### 🛠️ The Approach
We built DesiTrip as a **Monorepo** powerhouse to ensure high-speed development and synchronized data models. By combining **Google Gemini's LLM capabilities** with a robust **Offline-First PWA architecture**, we created a tool that is both "Smart" and "Reliable" regardless of where the trail leads.

### ✅ The Solution
**DesiTrip** is a unified bilingual travel companion. It captures expenses offline, generates custom Bengali itineraries using AI, and provides a curated gateway to the 64 districts of Bangladesh—all while keeping your travel squad in sync.

---

## �🚀 Features

### 🤖 AI-Powered Trip Intelligence
- **Dynamic Itinerary Generator**: Custom, budget-optimized travel plans across 64 districts of Bangladesh, powered by Google Gemini.
- **Contextual Recommendation Engine**: Curated spotlight cards for gems like Sajek, Sylhet, and Sundarbans, featuring regional food guides and "hidden spot" alerts.
- **Smart Budgeting**: Tailored insights for domestic travel, including local transport (bus/launch/train) cost estimations.

### 👥 Squad & Expense Management
- **Squad Hub**: Create travel crews with unique invite codes. Manage members and "phantom guests" (for non-app users) with ease.
- **Fractional Settlements**: Log expenses in BDT, auto-split costs, and track "who owes whom" with a staged settlement system.
- **Seamless Sync**: Log expenses on a remote trail in the Hill Tracts; the app auto-syncs your data the moment you hit a 4G/Wi-Fi zone.

### 📶 Built for the Trail (Offline-First)
- **Resilient Dashboard**: Your recent groups, expense summaries, and summaries are cached on-device for 100% usability without cellular coverage.
- **Offline Actions**: Queue new expenses and view itineraries even in deep-forest or high-altitude zones.

### 🔒 Security & Localization
- **Enterprise-Grade Auth**: Secure login via JWT, Argon2 password hashing, and protected API middleware.
- **Native Experience**: Full localization support for English (en) and Bengali (bn). The AI planner intelligently responds in your preferred language.

## 🛠️ Tech Stack

### Monorepo Structure
Built using **TurboRepo** and **PNPM** workspaces for efficient scaling.

### Frontend (`apps/web`)
-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS, Framer Motion
-   **State/Data**: React Query, React Hook Form, Zod
-   **Maps**: Mapbox GL / React Map GL
-   **I18n**: next-intl
-   **PWA**: next-pwa with Workbox for caching and offline fallbacks

### Backend (`apps/api`)
-   **Runtime**: Node.js & Express.js
-   **AI Engine**: [Google Gemini Pro](https://ai.google.dev/)
-   **Database**: MongoDB (Mongoose ODM)
-   **Auth**: JWT & Argon2 hashing
-   **API Security**: Helmet, CORS
-   **Documentation**: Swagger/OpenAPI (prepared)

---

## 📦 Installation & Setup

### Prerequisites
-   Node.js (v18+)
-   PNPM (v9+)
-   MongoDB (Local or AtlasURI)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/deshitrip.git
cd deshitrip
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Configuration
Create a `.env` file in `apps/api` and `apps/web` based on the examples.

**`apps/api/.env`**
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/deshitrip
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_gemini_api_key_here
client_url=http://localhost:3000
```

### 4. Run Development Server
This command starts both the Frontend and Backend concurrently using TurboRepo.
```bash
pnpm dev
```
-   **Frontend**: [http://localhost:3000](http://localhost:3000)
-   **Backend**: [http://localhost:8000](http://localhost:8000)

---

## �️ Technical Notes & API Integrations

### 🧠 Intelligence Suite
- **Google Gemini 1.5 Pro**: Orchestrates the AI Planner. We utilize specialized system prompts to enforce **locale-aware generation** (Bengali responses with English JSON keys) and enforce budget-friendly traveling constraints specific to the Bangladeshi economy.
- **OpenRouteService (ORS) API**: Handles real-time route calculations, distance estimation, and travel time for the "Spot Explore" feature.

### 🌐 Internationalization (i18n) Strategy
- Built with **next-intl**, the app maintains a unified locale state across the client, server, and AI requests. 
- **Dynamic AI Localization**: Unlike standard translation, our AI engine dynamically shifts its entire persona and language output based on the user's selected locale.

### 🔌 API Architecture
- **Centralized Axios Interceptor**: Implemented in `@/utils/api.ts` to provide seamless, unified communication between the Vercel-hosted frontend and the Render-hosted backend.
- **Auto-Auth Injection**: Automatically attaches JWT Bearer tokens to every outgoing request, ensuring consistent security without manual header management in components.

### 🌩️ Offline & PWA Engineering
- **Workbox Power**: Uses `next-pwa` with a custom **Cache-First** strategy for core UI assets and **Stale-While-Revalidate** for dynamic discovery data.
- **Client-Side Vault**: Critical travel data (squad info, itinerary) is persisted on-device, allowing the app to remain functional in zero-connectivity zones like the Sundarbans.

---

## �📂 Project Structure

```
├── apps/
│   ├── web/                 # Next.js Frontend Application
│   │   ├── src/app/         # App Router Pages
│   │   ├── messages/        # i18n JSON files
│   │   └── public/          # Static Assets
│   │
│   ├── api/                 # Express Backend API
│       ├── src/controllers/ # Logic Layer
│       ├── src/models/      # Mongoose Schemas (User, Group, Expense)
│       └── src/routes/      # Endpoint Definitions
│
├── packages/                # Shared internal packages
└── README.md                # You are here
```

## 🤝 Contribution
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
Distributed under the MIT License.

---
*Built with ❤️ for Bangladesh Tourism*
