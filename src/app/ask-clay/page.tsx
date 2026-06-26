"use client";

import { useState } from "react";
import Image from "next/image";

export default function AskClayPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Simulate submission (wire up to a real endpoint later)
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero band ── */}
      <div className="bg-black text-white py-16 px-6 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            C
          </div>
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-3">
          Ask Clay
        </h1>
        <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
          Got a question? Clay knows everything — or at least he thinks he does. Drop it below.
        </p>
      </div>

      {/* ── Form card ── */}
      <div className="max-w-2xl mx-auto px-6 py-14">
        {submitted ? (
          /* ── Success state ── */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-md">
              ✓
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-black mb-3">
              Question received!
            </h2>
            <p className="text-gray-500 text-base">
              Clay will get to it — probably. Thanks for reaching out.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              ← Ask another question
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  First Name <span className="text-orange-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="Jane"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Last Name <span className="text-orange-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Smith"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Email <span className="text-orange-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="jane@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Question */}
            <div>
              <label
                htmlFor="question"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                What would you like to ask Clay? <span className="text-orange-500">*</span>
              </label>
              <textarea
                id="question"
                name="question"
                required
                rows={6}
                placeholder="Ask away — no question too big, too small, or too weird."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none leading-relaxed"
              />
            </div>

            {/* Submit */}
            <button
              id="ask-clay-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-widest py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? "Sending…" : "Send My Question"}
            </button>

            <p className="text-center text-xs text-gray-400 pt-1">
              Your info will never be shared or sold. Ever.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
