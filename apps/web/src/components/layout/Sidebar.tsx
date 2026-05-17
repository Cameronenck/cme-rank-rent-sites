'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher'

const NAV = [
  { href: '/approvals',  label: 'Needs Cam',  icon: '🔔' },
  { href: '/',           label: 'Command',    icon: '⌘' },
  { href: '/businesses', label: 'Businesses', icon: '🏢' },
  { href: '/tasks',      label: 'Tasks',      icon: '☑' },
  { href: '/workshop',   label: 'Pipeline',   icon: '◫' },
  { href: '/ledger',     label: 'Ledger',     icon: '₿' },
  { href: '/content',    label: 'Content',    icon: '✦' },
  { href: '/training',   label: 'Training',   icon: '📚' },
  { href: '/council',    label: 'Council',    icon: '⬡' },
  { href: '/memory',     label: 'Memory',     icon: '🧠' },
  { href: '/settings',   label: 'Settings',   icon: '⚙' },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside
      className="glass-elevated flex flex-col shrink-0 p-3 gap-2"
      style={{
        width: 220,
        margin: 12,
        borderRadius: 'var(--radius-xl)',
        height: 'calc(100vh - 24px)',
      }}
    >
      <WorkspaceSwitcher />

      <nav className="mt-2 flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium"
              style={{
                background: active ? 'var(--bg-surface-active)' : 'transparent',
                border: `1px solid ${active ? 'var(--border-medium)' : 'transparent'}`,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  width: 18,
                  textAlign: 'center',
                  color: active ? 'var(--accent-blue)' : 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                {icon}
              </span>
              <span style={{ letterSpacing: '-0.01em' }}>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <div
          className="flex items-center justify-between px-2 py-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="status-dot status-pulse"
              style={{ background: 'var(--accent-green)' }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bert · Online</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>v0.1</span>
        </div>
      </div>
    </aside>
  )
}
