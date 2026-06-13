# SmartPest Backend

Production-oriented Express + TypeScript + Prisma backend integrated into the existing SmartPest app workspace.

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

## Core Features

- PostgreSQL relational schema via Prisma
- JWT authentication and role authorization
- Admin/Fellah role model
- Territory, robot, camera, AI model, trajectory, captured image, alert, notification, and cloud server entities
- Expo push notification delivery
- Socket.IO realtime alert and robot updates
- Local upload storage adapter with cloud-ready interface
- SQL migration and seed data included
