import type { Metadata } from "next";
import { LegalPage } from "@/src/presentation/views/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy · Synseafy",
  description: "How Synseafy collects, uses and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 21, 2026">
      <p>
        Synseafy (&ldquo;we&rdquo;, &ldquo;the app&rdquo;) is a personal music player at
        music.wynnsea.my.id. This policy explains what data the app handles and why.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account details</strong>: your email address and display name. If you sign in
          with Google, we receive your name, email address and profile photo from Google. We do
          not receive your Google password.
        </li>
        <li>
          <strong>Your library</strong>: songs you like, playlists you create (including their
          names, descriptions and cover images) and your recent searches.
        </li>
        <li>
          <strong>Listening activity</strong>: which songs you played, when, and for how long,
          used for &ldquo;Recently played&rdquo; and your Listening Recap.
        </li>
        <li>
          <strong>Images you upload</strong>: your profile photo and playlist covers.
        </li>
        <li>
          <strong>Preferences</strong>: theme and playback settings.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        Only to provide the app to you: to sign you in, keep your library and settings across
        devices, and show your listening history and recap. We do not sell your data, show ads
        based on it, or share it with third parties for marketing.
      </p>

      <h2>Where it is stored</h2>
      <p>
        Account data, your library, listening activity and uploaded images are stored with{" "}
        <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
          Supabase
        </a>
        , our database and authentication provider. Access is restricted so that each account
        can only read and change its own data. The website is hosted on Vercel.
      </p>

      <h2>YouTube</h2>
      <p>
        Song information and playback come from YouTube / YouTube Music through YouTube API
        Services. By using Synseafy you also agree to the{" "}
        <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
          YouTube Terms of Service
        </a>
        , and YouTube&apos;s handling of data is covered by the{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google Privacy Policy
        </a>
        . The YouTube player may set its own cookies when a song plays.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        The app stores your sign-in session and a few settings in your browser so you stay
        signed in. We do not use advertising or analytics trackers.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>You can edit your name, photo, playlists and liked songs at any time in the app.</li>
        <li>You can clear your listening history from the Recap page.</li>
        <li>
          To delete your account and all associated data, contact us (below) and we will remove
          it.
        </li>
        <li>
          You can revoke Synseafy&apos;s access to your Google account at{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
          >
            myaccount.google.com/permissions
          </a>
          .
        </li>
      </ul>

      <h2>Children</h2>
      <p>Synseafy is not directed at children under 13.</p>

      <h2>Changes</h2>
      <p>
        If this policy changes, we will update the date at the top of this page.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or deletion requests: use the contact form at{" "}
        <a href="https://wynnsea.my.id" target="_blank" rel="noopener noreferrer">
          wynnsea.my.id
        </a>
        .
      </p>
    </LegalPage>
  );
}
