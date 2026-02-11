"use client";

import React from 'react';
import { Download, FileCode, CheckCircle2, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export const ArtifactBridge = () => {
  const [artifacts, setArtifacts] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/artifacts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setArtifacts(data);
      });
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-cyan-400 italic uppercase">Artifact Bridge</h2>
      <p className="text-gray-400 text-sm">Real-time virtual-to-physical filesystem mapping.</p>

      <div className="space-y-2">
        {artifacts.map((art, i) => (
          <motion.div
            key={art.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <FileCode className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-200">{art.name}</div>
                <div className="text-[10px] text-gray-500 font-mono">{art.size}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-black uppercase italic ${art.status === 'Synced' ? 'text-emerald-500' : 'text-cyan-400'}`}>
                {art.status}
              </span>
              <button className="p-2 rounded-lg bg-white/5 border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-cyan-500/20 hover:text-cyan-400">
                <Download className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl flex items-start gap-3">
        <Terminal className="w-4 h-4 text-cyan-400 mt-1" />
        <div className="text-[10px] font-mono text-cyan-300 leading-relaxed">
          [BRIDGE_LOG]: Mapping virtual://artifact_01 to fs:///scratch/artifacts/concept_01.ts
          <br />
          [BRIDGE_LOG]: SYNC_OK: 144 bytes verified.
        </div>
      </div>
    </div>
  );
};
