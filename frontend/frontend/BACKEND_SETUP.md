# Smart Study Backend Setup Guide

## 🚀 Quick Start (2-Month Implementation Timeline)

### Week 1-2: Database & Authentication
1. **MongoDB Setup**
   - Create MongoDB Atlas account (free tier)
   - Create a new cluster
   - Get your connection string
   - Add to `.env.local` as `MONGODB_URI`

2. **Install Dependencies**
   ```bash
   npm install mongodb bcryptjs jose
   npm install -D @types/bcryptjs
   ```

3. **Test Authentication**
   - Start your dev server: `npm run dev`
   - Test signup: POST to `/api/auth/signup`
   - Test login: POST to `/api/auth/login`

### Week 3-4: Core Features
1. **Tasks Management**
   - Implement task CRUD operations
   - Connect frontend task components
   - Add due date reminders

2. **Sleep & Mood Tracking**
   - Implement sleep logging
   - Add mood entry system
   - Create analytics dashboard

### Week 5-6: Calendar & Pomodoro
1. **Calendar Integration**
   - Event creation/editing
   - Connect with tasks
   - Add reminders

2. **Pomodoro Timer**
   - Session tracking
   - Break management
   - Statistics

### Week 7: Analytics & AI
1. **Dashboard Analytics**
   - Task completion trends
   - Sleep pattern analysis
   - Productivity insights

2. **AI Chatbot Integration**
   - Set up AI SDK
   - Implement chat history
   - Add context-aware responses

### Week 8: Testing & Deployment
1. **Testing**
   - API endpoint testing
   - Authentication flow
   - Data validation

2. **Deployment**
   - Deploy to Vercel
   - Set up production MongoDB
   - Configure environment variables

## 📋 API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user



### Tasks
- `GET /api/tasks` - Get all tasks (supports filtering)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Sleep Tracking
- `GET /api/sleep` - Get sleep logs
- `POST /api/sleep` - Create sleep log

### Mood Tracking
- `GET /api/mood` - Get mood entries
- `POST /api/mood` - Create mood entry

### Calendar
- `GET /api/calendar/events` - Get calendar events
- `POST /api/calendar/events` - Create event

### Pomodoro
- `GET /api/pomodoro` - Get pomodoro sessions
- `POST /api/pomodoro` - Start session
- `PUT /api/pomodoro/[id]/complete` - Complete session

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics

### Chat
- `GET /api/chat` - Get chat history
- `POST /api/chat` - Send message

## 🗄️ Database Collections

### users
- Authentication & profile data


### tasks
- Task details
- Due dates & priorities
- Completion status

### sleepLogs
- Sleep duration
- Sleep quality ratings
- Mood correlation

### moodEntries
- Daily mood tracking
- Thought journal
- Trend analysis

### calendarEvents
- Scheduled events
- Reminders
- Event types

### pomodoroSessions
- Focus sessions
- Break tracking
- Productivity metrics

### chatMessages
- User conversations
- AI responses
- Message history

## 🔒 Security Best Practices

1. **Password Security**
   - Passwords are hashed with bcrypt (12 rounds)
   - Never store plain text passwords

2. **JWT Authentication**
   - Tokens expire after 7 days
   - Stored in HTTP-only cookies
   - Use strong JWT_SECRET in production

3. **API Protection**
   - All endpoints check authentication
   - Users can only access their own data
   - Input validation on all requests

4. **MongoDB Security**
   - Use MongoDB Atlas with IP whitelist
   - Create database user with limited permissions
   - Enable connection encryption

## 🧪 Testing Examples

### Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Test Task Creation
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{"title":"Complete project","priority":"high","dueDate":"2025-01-20"}'
```

## 🎯 Next Steps for AI Integration

1. Install AI SDK:
   ```bash
   npm install ai @ai-sdk/openai
   ```

2. Update `/api/chat/route.ts` to use OpenAI
3. Add streaming responses
4. Implement context-aware study assistance

## 📊 MongoDB Indexes (For Performance)

Add these indexes in MongoDB Atlas:

```javascript
// users collection
db.users.createIndex({ email: 1 }, { unique: true })

// tasks collection
db.tasks.createIndex({ userId: 1, dueDate: 1 })
db.tasks.createIndex({ userId: 1, completed: 1 })

// sleepLogs collection
db.sleepLogs.createIndex({ userId: 1, date: -1 })

// moodEntries collection
db.moodEntries.createIndex({ userId: 1, date: -1 })

// calendarEvents collection
db.calendarEvents.createIndex({ userId: 1, startTime: 1 })

// pomodoroSessions collection
db.pomodoroSessions.createIndex({ userId: 1, startTime: -1 })

// chatMessages collection
db.chatMessages.createIndex({ userId: 1, timestamp: -1 })
```

## 🚨 Common Issues & Solutions

1. **MongoDB Connection Error**
   - Check MONGODB_URI format
   - Verify IP whitelist in Atlas
   - Ensure database user has correct permissions

2. **Authentication Not Working**
   - Verify JWT_SECRET is set
   - Check cookie settings
   - Test in non-incognito browser

3. **CORS Issues**
   - Next.js API routes handle CORS automatically
   - Ensure requests use same domain

## 📱 Mobile Considerations

The API is designed to work with mobile apps:
- Use JWT tokens for mobile authentication
- All responses are JSON
- RESTful endpoint design
- Stateless architecture

## 🔄 Data Migration

If you need to migrate data:
1. Export from old system
2. Transform to match schemas
3. Use MongoDB import tools
4. Verify data integrity

---

**Timeline Summary:**
- Weeks 1-2: Setup & Auth ✅
- Weeks 3-4: Core Features ✅
- Weeks 5-6: Calendar & Timer ✅
- Week 7: Analytics & AI ✅
- Week 8: Testing & Deploy ✅

Total: **2 months to completion**
