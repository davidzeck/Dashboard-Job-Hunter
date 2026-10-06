import type { Metadata } from "next";
import type { ReactNode } from "react";

// ⚠️ Before submitting to Google Play: replace these with the real operator
// and a monitored address. Everything below describes what the system does
// today — change the text when the system changes, not the other way round.
const OPERATOR = "the Job Scout team";
const CONTACT_EMAIL = "privacy@example.com";
const LAST_UPDATED = "3 October 2026";

export const metadata: Metadata = {
  title: "Privacy policy · Job Scout",
  description: "What Job Scout collects, why, who processes it, and your rights.",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}

function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <article className="mx-auto max-w-2xl space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Privacy policy</h1>
          <p className="text-sm text-muted-foreground">
            Job Scout (the web dashboard and the Android app) is operated by {OPERATOR}.
            Last updated {LAST_UPDATED}. Questions or requests:{" "}
            <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </header>

        <Section title="What we collect">
          <List
            items={[
              <>
                <strong>Your account:</strong> name, email, optional phone number, your
                password (stored only as a one-way hash), your career state and
                notification preferences.
              </>,
              <>
                <strong>Sign-in sessions:</strong> device and browser names and the IP
                address of each signed-in session, so you can review and revoke them and
                so we can protect your account.
              </>,
              <>
                <strong>CVs you upload:</strong> the file, the text extracted from it, and
                the skills we identify in it.
              </>,
              <>
                <strong>Your career log:</strong> the achievements you write, in your own
                words, the structured summary we derive from them, and the roles you add.
              </>,
              <>
                <strong>Interview practice:</strong> the audio of answers you record, their
                transcripts, delivery measures and scores. The recording itself is deleted
                from storage as soon as it has been analysed; the transcript and scores are
                kept so you can see your progress.
              </>,
              <>
                <strong>Job activity:</strong> jobs you save or mark as applied, and the
                alerts and recommendations we show you.
              </>,
              <>
                <strong>Notifications:</strong> a device token so the app can receive job
                alerts and reminders.
              </>,
            ]}
          />
        </Section>

        <Section title="How we use it">
          <p>
            To recommend jobs and send alerts, compare your CV with roles, coach your
            interview answers, summarise your career progress and what the job market asks
            for, keep your account secure, and send account emails such as password
            resets. We do not sell your data or use it for advertising.
          </p>
        </Section>

        <Section title="Who processes it for us">
          <List
            items={[
              "Google (Gemini API) analyses CV text, achievement notes and interview recordings.",
              "Google Firebase delivers push notifications.",
              "Amazon Web Services stores uploaded files and database backups (Frankfurt, Germany).",
              "Hetzner hosts our servers (Germany).",
              "Brevo sends account emails.",
            ]}
          />
          <p>
            Your data is therefore stored and processed outside Kenya, in the European
            Union. We transfer it only to these providers, for the purposes above.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            You can delete your account from your profile. When you do, we immediately
            delete the files you uploaded (CVs and any remaining recordings) and deactivate
            the account. Your account record and activity are retained after deactivation;
            email us to have them erased as well. Database backups are kept for 30 days.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            Under Kenya&apos;s Data Protection Act, 2019 you may ask to access, correct,
            delete or receive a copy of your personal data, and object to its processing.
            Email {CONTACT_EMAIL}. You may also complain to the Office of the Data
            Protection Commissioner.
          </p>
        </Section>

        <Section title="Security">
          <p>
            All traffic is encrypted (HTTPS). Passwords are stored only as hashes, and
            uploaded files are kept in private storage reachable only through
            short-lived links.
          </p>
        </Section>

        <Section title="Children">
          <p>Job Scout is intended for adults and is not directed at children under 18.</p>
        </Section>

        <Section title="Changes">
          <p>
            When this policy changes we will update this page and the date above.
          </p>
        </Section>
      </article>
    </main>
  );
}
