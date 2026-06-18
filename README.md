# Humic Conference — Frontend Web Application
*A Professional Work Sample & Portfolio Project*

---

## 1. Overview

The **Humic Conference Frontend** is a modern, high-performance web application designed to handle the complex requirements of academic and professional conference management. Built with scale and user experience in mind, this project serves as a comprehensive portal that seamlessly connects event organizers, speakers, and attendees. It demonstrates production-ready engineering practices, robust state management, and a premium, accessible user interface.

## 2. Problem Statement

Modern conferences and events face several digital challenges that directly impact business growth and user satisfaction:
- **Low Organic Visibility**: Traditional Single Page Applications (SPAs) often struggle with SEO, leading to low organic traffic and higher marketing costs.
- **Brand Trust & Professionalism**: A generic or clunky UI/UX can damage brand perception, whereas a premium, well-crafted interface is critical for building trust with high-ticket clients, sponsors, and academic professionals.
- **Information Overload**: Conferences generate massive amounts of data (schedules, speaker bios, ticketing info). Users often suffer from cognitive overload if this data is not presented with clear visual hierarchy and intuitive navigation.

## 3. Solution

This application was engineered specifically to solve these industry challenges:
- **SEO-Optimized Architecture**: Leveraging Next.js Server-Side Rendering (SSR) and React Server Components (RSC) ensures that search engine crawlers can index page content instantly, significantly boosting organic website traffic.
- **Premium, Trust-Building UI/UX**: The interface features a clean, sophisticated design system using Tailwind CSS and Radix UI primitives. Subtle, interactive micro-animations guide the user's attention, creating a dynamic and professional feel that elevates the brand.
- **Cognitive Clarity**: Complex data sets (like event schedules and participant lists) are abstracted into digestible, interactive components. The layout is purposefully designed to prevent information overload while keeping essential data easily accessible.
- **Secure & Robust Integration**: Built with secure, scalable design patterns to ensure safe data handling and seamless future API integrations.

## 4. Key Features & Tech Stack

### ⚡ Key Features
- **Role-Based Dashboards**: Secure, dedicated interfaces tailored for attendees, speakers, and administrators.
- **Dynamic Event Scheduling**: Interactive agendas that adapt to user timezones and preferences.
- **Optimized Data Tables**: High-performance data visualization for administrative management (including `.xlsx` spreadsheet exports).
- **Responsive & Accessible**: Fully optimized for cross-device compatibility, adhering to strict web accessibility standards.

### 🛠️ Technology Stack
- **Core Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling & Theming**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Component Primitives**: [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Icons & Typography**: [Lucide React](https://lucide.dev/)
- **Animation & Utilities**: `tw-animate-css`, `clsx`, `tailwind-merge`, `class-variance-authority`
- **Data Handling**: `js-cookie` (for secure client-side auth state) and `xlsx` (for spreadsheet processing)
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

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **View the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.
