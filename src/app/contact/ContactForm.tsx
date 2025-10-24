"use client";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Spinner, addToast } from "@heroui/react";

async function submitContact(data: { name: string; email: string; message: string }) {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.ok;
}

const ContactForm = () => {
  const searchParams = useSearchParams();
  const content = (searchParams.get("content") || "movie") as "movie" | "tv" | "anime";
  const buttonColor = content === "movie" ? "primary" : content === "tv" ? "warning" : "danger";
  const focusBorder = content === "movie" ? "focus:border-primary" : content === "tv" ? "focus:border-warning" : "focus:border-danger";
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [cooldown, setCooldown] = useState(0);
  const COOLDOWN_SECONDS = 15;
  const [emailError, setEmailError] = useState<string | null>(null);

  const isValidEmail = (value: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);

  async function onSubmit(formData: FormData) {
    setSubmitting(true);
    setSuccess(null);
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const message = String(formData.get("message") || "");

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      setSubmitting(false);
      return;
    }

    setEmailError(null);

    const ok = await submitContact({
      name,
      email,
      message,
    });
    setSuccess(ok);
    setSubmitting(false);
    if (ok) {
      formRef.current?.reset();
      addToast({ title: "Message sent successfully", color: buttonColor as any });
      setTimeout(() => setSuccess(null), 3000);
      setCooldown(COOLDOWN_SECONDS);
      const interval = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
  }

  return (
    <form ref={formRef} action={onSubmit} aria-busy={submitting} className="rounded-2xl border border-default-200 p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-foreground/80">Name</label>
          <input
            name="name"
            type="text"
            required
            placeholder="Your name"
            className={`rounded-lg border border-default-200 bg-transparent px-3 py-2 outline-none ${focusBorder}`}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-foreground/80">Email</label>
            <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
              aria-invalid={emailError ? "true" : "false"}
              onChange={(e) => {
                if (emailError && isValidEmail(e.target.value)) setEmailError(null);
              }}
              className={`rounded-lg border bg-transparent px-3 py-2 outline-none ${focusBorder} ${
                emailError ? "border-danger" : "border-default-200"
              }`}
          />
            {emailError && <span className="text-xs text-danger">{emailError}</span>}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <label className="text-sm text-foreground/80">Message</label>
        <textarea
          name="message"
          required
          placeholder="What can we help you with?"
          rows={6}
          className={`rounded-lg border border-default-200 bg-transparent px-3 py-2 outline-none ${focusBorder}`}
        />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Button
          type="submit"
          isDisabled={submitting || cooldown > 0}
          isLoading={submitting}
          color={buttonColor as any}
          className="px-4 py-2 transition-transform data-[pressed=true]:scale-95"
        >
          {submitting ? "Sending..." : cooldown > 0 ? `Wait ${cooldown}s` : "Send Message"}
        </Button>
        {success === true && <span className="text-sm text-green-500">Sent successfully.</span>}
        {success === false && <span className="text-sm text-red-500">Failed. Try again.</span>}
      </div>
    </form>
  );
};

export default ContactForm;


