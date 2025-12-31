# MindCapture

Turn your voice notes into research insights instantly using AI.

MindCapture is an AI-powered research assistant that transcribes your voice recordings and generates intelligent summaries, titles, and tags using Google's Gemini AI.

## Features

- 🎤 **Voice Recording** - Record up to 30 seconds of audio directly in your browser
- 🤖 **AI Transcription** - Automatic transcription using Google Gemini AI
- 🔍 **Smart Insights** - AI-generated titles, summaries, and topic tags
- 💾 **Local Storage** - All insights saved locally in your browser
- 🔐 **Secure Authentication** - Powered by Clerk for secure user management

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS
- **Authentication**: Clerk
- **AI**: Google Gemini API
- **Backend**: Python FastAPI (Vercel Serverless Functions)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
- Clerk account ([Sign up here](https://clerk.com))

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jjqians66/mindcapture.git
   cd mindcapture
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # Required: Clerk Authentication
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
   
   # Required: Google Gemini API
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   
   # Optional: OpenAI API (if using OpenAI services)
   OPENAI_API_KEY=sk-your_openai_api_key_here
   ```

4. **Get your API keys**
   - **Clerk**: Get your publishable key from [Clerk Dashboard](https://dashboard.clerk.com)
   - **Gemini**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:3000`

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy with Vercel CLI**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel**
   
   Add the following environment variables in your Vercel project settings:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_GEMINI_API_KEY`
   - `OPENAI_API_KEY` (optional)
   - `CLERK_SECRET_KEY` (for backend API)
   - `GEMINI_API_KEY` (for backend API)

   Or use Vercel CLI:
   ```bash
   vercel env add VITE_CLERK_PUBLISHABLE_KEY production
   vercel env add VITE_GEMINI_API_KEY production
   ```

## Project Structure

```
mindcapture/
├── api/                    # Backend API (Python FastAPI)
│   ├── auth.py            # Authentication endpoints
│   └── index.py           # Main API handler
├── components/            # React components
│   ├── ClerkErrorBoundary.tsx
│   ├── InsightList.tsx
│   ├── Recorder.tsx
│   ├── SettingsModal.tsx
│   └── Visualizer.tsx
├── services/              # Service layer
│   └── geminiService.ts   # Gemini AI integration
├── utils/                 # Utility functions
│   └── config.ts         # Environment variable helpers
├── App.tsx               # Main application component
├── index.tsx             # Application entry point
├── types.ts              # TypeScript type definitions
├── vite.config.ts        # Vite configuration
├── vercel.json           # Vercel deployment configuration
└── package.json          # Dependencies and scripts
```

## Usage

1. **Sign in/Sign up** using Clerk authentication
2. **Click the record button** to start recording (up to 30 seconds)
3. **Stop recording** - AI will automatically:
   - Transcribe your audio
   - Generate a title
   - Create a research summary
   - Extract relevant tags
4. **View your insights** in the list below
5. **Click on any insight** to see full details

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key for authentication |
| `VITE_GEMINI_API_KEY` | Yes | Google Gemini API key for AI processing |
| `OPENAI_API_KEY` | No | OpenAI API key (if using OpenAI services) |
| `CLERK_SECRET_KEY` | Yes (backend) | Clerk secret key for backend API |
| `GEMINI_API_KEY` | Yes (backend) | Gemini API key for backend API |

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting (if configured)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/jjqians66/mindcapture/issues)
- Check the [documentation](https://github.com/jjqians66/mindcapture)

## Acknowledgments

- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Clerk](https://clerk.com/) for authentication
- [Vercel](https://vercel.com/) for hosting
- [Vite](https://vitejs.dev/) for build tooling
