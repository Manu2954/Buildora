# Buildora - Multi-Vendor E-commerce Platform

### Sourcing Made Simple. Building Made Easy.

---

Buildora is a comprehensive B2B/B2C multi-vendor e-commerce platform built on the MERN stack, designed specifically for the construction and building materials industry. It provides a complete, end-to-end solution for managing companies, products, users, and orders, connecting manufacturers directly with customers and dealers.

## Core Features

The Buildora platform is divided into two main applications: a feature-rich **Admin Panel** and a professional **Customer-Facing Storefront**.

#### Customer Interface

* **Advanced Product Discovery:** A modern storefront with live search, auto-suggestions, and multi-select filters for categories, companies, and price ranges.
* **Product Variant Support:** A professional product detail page inspired by top e-commerce sites, allowing users to select different product variants (e.g., sizes, weights) with unique pricing and stock levels.
* **Full E-commerce Flow:** Complete shopping cart, secure checkout process, and order placement functionality.
* **Customer Account Dashboard:** A secure, dedicated area for users to view their order history, manage their profile details, and update their security settings.

#### Admin Panel

* **Dynamic Analytics Dashboard:** A data-driven dashboard showing key platform metrics like total users, companies, products, and user role distribution.
* **Comprehensive Content Management:** Full CRUD (Create, Read, Update, Delete) capabilities for Companies and their Products.
* **Advanced Product Creation:** A detailed product form that supports complex data structures, including multiple images, custom attributes, and product variants with unique pricing, stock, SKUs, and units.
* **Full User Management:** An interface to view, search, and manage all registered customers and dealers, including the ability to change roles and deactivate accounts.
* **Complete Order Management:** A system for admins to view all customer orders, filter them by status, and update an order's progress from "Processing" to "Shipped" or "Delivered".

---

## Technology Stack

-   **Frontend:** **React.js** (with Hooks and Context API)
-   **Backend:** **Node.js** & **Express.js**
-   **Database:** **MongoDB** (with Mongoose)
-   **Authentication:** **JSON Web Tokens (JWT)**
-   **Styling:** **Tailwind CSS**

---

## Setup & Installation

Follow these instructions to get the project running locally for development and testing.

### Prerequisites

-   Node.js (v14 or higher)
-   npm (or yarn)
-   A local or cloud-based MongoDB instance

### Backend Setup

1.  **Navigate to the directory:**
    ```sh
    cd backend
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Set Environment Variables:**
    -   Create a `.env` file in the root of the `/backend` directory.
    -   Populate the `.env` file with your values for the following variables:
        ```env
        NODE_ENV=development
        PORT=5000
        MONGO_URI=your_mongodb_connection_string
        JWT_ACCESS_SECRET=your_super_secret_access_key
        JWT_REFRESH_SECRET=your_super_secret_refresh_key
        ACCESS_TOKEN_EXPIRES=15m
        REFRESH_TOKEN_EXPIRES=7d
        JWT_COOKIE_EXPIRE=30
        ```
4.  **Start the Server:**
    ```sh
    npm run dev  # For development with nodemon
    # OR
    npm start    # For production
    ```

### Frontend Setup

1.  **Navigate to the directory:**
    ```sh
    cd frontend
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Set up the Proxy:**
    -   Open the `package.json` file and add this line to redirect API requests to the backend:
        ```json
        "proxy": "http://localhost:5000"
        ```
4.  **Start the Application:**
    ```sh
    npm start
    ```
    The application should now be running on `http://localhost:3000`.

---

## Future Development

The core functionality is complete. The next phase of development will focus on the advanced features outlined in the project brief:

-   **Dealer Interface:** A dedicated portal for dealers to manage their catalogs and orders.
-   **Payment Gateway Integration:** Implementing a real payment processor like Razorpay or PayU.
-   **Logistics Interface:** A mobile-optimized view for delivery staff to manage and track shipments.
-   **Bulk Product Upload:** A system for admins to import products via CSV/Excel.
-   **Communication Integrations:** Implementing SMS/WhatsApp notifications for order updates.
