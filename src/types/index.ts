
export enum AgentStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  WORKING = 'WORKING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  KILLED = 'KILLED'
}

export enum OpCode {
  INITIALIZE = 0x1, // 0001
  EXECUTING = 0x2,  // 0010
  ERROR = 0x4,      // 0100
  TERMINAL = 0x8    // 1000
}

export interface AgentLog {
  id: string;
  timestamp: number;
  type: 'info' | 'error' | 'success' | 'thought' | 'artifact';
  message: string;
}

export interface AgentArtifact {
  id: string;
  path: string;
  content: string;
  language: string;
  createdBy: string;
  lastModified: number;
}

export interface WorkerAgent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  progress: number;
  currentTask?: string;
  logs: AgentLog[];
  memoryUsage: number; // in MB
  dependencies: string[]; // List of agent names this agent depends on
}

export interface AgentPacket {
  syncByte: number;
  agentId: number;
  opCode: OpCode;
  payload: string; // Hex representation for visualization
  timestamp: number;
}

export interface Agent {
  pid: number;
  role: string;
  status: OpCode;
  tier: 'FLASH' | 'PRO';
  logs: string[];
  parentId: number | null;
  progress: number;
}

export interface OrchestratorState {
  isProcessing: boolean;
  masterThought: string;
  activeAgents: WorkerAgent[];
  globalLogs: AgentLog[];
}

export interface MasterCommand {
  type: 'SPAWN_AGENTS' | 'KILL_ALL' | 'UPDATE_AGENT';
  payload?: any;
}

export interface BroadcastEvent {
  sourceId: string;
  message: string;
  timestamp: number;
}

export const PACKET_HEADER_SIZE = 8;
