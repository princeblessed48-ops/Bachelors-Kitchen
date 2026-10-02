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

- GET /api/timetable/current
- GET /api/timetable/month/:year/:month (current month only for members)

Unauthenticated timetable requests return only the first 14 dates of the current month in `APP_TIME_ZONE` (defaults to `Africa/Lagos`). Subscribers and admins with a valid JWT receive the full current month. Regular users cannot request future months.

Admin annual and monthly planning endpoints are documented in [Annual Scheduling](ANNUAL_SCHEDULING.md).

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
