"use client";

import AgenticOrchestrator from "@/components/orchestrator/AgenticOrchestrator";
import { ConceptDashboard } from "@/components/concept-lab/ConceptDashboard";
import { FlaskConical, Cpu, LayoutGrid } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [view, setView] = useState<'ORCHESTRATOR' | 'LAB'>('ORCHESTRATOR');

  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-black text-gray-100">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Global Navigation - Minimalist Sidebar / Floating Dock */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
        <button
          onClick={() => setView('ORCHESTRATOR')}
          className={`p-3 rounded-full border transition-all ${view === 'ORCHESTRATOR' ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 grayscale opacity-60 hover:opacity-100'}`}
          title="Swarm Orchestrator"
        >
          <Cpu className="w-5 h-5" />
        </button>
        <button
          onClick={() => setView('LAB')}
          className={`p-3 rounded-full border transition-all ${view === 'LAB' ? 'bg-emerald-600 border-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-white/5 border-white/10 grayscale opacity-60 hover:opacity-100'}`}
          title="Concept Lab"
        >
          <FlaskConical className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 w-full pl-20">
        {view === 'ORCHESTRATOR' ? (
          <AgenticOrchestrator />
        ) : (
          <div className="p-12 space-y-12 max-w-6xl mx-auto h-full overflow-y-auto pb-24">
            <header className="flex items-center justify-between border-b border-white/10 pb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400">
                  <FlaskConical className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Dev Environment // Concept Lab</span>
                </div>
                <h1 className="text-5xl font-black italic tracking-tighter">
                  AGENTIC <span className="text-emerald-500 px-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">PRO</span>
                </h1>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Research Phase</div>
                <div className="text-xs font-bold text-emerald-500 animate-pulse">● ACTIVE_LAB_MODE</div>
              </div>
            </header>

            <ConceptDashboard />

            <footer className="pt-12 flex justify-between items-center text-gray-600 font-mono text-[10px] uppercase tracking-[0.2em]">
              <span>Build: 2026.02.10.PRIME</span>
              <span>Antigravity Swarm // Research Division</span>
            </footer>
          </div>
        )}
      </div>
    </main>
  );
}
