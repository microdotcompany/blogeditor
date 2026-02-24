# Blog Editor

A rich text editor for static site blogs. Edit Markdown and HTML files in your GitHub repositories through a visual editor powered by TipTap.

## Stack

- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui + TipTap
- **Backend:** Express + TypeScript + MongoDB
- **Auth:** GitHub OAuth

## Setup

```bash
npm install
```

Create `server/.env`:

```
MONGODB_URI=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
JWT_SECRET=
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:3000
```

## Development

```bash
npm run dev
```

Starts both the server (`:3000`) and web app (`:5173`).

## Build

```bash
npm run build
```

## License

MIT
