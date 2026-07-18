import type { Metadata } from 'next'
import Link from 'next/link'
import ContactLink from '@/components/ContactLink'

export const metadata: Metadata = {
  title: 'Terms of Service - NexaGames',
  description: 'Terms of Service for NexaGames — the rules and conditions for using our free browser game portal.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'July 18, 2026'
const SITE_URL = 'https://fun.nexahost.top'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-bold text-gray-900">{title}</h2>
      <div className="space-y-3 text-gray-600 leading-relaxed">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">Terms of Service</span>
      </nav>

      {/* Hero */}
      <div className="mb-10 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 py-10 text-center">
        <div className="text-4xl mb-3">📜</div>
        <h1 className="text-3xl font-black text-white">Terms of Service</h1>
        <p className="mt-2 text-slate-400 text-sm">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="mb-8 text-gray-600 leading-relaxed">
          Welcome to <strong>NexaGames</strong> (<a href={SITE_URL} className="text-orange-500 hover:underline">{SITE_URL}</a>).
          By accessing or using NexaGames you agree to be bound by these Terms of Service. If you do not agree,
          please do not use the site.
        </p>

        <Section title="1. Acceptance of Terms">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you and NexaGames
            governing your use of the website and all games, features, and content available on it. We may update
            these Terms at any time. Continued use of NexaGames after changes are posted constitutes your acceptance
            of the revised Terms.
          </p>
        </Section>

        <Section title="2. Use of the Service">
          <p>
            NexaGames grants you a personal, non-exclusive, non-transferable, revocable licence to access and use
            the site for your own non-commercial entertainment. You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Attempt to gain unauthorised access to any part of the site, its servers, or connected systems</li>
            <li>Use bots, scripts, or automated tools to manipulate game scores or leaderboard rankings</li>
            <li>Disrupt or interfere with the normal operation of the site, its infrastructure, or its advertising</li>
            <li>Copy, reproduce, redistribute, or resell any game, artwork, or other content from NexaGames</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate access for any user who violates these conditions.
          </p>
        </Section>

        <Section title="3. Intellectual Property">
          <p>
            All original code, artwork, game mechanics, and site content are the property of NexaGames and are
            protected by applicable copyright and intellectual property laws. While certain games on NexaGames are
            inspired by classic arcade titles, every game is an original HTML5 recreation built from scratch —
            the classic game concepts themselves are not owned by NexaGames, but our specific implementations are.
          </p>
          <p>
            You may not reproduce, distribute, or create derivative works from any NexaGames content without our
            express written permission.
          </p>
        </Section>

        <Section title="4. Leaderboard and Player Names">
          <p>
            NexaGames offers a public leaderboard where players may submit scores alongside a chosen player name.
            By submitting a score you acknowledge that your chosen name and score will be displayed publicly.
            You agree not to submit player names that are offensive, defamatory, or infringe the rights of others.
            We reserve the right to remove any entry at our discretion.
          </p>
        </Section>

        <Section title="5. Third-Party Advertising">
          <p>
            NexaGames displays advertisements served by <strong>Google AdSense</strong>. These ads are provided by
            a third party and are subject to Google&rsquo;s own policies and terms. We are not responsible for the
            content of third-party advertisements. For information on how advertising data is handled, please review
            our{' '}
            <Link href="/privacy-policy" className="text-orange-500 hover:underline">Privacy Policy</Link>.
          </p>
        </Section>

        <Section title="6. Disclaimer of Warranties">
          <p>
            NexaGames is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind,
            either express or implied. We do not warrant that the site will be uninterrupted, error-free, or
            free of viruses or other harmful components. Your use of the site is at your sole risk.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the fullest extent permitted by law, NexaGames and its operators shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising from your use of or
            inability to use the site, even if advised of the possibility of such damages. Our total liability
            for any claim arising out of these Terms shall not exceed the amount you paid to use the service,
            which in most cases is zero.
          </p>
        </Section>

        <Section title="8. External Links">
          <p>
            NexaGames may contain links to third-party websites. We have no control over, and assume no
            responsibility for, the content, privacy policies, or practices of any third-party sites. We
            encourage you to review the terms and privacy policies of any site you visit via a link from
            NexaGames.
          </p>
        </Section>

        <Section title="9. Changes to These Terms">
          <p>
            We may revise these Terms at any time by updating this page. The &ldquo;Last updated&rdquo; date at the top
            of this page reflects when the most recent changes were made. We encourage you to review these
            Terms periodically. Material changes will be announced via a notice on the site where practicable.
          </p>
        </Section>

        <Section title="10. Governing Law">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of <strong>Malaysia</strong>,
            without regard to its conflict of law provisions. Any disputes arising under or in connection with
            these Terms shall be subject to the exclusive jurisdiction of the courts of Malaysia.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>
            If you have any questions about these Terms of Service, please contact us at:{' '}
            <ContactLink user="support" domain="nexahost.top" className="font-medium text-orange-500 hover:underline" />
          </p>
        </Section>
      </div>
    </div>
  )
}
