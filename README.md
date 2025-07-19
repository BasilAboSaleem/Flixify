# 🎬 Flixify

**Flixify** is a full-featured web application for browsing movies and TV series. It includes a user-friendly front-end and an admin dashboard for managing content. The app fetches movie and series data dynamically from the TMDB API, supports user authentication, and provides interactive features like reviews and watchlists.

---

## 🚀 Overview

Flixify offers an intuitive platform to explore movies and TV shows with rich details, including trailers, genres, user reviews, and ratings.  
Admins can easily update the database with new movies and series via a dedicated dashboard button, which fetches fresh content from TMDB while avoiding duplicates.

---

## ✨ Key Features

### 👤 User Interface (Front-end)
- Browse movies and TV series by categories: **popular**, **top rated**, **coming soon**, **anime**, **Asian cinema**, and more.
- View detailed pages for each movie/series with **synopsis**, **trailers**, **user reviews**, and **ratings**.
- **User registration and login** functionality.
- Logged-in users can:
  - Add reviews
  - Rate movies
  - Maintain a personalized **watchlist**

### 🔐 Admin Dashboard
- Secure login for admin users.
- General **site settings** management (site name, logo, social links).
- Add new movies and series by fetching data from **TMDB API**:
  - Prevents duplicates by checking existing entries before adding.
  - Shows a **loading spinner** while fetching data.
  - Displays **success or error flash messages** after completion.
- View **site statistics** including:
  - Total users
  - Total movies
  - Reviews
  - Ratings

---

## 🛠️ Technologies Used

- **Node.js** with **Express** for the backend server
- **MongoDB** with **Mongoose** ODM for data management
- **EJS** templating engine for server-side rendering
- **Bootstrap** for responsive UI design
- **TMDB API** to fetch movie and TV series data
- **JWT** and custom middleware for authentication & authorization
- **connect-flash** for flash message support
- **JavaScript** and **AJAX** for admin dashboard interactivity

---

## 📋 Getting Started

### 1. Setup Environment Variables

Create a `.env` file in the project root with the following:

```
PORT=3001
MONGODB_URL=your_mongodb_connection_string
TMDB_API_KEY=your_tmdb_api_key
JWT_SECRET=your_jwt_secret
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
npm run watch
```

### 4. Access the Application

- **Front-end user site**: [http://localhost:3001/](http://localhost:3001/)
- **Admin dashboard**: [http://localhost:3001/admin/dashboard](http://localhost:3001/admin/dashboard)

### 5. Add Movies and Series

- Log into the admin dashboard.
- Click the **"Add Movies and Series"** button.
- Wait for the **loading spinner** while the app fetches and adds new data.
- Upon completion, a **flash message** will show success or failure.

---

## 🔒 Security

- **JWT-based authentication** ensures secure access to admin routes.
- **Middleware** protects sensitive routes from unauthorized access.
- **Duplicate entries** are avoided by verifying existing content before insertion.

---

## ⚙️ Project Structure (Summary)

```
/models      → Mongoose schemas (Users, Movies, Reviews, etc.)
/controllers → Route handlers and business logic
/routes      → Express route definitions
/views       → EJS templates for front-end and dashboard
/public      → Static assets (CSS, JS, images)
```

---

## 🤝 Contributing

Contributions are welcome!  
Feel free to submit issues or pull requests to improve the project.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 📣 Final Notes

This project is ideal for developers, freelancers, or creatives who want to present their work professionally and keep their content up-to-date without redeploying.  
Built with flexibility, maintainability, and real-world usability in mind.

> **Created with ❤️ by Basil Abo Saleem**

---

## 🌍 Developer Context (Optional Personal Note)

> This platform was fully developed under extremely difficult conditions during the war in Gaza — amid displacement, power outages, and severe resource limitations.  
> Despite these challenges, I committed to learning and building a real-world full-stack project to demonstrate my skills, dedication, and perseverance.

**Thank you for visiting.**  
Every line of code represents not just technical knowledge, but a journey through adversity.
