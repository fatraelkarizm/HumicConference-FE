# Humic Conference — Frontend Web Application
*A Professional Work Sample & Portfolio Project*

---

## 1. Overview

The **Humic Conference Frontend** is a modern, enterprise-grade web application designed to handle the complex, multi-layered requirements of academic and professional conference management. Built with scale, security, and user experience at its core, this project serves as a comprehensive portal featuring a strict Role-Based Access Control (RBAC) system for Users, Admins, and Super Admins. It demonstrates production-ready engineering practices, robust state management, and a premium, accessible user interface.

## 2. Problem Statement

Organizing large-scale conferences presents several digital challenges that directly impact operational efficiency and user satisfaction:
- **Fragmented Scheduling & Room Allocation**: Managing concurrent track sessions, room capacities, and timelines often leads to overlaps and confusion for both organizers and attendees.
- **Security & Data Governance**: Lack of proper role segregation makes it difficult to safely delegate tasks to staff without exposing sensitive administrative controls.
- **Brand Trust & Cognitive Overload**: A clunky UI/UX damages brand perception. Furthermore, presenting massive amounts of schedule and speaker data often causes cognitive overload if not structured intuitively.
- **Low Organic Visibility**: Traditional Single Page Applications (SPAs) struggle with SEO, leading to low organic traffic and higher marketing costs for the event.

## 3. Solution

This application was engineered specifically to solve these industry challenges:
- **Unified & Interactive Management**: Features dynamic components like interactive Schedule Tables, Room Detail Modals, and Timeline Rows that abstract complex data into digestible, user-friendly interfaces.
- **Strict Multi-Role Architecture**: Implements dedicated, secure dashboards for `user`, `admin`, and `super-admin` roles, ensuring strict data governance and streamlined workflows.
- **Premium, Trust-Building UI/UX**: The interface features a clean, sophisticated design system using Tailwind CSS and Radix UI primitives. Subtle micro-animations guide the user's attention, creating a dynamic, professional feel that elevates the brand.
- **SEO-Optimized Architecture**: Leveraging Next.js Server-Side Rendering (SSR) and App Router ensures that search engine crawlers can index public-facing content instantly, boosting organic website traffic.

## 4. Key Features & Tech Stack

### ⚡ Key Features
- **Multi-Level RBAC Dashboards**: Secure, dedicated interfaces tailored for Super Admins (system oversight), Admins (event management), and Users (attendees/speakers).
- **Advanced Event Scheduling**: Interactive `ScheduleTable` and `TimelineRow` components that adapt to concurrent track sessions.
- **Room & Track Management**: Comprehensive CRUD capabilities for conference rooms and academic track sessions, visualized through interactive modals.
- **Data Analytics & Export**: High-performance data visualization using `StatCard` components and optimized tables (including `.xlsx` spreadsheet exports).
- **Secure Middleware**: Next.js middleware implementation for robust route protection and session validation.

### 🛠️ Technology Stack
- **Core Framework**: [Next.js 15](https://nextjs.org/) (App Router & Middleware)
- **UI Library**: [React 19](https://react.dev/)
- **Styling & Theming**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Component Primitives**: [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Icons & Typography**: [Lucide React](https://lucide.dev/)
- **Animation & Utilities**: `tw-animate-css`, `clsx`, `tailwind-merge`, `class-variance-authority`
- **Data Handling**: `js-cookie` (secure auth state) and `xlsx` (spreadsheet processing)
- **Language**: Strict TypeScript

## 5. Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/fatraelkarizm/HumicConference-FE.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd HumicConference-FE
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Environment Variables**
   Duplicate `.env.example` (if available) or create a `.env` file based on the project's required variables.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **View the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.
