export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-white">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-400">
        KaraoKey
      </p>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
        Find your song. Start singing.
      </h1>
      <p className="mt-5 max-w-lg text-lg text-slate-300">
        Your lightweight karaoke companion, powered by YouTube.
      </p>
      <div className="mt-8 flex w-full max-w-md gap-3">
        <input
          aria-label="Search for a song"
          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-left outline-none transition placeholder:text-slate-500 focus:border-fuchsia-400"
          placeholder="Search for a song..."
          type="search"
        />
        <button
          className="rounded-lg bg-fuchsia-500 px-5 py-3 font-semibold transition hover:bg-fuchsia-400"
          type="button"
        >
          Search
        </button>
      </div>
    </main>
  );
}
