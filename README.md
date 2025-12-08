# Beauty License Admin Panel

A modern admin panel built with React, TypeScript, shadcn/ui, and Tailwind CSS for managing licenses, knowledge bases, users, and AI configuration.

## Features

- 🔐 Authentication with JWT
- 📋 License Management - Create, activate, and deactivate licenses
- 📚 Knowledge Base Management - Create and attach knowledge bases to licenses
- 👥 User Management - View user details and their licenses
- ⚙️ Configuration - Configure AI settings (OpenAI, Gemini, Anthropic)

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **date-fns** - Date formatting

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:3000
```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/        # Reusable components
│   ├── ui/          # shadcn/ui components
│   └── layout/      # Layout components
├── contexts/        # React contexts (Auth)
├── lib/            # Utilities and API client
├── pages/          # Page components
├── types/          # TypeScript types
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## API Integration

The app integrates with the Beauty License Manager API. Make sure your backend is running and accessible at the URL specified in `.env`.

### Endpoints Used

- `POST /auth/login` - User authentication
- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `GET /licenses` - List all licenses
- `POST /licenses` - Create license
- `PATCH /licenses/:id/activate` - Activate license
- `PATCH /licenses/:id/deactivate` - Deactivate license
- `GET /knowledge-bases` - List knowledge bases
- `POST /knowledge-bases` - Create knowledge base
- `POST /knowledge-bases/attach` - Attach KB to license
- `GET /config/ai` - Get AI configuration
- `PUT /config/ai` - Update AI configuration

## License

MIT

