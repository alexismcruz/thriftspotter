"use client";

import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";
type Props = { shopName: string; shopSlug: string };

export default function ClaimListingButton({ shopName, shopSlug }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({ ownerName: "", email: "", message: "" });

  function change(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/claim-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, shopSlug, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function close() {
    setOpen(false);
    setTimeout(() => {
      setStatus("idle");
      setErrorMsg("");
      setForm({ ownerName: "", email: "", message: "" });
    }, 300);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-terra-500 hover:bg-terra-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
      >
        Claim your listing →
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div>
                <h2 className="text-lg font-bold">Claim your listing</h2>
                <p className="text-sm text-stone-500 mt-0.5">Takes 30 seconds. We&apos;ll handle the rest.</p>
              </div>
              <button onClick={close} className="text-stone-400 hover:text-stone-600 text-2xl leading-none ml-4">×</button>
            </div>

            {/* Success */}
            {status === "success" ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">You&apos;re all set!</h3>
                <p className="text-stone-500 text-sm mb-5">
                  We&apos;ve sent a confirmation to your email. We&apos;ll verify and update your listing within 1–2 business days.
                </p>
                <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-left mb-5">
                  <p className="text-xs font-semibold text-brand-700 mb-2">What happens next:</p>
                  <ol className="text-xs text-brand-600 space-y-1 list-decimal list-inside">
                    <li>We verify your ownership</li>
                    <li>We update your listing with correct info</li>
                    <li>You get featured placement in your city — free</li>
                  </ol>
                </div>
                <button
                  onClick={close}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">

                {/* Business name — readonly */}
                <div className="bg-stone-50 border border-stone-200 rounded-lg px-4 py-3">
                  <p className="text-xs text-stone-400 mb-0.5">Claiming listing for</p>
                  <p className="font-semibold text-stone-800 text-sm">{shopName}</p>
                </div>

                {/* Owner name */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="ownerName"
                    type="text"
                    required
                    value={form.ownerName}
                    onChange={change}
                    placeholder="Jane Smith"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={change}
                    placeholder="you@yourbusiness.com"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <p className="text-xs text-stone-400 mt-1">We&apos;ll send a confirmation here — no spam, ever.</p>
                </div>

                {/* Optional message */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Anything to update? <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    name="message"
                    rows={2}
                    value={form.message}
                    onChange={change}
                    placeholder="e.g. New address, updated hours, wrong phone number…"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>

                {/* Error */}
                {status === "error" && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    {errorMsg}
                  </p>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={close}
                    className="flex-1 border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium text-sm px-4 py-2.5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex-1 bg-terra-500 hover:bg-terra-600 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
                  >
                    {status === "loading" ? "Sending…" : "Claim listing →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
