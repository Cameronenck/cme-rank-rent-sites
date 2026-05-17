'use client'
import { type ButtonHTMLAttributes } from 'react'

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
}) {
  const pad = size === 'sm' ? '8px 10px' : '10px 12px'
  const font = size === 'sm' ? 12 : 13

  const style: any = {
    padding: pad,
    borderRadius: 12,
    fontSize: font,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    transition: 'all var(--transition-fast)',
    outline: 'none',
  }

  if (variant === 'primary') {
    style.background = 'rgba(10,132,255,0.16)'
    style.border = '1px solid rgba(10,132,255,0.26)'
    style.color = 'var(--text-primary)'
  } else if (variant === 'secondary') {
    style.background = 'rgba(255,255,255,0.04)'
    style.border = '1px solid var(--border-subtle)'
    style.color = 'var(--text-secondary)'
  } else if (variant === 'danger') {
    style.background = 'rgba(255,69,58,0.12)'
    style.border = '1px solid rgba(255,69,58,0.22)'
    style.color = 'var(--text-primary)'
  } else {
    style.background = 'transparent'
    style.border = '1px solid transparent'
    style.color = 'var(--text-secondary)'
  }

  if (props.disabled) {
    style.opacity = 0.5
    style.cursor = 'not-allowed'
    style.pointerEvents = 'none'
  } else {
    style.cursor = 'pointer'
  }

  return (
    <button
      {...props}
      className={className}
      style={style}
    />
  )
}
