# GrowEasy AI CSV Importer Pipeline

An intelligent, full-stack CSV importing wizard designed to map arbitrary lead spreadsheet layouts directly into strict CRM schemas using the Gemini 2.5 Flash model.

## Tech Stack
- **Frontend**: Next.js (App Router, Tailwind CSS, Lucide Icons, PapaParse)
- **Backend**: Node.js, Express, TypeScript, `@google/genai` SDK

## Local Installation & Setup

### 1. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the root of the backend folder and provide your API Key:
   ```env
   PORT=5000
   GEMINI_API_KEY=AQ.Ab8RN6KR1tXF_JgYPFVJnYLPDmRS_UbbmGKI5i8lDvgH1QGsnA