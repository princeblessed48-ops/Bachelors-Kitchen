# API Documentation

## Auth

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

## Meals

- GET /api/meals
- GET /api/meals/:id
- POST /api/meals
- PUT /api/meals/:id
- DELETE /api/meals/:id
- GET /api/meals/:id/subscriber-details

## Timetable

- GET /api/timetable
- POST /api/timetable
- PUT /api/timetable/:id
- DELETE /api/timetable/:id

## Subscriptions

- GET /api/subscriptions/plans
- POST /api/subscriptions
- GET /api/subscriptions/my
- GET /api/subscriptions/billing

## Payments

- POST /api/payments/initialize
- GET /api/payments/verify/:reference

## Admin

- GET /api/admin/dashboard
- GET /api/admin/users
- GET /api/admin/meals
