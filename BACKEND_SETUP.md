## Backend Setup Instructions

This directory contains all necessary files to set up the Express backend for Canteras Renacimiento Admin Panel.

### Quick Setup (Choose ONE method):

#### Method 1: Node.js (Recommended)
```bash
node setup-final.js
```
Or:
```bash
cd "c:\Users\Xavier\para proyectos web\proyecto"
node setup-final.js
```

#### Method 2: Python
```bash
python setup-backend.py
```

#### Method 3: Windows Batch File
```bash
run-setup.bat
```

### What These Scripts Do

They will automatically create the complete backend directory structure:
```
backend/
├── server.js
├── package.json
├── .env
├── .gitignore
├── config/
│   ├── database.js
│   └── jwt.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validateInput.js
└── routes/
    └── index.js
```

### Next Steps After Setup

Once the setup script runs successfully:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Install dev dependencies:
   ```bash
   npm install --save-dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will run on http://localhost:3001

### Environment Variables

The `.env` file includes:
- `PORT=3001`
- `DB_HOST=localhost`
- `DB_USER=root`
- `DB_PASSWORD=` (leave empty unless needed)
- `DB_NAME=canterasrenacimiento`
- `JWT_SECRET=your-secret-key-change-in-production-12345abcde`
- `JWT_EXPIRE=24h`
- `NODE_ENV=development`

**Important**: Update `JWT_SECRET` in production!

### API Endpoints

Once running:
- Health check: `GET /health` → `{ status: "ok" }`
- API route: `GET /api/health` → `{ success: true, message: "API is running" }`

### Files Included in This Setup

1. **setup-final.js** - Primary setup script (Node.js, most reliable)
2. **setup-backend.js** - Alternative Node.js version
3. **setup-backend.py** - Python alternative
4. **create-backend-dirs.bat** - Just creates directories
5. **run-setup.bat** - Batch wrapper for setup

All scripts do the same thing - create the backend directory structure with all necessary files.

### Troubleshooting

If scripts don't work:
1. Make sure you're in the correct directory
2. Ensure Node.js or Python is installed and in PATH
3. Check that you have write permissions to the directory
4. Run from Command Prompt or PowerShell with admin privileges if needed

