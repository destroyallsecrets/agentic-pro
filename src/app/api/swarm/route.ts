import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  // Check if we are in a Vercel/Production environment where local files don't exist
  const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  if (isVercel) {
    return NextResponse.json({
      queue: [],
      masterPlan: "# Simulation Mode\n\nActive Swarm connection unavailable in Vercel environment.\n\n### Status\n- [x] Cloud Deployment Active\n- [ ] Local Bridge Disconnected",
      latestOutput: "Simulation Mode: Local files not accessible.",
      timestamp: Date.now()
    });
  }

  try {
    const agentsPath = 'C:\\Users\\kampv\\.gemini\\Agents';

    const queueData = await fs.readFile(path.join(agentsPath, 'QUEUE.json'), 'utf-8');
    const masterPlan = await fs.readFile(path.join(agentsPath, 'MASTER_PLAN.md'), 'utf-8');
    const latestOutput = await fs.readFile(path.join(agentsPath, 'LATEST_OUTPUT.log'), 'utf-8');

    return NextResponse.json({
      queue: JSON.parse(queueData),
      masterPlan: masterPlan,
      latestOutput: latestOutput,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.warn('Swarm Sync Warning: Defaulting to simulation mode.', error);
    return NextResponse.json({
      queue: [],
      masterPlan: "# Local Bridge Error\n\nCould not read from local filesystem.\n\nEnsure the orchestrator is running on the host machine.",
      latestOutput: `Error: ${error.message}`,
      timestamp: Date.now()
    });
  }
}
