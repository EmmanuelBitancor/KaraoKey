"use client";

import Link from "next/link";

type TabType = "dashboard" | "songs" | "reviews";

interface AdminSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export default function AdminSidebar({
  activeTab,
  onTabChange,
  sidebarOpen,
  onToggleSidebar,
  onLogout,
}: AdminSidebarProps) {
  return (
    <div className={`fixed top-0 left-0 h-screen bg-[#1a1a1a] border-r border-white/10 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <div className={`p-4 border-b border-white/10 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
        {sidebarOpen && (
          <Link
            href="/"
            className="text-xl font-bold text-white"
            style={{ fontFamily: "'Ayaha', sans-serif" }}
          >
            Karao<span className="text-[#FF6B00]">KEY</span>
          </Link>
        )}
        <button onClick={onToggleSidebar} className="text-white/50 hover:text-white transition p-1">
          {sidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          )}
        </button>
      </div>
      <nav className="flex-1 p-2">
        <ul className="space-y-2">
          <li>
            <button onClick={() => onTabChange("dashboard")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${sidebarOpen ? '' : 'justify-center'} ${activeTab === "dashboard" ? "bg-[#FF6B00] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
              {sidebarOpen && <span>Dashboard</span>}
            </button>
          </li>
          <li>
            <button onClick={() => onTabChange("songs")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${sidebarOpen ? '' : 'justify-center'} ${activeTab === "songs" ? "bg-[#FF6B00] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
              </svg>
              {sidebarOpen && <span>Song List</span>}
            </button>
          </li>
          <li>
            <button onClick={() => onTabChange("reviews")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${sidebarOpen ? '' : 'justify-center'} ${activeTab === "reviews" ? "bg-[#FF6B00] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0-2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              {sidebarOpen && <span>Reviews</span>}
            </button>
          </li>
        </ul>
      </nav>
      <div className="p-2 border-t border-white/10">
        <button onClick={onLogout} className={`w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition ${sidebarOpen ? '' : 'justify-center'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}