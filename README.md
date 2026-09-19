# ShopEase Full Project

This project contains:
- frontend: HTML + CSS + JavaScript
- backend: Node.js + Express
- database: MySQL

## 1. Install Node.js
Install a current LTS version of Node.js.

Check:
node -v
npm -v

## 2. Create the MySQL database
Open MySQL Workbench or the MySQL command line and run:

SOURCE database/ecommerce.sql;

Or open `database/ecommerce.sql` and execute the entire file.

This creates `ecommerce_db`, the users/products/orders/order_items tables,
and six sample products.

## 3. Configure the backend
Go into `backend`.

Copy:
`.env.example` -> `.env`

Put your MySQL password in `.env`:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=ecommerce_db

Set a JWT secret:
JWT_SECRET=put_a_long_random_value_here

## 4. Install backend packages
Open a terminal in:
`shopease-full-project/backend`

Run:
npm install

## 5. Start the backend
Run:
npm start

You should see:
MySQL connected successfully.
ShopEase API running at http://localhost:5000

Test in your browser:
http://localhost:5000/api

## 6. Start the frontend
Do not just double-click the HTML files if your browser blocks module/API behavior.

Recommended:
- Open the `frontend` folder in VS Code.
- Install the Live Server extension.
- Right-click `frontend/index.html`.
- Choose "Open with Live Server".

The frontend already points to:
http://localhost:5000/api

## 7. Test registration
Open:
register.html

Create:
Name: Test User
Email: test@example.com
Password: 123456

A successful response creates the MySQL user and logs the user in.

## 8. Test login
Open:
login.html

Use the account you created.

## Common errors

"Failed to fetch"
- Backend is not running.
- Check that `npm start` is running.
- Check that the backend says it is using port 5000.

"Unable to connect to MySQL"
- MySQL server is not running.
- Check DB_HOST, DB_USER, DB_PASSWORD and DB_NAME in `.env`.

"Access denied for user 'root'"
- The MySQL password in `.env` is incorrect.

"Unknown database 'ecommerce_db'"
- Run `database/ecommerce.sql`.

"CORS error"
- This backend already enables CORS.
- Restart `npm start` after changing backend files.

The frontend login/register code does not store passwords itself.
Passwords are sent to the Express API over the local development connection,
then hashed with bcryptjs before being stored in MySQL.
