import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env vars from .env files and process.env (Vercel injects here)
    // Vite automatically exposes VITE_ prefixed vars to import.meta.env
    // Vercel's environment variables are available in process.env during build
    const env = loadEnv(mode, '.', '');
    
    // Log for debugging (only in build, not in dev to avoid spam)
    if (mode === 'production') {
      console.log('🔧 Vite Config - Environment Variables Check:', {
        VITE_CLERK_PUBLISHABLE_KEY: process.env.VITE_CLERK_PUBLISHABLE_KEY ? '✅ SET' : '❌ NOT SET',
        VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY ? '✅ SET' : '❌ NOT SET',
      });
    }
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // Vite automatically exposes VITE_ prefixed vars to import.meta.env
      // No need to manually define them - Vite handles it automatically
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
