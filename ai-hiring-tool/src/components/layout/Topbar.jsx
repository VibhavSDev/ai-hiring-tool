import { useLocation, Link } from "react-router-dom";
import { LogOut, Bell, ChevronRight, Search, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const pageTitles = {
  "/dashboard": "Dashboard Overview",
  "/jobs": "Job Pipelines",
  "/candidates": "Candidate Database",
  "/scoring": "Candidate Evaluation",
  "/scoring-jobs": "Scoring Engine",
};

export default function Topbar({ onOpenSidebar }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentPath = Object.keys(pageTitles).find((path) =>
    location.pathname.startsWith(path)
  );
  
  const title = pageTitles[currentPath] || "Workspace";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#020617] px-4 lg:px-10 z-20">
      
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu */}
        <button 
          onClick={onOpenSidebar} 
          className="lg:hidden p-1.5 -ml-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>

        <nav className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <Link to="/dashboard" className="hover:text-indigo-400 transition-colors">Workspace</Link>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-slate-300">{title.split(' ')[0]}</span>
        </nav>
        
        <div className="h-4 w-px bg-slate-800 hidden md:block mx-1" />
        
        <h1 className="text-sm font-bold tracking-tight text-white uppercase tracking-[0.1em] line-clamp-1">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <button className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-500 hover:border-indigo-500/30 transition-all">
          <Search size={14} />
          <span className="text-[10px] uppercase font-bold tracking-wider">Quick Search</span>
          <kbd className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded border border-white/10">⌘K</kbd>
        </button>

        <div className="flex items-center gap-2">
          <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-[#020617]" />
          </button>

          <div className="h-8 w-px bg-white/5 mx-1 md:mx-2 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-bold text-white leading-none">
                {user?.name || "Administrator"}
              </span>
              <span className="text-[9px] font-bold text-indigo-400/80 uppercase tracking-tighter mt-1">
                Recruiter Access
              </span>
            </div>
            
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-black text-white shadow-lg shadow-indigo-500/20">
              {user?.name?.substring(0, 2).toUpperCase() || "AD"}
            </div>
          </div>

          <button
            onClick={logout}
            className="ml-1 md:ml-2 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}