# SLMS User Panel

The existing `SLMS_USER` Vite/React application is a student-facing workspace for academics, hostel applications, expenses, complaints, reminders, notifications, profile management, and the local student copilot.

## Run locally

```bash
npm install
npm run dev
npm run build
npm run lint
```

With no API URL configured, the application uses its browser-based local data layer. Student records, CRUD changes, reminder preferences, notification read state, profile details, and local development accounts persist in browser storage.

## Backend integration

Set `VITE_API_BASE_URL` in a local `.env` file (see [.env.example](.env.example)) when the backend is available. All request setup is centralized in [src/api/client.js](src/api/client.js), including the base URL, bearer-token attachment, error handling, and JSON response handling. Authentication switches from local development storage to the API when this variable is set.

The local storage adapter lives in [src/services/studentDataService.js](src/services/studentDataService.js). Page components keep using the shared app data shape, so a backend service can replace the adapter without rewriting their UI.

### API data contract

`SLMS_USER` and `SLMS_ADMIN` should communicate only through the backend. Use stable entity IDs (`id` or legacy `key` during migration), ISO date strings (`YYYY-MM-DD` or ISO timestamps), and consistent status values.

| Domain | Suggested API paths |
| --- | --- |
| Authentication | `/auth/register`, `/auth/login`, `/auth/password-reset/*` |
| Profile and users | `/users/me`, `/students/:studentId` |
| Academic | `/courses`, `/assignments`, `/exams`, `/attendance` |
| Student services | `/hostel-applications`, `/expenses`, `/complaints` |
| Preferences | `/settings`, `/reminders`, `/notifications` |

Use one shared backend response envelope, for example `{ "data": ..., "message": "..." }`, and keep authorization decisions on the backend. The UI never communicates directly with `SLMS_ADMIN`.

## Development authentication

Without `VITE_API_BASE_URL`, registration and sign-in are genuine local development operations. Password values are hashed before being stored; no password is placed in the active session. The password-reset view displays a one-time code only in local development mode because email delivery requires the backend.