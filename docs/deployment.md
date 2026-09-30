# Futoracare AI OS — Production Deployment Guide

## 1. Prerequisites
- Node.js 20.x or 22.x LTS (or Node 24)
- PostgreSQL 15+ database instance (e.g. AWS RDS, Supabase, Neon)
- Redis 7+ instance (e.g. Upstash, AWS ElastiCache)

---

## 2. Option A: Deployment to Vercel (Recommended)

1. **Connect Repository**: Link the GitHub / GitLab repository in the Vercel Dashboard.
2. **Framework Preset**: Next.js (automatically detected).
3. **Environment Variables**: Copy variables from `.env.example` into Vercel Project Settings:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `REDIS_URL`
   - `GOOGLE_AI_API_KEY` / `OPENAI_API_KEY`
   - `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID`
   - `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN`
4. **Deploy**: Trigger production deployment.

---

## 3. Option B: Docker Containerized Deployment

### `Dockerfile`
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

### Build & Run
```bash
docker build -t futoracare-ai-os:latest .
docker run -p 3000:3000 --env-file .env.production futoracare-ai-os:latest
```

---

## 4. Verification Checklist
- [x] Run automated test suite: `npm test`
- [x] Verify type safety: `npx tsc --noEmit`
- [x] Verify production build: `npm run build`
- [ ] Connect production PostgreSQL connection string in `.env`
- [ ] Configure Meta WhatsApp Cloud Webhook URL to point to `https://your-domain.com/api/whatsapp/webhook`
- [ ] Configure Twilio Voice Webhook URL to point to `https://your-domain.com/api/voice-calls/webhook`
