import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env vars from .env files and process.env (Vercel injects here)
    // Vite automatically exposes VITE_ prefixed vars to import.meta.env
    const env = loadEnv(mode, '.', '');
    
    // In Vercel, environment variables are available in process.env during build
    // Merge with loaded env vars, prioritizing process.env (Vercel's injected vars)
    const clerkKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || env.VITE_CLERK_PUBLISHABLE_KEY || '';
    const geminiKey = process.env.VITE_GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';
    
    console.log('🔧 Vite Config - Environment Variables:', {
      clerkKey: clerkKey ? `${clerkKey.substring(0, 10)}...` : 'MISSING',
      geminiKey: geminiKey ? `${geminiKey.substring(0, 10)}...` : 'MISSING',
      processEnv: {
        VITE_CLERK_PUBLISHABLE_KEY: process.env.VITE_CLERK_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
        VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY ? 'SET' : 'NOT SET',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET',
      }
    });
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // Vite automatically exposes VITE_ prefixed vars to import.meta.env
      // But we also define them explicitly to ensure they're available
      define: {
        'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(clerkKey),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
        'import.meta.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
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
