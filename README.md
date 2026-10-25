# ChatGPT MERN AI Content Generator

A simple full-stack app that generates blog posts, emails, social posts and product descriptions with the OpenAI API. Responses stream in live and every result is saved to MongoDB history.

**Stack:** React (Vite) · Node.js · Express · MongoDB (Mongoose) · OpenAI API

## Run locally

Requirements: Node 18+, a MongoDB URI (local or free [MongoDB Atlas](https://www.mongodb.com/atlas)), and an [OpenAI API key](https://platform.openai.com/api-keys).

```bash
# 1. Backend
cd server
cp .env.example .env      # then fill in OPENAI_API_KEY and MONGODB_URI
npm install
npm run dev               # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

## API

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/generate` | Streams generated text; saves it to MongoDB |
| GET | `/api/history` | Last 20 generations |
| DELETE | `/api/history/:id` | Remove one item |

## Push to GitHub

```bash
git init
git add .
git commit -m "ChatGPT MERN AI Content Generator"
git branch -M main
git remote add origin https://github.com/<your-username>/chatgpt-mern-content-generator.git
git push -u origin main
```

Never commit your `.env` file (it is already in `.gitignore`).

## Optional hosting

- Backend: Render or Railway. Set `OPENAI_API_KEY`, `MONGODB_URI` and `CLIENT_URL` as environment variables.
- Frontend: Vercel or Netlify. Set `VITE_API_URL` to your deployed backend URL.
