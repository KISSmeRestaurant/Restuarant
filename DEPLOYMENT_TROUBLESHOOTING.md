# Deployment Troubleshooting Guide

## Current Issue
- 404 errors when trying to access `/api/admin/staff/:id/permissions`
- Indicates the deployed server doesn't have the latest code changes

## Immediate Solutions

### Option 1: Manual Render Deployment Trigger
1. Go to your Render dashboard
2. Find your backend service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete (5-10 minutes)

### Option 2: Force Deployment with Empty Commit
```bash
git commit --allow-empty -m "Force deployment trigger"
git push origin main
```

### Option 3: Local Development Testing
If you want to test locally while waiting for deployment:

1. **Start Local Backend:**
```bash
cd backend
npm install
npm start
```

2. **Update Frontend API URL temporarily:**
In `frontend/src/config/api.js`, change:
```javascript
// From:
const API_BASE_URL = 'https://restuarant-sh57.onrender.com/api';

// To:
const API_BASE_URL = 'http://localhost:5000/api';
```

3. **Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Verification Steps

### Check if Deployment Worked:
Run this in browser console:
```javascript
fetch('https://restuarant-sh57.onrender.com/api/admin/staff/test/permissions', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tableAccess: true, dashboardAccess: false })
}).then(r => console.log('Status:', r.status, r.status === 401 ? '✅ Working!' : '❌ Still not deployed'));
```

**Expected Result:** Status 401 (means endpoint exists but needs authentication)

### Test the Feature:
1. Login as admin
2. Go to User Management
3. Find a staff user
4. Toggle permission checkboxes
5. Should work without 404 errors

## Common Deployment Issues

### Issue 1: Build Failures
- Check Render logs for build errors
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### Issue 2: File Not Included
- Ensure all new files were committed:
  - `backend/middleware/staffPermissions.js`
  - Updated `backend/models/User.js`
  - Updated `backend/controllers/adminController.js`
  - Updated `backend/routes/adminRoutes.js`

### Issue 3: Environment Variables
- Check if all required environment variables are set in Render
- Verify database connection strings

## Next Steps

1. **Try Option 1 or 2 above** to trigger a fresh deployment
2. **Wait 5-10 minutes** for deployment to complete
3. **Test the verification steps** to confirm it's working
4. **If still not working**, try local development (Option 3)

## Contact Information
If deployment continues to fail, you may need to:
- Check Render service logs
- Verify GitHub webhook is working
- Ensure the repository is properly connected to Render
