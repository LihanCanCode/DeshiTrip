# 🇧🇩 DesiTrip

<img src="apps/web/public/icons/icon-512x512.png" alt="DesiTrip Icon" width="96" />

**DesiTrip** is a bilingual travel companion that keeps tour squads organised, uncovers curated Bangladeshi destinations, and syncs shared expenses with offline resilience.

![DesiTrip Banner](https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1200&h=400&fit=crop&auto=format)

---

## 🚀 Features

-   **Squad Management**: Create and name travel crews, generate invite codes, and keep tabs on who has joined—online or offline.
-   **Smart Settlements**: Log who paid, auto-split amounts across members and guests, and stage settlements for later sync when you reconnect.
-   **Offline-Ready Dashboard**: Recent groups, expenses, and summaries stay cached on device so dashboards, totals, and quick actions remain usable without coverage.
-   **Recommendation Engine**: Curated spotlight cards and budgeting insights for popular Bangladeshi destinations, paired with map overviews and tour plans.
-   **Secure Accounts**: Email-based authentication with JWT sessions, Argon2 hashing, and middleware guards across protected routes.
-   **Internationalization**: Seamlessly toggles between English (`en`) and Bengali (`bn`) copy, including the offline shell and PWA prompts.

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

---
*Built with ❤️ for Bangladesh Tourism*
