<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1XGBJ0pijy27T6pSxjh014NnVJZ5-8C8T

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file in the root directory with the following variables:
   ```bash
   # Required: Clerk Authentication
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
   
   # Required: Google Gemini API
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Get your API keys:
   - **Clerk**: Get your publishable key from [Clerk Dashboard](https://dashboard.clerk.com)
   - **Gemini**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

4. Run the app:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

## Required Environment Variables

- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key (required)
- `VITE_GEMINI_API_KEY` - Google Gemini API key (required)

See `.env.example` for a template.
