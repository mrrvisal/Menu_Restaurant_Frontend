# 🍽️ Khmer Restaurant Menu — Vue 3 + Node.js + MySQL

A full-stack restaurant menu app converted from the original single-file HTML to a proper project with:

- **Frontend**: Vue 3 + Vite + Pinia + Vue Router
- **Backend**: Node.js + Express + JWT auth + Multer file upload
- **Database**: MySQL

---

## 📁 Project Structure

```
khmer-restaurant/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js     # Login endpoint
│   │   ├── foodsController.js    # CRUD for menu items
│   │   ├── categoriesController.js
│   │   └── ordersController.js   # Place & manage orders
│   ├── middleware/
│   │   └── auth.js               # JWT middleware
│   ├── routes/
│   │   └── index.js              # All API routes
│   ├── uploads/                  # Uploaded food images
│   ├── .env.example              # Copy to .env and fill in
│   ├── database.sql              # DB setup + seed data
│   ├── package.json
│   └── server.js                 # Express app entry
│
└── frontend/
    ├── src/
    │   ├── assets/main.css       # Global CSS variables & base styles
    │   ├── components/
    │   │   ├── FoodCard.vue      # Reusable food card (public + admin modes)
    │   │   ├── CartModal.vue     # Shopping cart + order placement
    │   │   └── FoodFormModal.vue # Add / edit food form
    │   ├── stores/
    │   │   ├── auth.js           # Pinia: JWT auth state
    │   │   ├── foods.js          # Pinia: foods + categories
    │   │   └── cart.js           # Pinia: shopping cart
    │   ├── views/
    │   │   ├── MenuView.vue      # Public menu page
    │   │   ├── LoginView.vue     # Admin login
    │   │   └── AdminView.vue     # Admin dashboard (foods + orders)
    │   ├── router/index.js       # Vue Router with auth guard
    │   ├── App.vue
    │   └── main.js
    ├── index.html
    ├── package.json
    └── vite.config.js            # Proxy /api → localhost:3001
```

---

## 🚀 Setup & Running

### 1. MySQL Database

```bash
mysql -u root -p < backend/database.sql
```

This creates the `khmer_restaurant` database with tables and sample menu data.

### 2. Backend

```bash
cd backend
cp .env.example .env          # Edit DB_PASSWORD, JWT_SECRET
npm install
npm run dev                   # http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

---

## 🔐 Admin Login

Default credentials (from seeded `admins` table):
- **Username**: `admin`
- **Password**: `1234`

To change: update `ADMIN_PASSWORD` in `.env` and re-hash with:
```bash
node -e "const b=require('bcryptjs'); b.hash('yourNewPassword',10).then(console.log)"
```
Then update the hash in `database.sql` or directly in the DB.

---

## 🌐 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | — | Admin login → JWT |
| GET | /api/categories | — | List categories |
| GET | /api/foods | — | List foods (filter by ?category=&search=) |
| GET | /api/foods/:id | — | Get single food |
| POST | /api/foods | ✅ | Add food (multipart/form-data) |
| PATCH | /api/foods/:id | ✅ | Update food |
| PATCH | /api/foods/:id/status | ✅ | Toggle available/unavailable |
| DELETE | /api/foods/:id | ✅ | Delete food |
| POST | /api/orders | — | Place order |
| GET | /api/orders | ✅ | List all orders |
| GET | /api/orders/:id | ✅ | Order detail with items |
| PATCH | /api/orders/:id/status | ✅ | Update order status |

---

## ✨ Features

**Public (Customers)**
- Browse menu by category tabs
- Search foods in real time
- View food detail popup
- Add to cart, adjust quantities
- Place order (saved to MySQL)

**Admin**
- Secure login with JWT
- Add / edit / delete menu items
- Upload food images
- Toggle item availability
- View & update order status (pending → preparing → done)
