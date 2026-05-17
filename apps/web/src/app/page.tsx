import { GlassPanel } from '@/components/ui/GlassPanel'
import { MetricTile } from '@/components/ui/MetricTile'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { ActivityFeed } from '@/components/ui/ActivityFeed'
import { IntelligenceSummary } from '@/components/ui/IntelligenceSummary'
import { api } from '@/lib/api'
import { OpsConsole } from '@/components/ui/OpsConsole'
import type { Agent, Channel } from '@mc/shared'

export const dynamic = 'force-dynamic'

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

function fmtPct(n: number) { return `${n}%` }

const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

export default async function DashboardPage() {
  const [eventsRes, agents, channels, sheetsRes] = await Promise.allSettled([
    api.getEvents({ limit: '30' }),
    api.getAgents(),
    api.getChannels(),
    fetch('http://127.0.0.1:3010/api/sheets/dashboard', { cache: 'no-store' }).then(r => r.json()),
  ])

  const events = eventsRes.status === 'fulfilled' ? eventsRes.value.items : []
  const agentList: Agent[] = agents.status === 'fulfilled' ? agents.value : []
  const channelList: Channel[] = channels.status === 'fulfilled' ? channels.value : []
  const sheets = sheetsRes.status === 'fulfilled' ? sheetsRes.value : null

  const runningAgents = agentList.filter(a => a.status === 'running').length

  const mtd = sheets?.mtd
  const totals = sheets?.totals
  const pipeline: Array<{ address: string; type: string; estProfit: number; closeDate: string; confidence: string; status: string }> = sheets?.pipeline ?? []
  const months: Array<{ month: string; revenue: number; expenses: number; profit: number; deals: number; profitPerDeal: number }> = sheets?.months ?? []
  const margin: number = sheets?.margin ?? 0
  const pipelineTotal = pipeline.reduce((s, p) => s + (p.estProfit || 0), 0)

  const statusColor = (s: string) => {
    if (s === 'Clear to Close') return 'var(--accent-green)'
    if (s === 'Under Contract') return 'var(--accent-blue)'
    if (s === 'Rehab') return 'var(--accent-amber)'
    return 'var(--text-muted)'
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0 }}>
            Command
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Live · CME Holdings — TruOffer · MC1 · AcquireFlow
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sheets && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Sheets sync {new Date(sheets.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
          <div className="flex items-center gap-1.5 pill" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            <span className="status-dot status-pulse" style={{ background: 'var(--accent-green)' }} />
            Live
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <MetricTile
          label="Revenue MTD"
          value={mtd ? fmt(mtd.revenue) : '—'}
          sub={currentMonth}
          deltaLabel={totals ? `${fmt(totals.revenue)} YTD` : ''}
          tone="good"
        />
        <MetricTile
          label="Net Profit MTD"
          value={mtd ? fmt(mtd.profit) : '—'}
          sub={margin ? `${fmtPct(margin)} margin` : ''}
          deltaLabel={totals ? `${fmt(totals.profit)} YTD` : ''}
          tone="good"
        />
        <MetricTile
          label="Deals Closed"
          value={mtd ? String(mtd.deals) : '—'}
          sub="March · 14 YTD"
          deltaLabel={mtd ? `${fmt(mtd.profitPerDeal)}/deal avg` : ''}
          tone="neutral"
        />
        <MetricTile
          label="Pipeline Value"
          value={pipelineTotal > 0 ? fmt(pipelineTotal) : '—'}
          sub={`${pipeline.length} active deals`}
          deltaLabel="expected profit"
          tone={pipelineTotal > 50000 ? 'good' : 'neutral'}
        />
      </div>

      {/* Live ops console */}
      <OpsConsole />

      {/* 3-col grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>

        {/* Col 1 — Financials */}
        <div className="flex flex-col gap-4">
          <GlassPanel className="p-5" hover>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 14 }}>
              Monthly P&amp;L
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {months.map(m => (
                <div key={m.month} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 1fr 1fr', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.month.slice(0, 3)}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fmt(m.revenue)}</span>
                  <span style={{ fontSize: 12, color: 'var(--accent-red)', opacity: 0.8 }}>−{fmt(m.expenses)}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-green)' }}>{fmt(m.profit)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8, display: 'grid', gridTemplateColumns: '72px 1fr 1fr 1fr', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>YTD</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{totals ? fmt(totals.revenue) : '—'}</span>
                <span style={{ fontSize: 12, color: 'var(--accent-red)' }}>−{totals ? fmt(totals.expenses) : '—'}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-green)' }}>{totals ? fmt(totals.profit) : '—'}</span>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
              Revenue · Expenses · Net Profit · Live from Exec Dashboard
            </div>
          </GlassPanel>

          <GlassPanel className="p-5" hover>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10 }}>
              Businesses
            </div>
            {[
              { name: 'TruOffer LLC', role: 'Lead Acquisition + Wholesale', status: 'active' as const },
              { name: 'MC1 Holdings LLC', role: 'Fix & Flip + Buy & Hold', status: 'active' as const },
              { name: 'AcquireFlow', role: 'SaaS — $1.5k MRR', status: 'warn' as const },
            ].map(b => (
              <div key={b.name} className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{b.role}</div>
                </div>
                <NeonBadge status={b.status} pulse={b.status === 'active'} />
              </div>
            ))}
          </GlassPanel>
        </div>

        {/* Col 2 — Pipeline */}
        <div className="flex flex-col gap-4">
          <GlassPanel className="p-5" hover>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600 }}>
                Active Pipeline
              </div>
              {pipelineTotal > 0 && (
                <span style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 600 }}>{fmt(pipelineTotal)} pending</span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {pipeline.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No active deals</div>}
              {pipeline.map((deal, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${statusColor(deal.status)}`, paddingLeft: 10 }}>
                  <div title={deal.address} style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {deal.address.split(',').slice(0, 2).join(',')}
                  </div>
                  <div className="flex items-center gap-2" style={{ marginTop: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{deal.type}</span>
                    {deal.estProfit > 0 && <span style={{ fontSize: 10, color: 'var(--accent-green)', fontWeight: 600 }}>{fmt(deal.estProfit)}</span>}
                    {deal.closeDate && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Close {deal.closeDate}</span>}
                    <span style={{ fontSize: 10, color: statusColor(deal.status), fontWeight: 500 }}>{deal.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5" hover>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600 }}>
                Agents
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{runningAgents} running</span>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Bert', role: 'COO · Main AI', status: 'active' as const },
                { name: 'Nova', role: 'Marketing Commander', status: 'active' as const },
                { name: 'Atlas', role: 'Acquisitions Commander', status: 'active' as const },
              ].map(a => (
                <div key={a.name} className="flex items-center justify-between">
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.role}</div>
                  </div>
                  <NeonBadge status={a.status} pulse />
                </div>
              ))}
              {agentList.filter(a => a.status === 'running').length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10, marginTop: 4 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Sub-agents running</div>
                  {agentList.filter(a => a.status === 'running').map(a => (
                    <div key={a.id} style={{ fontSize: 12, color: 'var(--accent-blue)', marginBottom: 4 }}>
                      ◎ {a.name || a.id.slice(0, 20)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5" hover>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10 }}>
              Channels
            </div>
            <div className="flex flex-col gap-3">
              {channelList.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No channels</div>}
              {channelList.map(ch => (
                <div key={ch.id} className="flex items-center justify-between">
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ch.name}</div>
                  <NeonBadge status={ch.status as 'active' | 'warn' | 'error'} label={ch.status} pulse={ch.status === 'ok'} />
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Col 3 — Intelligence + Activity */}
        <div className="flex flex-col gap-4">
          <IntelligenceSummary events={events} />
          <ActivityFeed events={events} title="Timeline" />
        </div>

      </div>
    </div>
  )
}
