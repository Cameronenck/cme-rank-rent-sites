'use client'
import { GlassPanel } from '@/components/ui/GlassPanel'

export default function WorkshopPage() {
  return (
    <div className="flex flex-col gap-6 fade-in">
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0 }}>
          Pipeline
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Your deal pipeline will appear here.
        </p>
      </div>

      <GlassPanel className="p-12" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>◫</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Pipeline empty
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Your deal pipeline will appear here.
        </div>
      </GlassPanel>
    </div>
  )
}
