"use client";

import React, { useState, useEffect } from 'react';
import { Database, Activity, FileStack, MessageSquare, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtifactBridge } from './ArtifactBridge';

export const ConceptDashboard = () => {
  const [activeConcept, setActiveConcept] = useState('persistence');
  const [swarmData, setSwarmData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSwarmData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/swarm');
      const data = await res.json();
      setSwarmData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeConcept === 'swarm') {
      fetchSwarmData();
      const interval = setInterval(fetchSwarmData, 5000);
      return () => clearInterval(interval);
    }
  }, [activeConcept]);

  const concepts = [
    { id: 'persistence', name: 'Persistence-X', icon: Database, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'swarm', name: 'Swarm-Sync', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'bridge', name: 'Artifact Bridge', icon: FileStack, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { id: 'intervention', name: 'Intervention Bus', icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {concepts.map((concept) => (
          <button
            key={concept.id}
            onClick={() => setActiveConcept(concept.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
              activeConcept === concept.id 
                ? `bg-white/10 border-white/20 shadow-lg scale-[1.02]` 
                : 'bg-white/5 border-white/5 hover:bg-white/10 grayscale opacity-60'
            }`}
          >
            <concept.icon className={`w-5 h-5 ${concept.color}`} />
            <span className="font-bold text-sm">{concept.name}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-6 min-h-[450px] overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeConcept === 'persistence' && (
            <motion.div
              key="persistence"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-black text-blue-400 italic">PERSISTENCE-X</h2>
              <p className="text-gray-400 text-sm">Real-time state recovery for agent sessions.</p>
              <div className="p-4 bg-black/40 rounded-lg border border-white/10 font-mono text-xs">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500">// LocalStorage Stream</span>
                    <span className="text-blue-500 uppercase tracking-tighter text-[10px]">Active</span>
                 </div>
                 <pre className="text-blue-300">
                    {`{
  "id": "agy-kernel-state",
  "version": "1.1.0",
  "timestamp": ${Date.now()},
  "agents": [...],
  "checksum": "A1-BK-92"
}`}
                 </pre>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all">
                  Trigger Snapshot
                </button>
              </div>
            </motion.div>
          )}

          {activeConcept === 'swarm' && (
             <motion.div
               key="swarm"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.02 }}
               className="space-y-4 h-full flex flex-col"
             >
               <div className="flex justify-between items-start">
                 <div>
                   <h2 className="text-2xl font-black text-purple-400 italic">SWARM-SYNC</h2>
                   <p className="text-gray-400 text-sm">CLI Swarm-to-Web telemetry bridge.</p>
                 </div>
                 <button onClick={fetchSwarmData} className={`p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 ${loading ? 'animate-spin' : ''}`}>
                    <RefreshCw className="w-4 h-4 text-purple-400" />
                 </button>
               </div>

               {swarmData ? (
                 <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                       <div className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-3">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Active Mission Status</span>
                          <div className="text-xs text-emerald-400 font-mono italic">
                             {swarmData.latestOutput.substring(0, 100)}...
                          </div>
                       </div>
                       <div className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-3">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Queue Metrics</span>
                          <div className="space-y-2">
                             {swarmData.queue.map((task: any) => (
                                <div key={task.id} className="flex items-center justify-between text-[10px] border-b border-white/5 pb-1">
                                   <span className="text-gray-400">{task.id}</span>
                                   <span className={`italic ${task.status === 'COMPLETED' ? 'text-emerald-500' : 'text-yellow-500'}`}>
                                      {task.status}
                                   </span>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/10 overflow-hidden flex flex-col">
                       <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Master Plan (Raw Interface)</span>
                       <pre className="flex-1 text-[9px] text-purple-300 font-mono overflow-auto opacity-70">
                          {swarmData.masterPlan}
                       </pre>
                    </div>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-600 space-y-4">
                    <Activity className="w-12 h-12 opacity-20 animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest">Awaiting Swarm Connection...</span>
                 </div>
               )}
             </motion.div>
          )}

          {activeConcept === 'bridge' && (
             <motion.div
               key="bridge"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.02 }}
             >
                <ArtifactBridge />
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
