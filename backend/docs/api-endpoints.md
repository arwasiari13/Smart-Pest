# SmartPest REST API

Base URL: `/api/v1`

## Auth

- `POST /auth/login`
- `POST /auth/register/fellah`

## Alerts

- `GET /alerts`
- `POST /alerts/detections` admin robot/AI ingestion endpoint
- `PATCH /alerts/:id/read`
- `PATCH /alerts/:id/resolve`

## Notifications

- `POST /notifications/device-tokens`
- `GET /notifications`
- `PATCH /notifications/:id/read`

## Robots

- `GET /robots`
- `PATCH /robots/:id/status`

## Socket.IO Events

Client joins:

- `join:user` with user id
- `join:territory` with territory id
- `join:robots`

Server emits:

- `alert:new`
- `notification:new`
- `territory:alert`
- `robot:update`
