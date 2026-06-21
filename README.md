
# SCOPE - Enterprise Project Management Platform

[![React](https://img.shields.io/badge/React-18.x-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat-square&logo=spring)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com/)

**Scope** is a comprehensive, full-stack Agile project management dashboard designed to help teams collaborate, track sprints, manage backlogs, and organize departments efficiently. Built with a robust Spring Boot backend and a lightning-fast React frontend, it features secure role-based access control and dynamic workspace environments.

---

## ✨ Key Features & Role-Based Access Control

The platform strictly separates capabilities based on user roles (`ADMIN` vs `EMPLOYEE`) to maintain security and operational integrity.

### 🏢 Workspace Management
* **Admin:** Manage isssues from backlog
* **Employee:** Operates entirely within the designated Workspace and can view the Workspace identity but cannot alter its configuration.

### 📊 Sprint & Backlog Tracking
* **Admin:** Can create new sprints, log future issues into the Backlog, assign tasks to specific team Employees, and review completed tasks.
* **Employee:** Has a focused view of their actively assigned tasks but in workspace

### 👥 Team & Department Management
* **Admin:** Can invite new users, assign roles, create specific organizational departments, and allocate team Employees to those departments.
* **Employee:** Cant view the team directory and department structures 

### 🔐 Security & User Settings
* **Admin:** Can manage global security settings, force password resets, and update core organizational profiles. 
* **Employee:** Cant update their personal information.

---

## 🛠️ Technology Stack

**Frontend (Client)**
* **Framework:** React.js + Vite
* **Styling:** Tailwind CSS
* **State Management:** React Context API (`AuthContext`)
* **Routing:** React Router DOM
* **Alerts:** React Hot Toast

**Backend (Server)**
* **Core:** Java 17 + Spring Boot 3.x
* **Security:** Spring Security + JWT Filters
* **ORM:** Spring Data JPA (Hibernate)
* **Database:** MySQL 8+

---

## 📂 Architecture & Folder Structure

### Backend App (`com.initialrelase.ScopeBackend`)
```text
📦 src/main/java/com/initialrelase/ScopeBackend
 ┣ 📂 Controller    # REST API Endpoints (e.g., ProfileController, IssueController)
 ┣ 📂 Dto           # Data Transfer Objects for clean API payloads
 ┣ 📂 Entity        # JPA Models mapped to MySQL tables
 ┣ 📂 Repository    # Spring Data Interfaces with custom @Query methods
 ┣ 📂 Security      # JWT Token Filters and Auth configurations
 ┣ 📂 Service       # Core Business Logic and Transactional operations
 ┗ 📜 ScopeBackendApplication.java

```

### Frontend App (`/src`)

```text
📦 src
 ┣ 📂 assets        # Static resources
 ┣ 📂 components    # Reusable UI components (Sidebar, Navbar)
 ┣ 📂 context       # Global State (AuthContext.jsx)
 ┣ 📂 pages         # Route components (Dashboard, Settings, Backlog, Team)
 ┣ 📜 App.jsx       # Main application router
 ┣ 📜 config.js     # Global configurations (API Base URL)
 ┣ 📜 index.html    # Entry point
 ┗ 📜 style.css     # Global Tailwind imports

```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher)
* [Java JDK](https://adoptium.net/) (v17 or higher)
* [MySQL Server](https://www.google.com/search?q=https://dev.mysql.com/downloads/)

### 1. Database Setup

Log into your MySQL instance and execute:

```sql
CREATE DATABASE scopedb;

```

### 2. Backend Setup

1. Open the backend project in your preferred IDE.
2. Navigate to `src/main/resources/application.properties` and configure your database credentials (see Environment Variables section).
3. Build and run the Spring Boot application:

```bash
   ./mvnw spring-boot:run

```

*The backend will start on `http://localhost:8080*`

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

```bash
   cd frontend

```

2. Install Node dependencies:

```bash
   npm install

```

3. Create a `.env` file in the root of the frontend folder.
4. Start the Vite development server:

```bash
   npm run dev

```

*The frontend will be accessible at `http://localhost:5173*`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `JWT_SECRET_KEY` | The Jwt Key | `*****************` |

### Backend (`src/main/resources/application.properties`)

| Variable | Description | Example |
| --- | --- | --- |
| `spring.datasource.url` | MySQL JDBC URL | `jdbc:mysql://localhost:3306/scopedb` |
| `spring.datasource.username` | Database Username | `root` |
| `spring.datasource.password` | Database Password | `your_db_password` |
| `JWT_HEADER` | Header name for tokens | `Authorization` |
| `KEY` | Secret key for JWT signing | `generate_a_very_long_secret_key_here` |

---

## 👨‍💻 Author

**Roman Ali Sher**

* Full-Stack Developer
* Lahore, Punjab, Pakistan
* GitHub: [@RomanAliSher](https://github.com/RomanAliSher)

---

*If you find this project helpful, please consider giving it a ⭐ on GitHub!*

```

