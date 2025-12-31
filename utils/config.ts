// Read environment variables from .env.local (via Vite)
// Vite exposes env vars prefixed with VITE_ to the client
export const getEnvVar = (key: string): string => {
  try {
    // Try VITE_ prefix first (Vite convention)
    const viteKey = `VITE_${key}`;
    if (process.env[viteKey]) {
      return process.env[viteKey];
    }
    // Fallback to direct key
    return process.env[key] || '';
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
