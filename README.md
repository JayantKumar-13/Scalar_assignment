# ShopiMart

A full-stack e-commerce application inspired by Flipkart-style shopping flows. The project covers product discovery, product detail view, cart management, wishlist management, checkout, order placement, order history, and optional email notifications on order placement.

This repository was built for a full-stack assignment that asked for:

- a React-based frontend
- a Node.js backend
- a MySQL database
- a shopping experience similar to Flipkart

The original assignment phrased the stack in a way people often describe as "MERN-style frontend/backend separation", but because the database requirement is MySQL, this implementation intentionally uses:

- React + Vite on the frontend
- Express.js on the backend
- MySQL as the relational database
- Sequelize models/migrations/seeders for schema management
- `mysql2` raw SQL in controllers for direct query control

## 1. Project Goals

The main goal of this project is to provide an end-to-end e-commerce workflow that feels realistic enough for evaluation and code review.

Core capabilities implemented:

- product listing page
- search by product name / brand / short description
- filter by category
- sorting by price, rating, and newest
- product detail page with image carousel, highlights, and specifications
- add to cart
- buy now
- cart quantity update and item removal
- checkout with shipping address form
- order placement
- order confirmation page

Bonus capabilities implemented:

- responsive UI
- login / signup
- demo auto-login
- wishlist
- order history
- optional order confirmation email hook

## 2. Tech Stack

### Frontend

- React 18
- Vite
- React Router DOM
- Context API for shared state

### Backend

- Node.js
- Express.js
- JWT authentication
- Nodemailer for optional email notifications

### Database

- MySQL
- Sequelize ORM for models, migrations, and seeders
- `mysql2/promise` for direct SQL execution in runtime controllers

### Tooling

- Nodemon
- Concurrently
- Sequelize CLI

## 3. High-Level Design

This application follows a classic client-server architecture.

### High-Level Components

1. Frontend SPA
2. Backend REST API
3. MySQL database
4. Optional SMTP provider for emails

### Logical Flow

```text
User
  ->
React Frontend (Vite SPA)
  ->
API Client Wrapper
  ->
Express REST API
  ->
Auth Middleware / Controllers
  ->
MySQL Database
```

For order placement, the flow is slightly more involved:

```text
Checkout Form
  ->
POST /api/orders
  ->
Validate shipping data
  ->
Read cart with row locks
  ->
Check stock
  ->
Insert order
  ->
Insert order items
  ->
Decrement stock
  ->
Clear cart
  ->
Commit transaction
  ->
Attempt email send
  ->
Return order confirmation
```

### Why This Design

This design was chosen for a few practical reasons:

- React gives a fast, component-driven single-page user experience.
- Express keeps backend routing simple and easy to explain.
- MySQL gives a strong relational structure for categories, products, carts, wishlists, and orders.
- Raw SQL in controllers gives direct control over joins, aggregation, and transaction-heavy flows like order placement.
- Sequelize migrations and seeders make the schema reproducible and interview-friendly.

## 4. Architecture Decisions

### 4.1 Why MySQL Instead of MongoDB

The assignment explicitly allowed MySQL/PostgreSQL and evaluated schema quality. This project uses MySQL because the domain is highly relational:

- one category has many products
- one product has many images
- one user has many cart items
- one user has many wishlist items
- one user has many orders
- one order has many order items

Using MySQL also makes constraints, joins, uniqueness, and transactional order placement straightforward.

### 4.2 Why Use Both Raw SQL And Sequelize

This project intentionally uses both:

- raw SQL for runtime controllers
- Sequelize for models, migrations, and seeders

Reason:

- Raw SQL gives precise control over complex joins and transaction logic.
- Sequelize makes schema setup reproducible across systems.
- This hybrid approach is practical for assignments where both development speed and schema clarity matter.

### 4.3 Authentication Strategy

Authentication is JWT-based:

- user logs in or signs up
- server signs a token
- token is stored in `localStorage`
- frontend sends token in `Authorization: Bearer <token>`
- backend resolves the user through auth middleware

The project also supports demo auto-login because the assignment note said the evaluator should not be blocked by authentication.

## 5. Repository Structure

```text
.
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── middleware/
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seeders/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── scripts/
│   ├── .env.example
│   ├── .sequelizerc
│   └── package.json
├── database/
│   └── schema.sql
├── docs/
│   ├── project-artifact.html
│   └── project-artifact.pdf
└── package.json
```

## 6. Frontend Design

### 6.1 Frontend Routing

The frontend routes are defined in `client/src/App.jsx`.

Routes:

- `/` -> Home page
- `/products/:slug` -> Product detail page
- `/cart` -> Shopping cart
- `/checkout` -> Checkout page
- `/orders` -> Order history
- `/orders/:orderNumber/success` -> Order detail / confirmation
- `/wishlist` -> Wishlist page
- `/login` -> Login / signup page
- `*` -> Not found page

### 6.2 Frontend State Management

The frontend uses two main contexts.

#### AuthContext

File: `client/src/context/AuthContext.jsx`

Responsibilities:

- load session from `localStorage`
- verify token with `/api/auth/me`
- perform demo login when appropriate
- expose `login`, `register`, `demoLogin`, and `logout`
- hold current user and token

#### ShopContext

File: `client/src/context/ShopContext.jsx`

Responsibilities:

- load categories
- load cart for authenticated user
- load wishlist for authenticated user
- expose cart and wishlist mutation helpers
- expose utility function `isWishlisted`

### 6.3 Frontend Components

#### Layout

File: `client/src/components/Layout.jsx`

Purpose:

- renders the application shell
- keeps header and footer persistent across pages
- renders route content through `<Outlet />`

#### Header

File: `client/src/components/Header.jsx`

Purpose:

- navigation bar
- search bar
- cart count indicator
- wishlist count indicator
- auth shortcuts

Important behavior:

- syncs search input with URL query params
- redirects search to home route with `q` parameter

#### CategoryRail

File: `client/src/components/CategoryRail.jsx`

Purpose:

- displays categories as selectable pills
- updates active category on the home page

#### ProductCard

File: `client/src/components/ProductCard.jsx`

Purpose:

- reusable catalog tile
- product image, title, brand, rating, price, discount
- wishlist toggle
- add-to-cart action

### 6.4 Frontend Pages

#### HomePage

File: `client/src/pages/HomePage.jsx`

Responsibilities:

- fetch products using current query params
- support search
- support category filter
- support sort selection
- show grid of products
- show loading and empty states

#### ProductPage

File: `client/src/pages/ProductPage.jsx`

Responsibilities:

- fetch one product by slug
- render gallery
- show brand, price, stock, highlights, and specifications
- support add to cart
- support buy now
- support wishlist toggle

#### CartPage

File: `client/src/pages/CartPage.jsx`

Responsibilities:

- show cart items
- update quantity
- remove items
- show pricing summary
- navigate to checkout

#### CheckoutPage

File: `client/src/pages/CheckoutPage.jsx`

Responsibilities:

- collect shipping details
- prefill name and phone when user is available
- submit order request
- refresh cart after successful order
- redirect to order confirmation

#### OrdersPage

File: `client/src/pages/OrdersPage.jsx`

Responsibilities:

- fetch and render all past orders
- show order number, status, total, and creation date

#### OrderSuccessPage

File: `client/src/pages/OrderSuccessPage.jsx`

Responsibilities:

- fetch one order by order number
- show shipping address
- show payment summary
- show line items

#### WishlistPage

File: `client/src/pages/WishlistPage.jsx`

Responsibilities:

- show saved products
- move items to cart
- remove items from wishlist

#### LoginPage

File: `client/src/pages/LoginPage.jsx`

Responsibilities:

- login flow
- signup flow
- demo login shortcut
- signed-in summary view

## 7. Backend Design

### 7.1 Express Application Structure

Entry files:

- `server/src/server.js` -> starts server
- `server/src/app.js` -> creates Express app and mounts routes

Mounted route groups:

- `/api/auth`
- `/api/categories`
- `/api/products`
- `/api/cart`
- `/api/wishlist`
- `/api/orders`

### 7.2 Middleware

#### Auth Middleware

File: `server/src/middleware/auth.js`

Responsibilities:

- read `Authorization` header
- verify JWT token
- load current user from database
- attach `req.user`

Protected route groups:

- cart
- wishlist
- orders
- `/api/auth/me`

#### Error Middleware

File: `server/src/middleware/errorHandler.js`

Responsibilities:

- catch route-not-found cases
- return safe JSON error messages

### 7.3 Backend Utilities

Key utility files:

- `server/src/utils/crypto.js` -> password hashing and verification
- `server/src/utils/jwt.js` -> token signing and verification
- `server/src/utils/orderNumber.js` -> custom order number generation
- `server/src/utils/mail.js` -> optional email sending
- `server/src/utils/formatters.js` -> product mapping and JSON parsing helpers

## 8. API Reference

## 8.1 Health

### `GET /api/health`

Purpose:

- confirms backend is running

Sample response:

```json
{
  "status": "ok",
  "timestamp": "2026-04-15T00:00:00.000Z"
}
```

## 8.2 Authentication APIs

### `POST /api/auth/register`

Purpose:

- create a new account

Request body:

```json
{
  "fullName": "Jayant Kumar",
  "email": "jayant@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

Behavior:

- validates required fields
- checks duplicate email
- hashes password
- inserts user row
- returns JWT token and user payload

### `POST /api/auth/login`

Purpose:

- log in with existing account

Request body:

```json
{
  "email": "jayant@example.com",
  "password": "password123"
}
```

Behavior:

- loads user by email
- verifies password hash
- returns signed JWT and user payload

### `POST /api/auth/demo-login`

Purpose:

- create or reuse demo user
- simplify evaluator access

Behavior:

- ensures demo user exists
- returns demo session payload

### `GET /api/auth/me`

Purpose:

- validate token and fetch active user

Headers:

```text
Authorization: Bearer <jwt-token>
```

## 8.3 Category API

### `GET /api/categories`

Purpose:

- fetch category list with product counts

Backend logic:

- left joins categories with products
- counts products per category
- returns `productCount` for UI use

## 8.4 Product APIs

### `GET /api/products`

Query params:

- `search`
- `category`
- `sort`

Purpose:

- fetch product listing for the home page

Search behavior:

- matches against `name`
- matches against `brand`
- matches against `short_description`

Sort values supported:

- `relevance`
- `price-asc`
- `price-desc`
- `rating`
- `newest`

### `GET /api/products/:slug`

Purpose:

- fetch detailed information for a single product

Response includes:

- product core fields
- category details
- highlights array
- specifications object
- product image array

## 8.5 Cart APIs

All cart routes require authentication.

### `GET /api/cart`

Purpose:

- fetch current authenticated user's cart

Response includes:

- `items`
- `summary.itemCount`
- `summary.subtotal`
- `summary.discount`
- `summary.shippingFee`
- `summary.total`

### `POST /api/cart/items`

Purpose:

- add one product to cart

Request body:

```json
{
  "productId": 1,
  "quantity": 1
}
```

Behavior:

- validates product exists
- validates stock
- inserts cart row or increments quantity

### `PATCH /api/cart/items/:productId`

Purpose:

- update quantity for an existing cart row

Request body:

```json
{
  "quantity": 2
}
```

Behavior:

- validates quantity > 0
- validates stock
- updates row

### `DELETE /api/cart/items/:productId`

Purpose:

- remove a product from cart

## 8.6 Wishlist APIs

All wishlist routes require authentication.

### `GET /api/wishlist`

Purpose:

- fetch current user's wishlist

### `POST /api/wishlist/items`

Purpose:

- add product to wishlist

Request body:

```json
{
  "productId": 1
}
```

Behavior:

- uses `INSERT IGNORE` to avoid duplicates

### `DELETE /api/wishlist/items/:productId`

Purpose:

- remove product from wishlist

## 8.7 Order APIs

All order routes require authentication.

### `GET /api/orders`

Purpose:

- fetch all orders for the current user

Response includes:

- order summary
- shipping snapshot
- order item snapshots

### `GET /api/orders/:orderNumber`

Purpose:

- fetch one order by public order number

### `POST /api/orders`

Purpose:

- place a new order

Request body:

```json
{
  "shippingAddress": {
    "fullName": "Jayant Kumar",
    "phone": "9876543210",
    "addressLine1": "221 Demo Residency",
    "addressLine2": "Near Tech Park",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560001",
    "country": "India"
  },
  "paymentMethod": "Cash on Delivery"
}
```

Detailed order placement flow:

1. Validate shipping fields.
2. Open a DB transaction.
3. Lock cart rows using `FOR UPDATE`.
4. Verify cart is not empty.
5. Verify each item has enough stock.
6. Compute subtotal, discount, shipping, and total.
7. Generate a unique order number.
8. Insert row into `orders`.
9. Insert all rows into `order_items`.
10. Decrement stock in `products`.
11. Delete all rows from `cart_items` for that user.
12. Commit transaction.
13. Attempt to send email.
14. Update `email_status`.
15. Return created order.

This is the most important backend flow in the project because it demonstrates:

- transactional integrity
- inventory update
- order snapshotting
- separation between active cart and finalized order

## 9. Database Design

## 9.1 Tables

### `users`

Stores:

- customer/admin identity
- email
- password hash
- phone
- role

### `categories`

Stores:

- category name
- slug
- description

### `products`

Stores:

- category relation
- product title
- brand
- short description
- long description
- highlights JSON
- specifications JSON
- price
- original price
- discount percentage
- rating
- review count
- stock
- thumbnail image

### `product_images`

Stores:

- product relation
- image URL
- alt text
- sort order

### `cart_items`

Stores:

- user relation
- product relation
- quantity

Unique rule:

- one user can have only one cart row per product

### `wishlist_items`

Stores:

- user relation
- product relation

Unique rule:

- one user can save one product only once

### `orders`

Stores:

- user relation
- order number
- status
- payment method
- financial totals
- shipping address snapshot
- email status

### `order_items`

Stores:

- order relation
- optional product relation
- product name snapshot
- brand snapshot
- image snapshot
- unit price snapshot
- quantity
- line total

This snapshot strategy is important because order history should remain stable even if the original product changes later.

## 9.2 Relationships

```text
Category 1 ---- * Product
Product  1 ---- * ProductImage
User     1 ---- * CartItem
User     1 ---- * WishlistItem
User     1 ---- * Order
Order    1 ---- * OrderItem
Product  1 ---- * CartItem
Product  1 ---- * WishlistItem
Product  1 ---- * OrderItem
```

## 10. Sequelize Layer

The project includes Sequelize support for:

- models
- migrations
- seeders

Location:

- `server/src/models`
- `server/src/migrations`
- `server/src/seeders`

Purpose:

- reproducible database schema setup
- clean onboarding for reviewers
- future migration-friendly evolution

Commands:

```bash
cd server
npm run db:migrate
npm run db:seed:all
```

## 11. Setup Instructions

## 11.1 Prerequisites

- Node.js installed
- npm installed
- MySQL installed and running

## 11.2 Environment Setup

### Server

Create `server/.env` using `server/.env.example`.

Important fields:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=flipkart_clone
JWT_SECRET=replace_with_a_secure_secret
DEMO_USER_EMAIL=demo@flipkartclone.dev
DEMO_USER_PASSWORD=password123
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=ShopiMart <no-reply@shopimart.dev>
```

### Client

Create `client/.env` using `client/.env.example`.

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 11.3 Install Dependencies

From repository root:

```bash
npm install
npm --prefix client install
npm --prefix server install
```

## 11.4 Database Setup Options

### Option A: Raw SQL Seed Script

Create a MySQL database named `flipkart_clone`, then run:

```bash
npm run seed
```

This uses:

- `database/schema.sql`
- `server/scripts/seed.js`

### Option B: Sequelize Migrations + Seeders

From the `server` folder:

```bash
npm run db:migrate
npm run db:seed:all
```

## 11.5 Start The Project

From root:

```bash
npm run dev
```

This starts:

- backend on `http://localhost:5000`
- frontend on `http://localhost:5173`

## 12. Available Scripts

### Root

- `npm run dev` -> starts frontend and backend together
- `npm run dev:client` -> starts frontend only
- `npm run dev:server` -> starts backend only
- `npm run build` -> builds frontend
- `npm run seed` -> runs raw SQL seed script

### Server

- `npm run dev` -> starts Express server with nodemon
- `npm run start` -> starts Express server
- `npm run seed` -> runs raw SQL seed script
- `npm run sequelize` -> runs Sequelize CLI
- `npm run db:migrate` -> applies migrations
- `npm run db:migrate:undo` -> rolls back last migration
- `npm run db:seed:all` -> runs all seeders

## 13. Demo Credentials

Default seeded/demo user:

```text
Email: demo@flipkartclone.dev
Password: password123
```

Admin seeder user:

```text
Email: admin@flipkartclone.dev
Password: admin123
```

## 14. Design Assumptions

- A default user experience was required, so demo auto-login is enabled unless the user explicitly logs out.
- Cash on Delivery is used as the checkout payment mode for simplicity.
- Product images are seeded remote URLs.
- Shipping fee is currently set to zero.
- Discount is derived from `original_price - price`.
- Order items preserve product snapshots to keep order history stable.

## 15. Future Improvements

- migrate runtime controllers fully to Sequelize if desired
- add pagination to product listing
- add coupon and payment gateway support
- add admin dashboard for product management
- add unit/integration tests
- add refresh token flow
- add image uploads instead of remote placeholder assets

## 16. Project Artifacts

Documentation generated for this repository:

- [Project Artifact HTML](docs/project-artifact.html)
- [Project Artifact PDF](docs/project-artifact.pdf)

## 17. Deployment

This project has been deployed with the following configuration:

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
- **Database**: Hosted on Railway (MySQL)

### Frontend Deployment (Vercel)

The frontend is built with Vite and deployed as static files on Vercel.

1. Build the frontend locally (optional, as Vercel can build automatically):
   ```bash
   npm run build
   ```

2. Connect your GitHub repository to Vercel.

3. Configure the build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
   - **Root Directory**: `./client` (or adjust if needed)

4. Set environment variables in Vercel:
   - `VITE_API_BASE_URL`: Set to your Render backend URL (e.g., `https://your-app.onrender.com/api`)

### Backend Deployment (Render)

The backend is an Express.js application deployed on Render.

1. Connect your GitHub repository to Render.

2. Create a new Web Service.

3. Configure the service:
   - **Runtime**: Node.js
   - **Build Command**: `npm install && npm --prefix server install`
   - **Start Command**: `npm --prefix server start`
   - **Root Directory**: `./server` (or adjust if needed)

4. Set environment variables in Render (based on your `.env` file):
   - `PORT`: Usually set automatically by Render
   - `CLIENT_URL`: Set to your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
   - `DB_HOST`: Your Railway database host
   - `DB_PORT`: Your Railway database port (usually 3306)
   - `DB_USER`: Your Railway database username
   - `DB_PASSWORD`: Your Railway database password
   - `DB_NAME`: Your Railway database name
   - `JWT_SECRET`: A secure secret for JWT
   - `DEMO_USER_EMAIL`: demo@flipkartclone.dev
   - `DEMO_USER_PASSWORD`: password123
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: For email notifications (optional)

### Database Setup (Railway)

The database is hosted on Railway's MySQL service.

1. Create a MySQL database on Railway.

2. Note down the connection details (host, port, username, password, database name).

3. Run database migrations and seeders after deployment:
   - Connect to your Railway database using a MySQL client or command line.
   - Run the schema setup using the provided scripts or Sequelize migrations.

   Alternatively, you can run migrations programmatically if your backend has access.

### Post-Deployment Steps

1. Update CORS settings: Ensure `CLIENT_URL` in the backend points to the Vercel URL.

2. Test the deployed application:
   - Frontend should load on Vercel.
   - API calls should work between frontend and backend.
   - Database connections should be established.

3. Monitor logs on Vercel and Render for any issues.

4. If using email notifications, configure SMTP settings in Render.

## 18. Summary

This project is not just a UI clone. It is a complete commerce workflow with:

- structured backend APIs
- relational schema design
- authentication
- transaction-based order placement
- reusable frontend architecture
- reproducible database setup

It is designed to be easy to run, easy to explain, and easy to extend.
