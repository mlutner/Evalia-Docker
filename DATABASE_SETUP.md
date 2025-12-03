# Database Configuration Guide

## ⚠️ CRITICAL: Know Your Database

This project has **TWO possible databases**:

| Database | Location | Contains | When to Use |
|----------|----------|----------|-------------|
| **Production (Replit/Neon)** | Cloud | Real survey data | Production, accessing real data |
| **Local (Docker)** | localhost:5432 | Empty/test data | Local development only |

## 🔴 Common Mistake to AVOID

**NEVER** run the app with the local Docker database if you expect to see real survey data.
The local database is empty - all real data is in Replit's Neon database.

---

## Getting the Production DATABASE_URL

### From Replit:
1. Go to your Replit project: https://replit.com/@mike913/evalia-survey (or your project URL)
2. Click the **Secrets** tab (lock icon) in the Tools panel
3. Find `DATABASE_URL` 
4. Copy the value - it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Store it safely:
1. Create `.env` file in project root (copy from `.env.example`)
2. Paste your DATABASE_URL there
3. **NEVER commit .env to git**

---

## Running the App

### Option 1: With Production Database (Real Data)
```bash
# Using .env file (recommended)
npm run dev

# Or with inline env vars
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" \
SESSION_SECRET="your-secret" \
PORT=4000 \
npm run dev
```

### Option 2: With Local Docker Database (Empty/Test)
```bash
# Start Docker database first
docker-compose up -d postgres

# Then run app
DATABASE_URL="postgresql://evalia:password@localhost:5432/evalia" \
SESSION_SECRET="dev-secret-key-12345" \
PORT=4000 \
npm run dev
```

---

## How to Tell Which Database You're Using

Check the server startup logs:
- **Neon/Production**: `postgresql://...neon.tech...`
- **Local Docker**: `postgresql://...localhost:5432...`

Or check `/api/templates` - if it returns 26 templates, the schema is set up.
Check `/api/surveys` - if it returns your surveys, you're on the right database.

---

## Database Schema

The app uses **Drizzle ORM** with these tables:
- `users` - User accounts
- `surveys` - Survey definitions
- `survey_responses` - Collected responses
- `survey_respondents` - Invited respondents
- `templates` - Survey templates
- `sessions` - Auth sessions
- `short_urls` - Short URL mappings
- `survey_analytics_events` - Analytics tracking

### Pushing Schema to New Database
```bash
DATABASE_URL="your-connection-string" npm run db:push
```

### Seeding Templates
```bash
DATABASE_URL="your-connection-string" npm run seed:templates
```

---

## Troubleshooting

### "relation 'users' does not exist"
The database schema hasn't been created. Run:
```bash
DATABASE_URL="your-url" npm run db:push
```

### "No surveys showing"
You're probably connected to the wrong database. Check your DATABASE_URL.

### "Templates empty"
Run the seed script:
```bash
DATABASE_URL="your-url" npm run seed:templates
```

