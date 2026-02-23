# Smart Waste Disposal System - Walkthrough

This guide will help you run and test the Smart Waste Disposal System.

## Prerequisites
- **MongoDB**: Ensure MongoDB is running on `localhost:27017`.
- **Node.js**: Required for the frontend.
- **Python**: Required for the backend.

## 1. Starting the Application

### Backend Setup (Python)
It is **highly recommended** to use a virtual environment to keep dependencies isolated.

1. **Create Virtual Environment**:
   ```bash
   cd backend
   # Windows
   python -m venv venv
   # Activate it
   .\venv\Scripts\activate
   ```
2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Database Configuration**:
   - The database name is configured in `backend/app/core/config.py`.
   - Default Name: `smart_waste_db`.
   - **Note**: You do **not** need to manually create the database in MongoDB. It will be created automatically when the first data (like a user registration) is saved.
4. **Run the Server**:
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   - The API will be available at `http://localhost:8000`.

### Frontend Setup (React)
1. Open a new terminal.
2. Navigate to the frontend directory: `cd frontend`
3. Install dependencies (if not done): `npm install`
4. Run the development server: `npm run dev`
   - The app will be available at `http://localhost:5173`.

## 2. User Roles & Testing Flow

### A. User Flow (Citizen)
1. **Register**: Go to `http://localhost:5173/register`. Create a new account with Role **"User"**.
2. **Login**: Login with the new credentials.
3. **Request Pickup**:
   - Click "Request New Pickup".
   - Enter address and select waste type.
   - **Map**: Click on the map to pin-point the exact location.
   - Submit.
4. **Complaints**:
   - Click "My Complaints".
   - Lodge a complaint (e.g., "Missed Pickup").
   - View history.

### B. Driver Flow
1. **Register**: Create a new account with Role **"Driver"**.
2. **Login**: Login as Driver.
3. **Dashboard**:
   - You will see assigned pickups (initially empty until Admin assigns).
   - Once assigned, you can click **"Navigate"** to open Google Maps.
   - Click **"Mark Complete"** when done.

### C. Admin Flow
1. **Register**: Create a new account with Role **"Admin"** (Note: In a real app, this would be restricted, but for demo, select "User" then manually update in DB or just add "Admin" option in Register page temporarily. *Wait, I removed Admin from Register page options to be safe, but you can add it back or manually update the user document in MongoDB to `role: "Admin"`*).
   - *Self-Correction*: I commented out the Admin option in `Register.jsx`. To test Admin, you can either:
     - Uncomment the Admin option in `frontend/src/pages/Register.jsx`.
     - OR: Register as User, then use a MongoDB tool (like Compass) to change the role to "Admin".
2. **Dashboard**:
   - View Stats (Total Users, Pickups, etc.).
   - **Live Pickup Map**: See all pending pickups on the map.
3. **Manage Pickups**:
   - Click "Manage Pickups".
   - Assign a Driver to a pending pickup.
4. **Manage Complaints**:
   - Click "Manage Complaints".
   - Update status (Open -> Resolved).

## 3. Key Features Implemented
- **Role-Based Access Control**: Secure JWT authentication.
- **Real-Time Map**: Leaflet integration for picking location and viewing pickups.
- **Status Tracking**: Full lifecycle for pickups (Pending -> Assigned -> Completed).
- **Complaint System**: Integrated issue reporting.
- **Responsive UI**: Built with Material UI.

## Troubleshooting
- **Map not loading?**: Ensure you have internet access (OpenStreetMap tiles require it).
- **Login failed?**: Check backend console for errors. Ensure MongoDB is running.
