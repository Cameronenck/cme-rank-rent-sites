'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { StatusBadge } from '@/components/ui/NeonBadge'
import { useToast } from '@/components/ui/Toast'

type ContentItem = {
  id: string
  title: string
  category: 'ads' | 'sms' | 'emails' | 'blog' | 'social'
  status: 'draft' | 'approved' | 'published'
  body: string
  assignedAgent: string
  createdAt: string
  tags: string[]
}

type CategoryFilter = 'all' | 'ads' | 'sms' | 'emails' | 'blog' | 'social'
type StatusFilter = 'all' | 'draft' | 'approved' | 'published'

function timeAgo(ts?: string | null) {
  if (!ts) return '—'
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? 'var(--bg-surface-active)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${active ? 'var(--border-medium)' : 'var(--border-subtle)'}`,
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    transition: 'all var(--transition-fast)',
  }
}

const CATEGORY_ICON: Record<string, string> = {
  ads: '📢', sms: '💬', emails: '✉️', blog: '📝', social: '🌐',
}

const CATEGORY_COLOR: Record<string, { bg: string; color: string }> = {
  ads:    { bg: 'rgba(10,132,255,0.12)',   color: 'var(--accent-blue)' },
  sms:    { bg: 'rgba(48,209,88,0.12)',    color: 'var(--accent-green)' },
  emails: { bg: 'rgba(255,159,10,0.12)',   color: 'var(--accent-amber)' },
  blog:   { bg: 'rgba(191,90,242,0.12)',   color: '#bf5af2' },
  social: { bg: 'rgba(255,55,95,0.12)',    color: '#ff375f' },
}

const STATUS_BADGE_MAP: Record<string, 'unknown' | 'warn' | 'ok' | 'idle'> = {
  draft: 'unknown',
  approved: 'warn',
  published: 'ok',
}

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const toast = useToast()

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (categoryFilter !== 'all') params.set('category', categoryFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    const res = await fetch(`/api/content?${params}`, { cache: 'no-store' }).then(r => r.json())
    setItems(res?.items ?? [])
    setLoading(false)
  }, [categoryFilter, statusFilter])

  useEffect(() => {
    load().catch(() => null)
  }, [load])

  async function copyBody(item: ContentItem) {
    try {
      await navigator.clipboard.writeText(item.body)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {}
  }

  function toggleExpanded(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function updateStatus(id: string, status: 'draft' | 'approved' | 'published') {
    const prevItems = items
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Request failed')
    } catch {
      setItems(prevItems)
      toast.push({ kind: 'error', title: 'Status update failed', detail: 'Could not save status change. Please try again.' })
    }
  }

  const CATEGORIES: CategoryFilter[] = ['all', 'ads', 'sms', 'emails', 'blog', 'social']
  const STATUSES: StatusFilter[] = ['all', 'draft', 'approved', 'published']

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const cat of CATEGORIES.filter(c => c !== 'all')) {
      c[cat] = items.filter(i => i.category === cat).length
    }
    return c
  }, [items])

  return (
    <div className="flex flex-col gap-6 fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0 }}>
            Content
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Creative production hub — ads, emails, SMS, blog posts
          </p>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {items.length} item{items.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        {/* Category */}
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className="px-3 py-1.5 rounded-xl text-sm font-medium"
              style={chipStyle(categoryFilter === c)}
            >
              {c === 'all' ? 'All' : `${CATEGORY_ICON[c]} ${c.charAt(0).toUpperCase() + c.slice(1)}`}
              {c !== 'all' && counts[c] != null ? ` (${counts[c]})` : ''}
            </button>
          ))}
        </div>
        {/* Status */}
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-xl text-sm font-medium"
              style={chipStyle(statusFilter === s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content cards */}
      {loading && (
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading content…</div>
      )}

      {!loading && items.length === 0 && (
        <GlassPanel className="p-10" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>✦</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            No content {categoryFilter !== 'all' ? `in ${categoryFilter}` : ''}{statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}
          </div>
        </GlassPanel>
      )}

      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))' }}>
        {items.map(item => {
          const catStyle = CATEGORY_COLOR[item.category] ?? { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }
          const isCopied = copiedId === item.id

          return (
            <GlassPanel key={item.id} className="p-5" hover>
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 8 }}>
                    {item.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {/* Category badge */}
                    <span style={{
                      padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: catStyle.bg, color: catStyle.color,
                      border: `1px solid ${catStyle.color}30`,
                    }}>
                      {CATEGORY_ICON[item.category]} {item.category}
                    </span>
                    {/* Status badge */}
                    <StatusBadge
                      status={STATUS_BADGE_MAP[item.status] ?? 'unknown'}
                      label={item.status}
                    />
                    {/* Agent */}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {item.assignedAgent.replace(/_/g, ' ')}
                    </span>
                    {/* Time */}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Copy button */}
                <button
                  onClick={() => copyBody(item)}
                  style={{
                    flexShrink: 0, padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                    background: isCopied ? 'rgba(48,209,88,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isCopied ? 'rgba(48,209,88,0.4)' : 'var(--border-subtle)'}`,
                    color: isCopied ? 'var(--accent-green)' : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {isCopied ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* Body preview */}
              {(() => {
                const isExpanded = expandedIds.has(item.id)
                return (
                  <div style={{
                    padding: '10px 12px', borderRadius: 12,
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: 12,
                  }}>
                    <p style={{
                      margin: 0, fontSize: 12, color: 'var(--text-secondary)',
                      lineHeight: 1.6, whiteSpace: 'pre-wrap',
                      maxHeight: isExpanded ? undefined : 120,
                      overflow: isExpanded ? 'visible' : 'hidden',
                      maskImage: isExpanded ? undefined : 'linear-gradient(to bottom, black 70%, transparent 100%)',
                      WebkitMaskImage: isExpanded ? undefined : 'linear-gradient(to bottom, black 70%, transparent 100%)',
                    }}>
                      {item.body}
                    </p>
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      style={{
                        marginTop: 6, fontSize: 11, color: 'var(--text-muted)',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '2px 0', textDecoration: 'underline', display: 'block',
                      }}
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  </div>
                )
              })()}

              {/* Tags + status actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                {/* Tags */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {item.tags.slice(0, 4).map(tag => (
                    <span key={tag} style={{
                      padding: '2px 6px', borderRadius: 6, fontSize: 10,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Quick status actions */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {item.status === 'draft' && (
                    <button
                      onClick={() => updateStatus(item.id, 'approved')}
                      style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                        background: 'rgba(255,159,10,0.12)', border: '1px solid rgba(255,159,10,0.3)',
                        color: 'var(--accent-amber)', cursor: 'pointer',
                      }}
                    >
                      Approve
                    </button>
                  )}
                  {item.status === 'approved' && (
                    <button
                      onClick={() => updateStatus(item.id, 'published')}
                      style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                        background: 'rgba(48,209,88,0.12)', border: '1px solid rgba(48,209,88,0.3)',
                        color: 'var(--accent-green)', cursor: 'pointer',
                      }}
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>
            </GlassPanel>
          )
        })}
      </div>
    </div>
  )
}
