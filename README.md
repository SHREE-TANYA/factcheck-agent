# FactCheck Agent 🔍

AI-powered fact-checking web app. Upload a PDF or TXT → extracts claims → verifies against live web.

## Live URL
> Add your Vercel URL here

## Stack
- Frontend: HTML/CSS/JS + PDF.js
- Backend: Vercel Serverless Functions
- AI: Claude claude-sonnet-4-20250514 + web search

## Deploy
1. Push this repo to GitHub
2. Import to Vercel
3. Add env var: `ANTHROPIC_API_KEY`
4. Deploy

## Structure
```
├── public/index.html   ← Frontend
├── api/extract.js      ← Extracts claims
├── api/verify.js       ← Verifies via web search
├── vercel.json         ← Routing
└── package.json
```
