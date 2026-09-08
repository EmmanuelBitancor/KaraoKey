"use client";

import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import type { Database } from "@/lib/database.types";
import type { Song } from "@/lib/database.types";

type Feedback = Database["public"]["Tables"]["feedback"]["Row"];

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface DashboardChartsProps {
  songs: Song[];
  feedback: Feedback[];
}

export default function DashboardCharts({ songs, feedback }: DashboardChartsProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
          <p className="text-white/50 text-sm">Total Songs</p>
          <p className="text-3xl font-bold text-[#FF6B00]">{songs.length}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
          <p className="text-white/50 text-sm">Unique Artists</p>
          <p className="text-3xl font-bold text-[#FF6B00]">
            {new Set(songs.map((s) => s.artist)).size}
          </p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
          <p className="text-white/50 text-sm">Songs This Month</p>
          <p className="text-3xl font-bold text-[#FF6B00]">
            {songs.filter((s) => {
              const songDate = new Date(s.created_at);
              const now = new Date();
              return songDate.getMonth() === now.getMonth() && songDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
          <p className="text-white/50 text-sm">Most Common Artist</p>
          <p className="text-xl font-bold text-white truncate">
            {(() => {
              const artistCounts = songs.reduce((acc, song) => {
                acc[song.artist] = (acc[song.artist] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              const sorted = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]);
              return sorted.length > 0 ? sorted[0][0] : "N/A";
            })()}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Songs by Letter Chart */}
        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold mb-4">Songs by Letter</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
                datasets: [
                  {
                    label: "Songs",
                    data: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) =>
                      songs.filter((s) => s.title.toUpperCase().startsWith(letter)).length
                    ),
                    backgroundColor: "#FF6B00",
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { color: "rgba(255,255,255,0.5)" },
                    grid: { color: "rgba(255,255,255,0.1)" },
                  },
                  x: {
                    ticks: { color: "rgba(255,255,255,0.5)" },
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Songs by Artist Chart */}
        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold mb-4">Top Artists</h3>
          <div className="h-64">
            <Pie
              data={{
                labels: (() => {
                  const artistCounts = songs.reduce((acc, song) => {
                    acc[song.artist] = (acc[song.artist] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  return Object.entries(artistCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([artist]) => artist);
                })(),
                datasets: [
                  {
                    data: (() => {
                      const artistCounts = songs.reduce((acc, song) => {
                        acc[song.artist] = (acc[song.artist] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      return Object.entries(artistCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 8)
                        .map(([, count]) => count);
                    })(),
                    backgroundColor: [
                      "#FF6B00",
                      "#FF8C42",
                      "#FFB347",
                      "#FFCE73",
                      "#FFE4B5",
                      "#FFD700",
                      "#F0A500",
                      "#CC8800",
                    ],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right",
                    labels: { color: "rgba(255,255,255,0.7)", boxWidth: 12, padding: 8 },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Songs Added Over Time */}
        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold mb-4">Songs Added Over Time</h3>
          <div className="h-64">
            <Line
              data={{
                labels: (() => {
                  const months: string[] = [];
                  const now = new Date();
                  for (let i = 5; i >= 0; i--) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    months.push(date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }));
                  }
                  return months;
                })(),
                datasets: [
                  {
                    label: "Songs Added",
                    data: (() => {
                      const months: number[] = [];
                      const now = new Date();
                      for (let i = 5; i >= 0; i--) {
                        const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        const count = songs.filter((s) => {
                          const songDate = new Date(s.created_at);
                          return songDate.getMonth() === targetMonth.getMonth() &&
                                 songDate.getFullYear() === targetMonth.getFullYear();
                        }).length;
                        months.push(count);
                      }
                      return months;
                    })(),
                    borderColor: "#FF6B00",
                    backgroundColor: "rgba(255, 107, 0, 0.1)",
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { color: "rgba(255,255,255,0.5)" },
                    grid: { color: "rgba(255,255,255,0.1)" },
                  },
                  x: {
                    ticks: { color: "rgba(255,255,255,0.5)" },
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Average Rating Over Time */}
        <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold mb-4">Average Rating Over Time</h3>
          <div className="h-64">
            <Line
              data={{
                labels: (() => {
                  const months: string[] = [];
                  const now = new Date();
                  for (let i = 5; i >= 0; i--) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    months.push(date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }));
                  }
                  return months;
                })(),
                datasets: [
                  {
                    label: "Average Rating",
                    data: (() => {
                      const months: number[] = [];
                      const now = new Date();
                      for (let i = 5; i >= 0; i--) {
                        const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        const ratings = feedback.filter((f) => f.rating !== null).filter((f) => {
                          const d = new Date(f.created_at);
                          return d.getMonth() === targetMonth.getMonth() && d.getFullYear() === targetMonth.getFullYear();
                        }).map((f) => f.rating!);
                        const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
                        months.push(avg);
                      }
                      return months;
                    })(),
                    borderColor: "#FF6B00",
                    backgroundColor: "rgba(255, 107, 0, 0.1)",
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: { color: "rgba(255,255,255,0.5)" },
                    grid: { color: "rgba(255,255,255,0.1)" },
                  },
                  x: {
                    ticks: { color: "rgba(255,255,255,0.5)" },
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
