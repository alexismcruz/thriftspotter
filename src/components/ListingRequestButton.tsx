"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

type FormState = "idle" | "loading" | "success" | "error";

export default function ListingRequestButton() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    businessName: "", city: "", state: "", phone: "", email: "", website: "",
  });

  function change(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/business-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, address: "" }),
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
      <div className="mt-auto">
        <p className="text-xs text-stone-500 text-center mb-3">
          Don&apos;t see your business? We&apos;ll list it for you.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="w-full text-center font-semibold px-5 py-3 rounded-lg transition-colors text-sm bg-brand-600 text-white hover:bg-brand-700"
        >
          Send us a Message
        </button>
      </div>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <div>
                <h2 className="text-lg font-bold">Get Listed for Free</h2>
                <p className="text-sm text-stone-500 mt-0.5">We&apos;ll add your business within 1–2 business days.</p>
              </div>
              <button onClick={close} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">×</button>
            </div>

            {status === "success" ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Request received!</h3>
                <p className="text-stone-500 text-sm mb-6">We&apos;ll get your business listed within 1–2 business days.</p>
                <button
                  onClick={close}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="businessName" value={form.businessName} onChange={change} required
                    placeholder="e.g. Goodwill of Sacramento"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="city" value={form.city} onChange={change} required
                      placeholder="Sacramento"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="state" value={form.state} onChange={change} required
                      placeholder="CA"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone" value={form.phone} onChange={change} required type="tel"
                    placeholder="(555) 000-0000"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email" value={form.email} onChange={change} required type="email"
                    placeholder="you@yourstore.com"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Website</label>
                  <input
                    name="website" value={form.website} onChange={change} type="url"
                    placeholder="https://yourstore.com"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    {errorMsg}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button" onClick={close}
                    className="flex-1 border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium text-sm px-4 py-2.5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={status === "loading"}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
                  >
                    {status === "loading" ? "Sending…" : "Submit"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
