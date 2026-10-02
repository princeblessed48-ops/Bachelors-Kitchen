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

Public meal list/detail responses omit nutrition, servings, storage/reheating data, video URLs, and chef contacts. Subscriber details require JWT authentication and an active subscription.

## Timetable

- GET /api/timetable
- POST /api/timetable
- PUT /api/timetable/:id
- DELETE /api/timetable/:id

Unauthenticated timetable requests return only the first 14 dates of the selected month. Subscribers and admins with a valid JWT receive the full published month.

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
- GET /api/admin/ingredient-prices
- POST /api/admin/ingredient-prices
- PATCH /api/admin/ingredient-prices/:id
