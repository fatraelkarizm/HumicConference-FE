# Humic Conference Frontend

A robust frontend application for the Humic Conference management system, designed to handle conference events, participant registrations, and administrative tasks seamlessly.

## 🎯 Problem Statement
Managing academic and professional conferences often involves scattered tools for registration, scheduling, paper submissions, and attendee communication. This project aims to centralize the conference experience by providing an intuitive, centralized portal for organizers, speakers, and attendees, reducing administrative overhead and improving overall event engagement.

## ✨ Key Features
- **User Authentication**: Secure login and registration for attendees, speakers, and admins.
- **Event Scheduling**: Interactive calendar and agenda views for conference sessions.
- **Paper Submission**: Seamless upload and management for academic paper submissions.
- **Admin Dashboard**: Comprehensive control panel for organizers to manage participants, sessions, and content.
- **Responsive Design**: Fully optimized experience across desktop, tablet, and mobile devices.

## 💻 Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript

## 📸 Screenshot / Demo

## 🚀 Installation & Running Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/fatraelkarizm/HumicConference-FE.git
   ```
2. Navigate into the project directory:
   ```bash
   cd HumicConference-FE
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🏗️ Brief Architecture
The application follows a modern component-driven architecture using Next.js App Router:
- `src/app/`: Contains the main routing, pages, and layouts.
- `src/components/`: Reusable UI components (buttons, modals, form inputs).
- `src/lib/`: Utility functions and shared helpers.
- **State Management**: React Context & Hooks (for local state) with server-side rendering optimizations.
- **Styling Strategy**: Tailwind CSS utility classes combined with CSS variables for dynamic theming and consistent design language.

## 📊 Project Status

## 🌐 Deployment
