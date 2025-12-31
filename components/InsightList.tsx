import React from 'react';
import { Insight } from '../types';

interface InsightListProps {
  insights: Insight[];
}

const InsightList: React.FC<InsightListProps> = ({ insights }) => {
  if (insights.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="mb-2 text-4xl">🗒️</p>
        <p>No insights captured yet.</p>
        <p className="text-xs mt-2">Record your thoughts to generate research summaries.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto px-4 pb-20">
      {insights.map((insight) => (
        <div key={insight.id} className="bg-surface rounded-xl p-6 border border-slate-700 shadow-lg hover:border-slate-500 transition-colors flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-white leading-tight">{insight.title}</h3>
            <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
              {new Date(insight.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="mb-4">
            <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Transcription</p>
            <p className="text-slate-300 text-sm italic line-clamp-3">"{insight.transcription}"</p>
          </div>

          <div className="mb-4 flex-grow">
            <p className="text-xs font-semibold text-secondary mb-1 uppercase tracking-wider">Research Summary</p>
            <p className="text-slate-300 text-sm leading-relaxed">{insight.summary}</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-700">
            {insight.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-slate-800 text-accent text-xs rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InsightList;
