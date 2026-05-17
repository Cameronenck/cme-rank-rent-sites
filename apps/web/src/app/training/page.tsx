'use client'
import { useEffect, useMemo, useState } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Button } from '@/components/ui/Button'
import { Input, Label, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'

type Pack = { id: string; agentId: string; name: string; description?: string|null; createdAt: string; items?: Item[] }
type Item = { id: string; packId: string; type: 'note'|'file'; title: string; contentText?: string|null; filePath?: string|null; mime?: string|null; createdAt: string }

type Agent = { id: string }

export default function TrainingPage() {
  const toast = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [agentId, setAgentId] = useState('agent:main')
  const [packs, setPacks] = useState<Pack[]>([])
  const [selectedPackId, setSelectedPackId] = useState<string>('')
  const [q, setQ] = useState('')
  const [results, setResults] = useState<any[]>([])

  async function loadAgents() {
    const res = await fetch('/api/openclaw/agents', { cache: 'no-store' }).then(r => r.json())
    const list = (res?.agents ?? []).map((a: any) => ({ id: a.id }))
    setAgents(list)
  }

  async function loadPacks(nextAgentId = agentId) {
    const res = await fetch(`/api/training/packs?agentId=${encodeURIComponent(nextAgentId)}`, { cache: 'no-store' }).then(r => r.json())
    setPacks(res?.packs ?? [])
    if (!selectedPackId && (res?.packs?.length ?? 0) > 0) setSelectedPackId(res.packs[0].id)
  }

  useEffect(() => {
    loadAgents().catch(()=>null)
    loadPacks('agent:main').catch(()=>null)
  }, [])

  useEffect(() => {
    loadPacks(agentId).catch(()=>null)
  }, [agentId])

  const selected = useMemo(() => packs.find(p => p.id === selectedPackId) ?? null, [packs, selectedPackId])

  async function createPack(name: string, description: string) {
    const res = await fetch('/api/training/packs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ agentId, name, description })
    }).then(r => r.json())
    if (res?.ok) {
      toast.push({ kind: 'ok', title: 'Pack created' })
      await loadPacks(agentId)
      setSelectedPackId(res.pack.id)
    } else toast.push({ kind: 'error', title: 'Create failed', detail: String(res?.error ?? 'unknown') })
  }

  async function addNote(title: string, contentText: string) {
    if (!selectedPackId) return
    const res = await fetch('/api/training/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ packId: selectedPackId, title, contentText })
    }).then(r => r.json())
    if (res?.ok) {
      toast.push({ kind: 'ok', title: 'Note saved' })
      await loadPacks(agentId)
    } else toast.push({ kind: 'error', title: 'Save failed', detail: String(res?.error ?? 'unknown') })
  }

  async function uploadFile(file: File, title: string) {
    if (!selectedPackId) return
    const fd = new FormData()
    fd.set('agentId', agentId)
    fd.set('packId', selectedPackId)
    fd.set('title', title)
    fd.set('file', file)

    const res = await fetch('/api/training/upload', { method: 'POST', body: fd }).then(r => r.json())
    if (res?.ok) {
      toast.push({ kind: 'ok', title: 'File uploaded' })
      await loadPacks(agentId)
    } else toast.push({ kind: 'error', title: 'Upload failed', detail: String(res?.error ?? 'unknown') })
  }

  async function search() {
    if (!q.trim()) return
    const res = await fetch(`/api/training/search?agentId=${encodeURIComponent(agentId)}&q=${encodeURIComponent(q)}`, { cache: 'no-store' }).then(r => r.json())
    setResults(res?.items ?? [])
  }

  return (
    <div className="flex flex-col gap-6 fade-in">
      <div className="flex items-end justify-between" style={{ gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0 }}>Training</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Knowledge packs live on disk + DB. No embeddings (v1). Keyword search + attach to tasks next.</p>
        </div>
        <div className="flex gap-2" style={{ alignItems: 'center' }}>
          <div style={{ minWidth: 240 }}>
            <Label>Agent</Label>
            <select value={agentId} onChange={e => setAgentId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
              <option value="agent:main">agent:main</option>
              {agents.map(a => (<option key={a.id} value={a.id}>{a.id}</option>))}
            </select>
          </div>
          <NewPackButton onCreate={createPack} />
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: '340px 1fr 420px' }}>
        <GlassPanel className="p-5" hover>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>Packs</div>
          <div className="divider" style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 560, overflow: 'auto' }}>
            {packs.map(p => (
              <button key={p.id} onClick={() => setSelectedPackId(p.id)} className="text-left" style={{ padding: 10, borderRadius: 14, border: `1px solid ${selectedPackId===p.id ? 'rgba(10,132,255,0.28)' : 'var(--border-subtle)'}`, background: selectedPackId===p.id ? 'rgba(10,132,255,0.10)' : 'rgba(255,255,255,0.03)', color: 'var(--text-primary)' }}>
                <div style={{ fontSize: 13, fontWeight: 650 }}>{p.name}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>{p.description ?? '—'}</div>
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>{(p.items?.length ?? 0)} items</div>
              </button>
            ))}
            {packs.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No packs yet. Create one.</div>}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5" hover>
          {!selected ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Select a pack</div>
          ) : (
            <PackEditor pack={selected} onAddNote={addNote} onUpload={uploadFile} />
          )}
        </GlassPanel>

        <GlassPanel className="p-5" hover>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>Search</div>
          <div className="divider" style={{ margin: '12px 0' }} />
          <Label>Keyword</Label>
          <div className="flex gap-2">
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. underwriting" />
            <Button onClick={search}>Search</Button>
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflow: 'auto' }}>
            {results.map((r: any) => (
              <div key={r.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 12, background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center justify-between" style={{ gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 650 }}>{r.title}</div>
                  <span className="pill" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>{r.type}</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>{r.packName ? `Pack: ${r.packName}` : ''}</div>
                {r.snippet && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>{r.snippet}{r.snippet.length>=220?'…':''}</div>}
              </div>
            ))}
            {results.length === 0 && q.trim() === '' && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enter a keyword to search.</div>
            )}
            {results.length === 0 && q.trim() !== '' && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No results.</div>
            )}
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}

function NewPackButton({ onCreate }: { onCreate: (name: string, desc: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ New pack</Button>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 90, padding: 24 }}>
          <div className="glass-elevated" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 760, margin: '0 auto', padding: 16, borderRadius: 16 }}>
            <div className="flex items-center justify-between" style={{ padding: 6 }}>
              <div style={{ fontWeight: 650 }}>New knowledge pack</div>
              <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
            </div>
            <div className="divider" style={{ margin: '10px 0' }} />
            <div className="flex flex-col gap-3">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="TruOffer SOPs" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What this pack contains" />
              </div>
              <div className="flex gap-2" style={{ marginTop: 6 }}>
                <Button onClick={() => onCreate(name, desc)}>Create</Button>
                <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function PackEditor({ pack, onAddNote, onUpload }: { pack: Pack; onAddNote: (title: string, text: string) => Promise<void>; onUpload: (file: File, title: string) => Promise<void> }) {
  const [noteTitle, setNoteTitle] = useState('')
  const [note, setNote] = useState('')
  const [uploadTitle, setUploadTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSaveNote() {
    setIsSaving(true)
    try {
      await onAddNote(noteTitle || 'Note', note)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>Pack</div>
        <div style={{ marginTop: 6, fontSize: 16, fontWeight: 750 }}>{pack.name}</div>
        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>{pack.description ?? '—'}</div>
      </div>

      <div className="divider" />

      <div>
        <div style={{ fontSize: 12, fontWeight: 650 }}>Add note</div>
        <div style={{ marginTop: 10 }}>
          <Label>Title</Label>
          <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Underwriting rules" />
        </div>
        <div style={{ marginTop: 10 }}>
          <Label>Content</Label>
          <Textarea rows={6} value={note} onChange={e => setNote(e.target.value)} placeholder="Paste SOP text / rules / scripts here" />
        </div>
        <div style={{ marginTop: 10 }}>
          <Button onClick={handleSaveNote} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save note'}</Button>
        </div>
      </div>

      <div className="divider" />

      <div>
        <div style={{ fontSize: 12, fontWeight: 650 }}>Upload file</div>
        <div style={{ marginTop: 10 }}>
          <Label>Title</Label>
          <Input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="TruOffer_SOP.pdf" />
        </div>
        <div style={{ marginTop: 10 }}>
          <input
            type="file"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onUpload(f, uploadTitle || f.name)
            }}
            style={{ width: '100%', padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
          />
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>Text-based files become searchable; PDFs are stored but not indexed (v1).</div>
        </div>
      </div>

      <div className="divider" />

      <div>
        <div style={{ fontSize: 12, fontWeight: 650 }}>Items</div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflow: 'auto' }}>
          {(pack.items ?? []).map((i) => (
            <div key={i.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 12, background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center justify-between">
                <div style={{ fontSize: 13, fontWeight: 650 }}>{i.title}</div>
                <span className="pill" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>{i.type}</span>
              </div>
              {i.filePath && <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{i.filePath}</div>}
              {i.contentText && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>{i.contentText.slice(0, 160)}{i.contentText.length>160?'…':''}</div>}
            </div>
          ))}
          {(pack.items ?? []).length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No items yet.</div>}
        </div>
      </div>
    </div>
  )
}
