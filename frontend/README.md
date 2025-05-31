# Podplay Build Sanctuary Frontend

This is the React + Vite + Tailwind CSS frontend for the Podplay Build Sanctuary project.

## Quick Start

1. Clone the repository
2. Run `npm install`
3. Create a `.env` file and add your API keys as needed
4. Run `npm run dev` to start the development server

## Project Structure
- `index.html` — Main HTML entry point (no import maps; Vite handles modules)
- `index.tsx` — React entry point
- `index.css` — Tailwind CSS directives
- `tsconfig.json` — TypeScript configuration

## Environment Variables
- Place your API keys and environment settings in a `.env` file. Example:
  ```env
  API_KEY=your_google_gemini_api_key
  VITE_API_BASE_URL=http://localhost:5000
  ```

## Backend Integration
- The frontend expects the backend Flask server to run on `http://localhost:5000`.
- All `/api` requests are proxied to the backend via Vite's dev server proxy.

## Building for Production
- Run `npm run build` to build the app for production (output in `dist/`).

## Troubleshooting
- If you see layout issues or missing components, make sure you have removed any `<script type="importmap">` blocks from `index.html` and restarted the dev server.
- If you see TypeScript errors about `vite/client`, ensure Vite is installed and `tsconfig.json` includes the correct types.
