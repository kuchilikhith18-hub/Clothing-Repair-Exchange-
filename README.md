# 🧵 Clothing Repair Exchange

> A full-stack MERN platform connecting community members with clothing repair needs to skilled volunteers. Built to encourage textile reuse, reduce waste, and build sustainable local communities.

---

## ✨ Features

- **Smart Skill Matching**: Volunteers offer help on repair requests; request owners review and accept/reject offers with automated conflict resolution.
- **Role System**: Support for Requesters, Volunteers, and Dual-role members.
- **Repair Categories**: Encompasses clothing types (jackets, jeans, shirts, dresses, etc.) and repair types (zipper repair, button replacement, patching, seam stitching, darning, alterations).
- **Volunteer Directory**: Filter community volunteers by specific skills and day availability.
- **Responsive Design**: Mobile-first interface designed with an eco-conscious forest green aesthetic.
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing and input validation.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Axios, Custom Modular CSS (Mobile-responsive)
- **Backend**: Node.js, Express.js REST API, Express Validator, Helmet, CORS
- **Database**: MongoDB Atlas / Mongoose ODM

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- MongoDB Atlas account or local MongoDB instance

### 2. Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Installation
Install dependencies for both client and server:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 4. Running the Application
From the root directory:
```bash
# Run both backend and frontend concurrently
npm run dev

# Or run separately:
npm run server    # Backend on http://localhost:5000
npm run client    # Frontend on http://localhost:3000
```

---

## 📁 Project Structure

```
├── client/                 # React Frontend
│   ├── public/
│   └── src/
│       ├── components/     # Navbar, Footer, RequestCard, VolunteerCard, MatchCard, etc.
│       ├── context/        # AuthContext (JWT session management)
│       ├── pages/          # Home, Browse, CreateRequest, Detail, Dashboard, Profile, etc.
│       ├── services/       # Axios API client
│       └── App.js
├── server/                 # Express Backend
│   ├── config/             # Database connection with DNS fallback
│   ├── controllers/        # Auth, Request, Volunteer, and Match business logic
│   ├── middleware/         # Auth verification, Validator, Error handling
│   ├── models/             # Mongoose schemas (User, RepairRequest, Match)
│   ├── routes/             # REST API routes
│   └── server.js           # Express app entry point
└── package.json            # Root configuration and run scripts
```

---

## 📄 License
This project is open-source under the MIT License.

