# Podplay Build Sanctuary 🐻✨

Podplay Build Sanctuary is a unified, calm, and cohesive development environment designed specifically for Nathan. It's powered by Mama Bear (a Gemini-based AI assistant) and aims to provide a seamless, dynamic workspace for chat, coding, file management, project tracking, and launching mini-applications, all while minimizing cognitive load.

## Core Philosophy

The "Sanctuary" concept is central. Every design and functional choice serves to create:
- **Cognitive Calm:** Reducing context switching by integrating tools into one space.
- **Empowerment:** Providing proactive AI assistance and easy access to necessary tools.
- **Cohesion:** Ensuring a consistent and predictable user experience.

## Key Features

- **Unified Development Hub:** A dynamic central workspace that transforms to show:
    - **Mama Bear Chat:** Persistent, multimodal AI chat.
    - **Code Editor:** (Placeholder) For viewing and editing code.
    - **File Explorer:** (Placeholder) For project file management.
    - **Terminal:** (Placeholder) For command-line operations.
    - **Live Preview:** An iframe panel to preview web content or launched mini-apps.
    - **Agent Timeline:** Tracks Mama Bear's actions and thoughts.
- **Mama Bear AI Agent:**
    - Powered by Google Gemini API (`gemini-2.5-flash-preview-04-17`).
    - Proactive and supportive, offering a "gentle_supportive" personality.
    - Integrated directly into the chat and workspace.
- **Mini App Launcher:**
    - A curated collection of useful web-based tools (AI, coding, productivity, etc.).
    - Apps can be launched directly into the Live Preview panel.
- **Tailored UI/UX:**
    - Dark theme with calming aesthetics (purple accents, blurred backgrounds).
    - Responsive design.
    - Focus on accessibility and ease of use for Nathan.

## Tech Stack (Frontend)

- **Framework/Library:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI Integration:** `@google/genai` for Gemini API
- **State Management:** React Context / Component State

## Environment Setup

To run this project, you need to set up your environment variables. Specifically, the Google Gemini API key is required.

1.  **Create a `.env` file:**
    In the root directory of the project (alongside `package.json`), create a file named `.env`.

2.  **Add your API Key:**
    Open the `.env` file and add your Google Gemini API key like this:

    ```env
    API_KEY=your_actual_google_gemini_api_key_here
    ```

    Replace `your_actual_google_gemini_api_key_here` with your real API key. The application's `GeminiService.ts` expects this specific environment variable name (`API_KEY`) to be available via `process.env.API_KEY`.

    *Note: The `.env` file is ignored by Git (if a `.gitignore` file is properly set up) to prevent accidental commitment of sensitive keys. An `.env.example` file might be provided in some projects as a template, but you always need to create your own `.env` file.*

## Installation

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies using npm or yarn:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

## Running the Development Server

1.  **Ensure your `.env` file is created and contains your `API_KEY`.**
2.  **Start the Vite development server:**
    ```bash
    npm run dev
    ```
    This will typically start the application on `http://localhost:5173` (Vite's default) or another port if specified. The frontend will expect the backend (Flask app) to be running, likely on `http://localhost:5000` as per `VITE_API_BASE_URL` if used for backend calls.

## Building for Production

To create an optimized production build:
```bash
npm run build
```
The output files will be generated in the `dist` directory.

## Backend Context

This frontend application is designed to work with a Python Flask backend (presumably `app.py` from your project context). The backend provides API endpoints for chat, file management, etc. Make sure the backend server is running and accessible by the frontend, especially if the frontend makes direct API calls to it.

---

This README should help anyone (including Nathan) understand, set up, and run the Podplay Build Sanctuary frontend.
