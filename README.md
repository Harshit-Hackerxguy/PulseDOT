# 🎵 Pulse.

A full-stack Spotify clone featuring a beautiful, modern, and responsive user interface with a robust backend architecture.

## ✨ Features

- **Modern UI/UX**: Stunning interface inspired by Spotify, built with Tailwind CSS.
- **Responsive Design**: Flawless experience across desktop, tablet, and mobile devices.
- **State Management**: Efficient and predictable global state managed by Zustand.
- **Secure Authentication**: JWT-based authentication with bcrypt for secure password hashing.
- **Robust Backend**: Node.js and Express backend with strong type safety using TypeScript and Zod.
- **Database**: PostgreSQL for reliable and relational data storage.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (`pg`)
- **Validation**: Zod
- **Security**: Helmet, CORS, JWT, bcryptjs

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd PulseDOT
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Configure your .env file based on .env.example (if available)
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   # From the root directory
   npm install
   # Configure your .env file based on .env.example
   npm run dev
   ```

## 📜 License
This project is licensed under the MIT License.
