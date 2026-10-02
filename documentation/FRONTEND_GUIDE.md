# Frontend Guide

The frontend is a Vite React app with page-based routing and API calls to the backend. It uses environment config for base URLs and keeps UI and API logic separated.

The shared footer lives in `src/components/Footer.jsx`. Contact fields use `VITE_SUPPORT_EMAIL`, `VITE_SUPPORT_PHONE`, `VITE_SUPPORT_PHONE_LABEL`, `VITE_SUPPORT_LOCATION`, `VITE_SUPPORT_MAP_URL`, and `VITE_SUPPORT_HOURS`; location, map and hours are omitted unless configured. The footer uses React Router for internal destinations and adds a reduced-motion-aware back-to-top control.
