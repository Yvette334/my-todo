## Firebase CRUD Task App

A protected task manager built with Next.js 16, TypeScript, Firebase Authentication, and Firestore. Authenticated users can register, log in, and manage personalized tasks (create, read, update, delete) with priority and completion statuses.

## Features

- Firebase email/password authentication (register, login, logout)
- Protected dashboard greeting authenticated users by email
- CRUD task management with Firestore
- Task filtering per user account
- Realtime completion toggle and edit/delete actions
- Responsive UI with Tailwind CSS

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Firebase Authentication & Firestore
- Tailwind CSS

## Getting Started

1. Clone the repo and install dependencies:
   ```bash
   git clone (https://github.com/Yvette334/my-todo.git)
   cd my-todo
   npm install
   ```


2. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` (or the port shown) to view the app.

## Deployment

Deploy to Vercel and add the same Firebase environment variables in the project settings. After deploying, update this README with your live link:

- **Production URL:** `https://my-todo-82v4ukorf-xyvette334-gmailcoms-projects.vercel.app/login`

## Demo Credentials

- Email: `testuser@gmail.com`
- Password: `test1234`

Ensure this account exists in Firebase Authentication with sample tasks in Firestore for evaluation.

## Screenshots

![Alt screenshot](https://github.com/Yvette334/my-todo/blob/2980fa5059fd8140088d331b44a79f7fd2ef6225/screencapture-localhost-3000-2025-11-09-23_43_42.png)

