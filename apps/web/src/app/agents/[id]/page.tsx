import Link from 'next/link'
import { api } from '@/lib/api'
import { AgentDetail } from '@/components/agents/AgentDetail'

export const dynamic = 'force-dynamic'

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const agent = await api.getAgent(id)
    // api.getAgent returns { ...agent, executions }
    return <AgentDetail agent={agent as any} executions={(agent as any).executions ?? []} />
  } catch {
    return (
      <div className="glass p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        <div style={{ marginBottom: 12 }}>Agent not found.</div>
        <Link
          href="/agents/studio"
          style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none' }}
        >
          ← Back to Agent Studio
        </Link>
      </div>
    )
  }
}
