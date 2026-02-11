"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Agent, AgentPacket, OpCode } from '@/types';
import { SYNC_BYTE_HIGH, SYNC_BYTE_LOW, MODEL_TIERS } from '@/constants';
import * as GeminiService from '@/services/geminiService';
import BinaryMonitor from './BinaryMonitor';
import NetworkGraph from './NetworkGraph';
import AgentCard from './AgentCard';
import { Play, Square, Activity, Cpu, Layers, Network, LayoutGrid, Terminal, MessageSquare, ChevronRight, Zap } from 'lucide-react';

import { usePersistence } from '@/hooks/usePersistence';

const AgenticOrchestrator: React.FC = () => {
    const [objective, setObjective] = usePersistence<string>("orchestrator_objective", "Build a scalable e-commerce backend with microservices");
    const [agents, setAgents] = usePersistence<Agent[]>("orchestrator_agents", []);
    const [packets, setPackets] = usePersistence<AgentPacket[]>("orchestrator_packets", []);
    const [isRunning, setIsRunning] = usePersistence<boolean>("orchestrator_is_running", false);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [mobileTab, setMobileTab] = useState<'VISUAL' | 'AGENTS' | 'TERMINAL'>('AGENTS');
    const [interventionMode, setInterventionMode] = useState(false);
    const [interventionInput, setInterventionInput] = useState("");
    const [isTeleporting, setIsTeleporting] = useState(false);

    const simulationRef = useRef<number | null>(null);

    const handleTeleport = async () => {
        setIsTeleporting(true);
        pushPacket(0, OpCode.EXECUTING, "INIT_TELEPORT_BRIDGE");
        try {
            const res = await fetch('/api/swarm');
            const data = await res.json();

            if (data && data.masterPlan) {
                pushPacket(0, OpCode.INITIALIZE, "TELEPORT_OK: CLI_STATE_MAPPED");
                // For now, we simulate mapping the master plan to nodes
                setObjective(data.masterPlan.substring(0, 100));
            }
        } catch (e) {
            pushPacket(0, OpCode.ERROR, "TELEPORT_FAIL: BRIDGE_UNAVAILABLE");
        } finally {
            setIsTeleporting(false);
        }
    };

    const pushPacket = useCallback((pid: number, op: OpCode, payload: string) => {
        const isError = op === OpCode.ERROR;
        const sync = isError ? SYNC_BYTE_HIGH : SYNC_BYTE_LOW;

        const newPacket: AgentPacket = {
            syncByte: sync,
            agentId: pid,
            opCode: op,
            payload: payload,
            timestamp: Date.now() / 1000
        };

        setPackets(prev => [...prev.slice(-100), newPacket]);
    }, []);

    const spawnSubAgent = async (parentAgent: Agent) => {
        try {
            pushPacket(parentAgent.pid, OpCode.EXECUTING, "REQ_SUB_AGENT_PROVISION");

            const subAgentDef = await GeminiService.proposeSubAgent(parentAgent.role, "High load detected in subsystem");

            const newPid = Math.floor(Math.random() * 8000) + 2000;

            const spawnCommand = `gemini --agent --model "${subAgentDef.tier === 'PRO' ? MODEL_TIERS.PRO : MODEL_TIERS.FLASH}" --prompt "Init ${subAgentDef.role}"`;
            pushPacket(0, OpCode.EXECUTING, `EXEC: ${spawnCommand.substring(0, 30)}...`);

            const newAgent: Agent = {
                pid: newPid,
                role: subAgentDef.role,
                status: OpCode.INITIALIZE,
                tier: subAgentDef.tier as 'PRO' | 'FLASH',
                logs: [`Forked from PID:${parentAgent.pid}`, `> ${spawnCommand}`],
                parentId: parentAgent.pid,
                progress: 0
            };

            setAgents(prev => [...prev, newAgent]);
            pushPacket(0, OpCode.INITIALIZE, `FORK_SUCCESS_PID_${newPid}`);
            pushPacket(newPid, OpCode.INITIALIZE, "CHILD_PROCESS_INIT");

        } catch (e) {
            pushPacket(parentAgent.pid, OpCode.ERROR, "FORK_FAILED");
        }
    };

    const handleIntervention = () => {
        if (!interventionInput.trim()) return;
        pushPacket(0, OpCode.INITIALIZE, `USER_INTERVENTION: ${interventionInput}`);
        setInterventionInput("");
        setInterventionMode(false);
    };

    const handleBootstrap = async () => {
        if (!objective.trim()) return;

        setIsRunning(true);
        setIsProvisioning(true);
        setAgents([]);
        setPackets([]);
        // Force immediate persistence update for clean start
        if (typeof window !== 'undefined') {
            window.localStorage.setItem("orchestrator_agents", JSON.stringify([]));
            window.localStorage.setItem("orchestrator_packets", JSON.stringify([]));
        }

        pushPacket(0, OpCode.INITIALIZE, "BOOTSTRAP_SEQUENCE_INIT");
        pushPacket(0, OpCode.EXECUTING, `INIT_STATE_REGISTRY {"goal": "${objective.substring(0, 10)}..."}`);

        try {
            const proposedAgents = await GeminiService.decomposeObjective(objective);

            const newAgents: Agent[] = proposedAgents.map((pa, idx) => ({
                pid: 1000 + idx + 1,
                role: pa.role,
                status: OpCode.INITIALIZE,
                tier: pa.tier as 'PRO' | 'FLASH',
                logs: [`Spawned by Root Architect`, `> gemini --agent --model "${pa.tier}"`],
                parentId: 0,
                progress: 0
            }));

            for (const agent of newAgents) {
                await new Promise(r => setTimeout(r, 600));
                setAgents(prev => [...prev, agent]);
                pushPacket(agent.pid, OpCode.INITIALIZE, `SPAWN_ROLE_${agent.role.replace(/\s/g, '_').toUpperCase()}`);
            }

        } catch (e) {
            pushPacket(0, OpCode.ERROR, "ARCHITECT_FAILURE");
        } finally {
            setIsProvisioning(false);
        }
    };

    const handleStop = () => {
        setIsRunning(false);
        if (simulationRef.current) clearInterval(simulationRef.current);

        agents.forEach(a => {
            if (a.status !== OpCode.TERMINAL) {
                pushPacket(a.pid, OpCode.TERMINAL, "SIGKILL_RECEIVED");
            }
        });

        setAgents(prev => prev.map(a => ({ ...a, status: OpCode.TERMINAL })));
    };

    useEffect(() => {
        if (isRunning && !isProvisioning) {
            simulationRef.current = window.setInterval(async () => {
                let agentToSpawn: Agent | null = null;

                setAgents(currentAgents => {
                    return currentAgents.map(agent => {
                        if (agent.status === OpCode.TERMINAL || agent.status === OpCode.ERROR) return agent;

                        const roll = Math.random();
                        let newStatus: OpCode = agent.status;
                        let newLog = "";
                        let newProgress = agent.progress;

                        if (agent.status === OpCode.INITIALIZE && roll > 0.7) {
                            newStatus = OpCode.EXECUTING;
                            newLog = "Initialization complete. Entering loop.";
                            pushPacket(agent.pid, OpCode.EXECUTING, "STATE_TRANSITION_EXEC");
                        } else if (agent.status === OpCode.EXECUTING) {
                            if (roll > 0.8) {
                                pushPacket(agent.pid, OpCode.EXECUTING, Math.random().toString(16).substring(2, 10));
                            }

                            const progressIncrement = Math.random() * 2.5;
                            newProgress = Math.min(agent.progress + progressIncrement, 100);

                            if (newProgress >= 100) {
                                newStatus = OpCode.TERMINAL;
                                newLog = "Definition of Done reached. exit 0";
                                pushPacket(agent.pid, OpCode.TERMINAL, "TASK_COMPLETE_EXIT_0");
                                pushPacket(0, OpCode.EXECUTING, `UPDATE_STATE_JSON {"done": ${agent.pid}}`);
                            } else {
                                if (agent.tier === 'PRO' && roll > 0.99 && currentAgents.length < 12) {
                                    agentToSpawn = agent;
                                }
                            }
                        }

                        if (roll < 0.005 && newStatus !== OpCode.TERMINAL) {
                            newStatus = OpCode.ERROR;
                            newLog = "CRITICAL: Stack overflow exception.";
                            pushPacket(agent.pid, OpCode.ERROR, "EXCEPTION_THROWN");
                        }

                        if (newLog) {
                            return { ...agent, status: newStatus, progress: newProgress, logs: [...agent.logs, newLog] };
                        }
                        return { ...agent, status: newStatus, progress: newProgress };
                    });
                });

                if (agentToSpawn) {
                    await spawnSubAgent(agentToSpawn);
                }

            }, 1000);
        }

        return () => {
            if (simulationRef.current) clearInterval(simulationRef.current);
        };
    }, [isRunning, isProvisioning, pushPacket]);


    useEffect(() => {
        if (!isRunning) return;
        const logInterval = window.setInterval(async () => {
            const activeAgents = agents.filter(a => a.status === OpCode.EXECUTING);
            if (activeAgents.length === 0) return;

            const randomAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
            try {
                const log = await GeminiService.generateAgentLog(randomAgent.role, "Analyzing dependency graph");
                setAgents(prev => prev.map(a => a.pid === randomAgent.pid ? { ...a, logs: [...a.logs, log] } : a));
                pushPacket(randomAgent.pid, OpCode.EXECUTING, `LOG_STREAM_${log.length}B`);
            } catch (e) { /* silent */ }
        }, 4000);
        return () => clearInterval(logInterval);
    }, [isRunning, agents]);

    const ResourcePanel = ({ compact = false }: { compact?: boolean }) => {
        if (compact) {
            return (
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-mono text-gray-400">
                    <div className="flex flex-col justify-center gap-1">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">ROOT</span>
                            <span className="text-blue-400 bg-blue-900/10 px-1 rounded-sm text-[9px]">{MODEL_TIERS.PRO.split('-')[1].toUpperCase()}</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1 rounded overflow-hidden">
                            <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: isRunning ? '65%' : '5%' }}></div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center gap-1">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">POOL</span>
                            <span className="text-yellow-400 bg-yellow-900/10 px-1 rounded-sm text-[9px]">{MODEL_TIERS.FLASH.split('-')[1].toUpperCase()}</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1 rounded overflow-hidden">
                            <div className="bg-yellow-600 h-full transition-all duration-300" style={{ width: `${Math.min((agents.length / 12) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                    <div className="col-span-2 flex justify-between items-center border-t border-gray-800/50 pt-1.5 mt-0.5">
                        <div className="flex gap-2">
                            <span>PID_COUNT: <span className="text-white font-bold">{agents.length}</span></span>
                        </div>
                        <div className="flex gap-1 items-center">
                            <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
                            <span>{isRunning ? 'RUNNING' : 'STOPPED'}</span>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-3 text-xs font-mono text-gray-400">
                <div className="flex justify-between items-center">
                    <span>ROOT_ARCHITECT</span>
                    <span className="text-blue-400 bg-blue-900/20 px-1 rounded">{MODEL_TIERS.PRO}</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: isRunning ? '65%' : '5%' }}></div>
                </div>

                <div className="flex justify-between items-center mt-2">
                    <span>SUB_AGENTS_POOL</span>
                    <span className="text-yellow-400 bg-yellow-900/20 px-1 rounded">{MODEL_TIERS.FLASH}</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded overflow-hidden">
                    <div className="bg-yellow-600 h-full transition-all duration-300" style={{ width: `${(agents.length / 12) * 100}%` }}></div>
                </div>

                <div className="flex justify-between mt-4 border-t border-gray-800 pt-3">
                    <span>ACTIVE PIDs</span>
                    <span className="text-white font-bold text-sm">{agents.length}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#050505] text-[#e5e5e5] overflow-hidden font-sans">

            <header className="border-b border-gray-800 bg-[#0a0a0a] p-4 flex flex-col md:flex-row md:h-16 md:items-center justify-between gap-4 shrink-0 z-10 shadow-md">
                <div className="flex justify-between items-center w-full md:w-auto">
                    <div className="flex items-center gap-3">
                        <Activity className="text-green-500 w-6 h-6" />
                        <h1 className="font-bold tracking-widest text-lg md:text-xl text-gray-100 italic">
                            SWARM<span className="text-gray-600">ORCHESTRATOR</span>
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:flex-1 md:max-w-3xl md:mx-12">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <span className="text-green-600 font-bold text-lg">{">"}</span>
                        </div>
                        <input
                            type="text"
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            disabled={isRunning}
                            className="w-full bg-black border border-gray-700 rounded-sm py-2 pl-8 pr-12 text-base focus:outline-none focus:border-green-600 transition-colors disabled:opacity-50 font-mono shadow-inner text-sm"
                            placeholder="DEFINE OBJECTIVE..."
                        />
                        <button
                            onClick={handleTeleport}
                            disabled={isRunning || isTeleporting}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-sm transition-all ${isTeleporting ? 'animate-pulse text-yellow-500' : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-500/10'}`}
                            title="Teleport CLI State"
                        >
                            <Zap size={14} fill={isTeleporting ? "currentColor" : "none"} />
                        </button>
                    </div>

                    {!isRunning ? (
                        <button
                            onClick={handleBootstrap}
                            className="bg-green-700 hover:bg-green-600 text-white px-6 py-2 text-sm font-bold rounded-sm flex items-center justify-center gap-2 transition-colors uppercase whitespace-nowrap shadow-lg active:scale-95"
                        >
                            <Play size={16} fill="currentColor" /> <span>Bootstrap</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setInterventionMode(!interventionMode)}
                                className={`p-2 rounded-sm border transition-all ${interventionMode ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-emerald-600'}`}
                                title="Intervention Bus"
                            >
                                <MessageSquare size={18} />
                            </button>
                            <button
                                onClick={handleStop}
                                className="bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 px-6 py-2 text-sm font-bold rounded-sm flex items-center justify-center gap-2 transition-colors uppercase whitespace-nowrap shadow-lg active:scale-95"
                            >
                                <Square size={16} fill="currentColor" /> <span>SigKill</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="hidden md:flex text-[10px] text-gray-500 font-mono flex-col items-end">
                    <div>ROOT_PID: 0000</div>
                    <div>STATUS: {isRunning ? (isProvisioning ? "PROVISIONING" : "ACTIVE") : "IDLE"}</div>
                </div>
            </header>

            {/* Intervention Bus UI */}
            <div className={`bg-[#0d0d0d] border-b border-gray-800 transition-all duration-300 overflow-hidden ${interventionMode ? 'h-12' : 'h-0'}`}>
                <div className="h-full flex items-center px-4 gap-4">
                    <div className="flex items-center gap-2 text-emerald-500 font-mono text-[10px] uppercase font-bold shrink-0">
                        <MessageSquare size={14} /> Intervention_Mode
                    </div>
                    <input
                        type="text"
                        value={interventionInput}
                        onChange={(e) => setInterventionInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleIntervention()}
                        placeholder="INJECT PACKET TO MAIN BUS..."
                        className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-emerald-400 placeholder:text-emerald-900"
                        autoFocus={interventionMode}
                    />
                    <div className="flex gap-2">
                        <button onClick={handleIntervention} className="text-[10px] font-mono bg-emerald-900/20 text-emerald-500 px-2 py-0.5 border border-emerald-800/30 hover:bg-emerald-800/40 transition-all uppercase">Send</button>
                        <button onClick={() => setInterventionMode(false)} className="text-[10px] font-mono text-gray-500 hover:text-gray-300 uppercase">Cancel</button>
                    </div>
                </div>
            </div>

            <div className="hidden md:flex flex-col flex-1 overflow-hidden">
                <main className="flex-1 flex overflow-hidden">
                    <div className="w-1/3 border-r border-gray-800 flex flex-col">
                        <div className="flex-1 relative bg-black/50">
                            <NetworkGraph agents={agents} objective={objective} packets={packets} />
                        </div>
                        <div className="h-1/3 border-t border-gray-800 p-6 bg-[#080808]">
                            <h3 className="text-xs font-bold text-gray-300 mb-4 uppercase flex items-center gap-2">
                                <Cpu size={14} /> Control Plane Resources
                            </h3>
                            <ResourcePanel />
                        </div>
                    </div>

                    <div className="flex-1 bg-[#050505] p-6 overflow-y-auto">
                        {agents.length === 0 && !isProvisioning && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-700 gap-4">
                                <div className="w-12 h-12 border-2 border-dashed border-gray-800 rounded-full flex items-center justify-center opacity-30">
                                    <Layers />
                                </div>
                                <p className="font-mono text-xs opacity-50">System Idle. Awaiting Objective.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {agents.map(agent => (
                                <AgentCard key={agent.pid} agent={agent} />
                            ))}
                            {isProvisioning && (
                                <div className="border border-gray-800 border-dashed p-4 rounded-sm flex items-center justify-center text-gray-600 animate-pulse text-xs font-mono">
                                    [PROVISIONING_NODE...]
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <footer className="h-40 shrink-0 border-t border-gray-800">
                    <BinaryMonitor packets={packets} />
                </footer>
            </div>

            <div className="flex md:hidden flex-col flex-1 overflow-hidden relative">
                <div className="flex-1 overflow-hidden relative bg-[#050505]">
                    {mobileTab === 'VISUAL' && (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 relative border-b border-gray-800 min-h-0">
                                <NetworkGraph agents={agents} objective={objective} packets={packets} />
                            </div>
                            <div className="shrink-0 p-3 bg-[#080808] border-t border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] z-10">
                                <ResourcePanel compact={true} />
                            </div>
                        </div>
                    )}

                    {mobileTab === 'AGENTS' && (
                        <div className="h-full overflow-y-auto p-4">
                            {agents.length === 0 && !isProvisioning ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-800 gap-2">
                                    <Layers className="opacity-50" size={32} />
                                    <p className="font-mono text-sm">No active agents</p>
                                </div>
                            ) : (
                                <div className="space-y-4 pb-4">
                                    {agents.map(agent => (
                                        <AgentCard key={agent.pid} agent={agent} />
                                    ))}
                                    {isProvisioning && (
                                        <div className="border border-gray-800 border-dashed p-6 rounded-sm text-center text-gray-500 animate-pulse text-sm font-mono">
                                            [PROVISIONING...]
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {mobileTab === 'TERMINAL' && (
                        <div className="h-full flex flex-col">
                            <BinaryMonitor packets={packets} />
                        </div>
                    )}
                </div>

                <nav className="h-16 bg-[#0a0a0a] border-t border-gray-800 flex items-center justify-around shrink-0 pb-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] z-20">
                    <button
                        onClick={() => setMobileTab('VISUAL')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mobileTab === 'VISUAL' ? 'text-green-500 bg-green-900/10' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Network size={20} />
                        <span className="text-[10px] font-bold tracking-wider">NEURAL</span>
                    </button>

                    <button
                        onClick={() => setMobileTab('AGENTS')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mobileTab === 'AGENTS' ? 'text-green-500 bg-green-900/10' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <LayoutGrid size={20} />
                        <span className="text-[10px] font-bold tracking-wider">GRID</span>
                    </button>

                    <button
                        onClick={() => setMobileTab('TERMINAL')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mobileTab === 'TERMINAL' ? 'text-green-500 bg-green-900/10' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Terminal size={20} />
                        <span className="text-[10px] font-bold tracking-wider">TERM</span>
                    </button>
                </nav>
            </div>

        </div>
    );
};

export default AgenticOrchestrator;
