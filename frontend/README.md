# ShopEase Frontend

Responsive vanilla HTML/CSS/JavaScript frontend for the Express.js + MySQL e-commerce backend.

## Pages
- index.html
- products.html
- product.html?id=PRODUCT_ID
- cart.html
- checkout.html
- login.html
- register.html
- orders.html

## Backend connection
Edit `js/api.js` if your backend runs somewhere other than:

http://localhost:5000/api

Expected API endpoints:
- GET /api/products
- GET /api/products/:id
- POST /api/auth/register
- POST /api/auth/login
- POST /api/orders
- GET /api/orders/my-orders

## Images
Put the hero background at:
`images/background.jpg`

Product image URLs can come from your database `products.image` column.
If an image is missing, the UI displays a simple "No image" placeholder.

## Running
The frontend can be opened with a local static server, for example VS Code Live Server.

Because the frontend calls the Express API, make sure:
1. MySQL is running.
2. Your Express backend is running on port 5000 (or update js/api.js).
3. CORS is enabled in the backend.
