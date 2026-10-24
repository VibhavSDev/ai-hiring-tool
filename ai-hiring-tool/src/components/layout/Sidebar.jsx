import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  ListChecks,
  Users,
  Settings,
  HelpCircle,
  X
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Jobs",
    path: "/jobs",
    icon: <Briefcase size={18} />,
  },
  {
    label: "Candidates",
    path: "/candidates",
    icon: <Users size={18} />,
  },
];

export default function Sidebar({ onClose }) {
  return (
    <aside className="flex-none flex h-screen w-64 flex-col border-r border-slate-800 bg-[#0f172a] text-slate-200 z-50 shadow-2xl lg:shadow-none">
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Briefcase size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Hire<span className="text-indigo-500">OS</span>
          </span>
        </div>
        
        {/* Mobile Close Button */}
        <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto custom-scrollbar">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Core Workflow
        </div>
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} onClick={onClose} />
        ))}
      </nav>

      <div className="shrink-0 border-t border-slate-800 p-4 space-y-4">
        <div className="space-y-1">
          <FooterItem label="Settings" icon={<Settings size={16} />} />
          <FooterItem label="Support" icon={<HelpCircle size={16} />} />
        </div>
        
        <div className="flex items-center justify-between rounded-xl bg-slate-900/50 border border-white/5 px-3 py-2 text-[10px] font-bold text-slate-500">
          <span className="uppercase tracking-widest">Build</span>
          <span className="text-slate-400 font-mono">v1.0.0-PRO</span>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.path}
      onClick={onClick} // Closes menu on mobile when a link is clicked
      className={({ isActive }) => `
        group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
        ${isActive 
          ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20 shadow-sm" 
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"}
      `}
    >
      {({ isActive }) => (
        <>
          <span className={`transition-colors duration-200 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`}>
            {item.icon}
          </span>
          <span className="flex-1">{item.label}</span>
          {isActive && (
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}

function FooterItem({ label, icon }) {
  return (
    <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors">
      {icon}
      {label}
    </button>
  );
}