# System Architecture

## Frontend

- React + Vite SPA
- Uses public pages, protected routes, and premium content logic
- Communicates with the backend through REST APIs

## Backend

- Express REST API
- MongoDB with Mongoose models
- JWT auth and role-based access
- Subscription checks for premium content

## Data flow

1. User logs in or registers
2. Client sends requests with JWT
3. API validates auth and subscription restrictions
4. Database returns requested data
