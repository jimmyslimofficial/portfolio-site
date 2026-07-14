import React from 'react';

const ProjectCard = ({ title, description, tags }) => {
  return (
    <div className="group relative rounded-xl border border-slate-800 bg-[#0d1527]/40 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-[#111c34]/50">
      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-emerald-500/0 to-blue-500/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:from-emerald-500/5 group-hover:to-blue-500/5 group-hover:opacity-100"></div>
      
      <h3 className="font-mono text-lg font-bold uppercase tracking-tight text-slate-100 transition-colors duration-300 group-hover:text-emerald-400">
        {title}
      </h3>
      <p className="mt-3 text-xs leading-relaxed text-slate-400">
        {description}
      </p>
      
      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <span key={idx} className="rounded border border-emerald-500/10 bg-emerald-500/5 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProjectCard;