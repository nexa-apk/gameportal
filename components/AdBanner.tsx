'use client'

import { useEffect, useRef } from 'react'

type AdBannerProps = {
  slot: string
  format?: 'horizontal' | 'rectangle' | 'vertical'
  className?: string
}

export default function AdBanner({ slot, format = 'horizontal', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_ID

  useEffect(() => {
    if (clientId && clientId !== 'ca-pub-XXXXXXXXXXXXXXXX') {
      try {
        // @ts-expect-error adsbygoogle is injected by the AdSense script
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch {
        // AdSense not ready
      }
    }
  }, [clientId])

  const heightMap = {
    horizontal: 'h-24',
    rectangle: 'h-64',
    vertical: 'h-96',
  }

  // Show placeholder when AdSense ID is not configured
  if (!clientId || clientId === 'ca-pub-XXXXXXXXXXXXXXXX') {
    return (
      <div
        ref={adRef}
        className={`flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 ${heightMap[format]} ${className}`}
      >
        <span className="text-sm font-medium">Advertisement — {slot}</span>
      </div>
    )
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
