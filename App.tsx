import React, { useState, useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, SignIn, SignUp, UserButton, useUser } from '@clerk/clerk-react';
import { Insight, ProcessingResult } from './types';
import Recorder from './components/Recorder';
import InsightList from './components/InsightList';
import ClerkErrorBoundary from './components/ClerkErrorBoundary';
import { getClerkKey } from './utils/config';

// Component for the Auth Landing Page
const AuthLanding: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">

      <div className="max-w-md w-full bg-surface p-8 rounded-2xl shadow-2xl border border-slate-700 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-indigo-500/20">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">MindCapture</h1>
        <p className="text-slate-400 mb-8">
          Turn your voice notes into research insights instantly using AI.
        </p>
        
        <div className="flex justify-center mb-6">
           {isSignUp ? (
             <SignUp 
               appearance={{
                 variables: { colorBackground: '#1e293b', colorText: '#f8fafc', colorPrimary: '#6366f1', colorInputBackground: '#0f172a', colorInputText: '#fff' },
                 elements: { card: 'shadow-none', rootBox: 'w-full' } 
               }} 
             />
           ) : (
             <SignIn 
               appearance={{
                 variables: { colorBackground: '#1e293b', colorText: '#f8fafc', colorPrimary: '#6366f1', colorInputBackground: '#0f172a', colorInputText: '#fff' },
                 elements: { card: 'shadow-none', rootBox: 'w-full' }
               }}
             />
           )}
        </div>

        <div className="text-sm text-slate-400">
           {isSignUp ? "Already have an account?" : "Don't have an account?"}
           <button 
             onClick={() => setIsSignUp(!isSignUp)}
             className="ml-2 text-primary hover:text-indigo-400 font-bold underline"
           >
             {isSignUp ? "Sign In" : "Sign Up"}
           </button>
        </div>
        
        <div className="mt-6 text-xs text-slate-600">
          Powered by Next.js, Gemini & Tailwind
        </div>
      </div>
    </div>
  );
};

// Component for the Main Dashboard
const Dashboard: React.FC = () => {
  const { user } = useUser();
  const [insights, setInsights] = useState<Insight[]>([]);

  // Load insights from local storage on mount (persistence simulation)
  useEffect(() => {
    const saved = localStorage.getItem('mindcapture_insights');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInsights(parsed);
      } catch (e) {
        console.error("Failed to load insights", e);
      }
    }
  }, []);

  // Save insights whenever they change
  useEffect(() => {
    if (insights.length > 0) {
      // Note: We strip blobs before saving to localStorage as it can't handle them easily
      const toSave = insights.map(({ audioBlob, ...rest }) => rest);
      localStorage.setItem('mindcapture_insights', JSON.stringify(toSave));
    }
  }, [insights]);

  const handleInsightGenerated = (result: ProcessingResult, audioBlob: Blob) => {
    const newInsight: Insight = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      transcription: result.transcription,
      title: result.title,
      summary: result.summary,
      tags: result.tags,
      audioBlob: audioBlob
    };
    
    setInsights(prev => [newInsight, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <span className="font-bold text-lg hidden sm:block">MindCapture</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-white">{user?.fullName || user?.firstName || "User"}</span>
                <span className="text-xs text-slate-500">Pro Plan</span>
            </div>
            <UserButton appearance={{
               elements: {
                 userButtonAvatarBox: "w-8 h-8 border border-slate-600"
               }
            }}/>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center pt-8 pb-12 px-4 gap-12">
        
        {/* Recorder Section */}
        <section className="w-full max-w-2xl">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Capture Thought</h2>
                <p className="text-slate-400 text-sm">Record up to 30s. AI will transcribe and research automatically.</p>
            </div>
            <Recorder onInsightGenerated={handleInsightGenerated} />
        </section>

        {/* List Section */}
        <section className="w-full">
            <div className="max-w-6xl mx-auto px-4 mb-6 border-b border-slate-800 pb-2 flex justify-between items-end">
                <h3 className="text-xl font-bold text-slate-200">Recent Insights</h3>
                <span className="text-xs text-slate-500">{insights.length} notes saved</span>
            </div>
            <InsightList insights={insights} />
        </section>

      </main>
      
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
        <p>&copy; 2024 MindCapture Inc. All data stored locally for demo.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const clerkKey = getClerkKey();

  if (!clerkKey || (!clerkKey.startsWith('pk_test_') && !clerkKey.startsWith('pk_live_'))) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
         <div className="max-w-md text-center space-y-6">
           <div className="inline-block p-4 rounded-full bg-slate-800 border border-slate-700 text-primary mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
           </div>
           <h1 className="text-2xl font-bold">Configuration Required</h1>
           <p className="text-slate-400">
             Please set <code className="bg-slate-800 px-2 py-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> in your <code className="bg-slate-800 px-2 py-1 rounded">.env.local</code> file.
           </p>
           <p className="text-sm text-slate-500">
             Restart the dev server after adding the key.
           </p>
         </div>
       </div>
     );
  }

  return (
    <ClerkErrorBoundary>
        <ClerkProvider publishableKey={clerkKey}>
        <SignedOut>
            <AuthLanding />
        </SignedOut>
        <SignedIn>
            <Dashboard />
        </SignedIn>
        </ClerkProvider>
    </ClerkErrorBoundary>
  );
};

export default App;