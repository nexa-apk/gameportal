'use client'

import { useEffect, useRef } from 'react'

type Props = {
  user: string
  domain: string
  /** Static label shown before JS runs and as the link text. Defaults to showing the assembled email after mount. */
  label?: string
  className?: string
}

export default function ContactLink({ user, domain, label, className = '' }: Props) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const email = `${user}@${domain}`
    ref.current.href = `mailto:${email}`
    if (!label) ref.current.textContent = email
  }, [user, domain, label])

  return (
    <a ref={ref} className={className}>
      {label ?? 'support'}
    </a>
  )
}
