#  Auction  - Extended Edition

A full-featured real-time auction platform with bidding system, automatic auction closing, and image support.

## ✨ Features

-  JWT Authentication & Authorization
-  Role-Based Access Control (User & Admin)
-  Complete CRUD for Lots and Categories
-  Real-time Bidding System
-  Automatic Auction Closing
-  Image Upload Support
-  Bid History Tracking
-  Live Countdown Timers

##  Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Cron jobs for auto-closing

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** - [Download]
- **MongoDB**  - [Download](https://www.mongodb.com/try/download/community) or MongoDB Atlas



## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/ynagi-1/Final-Project-_WEB2.git
cd (project name)
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mongoose
- jsonwebtoken
- bcryptjs
- cors
- dotenv

### Step 3: Create Environment File

Create a `.env` file in the root directory:

Edit `.env` file with your settings:

```env
MONGODB_URI={mongodb://localhost:27017/auction_db} or {use mongodb Atlas}
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=3000
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a long, random string for security!


## ▶️ Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## 🌐 Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

## 👤 First Time Setup

### 1. Register First User (Auto-Admin)

The **first registered user** automatically becomes an **Admin**.

1. Click "Register" tab
2. Fill in:
   - **Name:** Admin User
   - **Email:** admin@test.com
   - **Password:** 123456
3. Click "Register"

You're now logged in as Admin! 🎉

### 2. Create Categories (Admin Only)

1. Scroll to "Add New Category" section
2. Create a category:
   - **Name:** Electronics
   - **Description:** Electronic devices and gadgets
3. Click "Add Category"

### 3. Create Your First Lot (Admin Only)

1. Scroll to "Add New Lot" section
2. Fill in:
   - **Title:** Vintage Camera
   - **Starting Bid:** 100
   - **Description:** Beautiful vintage camera from 1960s
   - **Category:** Electronics
   - **End Date:** Select a future date (e.g., tomorrow)
   - **Bid Increment:** 10
   - **Image:** Paste URL or upload file
3. Click "Add Lot"

### 4. Test Bidding (as Regular User)

1. Logout (top right)
2. Register a new user:
   - **Name:** John Doe
   - **Email:** user@test.com
   - **Password:** 123456
3. Find the lot you created
4. Click "Place Bid"
5. Enter amount (minimum shown)
6. Click "Place Bid"

## 📁 Project Structure

```
auction-app-v2/
├── models/                     # MongoDB Schemas
│   ├── User.js                # User model with authentication
│   ├── Lot.js                 # Lot model with bidding system
│   └── Category.js            # Category model
│
├── controllers/               # Business Logic
│   ├── authController.js     # Login, register, getMe
│   ├── lotController.js      # CRUD + bidding functions
│   └── categoryController.js # Category management
│
├── routes/                    # API Routes
│   ├── auth.js               # /api/auth/*
│   ├── lots.js               # /api/lots/*
│   └── categories.js         # /api/categories/*
│
├── middleware/               # Middleware Functions
│   ├── auth.js              # JWT verification & RBAC
│   └── errorHandler.js      # Error handling
│
├── utils/                    # Utility Functions
│   └── cronJobs.js          # Auto-close expired auctions
│
├── config/                   # Configuration
│   └── database.js          # MongoDB connection
│
├── public/                   # Frontend
│   └── index.html           # Single-page application
│
├── server.js                # Entry point
├── package.json             # Dependencies
├── .env                     # Environment variables (create this)
├── .env.example            # Example env file
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 📚 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login user |
| GET | `/auth/me` | ✅ | Get current user |

### Lots

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/lots` | ❌ | Any | Get all lots |
| GET | `/lots/:id` | ❌ | Any | Get lot by ID |
| POST | `/lots` | ✅ | Admin | Create lot |
| PUT | `/lots/:id` | ✅ | Admin | Update lot |
| DELETE | `/lots/:id` | ✅ | Admin | Delete lot |

### Bidding

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/lots/:id/bid` | ✅ | User | Place bid |
| GET | `/lots/:id/bids` | ❌ | Any | Get bid history |
| GET | `/lots/my/bids` | ✅ | User | Get my bids |
| POST | `/lots/:id/close` | ✅ | Admin | Close auction |

### Categories

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/categories` | ❌ | Any | Get all categories |
| GET | `/categories/:id` | ❌ | Any | Get category by ID |
| POST | `/categories` | ✅ | Admin | Create category |
| PUT | `/categories/:id` | ✅ | Admin | Update category |
| DELETE | `/categories/:id` | ✅ | Admin | Delete category |

## 🧪 Testing with Postman

### Import Collection

1. Download `Auction_API_Extended.postman_collection.json`
2. Open Postman
3. Click "Import" → Select file
4. Collection appears in sidebar

### Test Flow

1. **Register** → Get token
2. **Login** → Get token
3. **Create Category** (admin) → Get category ID
4. **Create Lot** (admin) → Get lot ID
5. **Place Bid** (user) → Success
6. **Get Bid History** → See all bids

## 🔄 Automatic Features

### Auto-Closing Auctions

The system automatically checks every **1 minute** for expired auctions:

```javascript
// In console you'll see:
✅ Auto-closed 2 expired lot(s) at 2025-02-05T12:00:00.000Z
```

When an auction ends:
- ✅ Status changes to `closed`
- ✅ Winner is determined (last/highest bidder)
- ✅ No more bids can be placed

### Live Countdown Timers

Frontend updates every second:
```
⏱️ 2d 15h 30m     (More than 1 day)
⏱️ 0h 45m 23s     (Less than 1 day)
⏰ Auction Ended  (Expired)
```

## 🎯 User Roles & Permissions

### Regular User
- ✅ View all lots
- ✅ View categories
- ✅ View bid history
- ✅ **Place bids on active lots**
- ✅ **View own bids**
- ❌ Create/edit/delete lots
- ❌ Create/edit/delete categories

### Admin
- ✅ All user permissions
- ✅ **Create lots**
- ✅ **Update lots**
- ✅ **Delete lots**
- ✅ **Close auctions manually**
- ✅ **Create categories**
- ✅ **Update categories**
- ✅ **Delete categories**
- ❌ Place bids (cannot bid on own lots)

## 🔐 Bidding Rules

1. **Minimum bid:** Current bid + bid increment
2. **Active only:** Can only bid on active auctions
3. **Before deadline:** Cannot bid after end date
4. **Not own lot:** Creator cannot bid on their own lot
5. **Authenticated:** Must be logged in

## 🖼️ Image Support

### Upload Methods

**Option 1: URL**
```javascript
{
  "images": ["https://example.com/camera.jpg"]
}
```

**Option 2: File Upload (Base64)**
```javascript
{
  "images": ["data:image/png;base64,iVBORw0KGgoAAAANS..."]
}
```

**Option 3: Multiple Images**
```javascript
{
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```
### JWT Token Errors

1. **"Invalid token"**
   - Token might be expired (7 days)
   - Login again to get new token

2. **"No token provided"**
   - Make sure to include `Authorization: Bearer TOKEN` header
   - Check that token is saved in localStorage
