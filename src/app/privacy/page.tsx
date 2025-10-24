import { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description: `Privacy Policy for ${siteConfig.name}`,
};

import { Next } from "@/utils/icons";
import { Saira } from "@/utils/fonts";
import { cn } from "@/utils/helpers";

export default async function PrivacyPolicyPage({ searchParams }: any) {
  const resolvedParams = searchParams && typeof searchParams.then === "function" ? await searchParams : searchParams;
  const raw = resolvedParams?.content;
  const content = Array.isArray(raw) ? raw[0] ?? "movie" : raw ?? "movie";
  const sectionTextClass = cn({
    "text-primary": content === "movie",
    "text-warning": content === "tv",
    "text-danger": content === "anime",
  });
  const sectionMarkerClass = cn({
    "marker:text-primary": content === "movie",
    "marker:text-warning": content === "tv",
    "marker:text-danger": content === "anime",
  });
  return (
    <div className="w-full px-4 md:px-6">
      <article className="mx-auto w-full max-w-5xl pt-2 md:pt-3 pb-10 md:pb-12">
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
          Privacy Policy
          <span
            className={cn(
              "flex items-center bg-linear-to-r from-transparent from-80% via-white to-transparent bg-size-[200%_100%] bg-clip-text bg-position-[40%] text-2xl md:text-3xl",
              "tracking-widest transition-[letter-spacing] hover:tracking-[0.2em]",
              Saira.className,
            )}
          >
            Stream
            <span>
              <Next
                className={cn(
                  "size-full px-[2px] transition-colors",
                  {
                    "text-primary": content === "movie",
                    "text-warning": content === "tv",
                    "text-danger": content === "anime",
                  },
                )}
              />
            </span>
            HQ
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        <hr className="mt-6" />

        <p className="mt-6 text-muted-foreground">
          Welcome to {siteConfig.name} ("we", "our", or "us"). We value your privacy and are committed to protecting
          your personal information. This policy explains how we collect, use, and safeguard your information when you
          use our website.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Information We Collect</h2>
        <p className="mt-3 text-muted-foreground">
          We may collect information that you provide directly to us, such as your email address when you create an
          account, subscribe to updates, or contact support. We also collect usage data including pages viewed, search
          queries, and interactions with content to improve functionality and user experience.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section>
            <h3 className="text-base font-semibold">Authentication and Accounts</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              If you sign in, we may store basic profile details and identifiers necessary to operate your account and
              provide personalized features like watch history and library.
            </p>
          </section>
          <section>
            <h3 className="text-base font-semibold">Cookies and Similar Technologies</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We use cookies and local storage to remember preferences (such as theme), maintain sessions, and analyze
              aggregated usage. You can control cookies in your browser; disabling them may impact some features.
            </p>
          </section>
        </div>

        <h2 className="mt-10 text-xl font-semibold">How We Use Your Information</h2>
        <ul className={cn("mt-3 list-disc space-y-2 pl-5", sectionMarkerClass)}>
          <li>Provide, maintain, and improve {siteConfig.name} and its features.</li>
          <li>Personalize content and remember your preferences.</li>
          <li>Monitor usage, performance, and prevent abuse or misuse.</li>
          <li>Communicate with you, including service updates and support.</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">Data Sharing</h2>
        <p className="mt-3 text-muted-foreground">
          We do not sell your personal information. We may share data with trusted service providers who assist in
          operating the site (for example, analytics, hosting, or authentication) under confidentiality obligations.
          We may disclose information if required by law or to protect our rights and users.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Third-Party Services</h2>
        <p className="mt-3 text-muted-foreground">
          Our site may contain links to third-party services and content. Their privacy practices are governed by their
          own policies. We recommend reviewing those policies when you visit third-party sites.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Data Retention</h2>
        <p className="mt-3 text-muted-foreground">
          We retain information for as long as needed to provide the service and for legitimate business purposes,
          such as security, analytics, and legal compliance. You may request deletion of your account data as described
          below.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Your Choices and Rights</h2>
        <ul className={cn("mt-3 list-disc space-y-2 pl-5", sectionMarkerClass)}>
          <li>Access, update, or delete your account information.</li>
          <li>Change preferences like theme and notifications.</li>
          <li>Opt-out of non-essential analytics where available.</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">Security</h2>
        <p className="mt-3 text-muted-foreground">
          We implement reasonable safeguards designed to protect your information. However, no method of transmission
          or storage is 100% secure, and we cannot guarantee absolute security.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Children's Privacy</h2>
        <p className="mt-3 text-muted-foreground">
          {siteConfig.name} is intended for a general audience. We do not knowingly collect personal information from
          children under the age of 13. If you believe a child provided us personal information, please contact us so
          we can take appropriate action.
        </p>

        <h2 className="mt-10 text-xl font-semibold">International Users</h2>
        <p className="mt-3 text-muted-foreground">
          If you access {siteConfig.name} from outside your country, you consent to processing and storage in
          locations where our providers operate, which may have different data protection laws.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Changes to This Policy</h2>
        <p className="mt-3 text-muted-foreground">
          We may update this Privacy Policy from time to time. Material changes will be posted on this page with an
          updated effective date.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Contact Us</h2>
        <p className="mt-3 text-muted-foreground">
          If you have questions about this Privacy Policy or our data practices, please
          {" "}
          <Link
            href={`/contact?content=${content}`}
            className={cn("font-medium underline underline-offset-4 hover:underline", sectionTextClass)}
          >
            Contact us here
          </Link>
          .
        </p>
      </article>
    </div>
  );
}



