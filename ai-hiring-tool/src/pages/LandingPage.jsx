import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Sparkles, Users, ArrowRight, Zap, Target, Cpu, ChevronRight } from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 overflow-hidden selection:bg-indigo-500/30">
      {/* Background Grid & Glow */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none mask-image:linear-gradient(to_bottom,white,transparent)"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Hire<span className="text-indigo-500">AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-6 text-sm font-semibold">
          <Link to="/login" className="text-slate-400 hover:text-white transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="group relative px-5 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            Get Started
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 max-w-5xl mx-auto mt-10">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-widest border border-indigo-500/20 flex items-center gap-2">
              <Sparkles size={14} /> Powered by Advanced LLMs
            </span>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
            The ATS that actually <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              understands resumes.
            </span>
          </motion.h2>

          <motion.p variants={itemVariants} className="mt-6 max-w-2xl text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
            Automate your pipeline. Parse bulk uploads instantly, bridge semantic gaps, and rank candidates with deep-context AI scoring.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              to="/signup"
              className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all font-bold text-white shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)]"
            >
              Start Building Your Pipeline <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="flex items-center justify-center px-8 py-4 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-600 transition-all font-bold text-slate-300 backdrop-blur-sm"
            >
              See How It Works
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Mock Score Card (Visual Interest) */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-3xl mx-auto px-6 mb-32"
      >
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-6 shadow-2xl flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 flex items-center justify-center font-black text-xl">
               A
             </div>
             <div>
               <h3 className="font-bold text-white">Alex Developer</h3>
               <p className="text-xs text-slate-400 font-mono mt-1">Found via Bulk Upload • MERN Stack</p>
             </div>
          </div>
          <div className="flex gap-4">
             <div className="text-right">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Semantic Match</p>
               <p className="text-2xl font-black text-emerald-400 mt-0.5">94%</p>
             </div>
             <div className="h-10 border-l border-white/10 mx-2 hidden sm:block"></div>
             <div className="text-right hidden sm:block">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Action</p>
               <div className="mt-1.5 px-3 py-1 rounded-md bg-indigo-600/20 text-indigo-400 text-xs font-bold ring-1 ring-indigo-500/30">
                 Auto-Shortlisted
               </div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 max-w-7xl mx-auto pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-white">Designed for High-Volume Hiring</h2>
          <p className="mt-4 text-slate-400">Everything you need to move candidates from PDF to final interview.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Feature
            icon={<Cpu size={24} />}
            title="Bulk AI Parsing"
            desc="Drop 50 resumes at once. Our background workers extract skills, compute experience, and normalize data instantly."
            color="text-indigo-400"
            bg="bg-indigo-500/10"
            border="border-indigo-500/20"
          />
          <Feature
            icon={<Target size={24} />}
            title="Semantic Scoring"
            desc="Go beyond keyword matching. The AI understands the context of a candidate's architecture and system design experience."
            color="text-emerald-400"
            bg="bg-emerald-500/10"
            border="border-emerald-500/20"
          />
          <Feature
            icon={<Briefcase size={24} />}
            title="Automated Pipelines"
            desc="Seamless bridging from raw document to actionable candidate profile. Shortlist with one click and update Kanban boards."
            color="text-cyan-400"
            bg="bg-cyan-500/10"
            border="border-cyan-500/20"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-slate-600 text-sm font-semibold">
        © {new Date().getFullYear()} HireAI · Engineered for Modern Teams
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc, color, bg, border }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 hover:bg-slate-900/60 transition-colors"
    >
      <div className={`w-12 h-12 rounded-xl ${bg} ${border} border flex items-center justify-center ${color} mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}