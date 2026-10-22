# EduTrend Lite X Implementation Plan

A feature-rich, high-fidelity EdTech mobile and web application inspired by EduTrendX, featuring AI-powered learning trends, interactive quizzes, curated courses, smart notes, exam prep (PYQ & NCERT books), dynamic learning roadmaps, and an AI tutor chatbot.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Display Mode**: The app will be presented in a sleek mobile phone frame on desktop with a toggle to expand to full responsive view.
> - **AI Integration**: Powered by server-side Gemini (`gemini-3.8-flash`) for the "Ask AI Bot" tutor and dynamic study roadmap recommendations.
> - **Interactive Features**: Fully interactive Quiz Arena, Course Lessons, Smart Notes, Important Questions, NCERT Library, and PYQ solver.

- **Confirmed Decision 1**: Modern dark slate theme with glowing violet/purple neon accents matching the EduTrendX design language.
- **Confirmed Decision 2**: Local storage persistence for bookmarks, quiz scores, and roadmap progress.

---

## 1. Overview & Core Concept

- **What It Does**: An all-in-one learning and career trend dashboard for students and professionals. It tracks high-demand tech skills (e.g., AI & Full-Stack up +42%), provides structured learning courses, interactive quizzes, exam preparation materials, and an AI assistant for instant doubt clearing.
- **Target Audience**: Students, job seekers, and continuous learners looking to upskill in high-demand domains.
- **Key Value**: Combines real-time industry demand insights with interactive educational modules and AI mentorship in a polished mobile-first interface.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Home Dashboard**: View learner greeting, industry trend alert, main options grid (Quiz, Courses, Notes, Important Questions, NCERT Books, PYQ), trending topic filters, and dynamic learning roadmap.
  2. **Interactive Quiz Arena**: Select a topic, answer multiple-choice questions with instant feedback, and view score results.
  3. **Curated Courses**: Browse paths, view modules, track completion percentage, and read lesson content.
  4. **Smart Notes & Exam Prep**: Search and read chapter notes and previous years' question papers with solutions.
  5. **Ask AI Bot**: Floating bottom navigation button opens an interactive AI tutor chat drawer powered by Gemini.
  6. **Saved & Profile Views**: Manage bookmarked courses/notes and learner progress stats.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Premium dark EdTech UI (deep slate background `#0B0F19`, dark navy cards `#131827`, vivid violet/purple gradients `#8B5CF6` to `#C084FC`).
  - *Typography*: Clean sans-serif (`Plus Jakarta Sans` / `Inter`) with tabular numerals for scores and progress stats.
  - *Layout*: Mobile phone container simulation on desktop with touch-optimized card grids and a fixed bottom navigation bar.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1**: Mobile-First Container with Full Responsiveness
  - *Chosen Approach*: Render inside an elegant mobile mockup frame on desktop while remaining fully usable on mobile screens.
  - *Why*: Matches the user's reference mockup while providing great usability across devices.
- **Decision 2**: Server-Side Gemini AI Integration
  - *Chosen Approach*: Proxy AI requests through an Express backend (`/api/ai/chat`) using `@google/genai` (`gemini-3.8-flash`).
  - *Why*: Keeps the API key secure and enables reliable AI tutor responses.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                        React SPA                       │
│  (Home Dashboard, Quiz Arena, Courses, Notes, AI Bot)  │
└───────────────────────────┬────────────────────────────┘
                            │
              HTTP API (Fetch / SSE)
                            │
┌───────────────────────────▼────────────────────────────┐
│                  Express Server (server.ts)            │
│       - Static assets / Vite middleware                │
│       - /api/ai/chat (GoogleGenAI gemini-3.8-flash)    │
└────────────────────────────────────────────────────────┘
```

- **Data Models**:
  - Courses: id, title, category, progress, modules, description
  - Quizzes: id, question, options, correctAnswer, explanation
  - Notes / PYQs: id, subject, title, content, year
  - Roadmap: stages (Stage 1 Done, Stage 2 Active, Stage 3 Upcoming), jobMatch %
- **State Management**: React `useState` and `localStorage` for user bookmarks, completed quizzes, and learning progress.
