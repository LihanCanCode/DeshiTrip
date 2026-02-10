# 🇧🇩 DesiTrip

<p align="center">
	<img src="apps/web/public/icons/icon-512x512.png" alt="DesiTrip Icon" width="120" />
	<br />
	<strong>DesiTrip</strong>
</p>

DesiTrip is a bilingual travel companion that keeps tour squads organised, uncovers curated Bangladeshi destinations, and syncs shared expenses with offline resilience.

**[Live Demo: deshi-trip.vercel.app](https://deshi-trip.vercel.app)**

> [!TIP]
> **The "Wow" Moment**: Switch the app to Bengali and use the AI Planner to see real-time localized intelligence.

---

## 💡 The Pitch

### 📍 The Problem
Tourists in Bangladesh face three major hurdles: **Information Fragmentation**, **Connectivity Gaps** in remote spots (like the Hill Tracts or Sundarbans), and **Language Barriers** when using generic global travel tools that don't understand local nuances or the Bengali language.

### 🛠️ The Approach
We built DesiTrip as a **Monorepo** powerhouse to ensure high-speed development and synchronized data models. By combining **Google Gemini's LLM capabilities** with a robust **Offline-First PWA architecture**, we created a tool that is both "Smart" and "Reliable" regardless of where the trail leads.

### ✅ The Solution
**DesiTrip** is a unified bilingual travel companion. It captures expenses offline, generates custom Bengali itineraries using AI, and provides a curated gateway to the 64 districts of Bangladesh—all while keeping your travel squad in sync.

---

## 💎 Regional Edge
Unlike global travel apps, DesiTrip is engineered for the Bangladeshi ecosystem:
- **Local Economy Logic**: The AI doesn't just suggest "cheap" hotels; it understands the price delta between a Non-AC bus and a Green Line Scania, or the seasonal cost of a boat in the Sundarbans.
- **Bengali-First Intelligence**: Our LLM implementation handles code-switching (Bengali/English) fluently, making it accessible to both urban Gen-Z and local guides.

---

## 🚀 Features

### 🤖 AI-Powered Trip Intelligence
- **Dynamic Itinerary Generator**: Custom, budget-optimized travel plans across 64 districts of Bangladesh, powered by Google Gemini.
- **Contextual Recommendation Engine**: Curated spotlight cards for gems like Sajek, Sylhet, and Sundarbans, featuring regional food guides and "hidden spot" alerts.
- **Smart Budgeting**: Tailored insights for domestic travel, including local transport (bus/launch/train) cost estimations.
- **AI Smart Scanning (OCR)**: Instantly extract entries from travel memos and paper receipts using Gemini-powered vision. Auto-populates description, amount (with Bengali-to-English conversion), and category.

### 👥 Squad & Expense Management
- **Squad Hub**: Create travel crews with unique invite codes. Manage members and "phantom guests" (for non-app users) with ease.
- **Fractional Settlements**: Log expenses in BDT, auto-split costs, and track "who owes whom" with a staged settlement system.
- **Seamless Sync**: Log expenses on a remote trail in the Hill Tracts; the app auto-syncs your data the moment you hit a 4G/Wi-Fi zone.

### 📶 Built for the Trail (Offline-First)
- **Resilient Dashboard**: Your recent groups, expense summaries, and summaries are cached on-device for 100% usability without cellular coverage.
- **Offline Actions**: Queue new expenses and view itineraries even in deep-forest or high-altitude zones.

### 🏆 Gamification & Explorer Prestige
- **Badge Collection**: Earn unique achievement badges based on your destinations (e.g., *Beach King* for Cox's Bazar, *Cloud Chaser* for Sajek).
- **Prestige Milestones**: Tiered rewards for frequent travelers, from *Rising Traveler* (5 tours) up to *National Legend* (20 tours).
- **XP System**: Global experience points system that tracks your journey across Bangladesh and adds a layer of competitive prestige to your profile.

### 👤 Profile & Social Identity
- **Personalized Showcase**: Dedicated profile page displaying your badge trophy room, total XP, and personalized travel bio.
- **Identity Sync**: Custom avatars (powered by Cloudinary) and display names that stay consistent across the Community Feed.
- **Community Stories**: Share your journeys and hidden gems with the community. Posts and comments now feature real-time integrated user avatars.

### 🛡️ Safety & SOS Alerts
- **Hold-to-Trigger SOS**: A high-stakes 3-second hold mechanism to prevent accidental emergency signals.
- **Automatic Voice Capture**: Every SOS activation automatically records a 10-second voice message of the user's surroundings.
- **Real-Time Group Broadcast**: Instantly transmits the user's live location and voice message to all group members via Socket.io.
- **Fail-Safe Audio**: Built-in Web Audio API synthesis ensures emergency alert sounds play even on restricted browsers or low-bandwidth connections.

### 🔒 Security & Localization
- **Enterprise-Grade Auth**: Secure login via JWT, Argon2 password hashing, and protected API middleware.
- **Native Experience**: Full localization support for English (en) and Bengali (bn). The AI planner intelligently responds in your preferred language.

---

## 🛠️ The "Devpost Secret Sauce" (Technical Edge)

### 🔄 Sync Conflict & Concurrency Management
In a squad environment, two users might log expenses offline simultaneously. DeshiTrip utilizes a **Last-Write-Wins (LWW) with Version Tracking** strategy.
- **Outbox Sequencing**: Every offline action is timestamped and assigned a client-side UUID.
- **Atomic Merging**: When connectivity returns, the backend processes reconcile the outbox vs the current server state, ensuring that balance calculations remain accurate even with hundreds of concurrent offline updates.

### 🎮 The Retention Engine (Business Viability)
DeshiTrip isn't a "one-off" utility; it's a social travel platform.
- **XP Ecosystem**: Every tour, badge, and community interaction builds a permanent prestige score.
- **Prestige Milestones**: By rewarding long-term progression (e.g., *National Legend* at 20 tours), we encourage users to keep the app installed for years, not just for a single weekend trip. This high retention logic is key for true platform scalability.

### ⚙️ Overcoming Technical Challenges
**Challenge**: Guaranteeing SOS voice delivery in 2G/Low-Bandwidth zones (common in the Hill Tracts).
**Solution**: We implemented a **Heartbeat-Monitor & Chunked Buffer** system. If a socket connection flickers, the app buffers the voice recordings locally and re-attempts broadcast using a prioritized message-queue. This ensures that a life-saving SOS alert never gets "dropped" due to a spotty 4G signal.

---

## 🛠️ Technical Notes & API Integrations

### 🧠 Intelligence Suite
- **Google Gemini 2,5-Flash**: Orchestrates the AI Planner and **Smart OCR Scanner**. We utilize specialized system prompts to enforce **locale-aware generation** (Bengali responses with English JSON keys) and multi-modal vision to parse handwritten travel memos.
- **OpenRouteService (ORS) API**: Handles real-time route calculations, distance estimation, and travel time for the "Spot Explore" feature.

### 📡 Real-Time & Media Engineering
- **Cloudinary Integration**: Handles optimized storage and delivery of high-resolution user avatars and trip memory photos.
- **Social Synthesis (Tour Wrapped)**: Uses `html-to-image` to generate dynamic JPEGs from React components, paired with the **Web Share API** for native mobile story sharing.
- **Socket.io Sync**: A robust bi-directional communication layer handles instant SOS alerts across sessions. Includes polling fallbacks and 10MB payload capacity for voice data.
- **Web Audio API Fallback**: Uses square-wave oscillators to synthesize emergency distractors locally, bypassing browser autoplay restrictions and missing asset errors.
- **MediaRecorder API**: Safely captures high-quality audio chunks across mobile and desktop browsers during emergency events.

### 🌐 Internationalization (i18n) Strategy
- Built with **next-intl**, the app maintains a unified locale state across the client, server, and AI requests. 
- **Dynamic AI Localization**: Unlike standard translation, our AI engine dynamically shifts its entire persona and language output based on the user's selected locale.

### 🔌 API Architecture
- **Centralized Axios Interceptor**: Implemented in `@/utils/api.ts` to provide seamless, unified communication between the Vercel-hosted frontend and the Render-hosted backend.
- **Auto-Auth Injection**: Automatically attaches JWT Bearer tokens to every outgoing request, ensuring consistent security without manual header management in components.

### 🌩️ Offline & PWA Engineering
- **Workbox Power**: Uses `next-pwa` with a custom **Cache-First** strategy for core UI assets and **Stale-While-Revalidate** for dynamic discovery data.
- **Sync Engine**: We implemented an **Optimistic UI pattern**. When a user logs an expense in a "dead zone," the app updates the UI instantly and queues the API request in an IndexedDB-backed outbox. The Service Worker then monitors the sync event to flush the queue once connectivity is restored.
- **Client-Side Vault**: Critical travel data (squad info, itinerary) is persisted on-device, allowing the app to remain functional in zero-connectivity zones like the Sundarbans.

## 🛠️ Tech Stack

### Monorepo Structure
Built using **TurboRepo** and **PNPM** workspaces for efficient scaling.

### Frontend (`apps/web`)
-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS, Framer Motion
-   **State/Data**: React Query, React Hook Form, Zod
-   **Maps**: Leaflet / React-Leaflet
-   **Share/Media**: html-to-image, Web Share API
-   **I18n**: next-intl
-   **PWA**: next-pwa (@ducanh2912/next-pwa) with Workbox

### Backend (`apps/api`)
-   **Runtime**: Node.js & Express.js
-   **AI Engine**: [Google Gemini Pro/Flash](https://ai.google.dev/) (Text & Vision)
-   **Database**: MongoDB (Mongoose ODM)
-   **Media Storage**: Cloudinary (via multer-storage-cloudinary)
-   **Auth**: JWT & Argon2 hashing
-   **API Security**: Helmet, CORS

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

---

## 📂 Project Structure

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

## 🔮 What's Next?
- **Ticketing Integration**: Real-time integration with Shohoz/GoZayaan APIs for direct bus and launch bookings.
- **AR Guide**: Augmented Reality landmark scanning to provide historical context for heritage sites like Mahasthangarh or Ahsan Manzil.

---

*Built with ❤️ for Bangladesh Tourism*
