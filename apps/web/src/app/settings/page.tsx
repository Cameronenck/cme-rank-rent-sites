'use client'

import { useMemo, useState } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { NeonBadge } from '@/components/ui/NeonBadge'

const INTEGRATIONS = [
  {
    id: 'openclaw',
    name: 'OpenClaw Gateway',
    description: 'Agent runtime + tool execution + channel routing',
    status: 'ok',
    detail: 'Running on localhost · claude-sonnet-4-6'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'DM channel for Cam + bot workspace',
    status: 'ok',
    detail: 'Workspace connected · DM channel active'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Personal WhatsApp Web session via OpenClaw plugin',
    status: 'unstable',
    detail: 'Reconnecting periodically (408 timeout). Twilio migration pending.'
  },
  {
    id: 'drive',
    name: 'Google Drive',
    description: 'Shared folder index',
    status: 'unknown',
    detail: 'OAuth not configured. Drive audit done via Browser Relay.'
  },
]

export default function SettingsPage() {
  const [password, setPassword] = useState('')
  const [loginState, setLoginState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')

  const needsLogin = useMemo(() => {
    try {
      const u = new URL(window.location.href)
      return u.searchParams.get('login') === '1'
    } catch {
      return false
    }
  }, [])

  async function submitLogin() {
    setLoginState('loading')
    try {
      const res = await fetch('/api/mc/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok || !j?.ok) throw new Error(j?.error || 'login failed')
      setLoginState('ok')
      window.location.href = '/'
    } catch {
      setLoginState('error')
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Integration status + configuration</p>
      </div>

      {needsLogin && (
        <GlassPanel className="p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            Login
          </h2>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Mission Control is password-gated (local-only). Enter the password to continue.
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitLogin() }}
              type="password"
              placeholder="Password"
              className="px-3 py-2 rounded-xl text-sm"
              style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={submitLogin}
              disabled={loginState === 'loading' || password.length === 0}
              className="px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(10,132,255,0.12)', border: '1px solid rgba(10,132,255,0.22)', color: 'var(--text-primary)', opacity: loginState === 'loading' ? 0.7 : 1 }}
            >
              {loginState === 'loading' ? 'Checking…' : 'Unlock'}
            </button>
          </div>
          {loginState === 'error' && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--accent-red)' }}>Invalid password.</div>
          )}
        </GlassPanel>
      )}

      <GlassPanel className="p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          Integrations
        </h2>
        <div className="flex flex-col gap-4">
          {INTEGRATIONS.map(int => (
            <div
              key={int.id}
              className="flex items-start justify-between py-3 border-b last:border-b-0"
              style={{ borderColor: 'var(--glass-border)' }}
            >
              <div className="flex-1 pr-4">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{int.name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{int.description}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{int.detail}</div>
              </div>
              <NeonBadge status={int.status as any} />
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          Pending (Waiting on Cam)
        </h2>
        <div className="flex flex-col gap-2">
          {[
            'Twilio WhatsApp setup (stable messaging)',
            'Google OAuth → Drive API indexer',
            'Hosting decision (local vs VPS)',
            'Auth preference (Google SSO vs magic link)',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--neon-yellow)' }}>⚠</span>
              {item}
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  )
}
