# React + Vite - Bách Hoàn Anh Admin Frontend

This is the admin frontend for Bách Hoàn Anh application built with React and Vite.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Domain

All API requests use a centralized configuration. To change the API domain:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and set your API domain:
   ```
   VITE_API_BASE_URL=http://your-api-domain:port
   ```

**Example configurations:**
- Local development: `http://127.0.0.1:8080`
- Production: `http://bachhoanhanh.example.com`
- Docker: `http://bachhoanhanh`

### 3. Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173` and proxy all API requests to your configured domain.

## Environment Variables

- `VITE_API_BASE_URL`: Main API domain (default: `http://bachhoanhanh`)
- `VITE_OCR_GATEWAY`: Optional OCR service endpoint (uses `VITE_API_BASE_URL` if not set)

## API Configuration

All API endpoints are managed through `src/config.js`. The configuration automatically:
- Loads the domain from `VITE_API_BASE_URL` environment variable
- Constructs all API endpoint URLs
- Makes it easy to change the domain without modifying code

To add new API endpoints, edit `src/config.js` and add them to the `API_ENDPOINTS` object.

## Template Features

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
