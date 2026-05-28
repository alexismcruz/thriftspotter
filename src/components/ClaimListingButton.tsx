"use client";

import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

type Props = {
  shopName: string;
  shopSlug: string;
};

export default function ClaimListingButton({ shopName, shopSlug }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({ ownerName: "", email: "", phone: "", message: "" });

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
    setTimeout(() => { setStatus("idle"); setErrorMsg(""); }, 300);
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
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <div>
                <h2 className="text-lg font-bold">Claim your listing</h2>
                <p className="text-sm text-stone-500 mt-0.5">
                  We&apos;ll verify and update your listing within 1–2 business days.
                </p>
              </div>
              <button
                onClick={close}
                className="text-stone-400 hover:text-stone-600 text-2xl leading-none ml-4"
              >
                ×
              </button>
            </div>

            {/* Success */}
            {status === "success" ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Request received!</h3>
                <p className="text-stone-500 text-sm mb-6">
                  We&apos;ll reach out within 1–2 business days to verify and set up your listing.
                </p>
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
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    readOnly
                    className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm bg-stone-50 text-stone-500 cursor-not-allowed"
                  />
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
                    placeholder="you@example.com"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={change}
                    placeholder="(555) 000-0000"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Optional message */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Message <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    value={form.message}
                    onChange={change}
                    placeholder="e.g. Our hours have changed, or I've owned this store since 2018…"
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
                    {status === "loading" ? "Sending…" : "Submit"}
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
