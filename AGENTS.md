# AGENTS.md - IELTS Writing Practice

## Project Overview
A single-page static website for IELTS writing practice. Features embedded topic data, timed writing exercises, word count tracking, model answers, and scoring guides. Progress is saved to localStorage.

## Tech Stack
- HTML5 + CSS3 + Vanilla JavaScript
- Google Fonts (Inter + Merriweather)
- No build step, served via Python HTTP server

## File Structure
```
/workspace/projects
  index.html          - Main page (HTML + CSS)
  scripts/
    data.js           - Topic data and scoring criteria
    app.js            - Application logic (timer, word count, filters, storage)
  DESIGN.md           - Design specifications
  .coze               - Build/run configuration
```

## Key Features
- 16 IELTS writing topics (8 Task 1, 8 Task 2) with model answers
- Topic filtering by task type, difficulty, and search
- Countdown timer with visual ring progress
- Real-time word count with color-coded status
- Auto-save to localStorage
- Model answer viewer
- Scoring criteria reference
- Responsive layout with mobile sidebar

## Development
- Dev server: `python -m http.server ${DEPLOY_RUN_PORT} --bind 0.0.0.0`
- No build step required
- Static files served directly

## Design
- Academic, focused aesthetic (see DESIGN.md)
- Color palette: warm white bg, deep indigo primary, amber gold accent
- Fonts: Merriweather (headings), Inter (UI), Georgia (writing area)
