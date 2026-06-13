# SmartPest Backend Architecture

## Layers

- `routes`: REST endpoint declaration and authorization guards.
- `controllers`: HTTP request/response mapping.
- `services`: business logic, Prisma calls, notifications, realtime events.
- `middleware`: JWT auth, role authorization, validation, rate limit, errors.
- `prisma`: relational model, SQL migration, seed data.
- `realtime`: Socket.IO rooms and events.

## Alert Flow

1. Robot/camera uploads a detection payload to `POST /api/v1/alerts/detections`.
2. Backend stores `ImageCapturee`.
3. If `detectedClass === harmful_snail`, backend creates `Alerte`.
4. Backend creates `Notification`.
5. Expo push is sent to active `DeviceToken` rows for the fellah.
6. Socket.IO emits `alert:new` to the fellah room and `territory:alert` to territory subscribers.
7. Mobile opens `smartpest://alerts/:id` from push notification data.

## Database Cardinalities

- `User 1-1 Admin`
- `User 1-1 Fellah`
- `Fellah 1-N Territoire`
- `Territoire 1-N Robot`
- `Robot 1-N Camera`
- `Robot 1-N Trajet`
- `Camera 1-N ImageCapturee`
- `ModeleIA 1-N ImageCapturee`
- `ImageCapturee 0-1 Alerte`
- `Alerte 1-N Notification`
- `User 1-N DeviceToken`

## Production Notes

- Use PostgreSQL with Prisma migrations.
- Replace local storage with S3 or Firebase Storage by implementing `storage.service.ts`.
- Use HTTPS, a strong `JWT_SECRET`, and real CORS origins.
- Run `prisma migrate deploy` in production.
- Run the API behind a reverse proxy and process manager.
