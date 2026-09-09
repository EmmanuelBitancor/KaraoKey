"use client";

import { useState } from "react";
import type { Database } from "@/lib/database.types";
type Feedback = Database["public"]["Tables"]["feedback"]["Row"];

interface ReviewsListProps {
  feedback: Feedback[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function ReviewsList({ feedback, loading, error, onRefresh }: ReviewsListProps) {
  const [selected, setSelected] = useState<Feedback | null>(null);

  if (loading) return <div className="text-center py-12">Loading reviews...</div>;
  if (error) return <div className="text-center py-12 text-red-400">Error: {error}</div>;
  if (feedback.length === 0) return <div className="text-center py-12 text-white/50">No reviews submitted yet.</div>;

  const avgRating = feedback.filter(f => f.rating !== null).length > 0
    ? (feedback.filter(f => f.rating !== null).reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.filter(f => f.rating !== null).length).toFixed(1)
    : "N/A";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
          <p className="text-white/50 text-sm">Total Reviews</p>
          <p className="text-3xl font-bold text-[#FF6B00]">{feedback.length}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
          <p className="text-white/50 text-sm">Average Rating</p>
          <p className="text-3xl font-bold text-[#FF6B00]">{avgRating}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
          <p className="text-white/50 text-sm">Reviews This Month</p>
          <p className="text-3xl font-bold text-[#FF6B00]">
            {feedback.filter(f => {
              const d = new Date(f.created_at);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
          <p className="text-white/50 text-sm">Suggestions</p>
          <p className="text-3xl font-bold text-[#FF6B00]">{feedback.filter(f => f.type === "suggestion").length}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold">Submitted Feedback</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-[#FF6B00]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">Date</th>
            </tr>
          </thead>
<tbody className="divide-y divide-white/10">
              {feedback.map((fb) => (
                <tr key={fb.id} onClick={() => setSelected(fb)} className="hover:bg-white/5 cursor-pointer tv-card" tabIndex={0} role="row">
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      fb.type === "review" ? "bg-white/20" :
                      fb.type === "suggestion" ? "bg-[#FF6B00]/20" : "bg-white/10"
                    }`}>{fb.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {fb.rating !== null ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                          fill={i < fb.rating! ? "#FF6B00" : "none"} stroke="currentColor"
                          strokeWidth={1} className="w-4 h-4 inline-block">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.562.562 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>
                      ))
                    ) : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">{fb.name || "(Anonymous)"}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-white/50">
                    {new Date(fb.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <button onClick={onRefresh} className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition tv-card" tabIndex={0} role="button">Refresh</button>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Feedback Details</h3>
              <button onClick={() => setSelected(null)} className="text-white/50 hover:text-white transition tv-card" tabIndex={0} role="button" aria-label="Close">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-white/50">Name</p>
                <p>{selected.name || "(Anonymous)"}</p>
              </div>
             
              {selected.comment && (
                <div>
                  <p className="text-white/50">Review</p>
                  <p className="whitespace-pre-wrap">{selected.comment}</p>
                </div>
              )}
              {selected.suggestion && (
                <div>
                  <p className="text-white/50">Suggestion</p>
                  <p className="whitespace-pre-wrap">{selected.suggestion}</p>
                </div>
              )}
              {selected.rating !== null && (
                <div>
                  <p className="text-white/50">Rating</p>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        fill={i < selected.rating! ? "#FF6B00" : "none"} stroke="currentColor"
                        strokeWidth={1} className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.562.562 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.562.562 0 0 0 .475-.345L11.48 3.5Z" />
                      </svg>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-white/50">Date</p>
                <p>{new Date(selected.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}