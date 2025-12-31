import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env vars from .env files and process.env (Vercel injects here)
    const env = loadEnv(mode, '.', '');
    
    // In Vercel, environment variables are available in process.env
    // Merge with loaded env vars, prioritizing process.env
    const clerkKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || env.VITE_CLERK_PUBLISHABLE_KEY || '';
    const geminiKey = process.env.VITE_GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(clerkKey),
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
        'process.env.API_KEY': JSON.stringify(geminiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
