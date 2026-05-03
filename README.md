# Legal AI Assistant

AI powered legal document analyzer.

A simple web app built with HTML, CSS, and JavaScript that analyzes contract text using the Groq API.

## Features

- Paste contract text directly in the textarea
- Upload `.txt` contracts
- Analyze for:
  - Risky clauses
  - Safe clauses
  - Missing important terms
- Clean, professional UI with categorized output cards

## How to Run

### Deployed (recommended)

Deploy to [Vercel](https://vercel.com). In the project settings, add an environment variable **`GROQ_API_KEY`** with your Groq API key. The browser calls the serverless route `api/analyze.js`, which attaches the key—users never see or enter it.

### Local development

Use [Vercel CLI](https://vercel.com/docs/cli) so `/api/analyze` is served:

```bash
vercel dev
```

Set `GROQ_API_KEY` in `.env.local` (see Vercel CLI env docs) or in your shell before `vercel dev`.

Opening `index.html` directly from disk will not resolve `/api/analyze`; use `vercel dev` or a deployed URL.

## Notes

- This is an AI-assisted review, not legal advice.
- For privacy, use this app in a trusted environment and avoid sharing sensitive contracts unless permitted.
