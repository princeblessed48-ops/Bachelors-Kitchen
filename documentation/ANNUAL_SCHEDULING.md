# Annual Meal Scheduling

## Model and visibility

`AnnualMealPlan` is the backend-only cycle record. Each year references 12 `MonthlySchedule` documents. Each monthly document contains one assignment per calendar date, a safe public meal snapshot, generation/manual source metadata, warnings and publication state. `ScheduleHistory` records generation, admin overrides, publication, archive and reshuffle actions.

Members cannot browse the annual plan. `GET /api/timetable/current` resolves the current year and month using `APP_TIME_ZONE` (defaults to `Africa/Lagos`). Guests and free users receive only days 1-14; a valid active subscriber or admin receives the complete current month. `/api/timetable/month/:year/:month` only allows the current month for members. Admin schedule APIs are protected independently.

## Generation

On MongoDB connection, the backend performs one maintenance pass and starts a daily `node-cron` task at 01:05 in `APP_TIME_ZONE`. It idempotently ensures the current annual plan, prepares this and next month, publishes the current month, and archives completed schedules. The following year's plan is generated during Q4, allowing newly approved recipes from the year to enter the upcoming cycle. Year plans are generated only when missing. Public requests also safely prepare a missing current plan, so the month does not depend on a browser being open.

The generator uses published meals only, rotates among categories, avoids repeats in the recent seven-day window where the library permits, penalizes using the previous year's same meal on the same date, and selects an exotic meal on Saturdays when one is available. It records a warning if the library cannot meet the exotic target or repetition rules. Leap years use calendar-derived month lengths.

Annual plans have a unique year index. Monthly schedules have a unique year/month index and validate unique date keys. Re-running the maintenance job does not regenerate an existing plan or replace manual changes. Only a future plan with no published or manually changed month may be deliberately reshuffled.

## Admin workflow

In Admin Dashboard, select a year and month. Generate the year's plan if it does not exist. Change an assigned meal and provide a reason to save a manual override; the override is marked `manual`, linked to the admin and protected from future automatic updates. Publish requires one assignment for every day. Review warnings and recent change history in the same panel.

## API

- `GET /api/timetable/current`
- `GET /api/timetable/month/:year/:month` (members: current month only)
- `GET /api/admin/timetable/years`
- `GET /api/admin/timetable/:year/:month`
- `GET /api/admin/timetable/:year/:month/history`
- `POST /api/admin/timetable/generate/:year`
- `POST /api/admin/timetable/prepare/:year/:month`
- `PATCH /api/admin/timetable/:year/:month/:entryId` with `mealId` and `reason`
- `POST /api/admin/timetable/publish/:year/:month`
- `POST /api/admin/timetable/reshuffle/:year` with optional reason

All admin routes require a JWT and the `admin` role. Subscriber schedule access is checked against MongoDB subscriptions; client-side flags do not grant access.

## Recovery and limitations

Generation failures are logged and do not delete existing plans. A missing/failed current plan returns a friendly temporary API error, or serves legacy published `Timetable` entries if present. Fix the published meal library or Atlas availability, then retry by calling the admin `generate/:year` endpoint for a missing year or wait for the next maintenance run. A deliberate future reshuffle is guarded against published/manual schedules.

Recipe snapshots preserve schedule-facing public fields. Full nutrition, storage, videos and chef contacts continue to come from the protected subscriber meal endpoint, never from annual schedule documents.
