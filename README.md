# 🛍️ Global POS - Point of Sale & Inventory Management System

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)
![SQL Server](https://img.shields.io/badge/SQL%20Server-MSSQL-red?style=for-the-badge&logo=microsoft-sql-server)

**A modern, full-featured Point of Sale (POS) and Inventory Management System built with Next.js 15**

*Streamline your business operations with powerful invoicing, inventory management, and reporting capabilities*

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Project Structure](#-project-structure) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Routes](#-api-routes)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Developers](#-developers)

---

## 🎯 Overview

**Global POS** is a comprehensive business management solution designed to handle all aspects of retail operations. From creating invoices and managing inventory to generating detailed reports, this system provides everything you need to run your business efficiently.

### Key Highlights

✨ **Modern UI/UX** - Beautiful, responsive design built with Tailwind CSS  
⚡ **High Performance** - Built on Next.js 15 with React 19  
🔒 **Secure** - User authentication and session management  
📊 **Analytics** - Comprehensive reporting and analytics  
🛒 **Inventory Management** - Real-time stock tracking with low stock alerts  
🧾 **Invoicing** - Create and manage invoices seamlessly  
📦 **GRN System** - Goods Receipt Note management for supplier deliveries  

---

## ✨ Features

### 🧾 Invoice Management
- Create and manage invoices with multiple items
- Customer selection with search functionality
- Real-time calculations (subtotal, discounts, taxes)
- Invoice history and tracking
- Print and export capabilities

### 📦 Inventory Management
- **Stock Tracking** - Real-time inventory monitoring
- **Low Stock Alerts** - Automatic notifications for items below threshold
- **Stock Settings** - Customizable low stock thresholds
- **Multi-location Support** - Manage inventory across multiple locations
- **Item Search** - Fast search by code, name, or category
- **Stock Statistics** - View total items, stock value, and alerts

### 📋 GRN (Goods Receipt Note)
- Supplier delivery management
- Multi-item receipt processing
- Location and staff assignment
- Purchase price tracking
- Automated inventory updates

### 📊 Reports & Analytics
- **Daily Summary** - Track daily sales and transactions
- **Profit & Loss (P&L)** - Financial performance analysis
- **Visual Charts** - Interactive charts with Chart.js
- **Export Functionality** - Export reports to Excel (XLSX)

### 👥 User Management
- Secure login system
- User authentication
- Session management
- Role-based access (extensible)

### 🎨 User Interface
- Modern, clean design
- Fully responsive (mobile, tablet, desktop)
- Intuitive navigation with sidebar
- Beautiful gradient themes
- Smooth animations and transitions

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5** - React framework with App Router
- **React 19.1** - UI library
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Chart.js** - Data visualization
- **React Chart.js 2** - Chart.js wrapper for React
- **SweetAlert2** - Beautiful alert dialogs

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MSSQL** - Microsoft SQL Server database
- **Node.js** - Runtime environment

### Utilities
- **XLSX** - Excel file generation and parsing
- **Next Font** - Google Fonts optimization (Poppins)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **SQL Server** (MSSQL) - Database server
- **Git** - Version control

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Report-System.git
cd Report-System
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration
USER=your_database_user
PASSWORD=your_database_password
SERVER=your_server_address
DATABASE=your_database_name

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Initialize the Database

Visit the initialization page or run the database setup:

```bash
# Start the development server
npm run dev

# Navigate to http://localhost:3000/init
# Click "Initialize Database" to set up tables and sample data
```

---

## ⚙️ Configuration

### Database Setup

1. **Create Database**
   - Create a new database in SQL Server
   - Update the `DATABASE` value in `.env.local`

2. **Initialize Tables**
   - Access `/init` page in the application
   - Click "Initialize Database" button
   - This will create all necessary tables and sample data

### Customization

- **Low Stock Threshold**: Adjustable in Stock Settings
- **Theme Colors**: Modify Tailwind CSS classes in components
- **Font**: Change font family in `src/app/layout.js`

---

## 💻 Usage

### Starting the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

### Application Flow

1. **Login** - Access the system with your credentials (`/auth/Login`)
2. **Dashboard** - View stock overview (default landing page)
3. **Invoice** - Create and manage invoices (`/Invoice`)
4. **GRN** - Manage goods receipt notes (`/GRN`)
5. **Stock** - Monitor and manage inventory (`/Stock`)
6. **Reports** - View daily summary and P&L reports (`/Reports`)

---

## 📁 Project Structure

```
Report-System/
├── public/                 # Static assets
│   ├── images/            # Image files
│   └── icons/             # Icon files
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   │   ├── invoice/  # Invoice endpoints
│   │   │   ├── grn/      # GRN endpoints
│   │   │   ├── items/    # Item endpoints
│   │   │   ├── customer/ # Customer endpoints
│   │   │   ├── staff/    # Staff endpoints
│   │   │   ├── supplier/ # Supplier endpoints
│   │   │   ├── location/ # Location endpoints
│   │   │   ├── user/     # Authentication
│   │   │   └── reports/  # Report endpoints
│   │   ├── auth/         # Authentication pages
│   │   │   └── Login/    # Login page
│   │   ├── Invoice/      # Invoice management
│   │   ├── GRN/          # GRN management
│   │   ├── Stock/        # Stock management
│   │   ├── Reports/      # Reports pages
│   │   │   ├── DailySummary/
│   │   │   └── P&L/
│   │   ├── layout.js     # Root layout
│   │   ├── page.js       # Home page
│   │   └── db.js         # Database connection
│   ├── components/       # React components
│   │   ├── AppShell.js   # Main app shell
│   │   ├── Sidebar.js    # Navigation sidebar
│   │   ├── LowStockAlerts.js
│   │   ├── StockSettings.js
│   │   └── Charts/       # Chart components
│   └── utils/            # Utility functions
│       ├── excelExport.js
│       └── notificationService.js
├── package.json
├── next.config.mjs
├── tailwind.config.js
└── README.md
```

---

## 🔌 API Routes

### Authentication
- `POST /api/user` - User login

### Invoices
- `GET /api/invoice` - Get all invoices
- `POST /api/invoice` - Create new invoice
- `GET /api/invoice/[id]` - Get invoice by ID
- `GET /api/invoice/history` - Get invoice history

### Inventory
- `GET /api/items` - Get all items
- `GET /api/items/itemCode` - Get item by code
- `GET /api/lowstock` - Get low stock items

### GRN
- `POST /api/grn` - Create new GRN
- `GET /api/grn` - Get all GRN entries

### Master Data
- `GET /api/customer` - Get all customers
- `GET /api/supplier` - Get all suppliers
- `GET /api/staff` - Get all staff
- `GET /api/location` - Get all locations

### Reports
- `GET /api/dailysummary` - Get daily summary data
- `GET /api/pnl` - Get profit & loss data

### Utilities
- `POST /api/init` - Initialize database
- `POST /api/init-db` - Database setup
- `POST /api/logout` - User logout

---

## 📸 Screenshots

> *Note: Add screenshots of your application here*

### Login Page
- Beautiful gradient background
- Smooth animations
- Responsive design

### Invoice Management
- Clean, organized interface
- Real-time calculations
- Item search and selection

### Stock Management
- Comprehensive stock overview
- Low stock alerts
- Search and filter capabilities

### Reports Dashboard
- Interactive charts
- Export functionality
- Detailed analytics

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developers

### Backend & Logic
**Kavija Dulmith**
- Database architecture
- API development
- Business logic implementation

### Frontend & Design
**Sineth Dinsara**
- UI/UX design
- Frontend development
- Component architecture

### Project Info
- **Organization**: Global Soft Solution (PVT). LTD
- **Project Name**: Global POS - Point of Sale System
- **Version**: 1.0.0

---

## 🔗 Related Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs)

---


<div align="center">

**Made with ❤️ by Global Soft Solution Team**

</div>

