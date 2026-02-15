# FlowTrack 🚀

A full-stack **project management application** with real-time collaboration, analytics dashboards, and role-based access control. Built with **Next.js**, **Express**, **MongoDB**, and **Socket.IO**.

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based login & registration with secure HTTP-only cookies
- **Role-based access control** — Admin, Team Leader, Team Member
- Protected routes and API middleware

### 📁 Project Management
- Create, update, and **delete projects** (with full cascade cleanup)
- Add and **remove members** from projects
- Per-project activity feed with real-time updates

### ✅ Task Management
- Create, **edit**, and **delete tasks** with cascade cleanup of comments & notifications
- **4 task views**: Board (Kanban), List, Timeline, and Table
- Drag-and-drop status columns (To Do → In Progress → Review → Done)
- Priority levels: Low, Medium, High, Urgent
- Task assignment, due dates, and inline editing
- **Client-side filtering** by status, priority, and assignee

### 💬 Real-Time Collaboration
- **Live comments** on tasks via Socket.IO — no page refresh needed
- Real-time activity feed per project
- Socket-based notification delivery

### 🔔 In-App Notifications
- Real-time notification bell with unread count badge
- Triggers: task assigned, status changed, comment added, member added
- Mark as read individually or all at once
- Click-to-navigate to the relevant project

### 🔍 Global Search
- Search across projects and tasks with `Ctrl+K` shortcut
- Debounced search with grouped results (Projects / Tasks)
- Click-to-navigate from search results

### 📊 Enhanced Analytics Dashboard
- **5 KPI stat cards**: Projects, Tasks, Completed, Overdue, Completion %
- **Status donut chart** (SVG) — To Do / In Progress / Review / Done
- **Priority bar chart** — horizontal progress bars
- **Project overview** — stacked progress bars per project, clickable
- **Upcoming deadlines** panel with color-coded urgency
- **Recent tasks table** with status & priority badges

### 👤 User Profile
- Profile page with avatar, stats (projects, tasks, completed)
- Edit name and change password
- Accessible from navbar and sidebar

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS |
| **Backend** | Express 5, Node.js |
| **Database** | MongoDB with Mongoose ODM |
| **Real-Time** | Socket.IO |
| **Auth** | JWT + bcryptjs + HTTP-only cookies |

---

## 📂 Project Structure

```
flowtrack/
├── backend/
│   ├── controller/          # Route handlers
│   │   ├── auth.controller.js
│   │   ├── project.controller.js
│   │   ├── task.controller.js
│   │   ├── comment.controller.js
│   │   ├── activity.controller.js
│   │   ├── notification.controller.js
│   │   ├── search.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js     # JWT verification + role authorization
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── Comment.js
│   │   ├── Activity.js
│   │   └── Notification.js
│   ├── routes/              # Express route definitions
│   ├── index.js             # Server entry point (Express + Socket.IO)
│   └── .env                 # Environment variables
│
├── frontend/
│   ├── app/
│   │   ├── layout.jsx               # Root layout (Navbar, Footer, Providers)
│   │   ├── page.jsx                 # Landing page
│   │   ├── login/page.jsx
│   │   ├── register/page.jsx
│   │   └── dashboard/
│   │       ├── layout.jsx           # Dashboard layout (Sidebar, SearchBar, NotificationBell)
│   │       ├── page.jsx             # Analytics dashboard
│   │       ├── profile/page.jsx     # User profile
│   │       └── project/[id]/page.jsx  # Project detail (Board, List, Timeline, Table)
│   ├── components/
│   │   ├── Navbar.jsx               # Auth-aware navbar (public + dashboard)
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx              # Project list + user info
│   │   ├── SearchBar.jsx            # Global search (Ctrl+K)
│   │   ├── NotificationBell.jsx     # Real-time notification dropdown
│   │   └── project/
│   │       ├── BoardView.jsx        # Kanban board
│   │       ├── ListView.jsx
│   │       ├── TimelineView.jsx
│   │       ├── TableView.jsx
│   │       ├── TaskDetailModal.jsx  # View, edit, delete tasks + comments
│   │       ├── CreateTaskModal.jsx
│   │       ├── CreateProjectModal.jsx
│   │       ├── AddMemberModal.jsx
│   │       └── ActivityFeed.jsx
│   ├── context/
│   │   └── AuthContext.js           # Auth state management
│   └── lib/
│       ├── axios.jsx                # Axios instance with credentials
│       └── socket.js                # Socket.IO client helper
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local or MongoDB Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/flowtrack.git
cd flowtrack
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/flowtrack
JWT_SECRET=your_jwt_secret_here
```

Start the backend server:

```bash
node index.js
```

The backend runs on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3001`.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all user's projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:id` | Get project by ID |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete project (cascades) |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/dashboard` | Dashboard analytics |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:projectId` | Get tasks by project |
| PUT | `/api/tasks/:taskId` | Update a task |
| DELETE | `/api/tasks/:taskId` | Delete task (cascades) |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/comments` | Add a comment |
| GET | `/api/comments/task/:taskId` | Get task comments |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search?query=` | Search users |
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update profile |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q=` | Global search |

---

## 🧑‍💼 User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Full access — manage all projects, tasks, and users |
| **Team Leader** | Create projects, manage members, create/edit/delete tasks |
| **Team Member** | View assigned projects, update tasks, add comments |

---

## 🔄 Real-Time Events (Socket.IO)

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-project` | Client → Server | Join a project room |
| `join-user` | Client → Server | Join user-specific room |
| `new-comment` | Server → Client | New comment on a task |
| `new-activity` | Server → Client | New project activity |
| `new-notification` | Server → Client | New notification for user |

---

## 📄 License

This project is licensed under the ISC License.
