# Interview Prep Studio

Interview Prep Studio is an AI-powered local web app designed to help job seekers — particularly those targeting product management roles — prepare for interviews in a personalized, structured way.

You provide two inputs: your resume (PDF) and a job description (pasted text or PDF). The app uses Claude to generate 35 tailored interview questions across five categories: **Behavioral**, **Technical & Product Skills**, **Leadership & Strategy**, **Role-Specific**, and **Culture Fit**. Each question comes with a collapsible answer guide showing what a strong response looks like and the specific keywords and themes to hit — giving you both a question bank and a coaching layer in one place.

## Features

- **35 tailored questions** generated from your actual resume and the specific job description — not generic templates
- **Answer guides** for every question: what the hiring manager wants to hear + keywords to weave in
- **Company context** — paste or upload a PDF of company info (mission, values, news, culture) to sharpen Culture Fit and Role-Specific questions
- **Hiring manager context** — paste or upload a PDF of the hiring manager's LinkedIn profile to personalize question framing and tone
- **Session history** — sessions are saved locally so you can revisit prep for different roles
- **Export to .docx** — download a formatted Word document with all questions and answer guides organized by category

## API

This app uses the **Anthropic API** (`claude-sonnet-4-6` model). You need an Anthropic account and API key to run it.

- Get a key at [console.anthropic.com](https://console.anthropic.com)
- Each session generation costs roughly **$0.05–$0.10** — API credits are pay-as-you-go, no subscription required

## Running Locally

**Prerequisites:** Node.js 18+

### 1. Clone the repo and install dependencies

```bash
git clone <repo-url>
cd interview-prepper
npm run install:all
```

### 2. Add your Anthropic API key

```bash
cp server/.env.example server/.env
```

Open `server/.env` and replace the placeholder with your key:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Start the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## How to Use It

1. **Enter the role title and company** you're interviewing for (optional but improves output)
2. **Upload your resume** as a PDF
3. **Paste or upload** the job description
4. Optionally expand **Add Company Context** and paste or upload a PDF with info about the company — mission, values, recent news, culture
5. Optionally expand **Add Hiring Manager Context** and paste or upload a PDF of the hiring manager's LinkedIn profile — open their profile, select all, copy, paste (or save as PDF)
6. Click **Generate** and wait ~30 seconds while Claude analyzes your inputs
7. **Browse by category tab** — click any question to expand its answer guide
8. Click **Export .docx** to download the full question bank as a formatted Word document
9. Previous sessions appear in the left sidebar — click any to reload it, or start a new one

## Production Build

To run as a single process on one port (no Vite dev server):

```bash
npm run build   # compiles React app to client/dist/
npm start       # Express serves both the API and the built frontend on port 3001
```
