# Hosting Guide for Version Control Dashboard

## Prerequisites
- **Node.js**: v22.22.1 (already installed)
- **MongoDB**: v8.0 (already installed)
- **Process Manager**: PM2 (recommended for background execution)

---

## 1. Environment Configuration Changes
The following files have been updated with the server-specific settings:

### Backend (`backend/.env`)
- **MONGO_URI**: Set to `mongodb://mern-stack:y168lkfP3Hs3@127.0.0.1:27017/mern-stack?authSource=admin`
- **PORT**: 5000

### Frontend (`frontend/.env`)
- **VITE_API_URL**: `http://10.2.77.151:5000/api`
- **VITE_IMAGE_BASE_URL**: `http://10.2.77.151:5000`

---

## 2. Deployment Steps (Manual)

### Connect to Server
```bash
ssh indianic@10.2.77.151
# Enter password: y168lkfP3Hs3
```

### Backend Setup
1. Navigate to backend: `cd Version-Control-Dashboard/backend`
2. Install dependencies: `npm install`
3. Start backend with PM2:
   ```bash
   # If pm2 is not installed globally, you can use npx
   npx pm2 start server.js --name "vcd-backend"
   ```

### Frontend Setup
1. Navigate to frontend: `cd Version-Control-Dashboard/frontend`
2. Install dependencies: `npm install`
3. Build for production: `npm run build`
4. Serve the build:
   ```bash
   # Use npx to avoid global permission issues
   npx pm2 start "npx serve -s dist -l 5173" --name "vcd-frontend"
   ```

---

## 3. How to View Database
To access the MongoDB shell and view data on the server:

1. **Enter MongoDB Shell**:
   ```bash
   mongosh "mongodb://mern-stack:y168lkfP3Hs3@127.0.0.1:27017/mern-stack?authSource=admin"
   ```

2. **Common Commands**:
   - Show collections: `show collections`
   - View users: `db.users.find().pretty()`
   - View games: `db.games.find().pretty()`

Alternatively, use **MongoDB Compass** on your local machine:
- Connection String: `mongodb://mern-stack:y168lkfP3Hs3@10.2.77.151:27017/mern-stack?authSource=admin`
- Note: This requires the server to allow external connections on port 27017 (checked via firewall) or use an SSH Tunnel.

---

## 4. Manual Settings Verification
- **CORS**: `backend/server.js` has been updated to allow requests from `http://10.2.77.151:5173`.
- **Firewall**: Ensure ports `5000` (Backend) and `5173` (Frontend) are open on the server firewall.
