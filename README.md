# IMobile V1 - E-commerce Website

A modern, full-stack e-commerce application built with **Vite + React + Express + Supabase**.

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with database-backed sessions
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router

## 📋 Features

- ✅ User Authentication (Sign In/Sign Up)
- ✅ Session Management (Database-backed, persists on refresh)
- ✅ Product Catalog & Search
- ✅ Shopping Cart
- ✅ User Profile Management
- ✅ Admin Dashboard
- ✅ Order Management
- ✅ Responsive Design (Mobile & Desktop)

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rashmithaRKL/IMobileV1.git
   cd IMobileV1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Server Configuration
   PORT=4000
   NODE_ENV=development
   ```

4. **Run database migrations**
   
   Go to Supabase Dashboard → SQL Editor and run:
   - `supabase/migrations/add_user_sessions.sql`

5. **Start the development servers**
   
   **Option 1: Use the provided scripts**
   ```bash
   # Windows
   start-dev.bat
   
   # Or PowerShell
   start-dev.ps1
   ```
   
   **Option 2: Manual start**
   ```bash
   # Terminal 1: Start backend server
   npm run dev:server
   
   # Terminal 2: Start frontend dev server
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## 📦 Build for Production

```bash
# Build frontend and backend
npm run build

# Start production server
npm run start:server
```

## 📁 Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities, stores, Supabase clients
│   ├── server/         # Express backend
│   │   └── api/        # API routes
│   └── main.tsx        # Entry point
├── supabase/
│   └── migrations/     # Database migrations
├── public/             # Static assets
└── dist/               # Build output (ignored in git)
```

## 🔐 Authentication Flow

1. User signs in via frontend
2. Backend validates credentials with Supabase
3. Session stored in database (`user_sessions` table)
4. Access token stored in `localStorage` for client-side validation
5. Session persists across page refreshes via database lookup

## 🗄️ Database Schema

Key tables:
- `user_sessions` - Stores user authentication sessions
- `profiles` - User profile information
- `products` - Product catalog
- `orders` - Customer orders
- `cart_items` - Shopping cart items

## 🧪 Testing

Run the Supabase configuration check:
```bash
node check-supabase-config.js
```

## 📝 Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run dev:server` - Start Express backend server
- `npm run build` - Build for production
- `npm run start:server` - Start production server
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### Session not persisting after refresh?
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env`
- Verify `user_sessions` table exists (run migration)
- Check browser console for authentication errors

### Backend connection errors?
- Ensure backend server is running on port 4000
- Check CORS configuration in `src/server/index.ts`
- Verify environment variables are set correctly

## 📄 License

This project is private and proprietary.

## 👤 Author

**Rashmitha RKL**
- GitHub: [@rashmithaRKL](https://github.com/rashmithaRKL)

---

**Note**: This project was migrated from Next.js to Vite + Express for better performance and flexibility.
