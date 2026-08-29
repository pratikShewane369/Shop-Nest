# 🛍️ ShopNest — Full-Stack MERN E-Commerce Platform

A professionally engineered **full-stack E-Commerce web application** built using the **MERN stack** with secure authentication, OTP-based email verification, product management, shopping cart, order management, Stripe payment integration, Cloudinary image storage, user profiles, admin dashboard, and analytics.

ShopNest is designed to provide a complete online shopping experience for customers while giving administrators a dedicated dashboard to manage products, orders, users, and business analytics.

The application follows a modern client-server architecture with the **React frontend deployed on Vercel** and the **Node.js/Express backend deployed on Render**, while **MongoDB Atlas** is used for persistent database storage.

---

## 🌐 Live Application

### 🛒 Frontend

**Live Website:**
https://shop-nest-gray.vercel.app

### ⚙️ Backend API

**Backend:**
https://shop-nest-qqld.onrender.com

**API Base URL:**
https://shop-nest-qqld.onrender.com/api

---

# 📌 Table of Contents

* [About the Project](#-about-the-project)
* [Project Highlights](#-project-highlights)
* [Features](#-features)
* [User Features](#-user-features)
* [Admin Features](#-admin-features)
* [Authentication & Security](#-authentication--security)
* [Payment Integration](#-payment-integration)
* [Cloudinary Integration](#-cloudinary-integration)
* [Email & OTP Verification](#-email--otp-verification)
* [Analytics](#-analytics)
* [Technology Stack](#-technology-stack)
* [Architecture](#-application-architecture)
* [Project Structure](#-project-structure)
* [API Structure](#-api-structure)
* [Environment Variables](#-environment-variables)
* [Local Development Setup](#-local-development-setup)
* [Frontend Setup](#-frontend-setup)
* [Backend Setup](#-backend-setup)
* [Running the Application](#-running-the-application)
* [Database](#-database)
* [Stripe Setup](#-stripe-setup)
* [Cloudinary Setup](#-cloudinary-setup)
* [Brevo Email Setup](#-brevo-email-setup)
* [Deployment](#-deployment)
* [Vercel Deployment](#-vercel-deployment)
* [Render Deployment](#-render-deployment)
* [CORS Configuration](#-cors-configuration)
* [Authentication Flow](#-authentication-flow)
* [Order Flow](#-order-flow)
* [Payment Flow](#-payment-flow)
* [Admin Workflow](#-admin-workflow)
* [API Testing](#-api-testing)
* [Error Handling](#-error-handling)
* [Future Improvements](#-future-improvements)
* [Learning Outcomes](#-learning-outcomes)
* [Contributing](#-contributing)
* [License](#-license)
* [Author](#-author)

---

# 🧾 About the Project

**ShopNest** is a full-stack E-Commerce platform developed using the MERN stack.

The objective of this project is to build a realistic production-style shopping platform rather than a simple CRUD application.

The system supports two primary types of users:

### 👤 Customer

Customers can:

* Register an account
* Verify their email using OTP
* Login securely
* Browse products
* Search products
* Add products to cart
* Update cart quantities
* Remove products from cart
* View their profile
* View previous orders
* Checkout
* Make payments using Stripe
* View order status

### 👨‍💼 Administrator

Administrators can:

* Login through the admin interface
* Manage products
* Upload product images
* Update products
* Delete products
* View users
* View orders
* Update order status
* Monitor application analytics
* Manage the overall E-Commerce platform

The project demonstrates how a modern full-stack application can be divided into a **frontend client**, **REST API backend**, **database layer**, **cloud storage**, **authentication system**, **email service**, and **payment gateway**.

---

# 🚀 Project Highlights

Some of the major engineering concepts implemented in ShopNest include:

* Full-stack MERN architecture
* React.js frontend
* Node.js backend
* Express.js REST API
* MongoDB database
* Mongoose ODM
* JWT authentication
* Password hashing with bcrypt
* OTP-based email verification
* Role-based authorization
* Protected routes
* Admin authorization
* Redux-based cart state management
* React Context API for authentication state
* Stripe payment integration
* Cloudinary product image storage
* Multer file upload handling
* Brevo transactional email API
* Order management
* User profile and order history
* Admin analytics
* CORS configuration
* Environment variable based configuration
* Vercel frontend deployment
* Render backend deployment

---

# ✨ Features

## 🔐 Authentication

ShopNest implements a complete authentication workflow.

Users can:

* Register
* Login
* Verify their account through OTP
* Receive a new OTP if their account remains unverified
* Logout
* Maintain authenticated sessions using JWT

Passwords are never stored as plain text. Passwords are securely hashed using **bcrypt** before being stored in MongoDB.

---

## 📧 OTP-Based Email Verification

When a user registers:

```text
Register
   ↓
Validate user information
   ↓
Check existing account
   ↓
Hash password
   ↓
Create user
   ↓
Generate 6-digit OTP
   ↓
Store OTP in MongoDB
   ↓
Send OTP through Brevo
   ↓
User enters OTP
   ↓
Account verified
```

The user account initially has:

```text
verified: false
```

After successful OTP verification:

```text
verified: true
```

If a user registers but never verifies their account, attempting to login generates a **new OTP** and redirects the user to the OTP verification page.

This prevents unverified users from accessing the application with a valid authentication token.

---

# 👤 User Features

## Registration

Users can create an account using:

* Full name
* Email
* Password

After registration, an OTP is sent to their email address.

---

## Login

Registered and verified users can login using their:

* Email
* Password

The backend validates the credentials and generates a JWT authentication token.

Unverified users are not allowed to proceed directly to the application.

Instead:

```text
Login
 ↓
Credentials correct
 ↓
verified === false
 ↓
Generate new OTP
 ↓
Send OTP
 ↓
Verify Account
```

---

## Product Browsing

Customers can browse available products and view:

* Product image
* Product name
* Description
* Price
* Category
* Available stock
* Product details

---

## 🔎 Product Search

The Shop page provides product searching functionality so users can quickly find products based on their requirements.

---

# 🛒 Shopping Cart

The shopping cart allows customers to:

* Add products
* Increase quantity
* Decrease quantity
* Remove products
* View cart totals
* Proceed to checkout

Cart state is managed on the frontend using **Redux**.

---

# 💳 Payment Integration

ShopNest uses **Stripe** for payment processing.

Stripe was selected to provide a secure and widely adopted payment infrastructure for handling online transactions.

The payment workflow is designed so that sensitive payment information is handled by Stripe rather than being directly stored by the application.

### Payment Flow

```text
Customer
   ↓
Add products to cart
   ↓
Checkout
   ↓
Create order/payment request
   ↓
Stripe Payment
   ↓
Payment successful
   ↓
Order confirmation
   ↓
Order stored in MongoDB
```

### Important Security Principle

The application does **not store raw card information** in MongoDB.

Stripe handles the sensitive payment information.

---

# ☁️ Cloudinary Integration

Product images are stored using **Cloudinary**.

The backend uses:

* Multer for handling uploaded files
* Cloudinary for cloud-based image storage

Product creation workflow:

```text
Admin selects image
       ↓
Frontend uploads image
       ↓
Multer processes file
       ↓
Backend uploads to Cloudinary
       ↓
Cloudinary returns image URL
       ↓
Product saved in MongoDB
       ↓
Frontend displays Cloudinary image
```

This avoids storing large image files directly inside MongoDB.

---

# 📩 Email Service

ShopNest uses **Brevo's transactional email API** for sending OTP emails.

The email service is separated into a reusable utility:

```text
authController
      ↓
sendEmail()
      ↓
Brevo API
      ↓
User Email
```

This separation keeps email-delivery logic independent from the authentication controller.

---

# 📊 Analytics

The application contains an analytics section for administrators.

The analytics system can provide information such as:

* Total users
* Total products
* Total orders
* Sales information
* Order-related statistics

This gives administrators a better overview of the application's business activity.

---

# 👨‍💼 Admin Dashboard

Administrators have access to dedicated functionality for managing the platform.

### Product Management

Admins can:

* Create products
* Upload product images
* Edit products
* Delete products
* Manage product information
* Manage product inventory

### Order Management

Admins can:

* View customer orders
* View order information
* Update order status
* Monitor order processing

### User Management

Admins can:

* View registered users
* View account information
* Monitor user activity

---

# 🔒 Authentication & Security

ShopNest uses several security mechanisms.

## JWT Authentication

After successful login, the backend generates a JWT:

```text
JWT
 ↓
Stored on client
 ↓
Sent with protected API requests
 ↓
Backend verifies token
 ↓
Request authorized
```

Protected API requests use:

```http
Authorization: Bearer <token>
```

---

## Password Hashing

Passwords are hashed using:

```text
bcryptjs
```

The application never intentionally stores users' plain-text passwords.

---

## Role-Based Authorization

Users have roles such as:

```text
user
admin
```

Admin-only operations are protected using authorization middleware.

For example:

```text
Normal User
   ↓
Product browsing
Cart
Orders
Profile

Admin
   ↓
All user capabilities
+
Product management
Order management
User management
Analytics
```

---

# 🧱 Application Architecture

ShopNest follows a client-server architecture.

```text
                    ┌──────────────────────┐
                    │       Browser        │
                    │      React App       │
                    └──────────┬───────────┘
                               │
                               │ HTTPS / REST API
                               ↓
                    ┌──────────────────────┐
                    │    Express Server    │
                    │      Node.js         │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ↓                 ↓                 ↓
      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
      │   MongoDB    │  │  Cloudinary  │  │    Brevo     │
      │   Database   │  │    Images    │  │    Emails    │
      └──────────────┘  └──────────────┘  └──────────────┘
                              
                         ┌──────────────┐
                         │    Stripe    │
                         │   Payments   │
                         └──────────────┘
```

---

# 🛠 Technology Stack

## Frontend

* React.js
* React Router
* Redux
* Redux Toolkit
* Context API
* JavaScript
* HTML5
* CSS3
* Axios / Fetch API
* React Toastify
* Create React App

---

## Backend

* Node.js
* Express.js
* REST APIs
* JWT
* bcryptjs
* CORS
* dotenv
* Nodemailer-compatible email architecture
* Brevo API
* Multer

---

## Database

* MongoDB
* Mongoose

---

## Cloud Services

* Vercel — Frontend hosting
* Render — Backend hosting
* MongoDB Atlas — Database
* Cloudinary — Image storage
* Brevo — Transactional email
* Stripe — Payment processing

---

# 📁 Project Structure

The repository follows a separated frontend/backend structure.

```text
ShopNest/
│
├── frontend/
│   │
│   ├── public/
│   │   ├── Laptop.webp
│   │   ├── ShopNestLogo.png
│   │   └── my_image.jpeg
│   │
│   ├── src/
│   │   │
│   │   ├── admin/
│   │   │   └── ...
│   │   │
│   │   ├── components/
│   │   │   └── ...
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyOTP.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Checkout.jsx
│   │   │   └── ...
│   │   │
│   │   ├── redux/
│   │   │   └── ...
│   │   │
│   │   ├── styles/
│   │   │   └── ...
│   │   │
│   │   ├── App.jsx
│   │   └── index.js
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── backend/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── analyticsController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── ...
│   │
│   ├── models/
│   │   ├── userModel.js
│   │   ├── productModel.js
│   │   ├── orderModel.js
│   │   └── otpModel.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── analyticsRoutes.js
│   │
│   ├── utils/
│   │   └── sendEmail.js
│   │
│   ├── index.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

---

# 🔌 API Structure

The backend provides RESTful API endpoints.

Base URL:

```text
https://shop-nest-qqld.onrender.com/api
```

## Authentication

```text
POST /auth/register
POST /auth/login
POST /auth/verify
```

---

## Products

```text
GET    /products
GET    /products/:id
POST   /products
PUT    /products/:id
DELETE /products/:id
```

Some product operations require administrator authorization.

---

## Orders

```text
POST /orders
GET  /orders/myorders
GET  /orders
PUT  /orders/:id
```

Protected routes require authentication.

---

## Payments

```text
POST /payments/...
```

Payment endpoints communicate with Stripe to process transactions.

---

## Analytics

```text
GET /analytics/...
```

Analytics endpoints are protected and intended for administrator access.

> Exact endpoint names may change as the application evolves. Refer to the corresponding route files in `backend/routes/` for the current API implementation.

---

# 🔐 Environment Variables

Environment variables are used to keep sensitive credentials outside the source code.

**Never commit `.env` files containing real credentials to GitHub.**

---

# Backend `.env`

Example:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=your_stripe_secret_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

BREVO_API_KEY=your_brevo_api_key
MAIL_FROM=your_verified_sender_email

FRONTEND_URL=http://localhost:3000
```

For production, change the frontend URL to your deployed Vercel URL.

Example:

```env
FRONTEND_URL=https://shop-nest-gray.vercel.app
```

---

# Frontend `.env`

The React frontend uses:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production:

```env
REACT_APP_API_URL=https://shop-nest-qqld.onrender.com/api
```

Because Create React App exposes variables beginning with `REACT_APP_` to the browser, **never put private secrets such as Stripe secret keys, MongoDB credentials, JWT secrets, Cloudinary API secrets, or Brevo private API keys inside the frontend `.env`.**

Only public/client-safe configuration should be exposed to the frontend.

---

# 💻 Local Development Setup

## Prerequisites

Before running ShopNest locally, install:

* Node.js
* npm
* MongoDB or MongoDB Atlas account
* Git

You also need accounts/credentials for:

* Stripe
* Cloudinary
* Brevo

---

# 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

Move into the project:

```bash
cd ShopNest
```

---

# 2️⃣ Backend Installation

Navigate to backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create:

```text
backend/.env
```

Add the required environment variables.

---

# 3️⃣ Frontend Installation

Open another terminal.

Navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env
```

Add:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

# ▶️ Running the Backend

From the backend directory:

```bash
npm start
```

For development:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

unless another port is specified through the environment.

---

# ▶️ Running the Frontend

From the frontend directory:

```bash
npm start
```

The React application normally runs on:

```text
http://localhost:3000
```

---

# 🔄 Running Frontend and Backend Together

Open two terminals:

### Terminal 1

```bash
cd backend
npm run dev
```

### Terminal 2

```bash
cd frontend
npm start
```

Then open:

```text
http://localhost:3000
```

---

# 🗄️ Database

ShopNest uses **MongoDB** with **Mongoose**.

The backend establishes the database connection through:

```text
backend/config/db.js
```

MongoDB stores information such as:

* Users
* Products
* Orders
* OTP records

---

# 👤 User Data

A typical user contains information such as:

```text
name
email
password
role
verified
```

The password is stored in hashed form.

The `verified` field determines whether the user's email/account verification has been completed.

---

# 🛍️ Product Data

Products contain information such as:

```text
name
description
price
category
stock
image
```

Product images are stored in Cloudinary while the corresponding image URL is stored with the product data.

---

# 📦 Order Data

Orders maintain information about:

* Customer
* Products
* Quantities
* Total amount
* Payment information
* Order status
* Creation date

---

# 💳 Stripe Setup

To enable Stripe payments:

1. Create a Stripe account.
2. Open the Stripe Developer Dashboard.
3. Obtain your API credentials.
4. Add the secret key to the backend environment variables.

Example:

```env
STRIPE_SECRET_KEY=your_stripe_secret_key
```

**Never expose `STRIPE_SECRET_KEY` in the React frontend.**

The frontend communicates with your backend, and the backend communicates with Stripe.

---

# ☁️ Cloudinary Setup

Create a Cloudinary account and obtain:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Add them to the backend environment.

The backend handles image uploads and sends them to Cloudinary.

---

# 📧 Brevo Setup

ShopNest uses Brevo for transactional OTP emails.

Create a Brevo account and configure a verified sender.

Then add:

```env
BREVO_API_KEY=your_brevo_api_key
MAIL_FROM=your_verified_sender_email
```

The backend communicates with Brevo through its API.

This keeps the email implementation independent from the authentication controller.

---

# ☁️ Deployment

ShopNest uses separate deployments for frontend and backend.

```text
                  GitHub
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
       Vercel                Render
          ↓                   ↓
     React Frontend      Express Backend
                              │
             ┌────────────────┼───────────────┐
             ↓                ↓               ↓
          MongoDB         Cloudinary        Brevo
                             
                         Stripe Payments
```

---

# ▲ Vercel Deployment

## Step 1 — Push Frontend to GitHub

Make sure the frontend source code is committed.

```bash
git add .
git commit -m "Prepare frontend for deployment"
git push
```

---

## Step 2 — Import Repository into Vercel

Create a new Vercel project and connect your GitHub repository.

If frontend and backend are inside the same repository, configure the frontend directory as the project root:

```text
frontend
```

---

## Step 3 — Configure Build Settings

For Create React App:

### Build Command

```bash
npm run build
```

### Output Directory

```text
build
```

### Install Command

```bash
npm install
```

---

## Step 4 — Add Frontend Environment Variable

In Vercel Environment Variables:

```env
REACT_APP_API_URL=https://shop-nest-qqld.onrender.com/api
```

After changing environment variables, redeploy the frontend.

---

# 🚀 Render Deployment

The backend is deployed as a Render Web Service.

## Build Command

```bash
npm install
```

## Start Command

```bash
npm start
```

The backend's `package.json` contains:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

Render automatically provides the production `PORT` environment variable.

The backend uses:

```js
const PORT = process.env.PORT || 5000;
```

---

# 🔑 Render Environment Variables

Add all backend secrets inside:

```text
Render
→ Web Service
→ Environment
→ Environment Variables
```

Example:

```env
NODE_ENV=production
MONGO_URI=...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
BREVO_API_KEY=...
MAIL_FROM=...
FRONTEND_URL=https://shop-nest-gray.vercel.app
```

Never commit these values into GitHub.

---

# 🔐 CORS Configuration

Because the frontend and backend are deployed separately, CORS must allow communication between them.

The backend supports the frontend origin:

```text
https://shop-nest-gray.vercel.app
```

During local development, the backend can also allow:

```text
http://localhost:3000
http://127.0.0.1:3000
```

The frontend and backend must use the correct deployed URLs.

---

# 🔄 Authentication Flow

The authentication system works as follows.

## Registration

```text
User enters:
Name
Email
Password
      ↓
POST /api/auth/register
      ↓
Backend checks existing user
      ↓
Password hashed using bcrypt
      ↓
User created
verified = false
      ↓
Generate OTP
      ↓
OTP stored in MongoDB
      ↓
OTP sent using Brevo
      ↓
Frontend redirects to Verify OTP
```

---

# 🔢 OTP Verification

```text
User enters OTP
      ↓
POST /api/auth/verify
      ↓
Find OTP record
      ↓
Validate OTP
      ↓
Find user
      ↓
verified = true
      ↓
Delete OTP
      ↓
Generate JWT
      ↓
Frontend stores authentication state
      ↓
User enters application
```

---

# 🔁 Unverified User Login

ShopNest also handles the case where a user registers but doesn't complete OTP verification.

```text
User already exists
       ↓
Registration again
       ↓
"User already exists"
       ↓
User tries Login
       ↓
Email + password verified
       ↓
verified === false
       ↓
Generate NEW OTP
       ↓
Save NEW OTP
       ↓
Send through Brevo
       ↓
Redirect to Verify OTP
       ↓
OTP verified
       ↓
verified = true
       ↓
JWT generated
       ↓
Home page
```

This prevents unverified accounts from bypassing email verification.

---

# 🛒 Order Flow

The order lifecycle follows:

```text
Browse Products
      ↓
Add to Cart
      ↓
Review Cart
      ↓
Checkout
      ↓
Payment
      ↓
Stripe
      ↓
Payment Successful
      ↓
Order Created
      ↓
Order Stored in MongoDB
      ↓
Admin Processes Order
      ↓
Order Status Updated
```

---

# 💳 Payment Flow

The payment architecture separates the frontend from Stripe's secret credentials.

```text
React Frontend
      ↓
Checkout
      ↓
Backend Payment API
      ↓
Stripe
      ↓
Payment Processing
      ↓
Payment Result
      ↓
Backend
      ↓
Order Confirmation
```

The Stripe secret key remains exclusively on the backend.

---

# 👨‍💼 Admin Workflow

The administrator workflow is:

```text
Admin Login
    ↓
JWT Authentication
    ↓
Role Verification
    ↓
Admin Dashboard
    ↓
┌─────────────┬─────────────┬─────────────┐
│             │             │             │
Products     Orders        Users       Analytics
│             │             │             │
CRUD        Manage       Monitor       Business
Operations  Status       Accounts      Statistics
```

---

# 🧪 API Testing

The backend APIs can be tested using tools such as:

* Postman
* Thunder Client
* Insomnia
* Browser for GET endpoints

Example backend URL:

```text
https://shop-nest-qqld.onrender.com/api
```

Example:

```http
GET /api/products
```

Authentication-protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 🐛 Error Handling

The application implements error handling across the frontend and backend.

Backend errors are returned using HTTP status codes such as:

```text
200 → Success
201 → Resource Created
400 → Bad Request
401 → Unauthorized
403 → Forbidden
404 → Not Found
500 → Server Error
```

The frontend displays relevant errors using toast notifications where appropriate.

---

# 🔐 Security Considerations

The project follows several security practices:

* Passwords are hashed using bcrypt.
* JWT is used for authentication.
* Admin routes require authorization.
* Sensitive environment variables are not committed.
* Stripe secret keys remain on the backend.
* Cloudinary API secrets remain on the backend.
* Brevo API keys remain on the backend.
* MongoDB credentials remain on the backend.
* CORS is configured for trusted frontend origins.
* Users must verify their accounts before receiving normal login access.

---

# 📱 Responsive Frontend

The frontend is designed to provide a usable experience across different screen sizes, including:

* Desktop
* Laptop
* Tablet
* Mobile

The UI contains dedicated pages and components for shopping, authentication, checkout, profiles, and administration.

---

# 🧩 Key React Concepts Used

The frontend demonstrates practical React concepts including:

* Functional components
* React Hooks
* `useState`
* `useEffect`
* `useContext`
* React Router
* Context API
* Redux
* Redux Toolkit
* Protected routes
* Form handling
* API integration
* Environment variables
* Component-based architecture

---

# 🧠 Backend Concepts Demonstrated

The backend demonstrates:

* REST API design
* Express middleware
* MVC-style organization
* MongoDB integration
* Mongoose models
* JWT authentication
* Authorization middleware
* Password hashing
* File uploads
* Cloudinary integration
* Stripe integration
* Transactional email APIs
* Environment configuration
* Error handling
* CORS
* Async/await

---

# 📈 Future Improvements

Possible future improvements include:

### Product Features

* Product reviews and ratings
* Wishlist
* Product filtering
* Sorting
* Pagination
* Related products
* Product recommendations

### User Features

* Forgot password
* Password reset through email
* Profile editing
* Address management
* Multiple saved addresses
* Improved order tracking

### Admin Features

* Advanced analytics dashboard
* Sales charts
* Revenue reports
* Inventory alerts
* Bulk product upload
* User management controls

### Technical Improvements

* Redis caching
* API rate limiting
* Advanced logging
* Automated testing
* CI/CD pipeline
* Docker containerization
* Kubernetes deployment
* Improved API documentation
* Automated database backups

---

# 🎯 Learning Outcomes

Building ShopNest provided practical experience with full-stack software development.

Major areas covered include:

### Frontend Development

* Building reusable React components
* Managing application state
* Creating responsive interfaces
* Integrating REST APIs
* Managing authentication state

### Backend Development

* Designing REST APIs
* Implementing authentication
* Implementing authorization
* Working with MongoDB
* Handling file uploads
* Integrating third-party services

### Cloud & Deployment

* Deploying React applications using Vercel
* Deploying Node.js APIs using Render
* Managing production environment variables
* Configuring CORS
* Debugging production deployment issues

### Third-Party Integrations

* Stripe payment processing
* Cloudinary image management
* Brevo transactional emails

---

# 🧑‍💻 Development Philosophy

ShopNest was developed with the goal of following real-world software engineering practices rather than treating the project as a simple academic CRUD application.

The project focuses on:

```text
Separation of Concerns
        +
Reusable Components
        +
Secure Authentication
        +
RESTful APIs
        +
Cloud Integrations
        +
Environment-Based Configuration
        +
Production Deployment
```

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

### Fork the repository

```bash
git fork
```

### Clone your fork

```bash
git clone <your-repository-url>
```

### Create a branch

```bash
git checkout -b feature/your-feature
```

### Make changes

Implement your changes and test them locally.

### Commit

```bash
git add .
git commit -m "Add your feature"
```

### Push

```bash
git push origin feature/your-feature
```

Then open a Pull Request.

---

# ⚠️ Important Notes

This project is intended for educational and portfolio purposes.

Before deploying a production E-Commerce platform, additional production-grade measures should be considered, including:

* Payment webhook verification
* Rate limiting
* Stronger input validation
* Security headers
* Comprehensive automated testing
* Monitoring
* Logging
* Database backups
* HTTPS enforcement
* Production-grade secrets management

---

# 📜 License

This project is available for educational and portfolio purposes.

You may modify and extend the project according to your requirements.

---

# 👨‍💻 Author

## Pratik Shewane

Computer Engineering Student
Full-Stack MERN Developer

### GitHub

https://github.com/pratikShewane369

### LinkedIn

https://www.linkedin.com/in/pratik-shewane/

---

# ⭐ Support

If you found this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

# 🏁 Final Overview

ShopNest represents a complete full-stack E-Commerce application combining:

```text
                         SHOPNEST
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    FRONTEND             BACKEND             DATABASE
        │                   │                   │
     React.js            Node.js             MongoDB
     Redux               Express              Mongoose
     Context API         REST APIs
        │                   │
        └───────────┬───────┘
                    │
        ┌───────────┼────────────┐
        │           │            │
     Stripe      Cloudinary    Brevo
     Payments     Images       Emails
        │           │            │
        └───────────┼────────────┘
                    │
               Cloud Hosting
              ┌─────┴─────┐
              │           │
           Vercel       Render
          Frontend      Backend
```

The project demonstrates the complete journey from **frontend development and backend API design to database management, authentication, third-party integrations, payment processing, cloud storage, transactional email, and production deployment**.

**ShopNest — Building a complete shopping experience with the MERN stack. 🛍️**

```
