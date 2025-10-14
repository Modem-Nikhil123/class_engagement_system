# 🎓 ClassSync - Centralized Timetable & Substitution Management System

A comprehensive web application designed for **Centralized Timetable & Substitution Management with Multi-Branch Admin Control**, streamlining communication between **Super Admins, HODs, Teachers, and Students** for efficient educational management.

## 🌟 Features

### 👑 Super Admin Features

- **Department Management**: Add and manage departments (CSE, ECE, MECH, etc.)
- **User Management**: Add teachers and students under each department
- **HOD Assignment**: Assign Head of Department (HOD) for every branch
- **Full System Access**: View or edit all data across the system
- **System Oversight**: Monitor and manage all timetables and substitutions

### 🏫 HOD (Department Admin) Features

- **Branch Oversight**: View teachers and subjects of their department
- **Timetable Generation**: Create/auto-generate timetables for the branch based on availability
- **Timetable Updates**: Update or regenerate timetable as needed (e.g., teacher changes)
- **Substitute Management**: Handle substitute assignments within the department

### 👨‍🏫 Teacher Features

- **Personal Timetable**: View their own assigned classes and schedule
- **Class Status Updates**: Mark classes as Engaged, Not Taking, Delayed, or Absent
- **Substitute Assignment**: Assign substitutes or allow system to handle automatically
- **Real-time Notifications**: Receive updates on schedule changes and substitutions

### 👨‍🎓 Student Features

- **Class Timetable View**: View timetable of their class in real-time
- **Status Updates**: Get instant updates when teachers change class status
- **Absence Reporting**: Mark teacher as absent if they don't attend and update status
- **Notifications**: Receive alerts for Engaged, Not Taking, Delayed, or Absent statuses

### 🔧 System Features

- **Automated Notifications**: Email notifications for all stakeholders
- **Grace Period Management**: Response window for teacher absence reports
- **Real-time Updates**: Live status synchronization across all users
- **Secure Authentication**: JWT-based authentication with enhanced role-based access
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Timetable Algorithms**: Automatic generation based on teacher availability and weekly hours

## 🏗️ Architecture Overview

The system follows a **three-tier architecture** with clear separation of concerns:

### Frontend (React + Zustand)

- **React 18** with modern hooks and functional components
- **Zustand** for lightweight state management
- **Tailwind CSS** for responsive UI design
- **Lucide React** for consistent iconography
- **React Hot Toast** for user notifications

### Backend (Node.js + Express)

- **Express.js** RESTful API server
- **JWT Authentication** with role-based access control
- **Nodemailer** for automated email notifications
- **bcrypt** for secure password hashing
- **Automated background jobs** for grace period management

### Database (MongoDB)

- **MongoDB** with Mongoose ODM
- **Optimized schemas** with proper indexing
- **Real-time data synchronization**
- **Efficient query patterns**

## 📊 Database Schema

### Core Models

#### Users

```javascript
{
  userId: String (unique),
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/teacher/student)
}
```

#### Students

```javascript
{
  studentId: String (unique),
  rollNumber: String (unique),
  name: String,
  classYear: String,
  branch: String,
  section: String
}
```

#### Teachers

```javascript
{
  teacherId: String (unique),
  name: String,
  department: String,
  specialization: String
}
```

#### Permanent Timetable

```javascript
{
  timetableId: String (unique),
  classId: String,
  subject: String,
  teacherId: String,
  dayOfWeek: String,
  slot: String,
  startTime: String,
  endTime: String,
  room: String
}
```

#### Class Status (Real-time Updates)

```javascript
{
  statusId: String (unique),
  classId: String,
  teacherId: String,
  date: Date,
  subject: String,
  status: String (engaged/not_taking/delayed/absent),
  delayMinutes: Number,
  substituteTeacherId: String,
  studentMarkedAbsent: Boolean,
  studentReporterId: String,
  teacherNotified: Boolean,
  graceTimeExpiry: Date,
  remarks: String
}
```

#### Queries

```javascript
{
  queryId: String (unique),
  studentId: String,
  teacherId: String,
  subject: String,
  message: String,
  category: String (attendance/timetable/substitute/delay/general),
  status: String (open/in_progress/resolved/closed),
  priority: String (low/medium/high)
}
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **Gmail account** (for email notifications)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd CAS
```

2. **Install Backend Dependencies**

```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**

```bash
cd ../frontend
npm install
```

4. **Environment Configuration**

Create/update `backend/.env`:

```env
MONGODB_URL=your_mongodb_connection_string
NODE_ENV=development
SECRET_KEY=your_jwt_secret_key

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173

# System Configuration
ABSENCE_GRACE_PERIOD=30
```

5. **Start the Application**

Backend (Terminal 1):

```bash
cd backend
npm start
```

Frontend (Terminal 2):

```bash
cd frontend
npm run dev
```

The application will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 📧 Email Configuration

To enable email notifications:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update .env file** with your email and app password

## 🔄 System Workflow

### Student Workflow

1. **Login** → View today's schedule
2. **Monitor class status** in real-time
3. **Report teacher absence** if teacher doesn't show up (15+ minutes after class start)
4. **Submit queries** for any issues
5. **Check calendar** for future/past schedules

### Teacher Workflow

1. **Login** → View today's classes
2. **Update class status** as needed (delayed, not taking, etc.)
3. **Respond to absence reports** within 30-minute grace period
4. **Assign substitutes** when not available
5. **Manage calendar** for future planning

### System Automation

1. **Student reports teacher absent** → Email sent to teacher
2. **30-minute grace period** → Teacher can respond
3. **No response** → Class automatically marked absent
4. **Status updates** → All students notified via email
5. **Background jobs** → Process expired grace periods every 5 minutes

## 🛡️ Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcrypt with salt rounds
- **Role-based Access Control** (RBAC)
- **Input Validation** and sanitization
- **CORS Configuration** for cross-origin requests
- **Environment Variables** for sensitive data

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:

- **Desktop** (1920px+)
- **Laptop** (1024px - 1919px)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🎨 UI/UX Features

- **Modern Design** with gradient backgrounds and smooth animations
- **3D Profile Page** with animated elements
- **Real-time Status Indicators** with color coding
- **Interactive Modals** for better user experience
- **Toast Notifications** for immediate feedback
- **Loading States** for better perceived performance

## 🔧 API Endpoints

### Authentication

- `POST /auth/login` - User login
- `GET /auth/logout` - User logout
- `GET /auth/check` - Verify authentication
- `POST /auth/change-password` - Change password

### Class Management

- `GET /class/schedule` - Get class schedule
- `POST /class/update-status` - Update class status (Teacher)
- `POST /class/mark-absent` - Mark teacher absent (Student)
- `POST /class/respond-absence` - Respond to absence report (Teacher)
- `POST /class/submit-query` - Submit query (Student)
- `GET /class/my-queries` - Get student queries

## 🧪 Testing

### Sample Data Structure

Create test users in your database:

```javascript
// Sample Student
{
  userId: "STU001",
  name: "John Doe",
  email: "john.student@example.com",
  password: "hashedPassword",
  role: "student"
}

// Sample Teacher
{
  userId: "TEA001",
  name: "Dr. Jane Smith",
  email: "jane.teacher@example.com",
  password: "hashedPassword",
  role: "teacher"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Mobile App** (React Native)
- **Push Notifications** (Web Push API)
- **Analytics Dashboard** for administrators
- **Attendance Reports** and analytics
- **Integration** with existing LMS systems
- **Multi-language Support**
- **Dark Mode** theme option

---

**Built with ❤️ for better education management**
