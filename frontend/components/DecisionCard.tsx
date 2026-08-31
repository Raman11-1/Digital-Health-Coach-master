"use client";

import React from 'react';

interface DecisionCardProps {
  reasoning: string;
}

export default function DecisionCard({ reasoning }: DecisionCardProps) {
  // 1. Clean up the text: Remove the "AI Reasoning" header if it appears in the text itself
  // to avoid duplication with the card header.
  const cleanText = reasoning.replace(/AI Reasoning\s*Insight\s*/i, "").trim();

  // 2. Parse the sections: Split by the numbered list pattern (e.g., "1. **Title**")
  // This Regex looks for a new line, followed by a number, a dot, and bold markers.
  const sections = cleanText.split(/\n(?=\d+\.\s\*\*)/).filter(Boolean);

  // If parsing fails (e.g. old data format), we use this fallback
  const isOldFormat = sections.length <= 1 && !cleanText.includes("**");

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-md border border-purple-200 overflow-hidden card-transition">
      {/* Header Section */}
      <div className="p-6 pb-4 border-b border-purple-100 flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md text-white">
          <span className="text-2xl">🤖</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            Coach's Analysis
            <span className="ml-2 text-xs font-semibold bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
              Insight
            </span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Personalized feedback based on your recent activity.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 pt-4">
        {!isOldFormat ? (
          <div className="space-y-6">
            {sections.map((section, idx) => {
              // Extract the Title (text between ** and **)
              const titleMatch = section.match(/\d+\.\s\*\*(.*?)\*\*:?/);
              const title = titleMatch ? titleMatch[1] : `Point ${idx + 1}`;

              // Extract the Body Lines (everything after the title line)
              const contentLines = section
                .replace(/.*\n?/, "") // Remove the first line (title)
                .split("\n")          // Split rest by newlines
                .map(line => line.trim())
                .filter(line => line.length > 0);

              // Assign icons based on keywords in the title
              let icon = "📌";
              if (title.includes("Progress")) icon = "📊";
              if (title.includes("Insight")) icon = "💡";
              if (title.includes("Next")) icon = "🚀";

              return (
                <div key={idx} className="relative pl-4 border-l-4 border-indigo-200 hover:border-indigo-400 transition-colors">
                  <h4 className="font-bold text-indigo-800 text-lg mb-2 flex items-center">
                    <span className="mr-2">{icon}</span> {title}
                  </h4>
                  <ul className="space-y-2">
                    {contentLines.map((line, i) => (
                      <li key={i} className="flex items-start text-gray-700 text-sm md:text-base">
                        {/* Custom Bullet Dot */}
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 mr-2 flex-shrink-0"></span>
                        {/* Clean the line: remove dash and bold markers */}
                        <span>
                          {line.replace(/^-\s*/, "").replace(/\*\*/g, "")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          // Fallback for old letter-style data
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {cleanText}
          </div>
        )}
      </div>
    </div>
  );
}