"use client";

import { useState } from "react";

type Props = { stateName: string; stateAbbr: string };

type FormState = "idle" | "loading" | "success" | "error";

export default function BusinessRequestModal({ stateName, stateAbbr }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    businessName: "", address: "", city: "", phone: "",
    website: "", instagram: "", facebook: "", other: "",
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
        body: JSON.stringify({ ...form, state: stateAbbr }),
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
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto bg-white border border-brand-300 hover:bg-brand-50 text-brand-700 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
      >
        + Add Your Business
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <div>
                <h2 className="text-xl font-bold">Add Your Business</h2>
                <p className="text-sm text-stone-500 mt-0.5">List your thrift business in {stateName}</p>
              </div>
              <button onClick={close} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">×</button>
            </div>

            {status === "success" ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Request received!</h3>
                <p className="text-stone-500 text-sm mb-6">
                  We&apos;ll review your submission and add your business within 1–2 business days.
                </p>
                <button
                  onClick={close}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Required */}
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Required</p>
                  <div className="space-y-3">
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
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="address" value={form.address} onChange={change} required
                        placeholder="123 Main St"
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
                        <label className="block text-sm font-medium text-stone-700 mb-1">State</label>
                        <input
                          value={`${stateName} (${stateAbbr})`} readOnly
                          className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm bg-stone-50 text-stone-500"
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
                  </div>
                </div>

                {/* Optional */}
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Optional</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Website</label>
                      <input
                        name="website" value={form.website} onChange={change} type="url"
                        placeholder="https://yourstore.com"
                        className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Instagram</label>
                      <input
                        name="instagram" value={form.instagram} onChange={change}
                        placeholder="@yourstore"
                        className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Facebook</label>
                      <input
                        name="facebook" value={form.facebook} onChange={change}
                        placeholder="facebook.com/yourstore"
                        className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Other Social</label>
                      <input
                        name="other" value={form.other} onChange={change}
                        placeholder="TikTok, Twitter, etc."
                        className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    {errorMsg}
                  </p>
                )}

                {/* Actions */}
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
                    {status === "loading" ? "Sending…" : "Submit Request"}
                  </button>
                </div>

                <p className="text-xs text-stone-400 text-center">
                  We review all submissions within 1–2 business days.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
