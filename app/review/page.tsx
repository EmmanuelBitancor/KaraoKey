"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import type { Database } from "@/lib/database.types";

type Feedback = Database["public"]["Tables"]["feedback"]["Row"];

export default function ReviewPage() {
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [comment, setComment] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");

  useEffect(() => {
    async function loadFeedback() {
      setLoading(true);
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage({ text: "Failed to load feedback.", type: "error" });
      } else if (data) {
        setFeedback(data);
      }
      setLoading(false);
    }
    loadFeedback();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const hasAnyContent = comment.trim() || suggestion.trim() || rating > 0;
    if (!hasAnyContent) {
      setMessage({ text: "Please enter a review, suggestion, or rating.", type: "error" });
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("feedback").insert({
      type: rating > 0 ? "rating" : suggestion.trim() ? "suggestion" : "review",
      comment: comment || null,
      rating: rating > 0 ? rating : null,
      suggestion: suggestion || null,
      name: name || null,
      email: null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      setMessage({ text: "Something went wrong. Please try again.", type: "error" });
    } else {
      setMessage({ text: "Thanks! Your feedback has been submitted.", type: "success" });
      setComment("");
      setSuggestion("");
      setRating(0);
      setName("");
      setShowForm(false);
      const { data } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
      if (data) setFeedback(data);
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Link href="/" className="text-[#FF6B00] hover:underline text-sm mb-6 inline-block tv-card">
          &larr; Back to home
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Feedback</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg bg-[#FF6B00] text-white font-semibold hover:bg-[#e55f00] transition tv-card"
            tabIndex={0}
            role="button"
          >
            Write a Review
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className="text-white/50 text-center py-12 col-span-full">Loading reviews...</p>
          ) : feedback.length === 0 ? (
            <p className="text-white/50 text-center py-12 col-span-full">No reviews submitted yet.</p>
          ) : (
            feedback.map((fb) => (
              <div key={fb.id} className="bg-[#1a1a1a] rounded-lg border border-white/10 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40">{new Date(fb.created_at).toLocaleString()}</span>
                </div>
                {fb.rating !== null && (
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        fill={i < fb.rating! ? "#FF6B00" : "none"} stroke="currentColor"
                        strokeWidth={1} className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.562.562 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.562.562 0 0 0 .475-.345L11.48 3.5Z" />
                      </svg>
                    ))}
                  </div>
                )}
                {fb.comment && <p className="text-white/80 text-sm mb-1 line-clamp-3">{fb.comment}</p>}
                {fb.suggestion && <p className="text-white/80 text-sm mb-1 line-clamp-3">{fb.suggestion}</p>}
                {fb.name && <p className="text-white/40 text-xs">— {fb.name}</p>}
              </div>
            ))
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowForm(false)}>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Write a Review</h3>
                <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white transition text-xl leading-none">&times;</button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm text-white/50 mb-1">Name (please don&lsquo;t use your real name)</label>
                   <input
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="Your name"
                     className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                     tabIndex={0}
                   />
                </div>

                <div>
                  <label className="block text-sm text-white/50 mb-1">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
<button
                         key={n}
                         type="button"
                         onClick={() => setRating(n === rating ? 0 : n)}
                         className="transition-transform hover:scale-110 tv-card"
                         tabIndex={0}
                         role="button"
                       >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={n <= rating ? "#FF6B00" : "none"}
                          stroke={n <= rating ? "#FF6B00" : "currentColor"}
                          strokeWidth={1.5}
                          className="w-12 h-12 text-white/40"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.562.562 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.562.562 0 0 0 .475-.345L11.48 3.5Z"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/50 mb-1">Song Suggestion</label>
                   <input
                     value={suggestion}
                     onChange={(e) => setSuggestion(e.target.value)}
                     placeholder="Song title / artist..."
                     className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                     tabIndex={0}
                   />
                </div>

                <div>
<label className="block text-sm text-white/50 mb-1">Your Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Tell us what you thought..."
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white resize-y"
                    tabIndex={0}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="self-start px-6 py-3 rounded-lg bg-[#FF6B00] text-white font-semibold hover:bg-[#e55f00] transition disabled:opacity-50 disabled:cursor-not-allowed tv-card"
                  tabIndex={0}
                  role="button"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>

                {message && (
                  <p className={`text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
                    {message.text}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}