"use client";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Spinner, addToast } from "@heroui/react";

async function submitMovieRequest(data: { 
  name: string; 
  email: string; 
  movieName: string; 
  action: string; 
  additionalInfo?: string 
}) {
  const res = await fetch("/api/movie-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.ok;
}

const MovieRequestForm = () => {
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
    const movieName = String(formData.get("movieName") || "");
    const action = String(formData.get("action") || "");
    const additionalInfo = String(formData.get("additionalInfo") || "");

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      setSubmitting(false);
      return;
    }

    if (!movieName.trim()) {
      setSubmitting(false);
      return;
    }

    if (!action) {
      setSubmitting(false);
      return;
    }

    setEmailError(null);

    const ok = await submitMovieRequest({
      name,
      email,
      movieName,
      action,
      additionalInfo: additionalInfo || undefined,
    });
    setSuccess(ok);
    setSubmitting(false);
    if (ok) {
      formRef.current?.reset();
      addToast({ title: "Request submitted successfully", color: buttonColor as any });
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
        <label className="text-sm text-foreground/80">Movie Name or URL</label>
        <input
          name="movieName"
          type="text"
          required
          placeholder="Enter movie name or URL (e.g., IMDb, TMDB, etc.)"
          className={`rounded-lg border border-default-200 bg-transparent px-3 py-2 outline-none ${focusBorder}`}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <label className="text-sm text-foreground/80">Action</label>
        <div className="flex gap-1 rounded-lg border border-default-200 p-1 bg-default-50">
          <label className="flex-1 cursor-pointer">
            <input
              name="action"
              type="radio"
              value="add"
              required
              className="sr-only peer"
            />
            <div className={`flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 text-foreground/70 hover:text-foreground peer-checked:shadow-sm ${
              content === "movie" ? "peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:hover:text-primary-foreground" :
              content === "tv" ? "peer-checked:bg-warning peer-checked:text-warning-foreground peer-checked:hover:text-warning-foreground" :
              "peer-checked:bg-danger peer-checked:text-danger-foreground peer-checked:hover:text-danger-foreground"
            }`}>
              Add Content
            </div>
          </label>
          <label className="flex-1 cursor-pointer">
            <input
              name="action"
              type="radio"
              value="remove"
              required
              className="sr-only peer"
            />
            <div className={`flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 text-foreground/70 hover:text-foreground peer-checked:shadow-sm ${
              content === "movie" ? "peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:hover:text-primary-foreground" :
              content === "tv" ? "peer-checked:bg-warning peer-checked:text-warning-foreground peer-checked:hover:text-warning-foreground" :
              "peer-checked:bg-danger peer-checked:text-danger-foreground peer-checked:hover:text-danger-foreground"
            }`}>
              Remove Content
            </div>
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <label className="text-sm text-foreground/80">Additional Information (Optional)</label>
        <textarea
          name="additionalInfo"
          placeholder="Any additional details about the movie or reason for the request..."
          rows={4}
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
          {submitting ? "Submitting..." : cooldown > 0 ? `Wait ${cooldown}s` : "Submit Request"}
        </Button>
        {success === true && <span className="text-sm text-green-500">Request submitted successfully.</span>}
        {success === false && <span className="text-sm text-red-500">Failed. Try again.</span>}
      </div>
    </form>
  );
};

export default MovieRequestForm;
