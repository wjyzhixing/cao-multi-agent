# Frontend Instructions

## Architecture & Tech Stack
- Pure HTML5, CSS3, and ES Modules (`html + fetch`).
- Zero unnecessary build tooling for runtime execution; runs directly in modern browsers.
- Strict adherence to the shared API Contract:
  - Base URL: `/api/bicycles`
  - Envelope: `{ success: boolean, data: T | null, error: { code: string, message: string } | null, meta?: { page, pageSize, total } }`
  - Fields: `name` (string), `brand` (string), `type` (string), `price` (number >= 0).
  - Creation & update payloads must only contain `{ name, brand, type, price }`.

## Testing
- Tests are located in `test/`.
- Run tests using `npm test` from the `frontend/` directory.
- Tests verify both the API client contract and real integration against the backend Express application.
