# 420Rims — Ghana's Premier Car Marketplace

A full-stack web application for buying and selling vehicles across Ghana. Built by TechSphere, a division of Sevinity Holdings, Accra.

---

## Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React (Create React App)            |
| Backend     | Node.js + Express                   |
| Database    | MongoDB Atlas (Mongoose)            |
| Images      | Cloudinary                          |
| Auth        | JWT (role-based: user/dealer/admin) |
| Payments    | Paystack (integration-ready)        |
| Frontend hosting | Vercel                         |
| Backend hosting  | Render                         |

---

## Project Structure

```
420rims-app/
├── client/          React frontend
└── server/          Node.js + Express backend
```

---

## Running Locally

### 1. Clone and install

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure environment variables

```bash
# In server/
cp .env.example .env
# Fill in all values (see Environment Variables below)

# In client/
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### 3. Start the backend

```bash
cd server
npm run dev        # nodemon — auto-restarts on change
# or
npm start          # node — production
```

### 4. Start the frontend

```bash
cd client
npm start          # runs on http://localhost:3000
```

---

## Environment Variables

### server/.env

| Variable                | Description                                      |
|-------------------------|--------------------------------------------------|
| `PORT`                  | Server port (default: 5000)                      |
| `MONGO_URI`             | MongoDB Atlas connection string                  |
| `JWT_SECRET`            | Long random string for signing tokens            |
| `JWT_EXPIRES_IN`        | Token expiry e.g. `7d`                           |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name                       |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                               |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                            |
| `CLIENT_URL`            | Frontend origin for CORS e.g. `http://localhost:3000` |

### client/.env

| Variable              | Description                                  |
|-----------------------|----------------------------------------------|
| `REACT_APP_API_URL`   | Backend API base URL e.g. `http://localhost:5000/api` |

---

## Seeding the Admin User

Run once after connecting to MongoDB:

```bash
cd server
npm run seed
```

This creates:
- **Email:** admin@420rims.com
- **Password:** Admin@420Rims2026

Change the password immediately after first login. Safe to run multiple times — skips if admin already exists.

---

## User Roles

| Role    | Access                                              |
|---------|-----------------------------------------------------|
| `user`  | Browse listings, submit enquiries, save listings    |
| `dealer`| Create/manage listings, view enquiries, edit profile|
| `admin` | Full platform management — users, dealers, listings |

---

## Key API Routes

```
POST   /api/auth/register               Register buyer
POST   /api/auth/register/dealer        Register dealer
POST   /api/auth/login                  Login (all roles)
GET    /api/auth/me                     Get current user

GET    /api/listings                    Browse listings (public)
GET    /api/listings/:id                Listing detail + view increment
POST   /api/listings                    Create listing (dealer)
POST   /api/listings/:id/enquiry        Submit enquiry (public/user)

GET    /api/dealers/stats               Dealer dashboard stats
GET    /api/dealers/enquiries           Dealer enquiries
PUT    /api/dealers/profile             Update dealer profile

GET    /api/admin/stats                 Platform stats
PUT    /api/admin/dealers/:id/approve   Approve dealer
PUT    /api/admin/listings/:id/approve  Approve listing
DELETE /api/admin/listings/:id          Hard delete listing
```

---

## Deployment Notes

**Backend (Render):**
- Set all environment variables in the Render dashboard
- Set `NODE_ENV=production` — disables stack traces in error responses
- Build command: `npm install`
- Start command: `npm start`

**Frontend (Vercel):**
- Set `REACT_APP_API_URL` to your Render backend URL
- Build command: `npm run build`
- Output directory: `build`

---

*420Rims · A TechSphere / Sevinity Holdings product · Accra, Ghana · 2026*
