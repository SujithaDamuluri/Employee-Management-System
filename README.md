
# 💼 Employee Management System (EMS)

A modern, full-featured Employee Management System designed to streamline operations, boost productivity, and empower both employees and managers. It includes real-time dashboards, smart analytics, and all tools necessary for HR and organizational processes in one place.

---

## ✨ Features

### 👥 Employee Management
- Create, view, and update employee profiles
- Upload profile pictures and personal documents
- Assign employees to departments and designations

### 🏢 Department Management
- Create and manage departments
- Assign employees under specific departments
- View department-based data and employee distribution

### 🕒 Attendance System
- Clock-in / Clock-out mechanism
- Track daily and monthly attendance
- Auto-calculate total work hours

### 📆 Leave Management
- Employees can apply for leaves with justifications
- Managers can approve/reject leave requests
- Leave history and balance tracking

### 💰 Payroll Module
- Generate monthly salary slips
- Auto-calculate deductions and bonuses
- Download payslips in PDF format

### 📊 Dashboard & Insights
- Interactive dashboard with real-time data
- Graphs for attendance, projects, performance
- Personalized view for employees and managers

### 📁 Project Management
- Create and track projects with due dates
- Assign employees to different projects
- Monitor project progress visually

### ✅ Task Management
- Break projects into manageable tasks
- Assign tasks to individuals or teams
- Track status: Pending, In-Progress, Completed

### 🧑‍💼 Manager Insights
- Get productivity metrics and team performance
- View reports on employee KPIs
- Department-level overview and trend analysis

---

## 🛠️ Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Frontend     | React.js, Tailwind CSS, Axios  |
| Backend      | Node.js, Express.js            |
| Database     | MySQL / MongoDB                |
| Auth         | JWT, Bcrypt.js                 |
| Charts       | Chart.js, Recharts             |
| File Uploads | Multer                         |
| Deployment   | Vercel (Frontend), Render/Railway (Backend) |

---




---

## 🚀 Getting Started

### ✅ Prerequisites
- Node.js & npm/yarn
- Git
- MySQL or MongoDB setup

### 🧪 Installation

```bash
# Clone the project
git clone https://github.com/SujithaDamuluri/employee-management-system.git
cd employee-management-system

# Install Backend dependencies
cd backend
npm install
npm run server

# Install Frontend dependencies
cd frontend
npm install
npm run dev


⚙️ Environment Variables
Create .env file in both /backend and /frontend:

Example .env for Backend

PORT=5000
MONGO_URI=your_mongo_db_url_or_mysql_connection
JWT_SECRET=your_secret_key


👨‍💻 Author
Your Name – SujithaDamuluri

Email: sujithadamuluri11@gamil.com
