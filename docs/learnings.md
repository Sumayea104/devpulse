@"
# 📚 DevPulse - Learnings & Challenges

## Problems I Faced & Solutions

### 1. Railway Deployment - PATCH Route Not Working

**Problem:** `Cannot PATCH /api/issues/3` even though everything worked locally.

**Root Cause:** 
- Monolithic `server.ts` (222 lines) had no PATCH route
- Modular routes existed but weren't mounted in `app.ts`
- Railway was running old monolithic version

**Solution:**
- Separated into modular architecture
- Fixed route order (specific before generic)
- Properly mounted routes in `app.ts`

### 2. Port 5000 Already in Use

**Problem:** `EADDRINUSE: address already in use :::5000`

**Solution:**
`netstat -ano | findstr :5000`
`taskkill /PID 12345 /F`

### 3. node_modules Pushed to GitHub

**Problem:** `node_modules` uploaded to GitHub

**Solution:**
- Added `.gitignore` before first commit
- Used `git rm -r --cached node_modules` to remove

### 4. Express Route Order

**Problem:** `/api/issues/metrics/overview` returned 404

**Solution:** Specific routes must come BEFORE `/:id` routes

### 5. JWT Token Format

**Problem:** `401 Unauthorized`

**Solution:** Use plain token, not "Bearer" prefix

## Key Takeaways

- Create `.gitignore` BEFORE first commit
- Specific routes before parameterized routes
- Check Railway logs for debugging
- Read assignment specs carefully

## Useful Commands

`netstat -ano | findstr :5000` - Find process on port 5000
`taskkill /PID <PID> /F` - Kill process
`rm -rf dist && npm run build` - Clean rebuild
"@ | Out-File -FilePath docs/learnings.md -Encoding utf8