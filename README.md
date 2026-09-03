# Brooklyn — Frontend (Gastronomic Management System)

A responsive restaurant and bar management frontend built with React and TypeScript, designed for table tracking, ordering, self-service, inventory, and administrative control.

Brooklyn allows visitors to explore a self-service kiosk to place takeaway or dine-in orders, while staff and administrators can manage tables, live kitchen displays, menu items, user permissions, and cash register shifts.

This repository contains the frontend application. The REST API is provided by a separate Spring Boot backend.

---

## Features

### Public & Customer Experience
* **Self-Service Kiosk Mode**: Interactive customer ordering interface supporting both **Takeaway** and **Dine-In** options.
* **Table Selection**: Choose dining room tables directly during order placement.
* **Menu Browsing**: Filter items by categories with real-time search functionality.
* **Dynamic Multilingual Support**: Fully localized interface supporting English (`EN`), Spanish (`ES`), and Italian (`IT`).
* **Secure Payment Simulator**: Integrated mock payment gateway supporting Card/POS, QR/Digital Pay (Yape/Plin), and Cash.

### Salón & Tables Management
* Visual dashboard for table statuses (Available vs. Occupied).
* Capacity tracking per table.
* Real-time active order monitoring per table.
* Pre-bill printing preview and checkout generation (Cash/Card with change calculation).
* Table management (add, edit, delete tables).

### Kitchen Display System (KDS)
* Real-time kitchen display for active orders.
* Order status management (Pending ➔ In Preparation ➔ Ready).
* Visual timer indicators for order preparation duration with urgency alerts.
* Audio alert notifications for incoming orders.

### Administration & Reports
* **Sales & Cash Register Dashboard**: Real-time sales statistics, daily/weekly/monthly/annual breakdowns, and top-selling product rotation.
* **End-of-Day (Z-Report)**: Shift opening/closing workflows with physical cash counting and discrepancy tracking.
* **Official Printable Reports**: Formatted downloadable and printable financial summary reports.
* **Menu Management**: Full CRUD capabilities for dishes, categories, pricing, and item availability toggles.
* **Staff & Role Management**: Manage system users, quick POS PINs, and granular permission matrices.
* **Customizable Settings**: Manage restaurant brand identity, tax rates, currencies, and custom UI color themes.

---

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React** | Component-based UI library |
| **TypeScript** | Static typing and interfaces |
| **Vite** | Fast development server and production bundler |
| **React Router** | Client-side routing and layout protection |
| **Axios** | Backend API communication |
| **Tailwind CSS** | Responsive styling, utilities, and layout scaffolding |

---

## Architecture

The source code is structured by feature responsibility:

```text
src/
├── components/     # Reusable UI features, layout elements, and icons
├── context/        # Global application state (Authentication, Language, Restaurant settings)
├── pages/          # Route-level application screens (Kiosk, Tables, Kitchen, Menu, Reports, Users, Settings, Login)
├── services/       # Encapsulated backend API communication layer
├── types/          # Shared TypeScript models (Menu, Restaurant, User, etc.)
├── App.tsx         # Main application structure and routing entry
├── main.tsx        # Application entry point
└── index.css       # Global styling and custom variables


Authentication & AuthorizationAuthentication is handled via secure credentials against the Spring Boot backend REST endpoints.User roles and permissions restrict administrative routes and POS actions.Quick POS PIN login support for restaurant floor staff.Getting StartedRequirementsNode.js (v18+ recommended)npmBrooklyn backend service running locally or remotely.InstallationClone the repository and install dependencies:Bashnpm install
Create a .env file in the project root:Snippet di codiceVITE_API_URL=http://localhost:8080/api
Start the development server:Bashnpm run dev
Access the application in your browser at:http://localhost:5173Production BuildGenerate an optimized production bundle with TypeScript type-checking:Bashnpm run build
The compiled output will be generated in the dist/ directory, ready for deployment to static hosting platforms such as Vercel or Netlify.Environment VariablesVariableDescriptionVITE_API_URLBase URL pointing to the Spring Boot backend REST API
