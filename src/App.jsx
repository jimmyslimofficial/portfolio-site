import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  
  const exportData = () => {
    const dataStr = JSON.stringify(projects);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'projects.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        setProjects(Array.isArray(parsed) ? parsed : []);
        setProjectsLoaded(true);
      } catch (error) {
        console.error('Invalid project JSON:', error);
        window.alert('That file is not valid project data.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const emailMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emailMenuRef.current && !emailMenuRef.current.contains(event.target)) {
        setActiveEmailMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Add this with your other useState hooks
  const [activeEmailMenu, setActiveEmailMenu] = useState(null);
  const updateProject = (idx, field, val) => {
    // Create a copy of the projects array
    const updatedProjects = [...projects];
    // Modify the specific field
    updatedProjects[idx][field] = val;
    // Update the state
    setProjects(updatedProjects);
  };
  const themes = [
    { name: 'Elegant Serif', classes: 'bg-stone-50 text-stone-900 font-serif', card: 'bg-white border border-stone-200 rounded-none shadow-sm', accent: 'text-stone-700', titleFont: 'font-bold tracking-tight', modalBg: 'bg-stone-50 text-stone-900' },
    { name: 'Tech Demo', classes: 'bg-black text-emerald-500 font-mono', card: 'bg-neutral-950 border border-emerald-900/50 rounded-lg', accent: 'text-emerald-400', titleFont: 'font-bold uppercase', modalBg: 'bg-black text-emerald-500 border border-emerald-900' },
    { name: 'Modern Brutalist', classes: 'bg-zinc-100 text-zinc-950 font-sans', card: 'bg-white border-4 border-zinc-950 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]', accent: 'text-zinc-950', titleFont: 'font-black uppercase tracking-tighter', modalBg: 'bg-zinc-100 text-zinc-950 border-4 border-zinc-950' },
    { name: 'Midnight Glass', classes: 'bg-slate-950 text-slate-200 font-sans', card: 'bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl', accent: 'text-sky-400', titleFont: 'font-light tracking-widest', modalBg: 'bg-slate-900/90 backdrop-blur-xl text-slate-200 border border-white/10' },
    { name: 'Paper Minimalist', classes: 'bg-[#f4f1ea] text-[#2c2c2c] font-sans', card: 'bg-[#e9e6de] border-0 rounded-2xl', accent: 'text-[#8b5e3c]', titleFont: 'font-medium tracking-tight', modalBg: 'bg-[#f4f1ea] text-[#2c2c2c]' },
    { name: 'Frutiger Aero', classes: 'bg-gradient-to-b from-sky-300 to-emerald-200 text-sky-900 font-sans', card: 'bg-white/60 backdrop-blur-md border border-white/50 rounded-[2rem]', accent: 'text-blue-600', titleFont: 'font-extrabold tracking-tighter italic', modalBg: 'bg-white/90 text-sky-900', bgAnimation: 'animate-pulse' },
    { name: 'Y2K', classes: 'bg-fuchsia-600 text-yellow-300 font-mono', card: 'bg-black border-4 border-yellow-300 rounded-none shadow-[10px_10px_0px_0px_#fff]', accent: 'text-yellow-400', titleFont: 'font-black tracking-widest uppercase', modalBg: 'bg-black text-yellow-300 border-2 border-yellow-300', bgAnimation: 'bg-[url(/y2k-grid.png)]' }
  ];

  const [themeIdx, setThemeIdx] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [viewingImage, setViewingImage] = useState(null); // Used for full-screen zoom
  const [imgCycleIdx, setImgCycleIdx] = useState(0);
  const [projects, setProjects] = useState([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const EDIT_PASSCODE = '2148';

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const saved = localStorage.getItem('port_projects_v5');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects(parsed);
            setProjectsLoaded(true);
            return;
          }
        }

        const response = await fetch(`${import.meta.env.BASE_URL}projects.json`);
        if (!response.ok) throw new Error(`Failed to load projects.json: ${response.status}`);

        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Unable to load project data:', error);
        setProjects([]);
      } finally {
        setProjectsLoaded(true);
      }
    };

    loadProjects();
  }, []);

  const fileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null);
  const activeTheme = themes[themeIdx];

 useEffect(() => {
    if (!projectsLoaded) return;
    localStorage.setItem('port_projects_v5', JSON.stringify(projects));
  }, [projects, projectsLoaded]);

  useEffect(() => {
    const interval = setInterval(() => { setImgCycleIdx((prev) => (prev + 1) % 5); }, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerUpload = (idx) => { setUploadTarget(idx); fileInputRef.current.click(); };
  const handleEditToggle = () => {
    if (isEditMode) {
      setIsEditMode(false);
      return;
    }

    const enteredCode = window.prompt('Enter edit passcode:');
    if (enteredCode === null) return;

    if (enteredCode.trim() === EDIT_PASSCODE) {
      setIsEditMode(true);
    } else {
      window.alert('Incorrect passcode');
    }
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || uploadTarget === null) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const p = [...projects];
      if (!p[uploadTarget].imgs) p[uploadTarget].imgs = [];
      p[uploadTarget].imgs.push(event.target.result);
      setProjects(p);
    };
    reader.readAsDataURL(file);
  };
  const addProject = () => {
    setProjects([...projects, { title: "New Project", desc: "Project description here...", imgs: [] }]);
  };

  const deleteProject = (idx) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const deleteImage = (projIdx, imgIdx) => {
    const p = [...projects];
    p[projIdx].imgs.splice(imgIdx, 1);
    setProjects(p);
  };
  return (
    <div className={`min-h-screen transition-colors duration-500 ${activeTheme.classes}`}>
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => setThemeIdx((p) => (p + 1) % themes.length)} className="px-4 py-2 bg-black/50 text-white rounded-full text-xs">Theme: {activeTheme.name}</button>
        <button onClick={handleEditToggle} className="px-4 py-2 bg-neutral-600 text-white rounded-full text-xs">{isEditMode ? 'Save' : 'Edit'}</button>
      </div>

<section className="h-screen flex flex-col justify-center items-center text-center p-6" ref={emailMenuRef}>
  <h1 className={`text-6xl md:text-9xl uppercase tracking-tighter mb-4 ${activeTheme.titleFont}`}>Qua'Tarious A. Bowman</h1>
  <p className="text-sm italic mb-6 opacity-70">"Say that five times fast"</p>
  <p className={`text-xl md:text-3xl mb-2 ${activeTheme.accent}`}>B.S. Mechanical Engineering Student</p>
  <p className="text-lg font-medium mb-8">Voted "This Eons Coolest"</p>

  {/* Contact Grid */}
  <div className={`flex flex-wrap justify-center gap-6 text-sm ${activeTheme.accent}`}>
    
    {/* LinkedIn */}
    <a href="https://www.linkedin.com/in/jimmyslimofficial" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
      <svg className="w-5 h-5 fill-blue-600" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
      LinkedIn
    </a>

    {/* Instagram */}
    <a href="https://www.instagram.com/jimmyslimofficial" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
      <svg className="w-5 h-5 fill-pink-600" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.514 1.41 4.662 4.662.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.148 3.252-1.41 4.514-4.662 4.662-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.514-1.41-4.662-4.662-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.148-3.252 1.41-4.514 4.662-4.662 1.266-.058 1.646-.07 4.85-.07m0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      Instagram
    </a>
    <a 
  href="https://resume-pink-three.vercel.app/" 
  target="_blank" 
  className="flex items-center gap-2 hover:underline text-purple-600"
>
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
  Share the Resume Link!
</a>
    {/* Emails with Dropdowns */}
    {['bbqsepnu48@gmail.com', 'zvc8fd@virginia.edu'].map((email) => (
      <div key={email} className="relative">
        <button 
          onClick={(e) => { e.stopPropagation(); setActiveEmailMenu(activeEmailMenu === email ? null : email); }}
          className="flex items-center gap-2 hover:underline"
        >
          <svg className="w-5 h-5 fill-blue-500" viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.692 7.188l3.729 3.021 3.729-3.021 4.542 5.006h-16.542l4.542-5.006zm13.826-3.754v9.458l-4.623-5.712 4.623-3.746z"/></svg>
          {email}
        </button>
        
        {activeEmailMenu === email && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 shadow-xl rounded-lg z-50 flex flex-col text-sm text-black min-w-[120px]">
            <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`} target="_blank" rel="noreferrer" className="px-4 py-2 hover:bg-gray-100">Gmail</a>
            <a href={`https://outlook.live.com/owa/?path=/mail/action/compose&to=${email}`} target="_blank" rel="noreferrer" className="px-4 py-2 hover:bg-gray-100">Outlook</a>
          </div>
        )}
      </div>
    ))}

    {/* Phone */}
    <div className="flex items-center gap-2 text-green-600">
      <svg className="w-5 h-5 fill-green-600" viewBox="0 0 24 24"><path d="M20 22.621l-3.521-6.795c-.007.004-1.974.97-2.076 1.021-.673.339-1.354.34-1.745-.022l-2.046-1.895c-.391-.362-.647-1.121-.572-1.688.075-.566.452-1.189.84-1.385l.135-.067c.75-.375.981-1.325.516-2.129l-2.072-3.585c-.466-.804-1.417-1.036-2.167-.661l-.145.072c-.397.198-1.011.168-1.579-.068-.567-.235-1.282-.821-1.636-1.554l-1.428-2.936c-.354-.733-.359-1.577-.014-2.311l.056-.123c.337-.743 1.077-1.353 1.77-1.465 1.096-.179 2.067.359 2.507 1.25l.896 1.838c.319.654.269 1.488-.112 2.115-.38.627-.991.956-1.365.73l-.062-.039c-.198-.124-.469-.17-.768-.131.241.517.471.93.757 1.258l2.062 3.568c.286.328.718.557 1.235.688.299.075.568.049.722-.057l.076-.051c.367-.253.978-.445 1.638-.179l2.043 1.892c.66.266 1.157.854 1.341 1.436.184.582.043 1.21-.322 1.575l-.048.048c-.053.053-.298.244-.576.438.381.187 1.143.565 1.673.827l.192.096c.749.375 1.7.143 2.166-.661l1.838-3.181c.466-.804.234-1.755-.516-2.129l-.161-.081c-.531-.266-1.385-.297-2.053.061l-1.334.721c-.482.261-1.066.239-1.531-.059-.465-.297-.818-.839-1.03-1.464l-1.026-3.031c-.212-.625-.094-1.247.262-1.579l.061-.055c.677-.63 1.464-.991 2.308-1.077.844-.086 1.724.168 2.392.796l2.309 2.138c.669.619.988 1.411 1.054 2.215.066.804-.153 1.637-.621 2.502l-1.859 3.216c-1.345 2.327-2.677 4.636-4.004 6.924l.019.011z"/></svg>
      (757) 581-5684
    </div>
  </div>
</section>

      <main className="max-w-7xl mx-auto p-12">
<div className="flex justify-between items-center mb-16 border-b pb-4">
  <h2 className="text-4xl font-bold">Featured Projects</h2>
  
  {isEditMode && (
    <div className="flex gap-2">
      {/* ADD THIS BUTTON */}
      <button 
        onClick={addProject} 
        className="bg-green-600 text-white px-3 py-1 rounded font-bold"
      >
        + Add Project
      </button>

      <button onClick={exportData} className="bg-orange-500 text-white px-3 py-1 rounded">Export</button>
      
      <label className="bg-purple-500 text-white px-3 py-1 rounded cursor-pointer">
        Import
        <input type="file" onChange={importData} className="hidden" />
      </label>
    </div>
  )}
</div>        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((p, i) => (
            <div key={i} className={`p-8 border ${activeTheme.card} relative`}>
              {isEditMode && (
                <button onClick={() => deleteProject(i)} className="absolute top-2 right-2 text-red-500 font-bold">✕</button>
              )}
              
              <div className="h-48 mb-4 relative flex items-center justify-center overflow-hidden" onClick={() => !isEditMode && setExpandedIdx(i)}>
                <AnimatePresence mode="wait">
                  {p.imgs?.length > 0 ? (
                    <motion.img key={p.imgs[imgCycleIdx % p.imgs.length]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} src={p.imgs[imgCycleIdx % p.imgs.length]} className="w-full h-full object-cover" />
                  ) : <div className="text-xs opacity-50">No Images</div>}
                </AnimatePresence>
              </div>

              {isEditMode ? (
  <div className="flex flex-col gap-2">
    {/* Title Input */}
    <input 
      value={projects[i].title} 
      onChange={(e) => updateProject(i, 'title', e.target.value)} 
      className="bg-transparent border p-2 w-full text-lg font-bold" 
      placeholder="Project Title"
    />
    
    {/* Description Textarea */}
    <textarea 
      value={projects[i].desc} 
      onChange={(e) => updateProject(i, 'desc', e.target.value)} 
      className="bg-transparent border p-2 w-full text-sm h-24" 
      placeholder="Project Description"
    />

    {/* Media Preview & Upload Button */}
    <div className="flex flex-wrap gap-2 mt-2">
      {projects[i].imgs?.map((img, imgIdx) => (
        <div key={imgIdx} className="relative w-16 h-16 group">
          <motion.img 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            src={img} 
            className="w-full h-full object-cover rounded shadow" 
          />
          <button 
            onClick={() => deleteImage(i, imgIdx)} 
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >×</button>
        </div>
      ))}
      <button 
        onClick={() => triggerUpload(i)}
        className="w-16 h-16 border-2 border-dashed flex items-center justify-center text-xs opacity-50 hover:opacity-100"
      >
        + Add
      </button>
    </div>
    
    {/* Delete Project Button */}
    <button 
      onClick={() => deleteProject(i)} 
      className="mt-4 bg-red-500 text-white text-xs px-2 py-1 rounded"
    >
      Delete Project
    </button>
  </div>
) : (
  <div onClick={() => !isEditMode && setExpandedIdx(i)} className="cursor-pointer">
    <h3 className={`text-2xl mb-2 ${activeTheme.titleFont}`}>{p.title}</h3>
    <p className="opacity-80 line-clamp-3">{p.desc}</p>
  </div>
)}
            </div>
          ))}
        </div>
      </main>

      {/* Project Expansion Modal */}
      {expandedIdx !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6" onClick={() => setExpandedIdx(null)}>
          <div className={`w-full max-w-4xl p-10 rounded-3xl ${activeTheme.modalBg}`} onClick={e => e.stopPropagation()}>
            <h2 className="text-4xl mb-4">{projects[expandedIdx].title}</h2>
            <p className="text-lg mb-6 leading-relaxed whitespace-pre-wrap">{projects[expandedIdx].desc}</p>
            <div className="grid grid-cols-2 gap-4">
              {projects[expandedIdx].imgs?.map((img, idx) => (
                <motion.img key={idx} onClick={() => setViewingImage({ projIdx: expandedIdx, imgIdx: idx })} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={img} className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-80" />
              ))}
            </div>
            <button onClick={() => setExpandedIdx(null)} className="mt-8 border px-4 py-2">Close</button>
          </div>
        </div>
      )}

      {/* Full-Screen Zoom Carousel */}
      {viewingImage && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" onClick={() => setViewingImage(null)}>
          <button className="absolute top-10 right-10 text-white text-3xl" onClick={() => setViewingImage(null)}>✕</button>
          <img src={projects[viewingImage.projIdx].imgs[viewingImage.imgIdx]} className="max-w-[90vw] max-h-[80vh] object-contain" />
          <div className="absolute bottom-10 flex gap-4">
            <button onClick={(e) => { e.stopPropagation(); setViewingImage(p => ({...p, imgIdx: (p.imgIdx - 1 + projects[p.projIdx].imgs.length) % projects[p.projIdx].imgs.length})) }} className="text-white px-6 py-2 border">Prev</button>
            <button onClick={(e) => { e.stopPropagation(); setViewingImage(p => ({...p, imgIdx: (p.imgIdx + 1) % projects[p.projIdx].imgs.length})) }} className="text-white px-6 py-2 border">Next</button>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
    </div>
  );
}
export default App;