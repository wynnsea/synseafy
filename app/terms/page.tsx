import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/src/presentation/views/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service · Synseafy",
  description: "The terms for using Synseafy.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="November 21, 2026">
      <p>
        These terms apply to your use of Synseafy at music.wynnsea.my.id. By using the app you
        agree to them.
      </p>

      <h2>The service</h2>
      <p>
        Synseafy is a personal, non-commercial music player. It lets you discover and play music
        available on YouTube / YouTube Music and keep a personal library. It is provided free of
        charge, &ldquo;as is&rdquo;, and may change or stop at any time.
      </p>

      <h2>YouTube</h2>
      <p>
        Music is played through YouTube. Your use of that content is also subject to the{" "}
        <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
          YouTube Terms of Service
        </a>{" "}
        and the{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google Privacy Policy
        </a>
        . All songs, artwork and related content belong to their respective owners; Synseafy
        does not host or own any music.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Keep your sign-in details secure; you are responsible for activity on your account.</li>
        <li>
          Only upload images (profile photos, playlist covers) that you have the right to use and
          that are not offensive or illegal.
        </li>
        <li>Don&apos;t misuse the service, for example by attacking it or scraping it.</li>
      </ul>
      <p>We may suspend accounts that break these rules.</p>

      <h2>Liability</h2>
      <p>
        To the extent permitted by law, Synseafy is not liable for any loss arising from use of
        the service, including unavailable songs, interruptions or lost data.
      </p>

      <h2>Privacy</h2>
      <p>
        How we handle your data is described in the <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: use the contact form at{" "}
        <a href="https://wynnsea.my.id" target="_blank" rel="noopener noreferrer">
          wynnsea.my.id
        </a>
        .
      </p>
    </LegalPage>
  );
}
