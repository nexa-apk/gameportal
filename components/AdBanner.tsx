'use client'

import { useEffect } from 'react'

type AdBannerProps = {
  slot: string
  format?: 'auto' | 'horizontal' | 'rectangle'
  className?: string
}

const CLIENT_ID = 'ca-pub-9172954381668177'

export default function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script tag in layout.tsx
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense not yet loaded
    }
  }, [])

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
