import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env vars from .env files and process.env (Vercel injects here)
    // Vite automatically exposes VITE_ prefixed vars to import.meta.env
    // Vercel's environment variables are available in process.env during build
    const env = loadEnv(mode, '.', '');
    
    // In Vercel, process.env contains the environment variables
    // We need to ensure they're available for Vite to inject
    const viteEnv = {
      ...env,
      // Override with process.env (Vercel's injected vars take precedence)
      VITE_CLERK_PUBLISHABLE_KEY: process.env.VITE_CLERK_PUBLISHABLE_KEY || env.VITE_CLERK_PUBLISHABLE_KEY,
      VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || env.VITE_GEMINI_API_KEY,
    };
    
    // Log for debugging (only in build, not in dev to avoid spam)
    if (mode === 'production') {
      console.log('🔧 Vite Config - Environment Variables Check:', {
        VITE_CLERK_PUBLISHABLE_KEY: viteEnv.VITE_CLERK_PUBLISHABLE_KEY ? '✅ SET' : '❌ NOT SET',
        VITE_GEMINI_API_KEY: viteEnv.VITE_GEMINI_API_KEY ? '✅ SET' : '❌ NOT SET',
        processEnvKeys: Object.keys(process.env).filter(k => k.startsWith('VITE_')),
      });
    }
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // Vite automatically exposes VITE_ prefixed vars to import.meta.env
      // But we can also explicitly define them to ensure they're available
      define: {
        // These will be statically replaced at build time
        'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(viteEnv.VITE_CLERK_PUBLISHABLE_KEY || ''),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(viteEnv.VITE_GEMINI_API_KEY || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
