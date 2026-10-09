# Installation & Deployment Guide

## Prerequisites
- Node.js v18.0.0 or higher
- MySQL Server 8.0+
- npm or yarn

## Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-org/inventory-management.git
cd inventory-management
npm install
```

## Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and configure your MySQL credentials:
```bash
cp .env.example .env
```
Edit `.env`:
```ini
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=inventory_management
SESSION_SECRET=your_jwt_or_session_secret_key_32_chars_min
```

## Step 3: Initialize Database Schema & Seed Data
Execute the SQL files in your MySQL instance:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

## Step 4: Run the Application
In development:
```bash
npm run dev
```

In production:
```bash
npm run build
npm start
```

## Default Development Accounts
- **Admin**: `admin` / `admin123`
- **Manager**: `manager` / `admin123`
- **Sales**: `sales_clerk` / `admin123`
- **Inventory**: `inventory_lead` / `admin123`
- **Accountant**: `accountant` / `admin123`
