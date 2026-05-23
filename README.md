# ⇄ FileSync — Office ↔ Home File Sharing

A full MERN stack app to share files between office and home.  
Supports: Word (.docx), PDF, PowerPoint (.pptx), Excel (.xlsx), Images, Text, ZIP and more.

---

## 📁 Project Structure

```
fileshare/
├── backend/
│   ├── middleware/
│   │   ├── auth.js          # JWT auth middleware
│   │   └── upload.js        # Multer file upload middleware
│   ├── models/
│   │   ├── User.js          # User schema + password hashing
│   │   └── File.js          # File schema + auto-categorization
│   ├── routes/
│   │   ├── auth.js          # POST /login, /register, GET /me
│   │   ├── files.js         # Upload, download, share, delete
│   │   └── users.js         # Search users for sharing
│   ├── uploads/             # Uploaded files stored here (auto-created)
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js            # Express app entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileCard.js      # File display card with download/share/delete
│   │   │   ├── ShareModal.js    # Share file with users modal
│   │   │   └── UploadZone.js    # Drag & drop upload with progress
│   │   ├── context/
│   │   │   └── AuthContext.js   # Auth state + login/register/logout
│   │   ├── pages/
│   │   │   ├── Dashboard.js     # Main dashboard with sidebar
│   │   │   ├── Login.js         # Login page
│   │   │   └── Register.js      # Register page
│   │   ├── utils/
│   │   │   ├── api.js           # All Axios API calls
│   │   │   └── fileHelpers.js   # Format size, icons, colors, dates
│   │   ├── App.js               # Router + protected routes
│   │   ├── App.css              # All styles (dark theme)
│   │   └── index.js             # React entry point
│   └── package.json
│
└── package.json             # Root — run both together
```

---

## 🚀 Setup & Run

### Step 1: Install dependencies

```bash
# In /backend
cd backend
npm install

# In /frontend
cd ../frontend
npm install
```

### Step 2: Configure backend .env

```env
PORT=5000
MONGO_URI=mongodb+srv://varmagollapalli_db_user:Varma%40db@office-home-share.peoi2id.mongodb.net/officeshare?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
```

### Step 3: Start backend

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Step 4: Start frontend

```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login + get JWT |
| GET | /api/auth/me | ✅ | Get current user |
| POST | /api/files/upload | ✅ | Upload a file |
| GET | /api/files/my | ✅ | My uploaded files |
| GET | /api/files/shared | ✅ | Files shared with me |
| GET | /api/files/download/:id | ✅ | Download a file |
| PUT | /api/files/:id/share | ✅ | Update sharing settings |
| DELETE | /api/files/:id | ✅ | Delete a file (owner only) |
| GET | /api/users/search?email=x | ✅ | Search users by email |

---

## ✨ Features

- ✅ JWT authentication (register / login / logout)
- ✅ Drag & drop file upload with progress bar
- ✅ Support for Word, PDF, PPT, Excel, Images, ZIP, Text
- ✅ File categorization (auto-detected from MIME type)
- ✅ Share files with specific users by email search
- ✅ Make files public (visible to all users)
- ✅ Download any accessible file
- ✅ Delete your own files
- ✅ Dashboard with stats, search, and category filters
- ✅ Responsive dark-themed UI
- ✅ 50MB file size limit
