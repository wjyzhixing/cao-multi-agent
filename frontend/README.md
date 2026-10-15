# Bicycle Management Frontend

A pure HTML5, CSS3, and modern JavaScript (Fetch + ES Modules) frontend application implementing CRUD operations for bicycles according to the shared API contract.

## Features
- **Create Bicycle**: Form modal to create a bicycle with name, brand, type, and price. Client and server validation error handling.
- **List Bicycles**: Paginated inventory table with search/filtering, formatted currency, badges, and responsive design.
- **View Bicycle**: Modal displaying detailed bicycle information (ID, Name, Brand, Type, Price, CreatedAt).
- **Edit Bicycle**: Pre-filled modal form allowing updates to bicycle fields with payload sanitization ensuring only contract-specified fields are sent.
- **Delete Bicycle**: Confirmation modal and immediate UI list refresh.
- **API Endpoint Configuration**: Ability to toggle/configure the API Base URL directly in the UI (default `/api/bicycles`).
- **Error & Status Handling**: Support for unified response envelope `{ success, data, error, meta }`, showing user-friendly toast messages and error banners.

## Project Structure
```text
frontend/
├── AGENTS.md        # Frontend agent instructions & architectural conventions
├── README.md        # Frontend documentation
├── package.json     # Node test and dev scripts
├── index.html       # Single-page application UI
├── styles.css       # Responsive styling, design tokens, modals, and toasts
├── serve.js         # Local static dev server with API reverse proxy
├── src/
│   ├── api.js       # Fetch client adhering to API contract
│   └── app.js       # State management, DOM events, and UI lifecycle
└── test/
    └── api.test.js  # Contract verification and backend integration tests
```

## Running & Testing

### Run Tests
```bash
cd frontend
npm test
```

### Run Dev Server
```bash
cd frontend
npm start
```
By default, the server runs at `http://localhost:8080` and proxies `/api/*` to `http://localhost:3000`.
