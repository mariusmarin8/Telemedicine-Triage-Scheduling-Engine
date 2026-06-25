# 🏥 Telemedicine Triage & Scheduling Engine

This repository contains a comprehensive platform designed to streamline telemedicine services, patient triage, and doctor appointments. The project is structured as a monorepo containing a Rust-based backend API, a Next.js frontend, and database initialization scripts orchestrated with Docker.

## 🏗️ Project Architecture

The platform is divided into two main applications:

### Backend API (`telemed_api`)
*   **Language:** Rust.
*   **Architecture:** Modular design with specific features separated into their own directories under `src/features/`.
*   **Core Modules:** The API handles `appointments`, `auth`, `consultations`, `diseases`, `doctors`, `history`, `patients`, `subscriptions`, and `triage`.
*   **Security:** Implements custom authentication middleware (`src/middleware/auth.rs`).

### Frontend Client (`frontend_telemedicina`)
*   **Framework:** Next.js with TypeScript (`next.config.ts`, `tsconfig.json`).
*   **Routing:** Uses the Next.js App Router (`app/`) with dedicated interfaces for different user roles.
*   **Patient Portal:** Includes a dashboard for managing profiles, associated minors (`dashboard/minors`), medical records (`dashboard/records`), and running triage assessments (`dashboard/triage`).
*   **Doctor Portal:** A separate dashboard space (`app/(public)/doctor/`) for managing patients, viewing appointment history, and handling schedules.

## ✨ Key Features

Based on the database schemas and API handlers, the system supports:
*   **🩺 Triage System:** Evaluates patient symptoms and conditions before booking (`008-triage-schema.sql`).
*   **📅 Appointment Scheduling:** Manages bookings between patients and doctors (`012-appoiments-schema.sql`).
*   **👨‍⚕️ Doctor Workflows:** Dedicated logic and UI for medical professionals to manage consultations (`014-doctor-workflow-logic.sql`).
*   **📁 Medical History:** Stores and retrieves patient records and previous consultation details (`features/history`).
*   **💳 Subscriptions:** Handles billing or membership plans for platform users (`015-subscriptions.sql`).
*   **🔐 Authentication:** Secure login and registration flows for both patients and doctors.

## 🚀 Getting Started

The repository includes a `docker-compose.yml` file and an `init-scripts/` directory containing SQL files, indicating that the database and environment can be spun up using Docker.

### Prerequisites
*   Docker & Docker Compose
*   Rust / Cargo
*   Node.js & npm

### Local Development

**1. Database Setup**
The database structure is automatically provisioned using the numbered SQL scripts located in the `init-scripts/` directory (covering core, patients, consultations, triage, etc., alongside seed data).
```bash
cd telemedicina_platform
docker-compose up -d
```

**2. Start the Backend API (Rust)**
```bash
cd telemedicina_platform/telemed_api
cargo run
```

**3. Start the Frontend UI (Next.js)**
```bash
cd telemedicina_platform/frontend_telemedicina
npm install
npm run dev
