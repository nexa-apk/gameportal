import type { Metadata } from 'next'
import Link from 'next/link'
import ContactLink from '@/components/ContactLink'

export const metadata: Metadata = {
  title: 'Contact - NexaGames',
  description: 'Get in touch with NexaGames — send game suggestions, report bugs, or ask about advertising and partnerships.',
  robots: { index: true, follow: true },
}

const reasons = [
  {
    icon: '🎮',
    title: 'Game Suggestions',
    body: 'Got a favourite browser game you\'d love to see on NexaGames? We\'re always looking for new titles to add to the library.',
  },
  {
    icon: '🐛',
    title: 'Bug Reports',
    body: 'Found a broken game, a layout issue, or something that just doesn\'t feel right? Let us know and we\'ll get it fixed.',
  },
  {
    icon: '📢',
    title: 'Advertising and Business',
    body: 'Interested in sponsoring NexaGames or exploring a business partnership? Reach out and we\'ll get back to you.',
  },
  {
    icon: '⚖️',
    title: 'Privacy and Legal',
    body: 'Questions about our Privacy Policy, Terms of Service, or a content takedown request? We take these seriously.',
  },
]

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">Contact</span>
      </nav>

      {/* Hero */}
      <div className="mb-12 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 py-14 text-center">
        <div className="text-5xl mb-4">✉️</div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          Get in <span className="text-orange-400">Touch</span>
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-slate-300 leading-relaxed">
          Have a question, a suggestion, or spotted a bug? We&rsquo;d love to hear from you.
        </p>
        <ContactLink
          user="support"
          domain="nexahost.top"
          label="Email Support"
          className="mt-6 inline-block rounded-full bg-orange-500 px-8 py-3 font-bold text-white shadow-lg transition hover:bg-orange-400 active:scale-95"
        />
      </div>

      {/* Email callout */}
      <section className="mb-12">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <p className="text-gray-500 text-sm mb-2">You can reach us directly at</p>
          <p className="text-lg font-semibold text-gray-900">
            <ContactLink user="support" domain="nexahost.top" />
          </p>
          <p className="mt-3 text-sm text-gray-400">We aim to respond within 2 business days.</p>
        </div>
      </section>

      {/* Reasons to contact */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-black text-gray-900">What Can We Help With?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-orange-200"
            >
              <div className="text-3xl mb-3">{r.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{r.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer links */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 py-10 text-center">
        <p className="text-slate-400 text-sm mb-4">Learn more about NexaGames</p>
        <nav className="flex items-center justify-center gap-6 text-sm">
          <Link href="/about" className="text-slate-300 hover:text-white transition-colors">About</Link>
          <Link href="/privacy-policy" className="text-slate-300 hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-slate-300 hover:text-white transition-colors">Terms of Service</Link>
        </nav>
      </section>
    </div>
  )
}
