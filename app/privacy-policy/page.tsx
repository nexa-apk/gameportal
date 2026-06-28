import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy - NexaGames',
  description: 'Privacy Policy for NexaGames — how we handle data, cookies, and third-party advertising.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'June 28, 2025'
const CONTACT_EMAIL = 'muhdsapuan@gmail.com'
const SITE_URL = 'https://fun.nexahost.top'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-bold text-gray-900">{title}</h2>
      <div className="space-y-3 text-gray-600 leading-relaxed">{children}</div>
    </section>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">Privacy Policy</span>
      </nav>

      {/* Hero */}
      <div className="mb-10 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 py-10 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
        <p className="mt-2 text-slate-400 text-sm">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="mb-8 text-gray-600 leading-relaxed">
          Welcome to <strong>NexaGames</strong> (<a href={SITE_URL} className="text-orange-500 hover:underline">{SITE_URL}</a>).
          This Privacy Policy explains what information we collect, how we use it, and your choices. By using NexaGames
          you agree to the practices described here.
        </p>

        <Section title="1. Information We Collect">
          <p>
            <strong>Usage data:</strong> When you visit NexaGames we may automatically collect standard server log
            information such as your IP address, browser type, pages visited, and time spent on those pages. This
            information is used solely to analyse site performance and improve the user experience.
          </p>
          <p>
            <strong>Scores and player names:</strong> If you choose to submit a score to the leaderboard you provide
            a player name. This name is stored in our database and displayed publicly on the leaderboard. We do not
            link this name to any personally identifiable information.
          </p>
          <p>
            <strong>No account registration:</strong> NexaGames does not require you to create an account, provide
            your real name, email address, or any other personal information to play games.
          </p>
        </Section>

        <Section title="2. Cookies">
          <p>
            NexaGames uses cookies and similar browser storage technologies for the following purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Session persistence:</strong> A small value may be saved in <code className="rounded bg-gray-100 px-1 text-sm">localStorage</code>{' '}
              to remember your player name across visits.
            </li>
            <li>
              <strong>Advertising cookies:</strong> Our third-party advertising partner (Google AdSense) uses cookies
              to serve personalised ads based on your browsing history. See Section 3 for details.
            </li>
          </ul>
          <p>
            You can disable cookies in your browser settings. Disabling cookies may affect the personalisation of
            advertisements but will not prevent you from playing games.
          </p>
        </Section>

        <Section title="3. Google AdSense and Third-Party Advertising">
          <p>
            NexaGames uses <strong>Google AdSense</strong> (publisher ID: ca-pub-9172954381668177) to display
            advertisements. Google AdSense may use cookies and web beacons to collect data about your visits to
            this and other websites in order to show you relevant advertisements.
          </p>
          <p>
            Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our
            site and/or other sites on the Internet. You can opt out of personalised advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline"
            >
              Google Ads Settings
            </a>
            {' '}or{' '}
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline"
            >
              www.aboutads.info/choices
            </a>.
          </p>
          <p>
            For more information on how Google uses data from sites that use its services, please visit{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline"
            >
              Google's Privacy &amp; Terms
            </a>.
          </p>
        </Section>

        <Section title="4. How We Use Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Operate and maintain NexaGames</li>
            <li>Display and manage the public leaderboard</li>
            <li>Understand how visitors use the site so we can improve it</li>
            <li>Serve relevant advertisements through Google AdSense</li>
          </ul>
          <p>We do not sell, rent, or trade any personal information to third parties.</p>
        </Section>

        <Section title="5. Children's Privacy">
          <p>
            NexaGames is intended for a general audience. We do not knowingly collect personal information from
            children under the age of 13. If you believe a child has provided us with personal information, please
            contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange-500 hover:underline">{CONTACT_EMAIL}</a>{' '}
            so we can delete it promptly.
          </p>
        </Section>

        <Section title="6. External Links">
          <p>
            NexaGames may contain links to third-party websites. We are not responsible for the privacy practices
            of those sites and encourage you to review their privacy policies.
          </p>
        </Section>

        <Section title="7. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date
            at the top of this page. Continued use of NexaGames after changes are posted constitutes your acceptance
            of the updated policy.
          </p>
        </Section>

        <Section title="8. Contact Us">
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-orange-500 hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>
      </div>
    </div>
  )
}
