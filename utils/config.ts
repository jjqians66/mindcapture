// Read environment variables from .env.local (via Vite)
// Vite exposes env vars prefixed with VITE_ to the client via import.meta.env
export const getEnvVar = (key: string): string => {
  try {
    // Try import.meta.env first (Vite's way of exposing env vars to client)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const viteKey = `VITE_${key}`;
      if (import.meta.env[viteKey]) {
        return import.meta.env[viteKey];
      }
      if (import.meta.env[key]) {
        return import.meta.env[key];
      }
    }
    
    // Fallback to process.env (for Node.js/server-side or build time)
    if (typeof process !== 'undefined' && process.env) {
      const viteKey = `VITE_${key}`;
      if (process.env[viteKey]) {
        return process.env[viteKey];
      }
      if (process.env[key]) {
        return process.env[key];
      }
    }
    
    return '';
  } catch (e) {
    return '';
  }
};

// Key Accessors - read from .env.local
export const getClerkKey = (): string => {
  return (
    getEnvVar('CLERK_PUBLISHABLE_KEY') || 
    getEnvVar('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY') ||
    ''
  );
};

export const getGeminiKey = (): string => {
  return (
    getEnvVar('GEMINI_API_KEY') || 
    getEnvVar('API_KEY') ||
    ''
  );
};

export const getOpenAIKey = (): string => {
  return getEnvVar('OPENAI_API_KEY') || '';
};
