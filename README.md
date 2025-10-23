# 🎓 Class Engagement System - Centralized Timetable & Substitution Management System

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
