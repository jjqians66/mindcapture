// Read environment variables from .env.local (via Vite)
// Vite exposes env vars prefixed with VITE_ to the client via import.meta.env
export const getEnvVar = (key: string): string => {
  try {
    // Vite automatically exposes VITE_ prefixed vars to import.meta.env
    // This is the primary way to access env vars in Vite client code
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // Try VITE_ prefix first (Vite convention)
      const viteKey = `VITE_${key}`;
      if (import.meta.env[viteKey]) {
        return String(import.meta.env[viteKey]);
      }
      // Try direct key (for backwards compatibility)
      if (import.meta.env[key]) {
        return String(import.meta.env[key]);
      }
    }
    
    // Fallback to process.env (for Node.js/server-side or build time)
    // This shouldn't be needed in client code, but kept for safety
    if (typeof process !== 'undefined' && process.env) {
      const viteKey = `VITE_${key}`;
      if (process.env[viteKey]) {
        return String(process.env[viteKey]);
      }
      if (process.env[key]) {
        return String(process.env[key]);
      }
    }
    
    return '';
  } catch (e) {
    console.error('Error reading env var:', key, e);
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
