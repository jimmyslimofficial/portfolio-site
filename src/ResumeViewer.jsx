import React, { useState, useEffect, useRef } from 'react';

// Hardcoded design themes directly using Tailwind inline styling rules to bypass config reliance
const themes = {
  'tech-premium-dark': {
    outerCanvas: 'bg-[#0a0f1d] text-slate-100 min-h-screen transition-all duration-500 font-sans p-6 md:p-12 selection:bg-emerald-500 selection:text-black',
    cards: 'bg-[#11192e]/60 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.1)] rounded-xl transition-all duration-300 hover:scale-[1.02] hover:border-emerald-400/60 active:scale-[0.98]',
    accent: 'text-emerald-400',
    button: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all px-4 py-2 rounded-lg text-sm font-mono tracking-wider',
    controlDeck: 'bg-[#11192e]/90 border border-emerald-500/40 backdrop-blur-md',
    input: 'bg-[#0a0f1d]/80 border border-emerald-500/20 rounded p-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-400 text-sm',
    placeholderBox: 'border-2 border-dashed border-emerald-500/20 bg-emerald-950/20 text-emerald-500/60'
  },
  'frutiger-aero-aurora': {
    outerCanvas: 'bg-gradient-to-tr from-[#e0f2fe] via-[#f0fdf4] to-[#f0f9ff] text-slate-800 min-h-screen transition-all duration-500 p-6 md:p-12 selection:bg-sky-500 selection:text-white',
    cards: 'bg-white/40 border border-white/70 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/50 before:to-transparent before:pointer-events-none transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(14,165,233,0.15)] active:scale-[0.98]',
    accent: 'text-sky-600 font-medium',
    button: 'bg-sky-500/20 border border-sky-400/40 text-sky-700 hover:bg-sky-500/30 active:scale-95 transition-all px-4 py-2 rounded-xl text-sm shadow-sm font-medium',
    controlDeck: 'bg-white/80 border border-white/90 shadow-lg backdrop-blur-lg rounded-2xl',
    input: 'bg-white/80 border border-sky-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:border-sky-400 shadow-inner text-sm',
    placeholderBox: 'border-2 border-dashed border-sky-300/40 bg-sky-50/50 text-sky-500/70 rounded-xl'
  },
  'matrix-monochrome': {
    outerCanvas: 'bg-black text-[#00ff41] min-h-screen transition-all duration-500 font-mono p-6 md:p-12 selection:bg-[#00ff41] selection:text-black',
    cards: 'bg-black border border-[#00ff41]/50 shadow-[0_0_15px_rgba(0,255,65,0.15)] rounded-none transition-all duration-300 hover:border-[#00ff41] hover:shadow-[0_0_25px_rgba(0,255,65,0.3)] active:scale-[0.99]',
    accent: 'text-[#00ff41] uppercase tracking-widest',
    button: 'border border-[#00ff41] text-[#00ff41] bg-transparent hover:bg-[#00ff41]/10 active:bg-[#00ff41]/20 transition-all px-4 py-2 text-xs uppercase',
    controlDeck: 'bg-black border-2 border-[#00ff41] p-2',
    input: 'bg-black border border-[#00ff41]/50 text-[#00ff41] p-2 text-xs focus:outline-none focus:border-[#00ff41]',
    placeholderBox: 'border border-dashed border-[#00ff41]/30 bg-transparent text-[#00ff41]/40'
  },
  'minimalist-alabaster': {
    outerCanvas: 'bg-[#f8f9fa] text-neutral-900 min-h-screen transition-all duration-500 p-6 md:p-12 selection:bg-neutral-900 selection:text-white',
    cards: 'bg-white border border-neutral-200 shadow-sm rounded-lg transition-all duration-300 hover:shadow-md hover:border-neutral-300 active:scale-[0.98]',
    accent: 'text-neutral-600 font-semibold tracking-tight',
    button: 'bg-neutral-900 border border-neutral-900 text-white hover:bg-neutral-800 active:scale-95 transition-all px-4 py-2 rounded-lg text-sm font-medium',
    controlDeck: 'bg-white border border-neutral-200 shadow-md rounded-lg',
    input: 'bg-[#f8f9fa] border border-neutral-200 rounded p-2 text-neutral-900 focus:outline-none focus:border-neutral-400 text-sm',
    placeholderBox: 'border-2 border-dashed border-neutral-200 bg-neutral-50 text-neutral-400 rounded-lg'
  }
};

const initialExperiences = [
  {
    title: "Potential Energy Propulsion Racer (UVA MAE 2020)",
    content: "Co-designed and manufactured dual-propulsion vehicle (two-spring potential energy drivetrain and a 10F supercapacitor-driven propeller) under physical constraints (12\"x8\"x4\"). Iterated 4+ chassis geometries and custom mechanical components using SolidWorks; optimizing structure and material to achieve a light 20.62g ABS chassis. Developed a functional 2.5:1 ratio gear train. Conducted physical testing and performance verification over a 60-foot competitive track; cross-referenced hand-calculated kinematic models (PE, torque, friction) against experimental outcomes to guide design iterations and secure a top-tier score of 250 points. Full Project Write-Up: MAE2020 - Spring Car Team 26.docx"
  },
  {
    title: "Custom LEV Bike Integration (Personal Design & Fabrication)",
    content: "Quality [non]Assurance & Problem Solving: Identified and resolved factory manufacturing defects in the original frame, careful restoration of structural integrity was accomplished. Spatial Constraints: Overcame strict spatial limitations within the main frame triangle by designing a custom top-mounted battery enclosure system. Budget Optimization: Managed strict budgetary constraints by performing cross-compatible component sourcing, maintaining a lean design-to-production lifecycle (under $600 for 32mph top speed and 35+ mile range). Field Validation & Lifecycle Testing: Validated drivetrain reliability and thermal management through ~200 miles of real-world operations utilizing DoorDash, achieving full capital cost recovery within the first month."
  },
  {
    title: "5-Inch FPV Drone",
    content: "Precision Electronics Manufacturing: Executed micro-scale precision soldering to integrate a high-density electronics stack, including a 4-in-1 Electronic Speed Controller (ESC) and Flight Controller (FC) on a compact carbon-fiber chassis. Quality Control & Troubleshooting: Rigorous electrical continuity testing and diagnostic troubleshooting to isolate signal noise, ensuring secure power distribution and data communication lines. Operational Testing & System Mastery: Logged extensive manual and simulated flight hours to master specialized aerodynamic handling, utilizing real-time analog/digital telemetry feedback via FPV goggles to monitor system performance."
  }
];

export default function ResumeViewer() {
  // --- Persistent State Configuration ---
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem('cyber_theme') || 'tech-premium-dark');
  const [previewMode, setPreviewMode] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  
  const [name, setName] = useState(() => localStorage.getItem('cyber_name') || "Qua'Tarious A. Bowman");
  const [titleSub, setTitleSub] = useState(() => localStorage.getItem('cyber_title') || "B.S. Mechanical Engineering Student");
  const [votedTag, setVotedTag] = useState(() => localStorage.getItem('cyber_voted') || 'Voted "This Eons Coolest"');
  const [contactMeta, setContactMeta] = useState(() => localStorage.getItem('cyber_meta') || "Contact: (757)581-5684 | bbqsepnu48@gmail.com | zvc8fd@virginia.edu");
  const [education, setEducation] = useState(() => localStorage.getItem('cyber_edu') || "University of Virginia — B.S. Mechanical Engineering (In Progress)");
  
  const [experiences, setExperiences] = useState(() => {
    const raw = localStorage.getItem('cyber_experiences');
    return raw ? JSON.parse(raw) : initialExperiences;
  });
  
  const [uploadedImages, setUploadedImages] = useState(() => {
    const raw = localStorage.getItem('cyber_images');
    return raw ? JSON.parse(raw) : {};
  });

  // Contact form temporary states
  const [formName, setFormName] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formMsg, setFormMsg] = useState('');

  const fileInputRef = useRef(null);
  const [imageUploadTarget, setImageUploadTarget] = useState(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('cyber_theme', themeKey);
    localStorage.setItem('cyber_name', name);
    localStorage.setItem('cyber_title', titleSub);
    localStorage.setItem('cyber_voted', votedTag);
    localStorage.setItem('cyber_meta', contactMeta);
    localStorage.setItem('cyber_edu', education);
    localStorage.setItem('cyber_experiences', JSON.stringify(experiences));
    localStorage.setItem('cyber_images', JSON.stringify(uploadedImages));
  }, [themeKey, name, titleSub, votedTag, contactMeta, education, experiences, uploadedImages]);

  // Toast alert fire logic
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Utility Actions
  const cycleTheme = () => {
    const keys = Object.keys(themes);
    const nextIdx = (keys.indexOf(themeKey) + 1) % keys.length;
    setThemeKey(keys[nextIdx]);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      triggerToast("System Deployment URL copied to clipboard!");
    } catch (err) {
      triggerToast("Could not copy link automatically.");
    }
  };

  const addEmptyProject = () => {
    if (previewMode) return;
    const updated = [...experiences, { title: "New Module Title", content: "Write project telemetry descriptions here..." }];
    setExperiences(updated);
    triggerToast("Empty project node allocated.");
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const triggerImageUpload = (e, index) => {
    e.stopPropagation(); // Avoid triggering card modals
    if (previewMode) return;
    setImageUploadTarget(index);
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImages(prev => ({
        ...prev,
        [imageUploadTarget]: reader.result
      }));
      triggerToast(`Dynamic asset cached for card slot ${imageUploadTarget + 1}.`);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = (e, index) => {
    e.stopPropagation();
    const updated = { ...uploadedImages };
    delete updated[index];
    setUploadedImages(updated);
    triggerToast("Asset payload dropped.");
  };

  const executeMailto = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio Contact from ${formName || 'Employer'}`);
    const body = encodeURIComponent(
      `Name: ${formName}\nOrganization: ${formOrg}\nAttachment Links: ${formLink}\n\nMessage:\n${formMsg}`
    );
    window.location.href = `mailto:bbqsepnu48@gmail.com?subject=${subject}&body=${body}`;
  };

  const activeTheme = themes[themeKey];

  return (
    <div className={activeTheme.outerCanvas}>
      
      {/* --- FLOATING CONTROLS PLATFORM --- */}
      <div className={`fixed bottom-6 right-6 z-50 p-2 flex flex-wrap gap-2 rounded-xl items-center shadow-xl ${activeTheme.controlDeck}`}>
        <button onClick={cycleTheme} className={activeTheme.button}>Theme Loop</button>
        <button 
          onClick={() => { setPreviewMode(!previewMode); triggerToast(previewMode ? "Edit Mode Engaged" : "Preview Constraints Armed"); }} 
          className={`${activeTheme.button} ${!previewMode ? 'border-red-500 text-red-400' : ''}`}
        >
          {previewMode ? "Edit Canvas" : "Preview Live"}
        </button>
        <button onClick={copyShareLink} className={activeTheme.button}>Share Link</button>
      </div>

      {/* --- NOTIFICATION TOAST --- */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-neutral-900 border border-neutral-700 text-white font-mono text-xs tracking-wider rounded-full shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* --- INPUT HELPER FIELD FOR UPLOADS --- */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* --- MASTER HEADER CONTAINER --- */}
      <header className="max-w-7xl mx-auto mb-12 border-b border-neutral-500/10 pb-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            {previewMode ? (
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-2 uppercase">{name}</h1>
            ) : (
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className={`text-4xl font-bold bg-transparent w-full ${activeTheme.input}`} 
              />
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm md:text-lg opacity-90 font-mono">
              {previewMode ? (
                <>
                  <span className={activeTheme.accent}>{titleSub}</span>
                  <span className="text-xs px-2 py-0.5 border border-current rounded-full opacity-60">{votedTag}</span>
                </>
              ) : (
                <div className="flex gap-2 w-full mt-2">
                  <input value={titleSub} onChange={(e) => setTitleSub(e.target.value)} className={activeTheme.input} placeholder="Subtitle" />
                  <input value={votedTag} onChange={(e) => setVotedTag(e.target.value)} className={activeTheme.input} placeholder="Tagline" />
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-auto text-xs md:text-sm font-mono opacity-75">
            {previewMode ? (
              <p className="whitespace-pre-line">{contactMeta}</p>
            ) : (
              <textarea 
                value={contactMeta} 
                onChange={(e) => setContactMeta(e.target.value)} 
                className={`w-full h-16 ${activeTheme.input}`} 
                placeholder="Contact line links..."
              />
            )}
          </div>
        </div>

        {/* --- EDUCATION MODULE block --- */}
        <div className="mt-8 p-4 rounded-lg bg-neutral-500/5 border border-neutral-500/10">
          <h3 className="text-xs font-mono tracking-widest uppercase opacity-50 mb-1">Academic Registry</h3>
          {previewMode ? (
            <p className="text-sm font-medium">{education}</p>
          ) : (
            <input 
              value={education} 
              onChange={(e) => setEducation(e.target.value)} 
              className={`w-full ${activeTheme.input}`} 
            />
          )}
        </div>
      </header>

      {/* --- GRID EXPERIENCES PORTFOLIO FRAMEWORK --- */}
      <main className="max-w-7xl mx-auto">
        <h2 className="text-xs font-mono tracking-widest uppercase opacity-50 mb-6">Interactive Modules Grid</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp, idx) => (
            <div 
              key={idx} 
              onClick={() => previewMode && setActiveCardIndex(idx)}
              className={`p-6 flex flex-col justify-between cursor-pointer ${activeTheme.cards}`}
            >
              <div>
                {/* Embedded Schematic Asset Container */}
                <div className="w-full h-40 mb-4 flex items-center justify-center overflow-hidden relative group">
                  {uploadedImages[idx] ? (
                    <>
                      <img src={uploadedImages[idx]} alt="Source Asset" className="w-full h-full object-cover rounded" />
                      {!previewMode && (
                        <button 
                          onClick={(e) => clearImage(e, idx)}
                          className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                        >
                          Wipe
                        </button>
                      )}
                    </>
                  ) : (
                    <div 
                      onClick={(e) => triggerImageUpload(e, idx)}
                      className={`w-full h-full flex flex-col items-center justify-center p-4 text-center font-mono text-xs ${activeTheme.placeholderBox} ${!previewMode ? 'hover:bg-opacity-40 border-current' : ''}`}
                    >
                      <span>[Tech Module Placeholder]</span>
                      {!previewMode && <span className="text-[10px] text-red-400 mt-2">(Click to feed Image asset)</span>}
                    </div>
                  )}
                </div>

                {previewMode ? (
                  <>
                    <h3 className="text-lg font-bold tracking-tight mb-2 min-h-[3.5rem] line-clamp-2">{exp.title}</h3>
                    <p className="text-xs font-normal opacity-80 leading-relaxed line-clamp-4">{exp.content}</p>
                  </>
                ) : (
                  <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                    <input 
                      value={exp.title} 
                      onChange={(e) => handleUpdateExperience(idx, 'title', e.target.value)}
                      className={`w-full font-bold ${activeTheme.input}`} 
                      placeholder="Project Title"
                    />
                    <textarea 
                      value={exp.content} 
                      onChange={(e) => handleUpdateExperience(idx, 'content', e.target.value)}
                      className={`w-full h-32 text-xs ${activeTheme.input}`} 
                      placeholder="Project details..."
                    />
                  </div>
                )}
              </div>

              {previewMode && (
                <div className="mt-4 pt-4 border-t border-neutral-500/10 text-right text-xs font-mono opacity-60 group-hover:opacity-100">
                  Expand Interface →
                </div>
              )}
            </div>
          ))}

          {/* Implicit Block Matrix Add Card Action */}
          {!previewMode && (
            <div 
              onClick={addEmptyProject}
              className={`p-6 flex flex-col items-center justify-center border-2 border-dashed border-neutral-500/30 rounded-xl cursor-pointer hover:border-neutral-500/60 min-h-[300px] transition-all`}
            >
              <span className="text-2xl opacity-60">+</span>
              <span className="font-mono text-xs tracking-wider opacity-60 mt-2">Append Dynamic Project Card</span>
            </div>
          )}
        </div>
      </main>

      {/* --- SECURE GLASSMORPHIC EXPANDED CONTAINER OVERLAY MODAL --- */}
      {activeCardIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
          onClick={() => setActiveCardIndex(null)}
        >
          <div 
            className={`w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 md:p-8 relative ${activeTheme.cards}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setActiveCardIndex(null)}
              className="absolute top-4 right-4 text-sm font-mono border border-current px-3 py-1 rounded opacity-60 hover:opacity-100 transition"
            >
              [ESC]
            </button>

            <div className="w-full h-64 md:h-80 bg-neutral-900/40 rounded-xl mb-6 overflow-hidden flex items-center justify-center">
              {uploadedImages[activeCardIndex] ? (
                <img src={uploadedImages[activeCardIndex]} alt="Expanded Screen View" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center font-mono text-xs opacity-40 uppercase tracking-widest p-4">
                  Skeletal Asset Array Container — Image Content Not Bound
                </div>
              )}
            </div>

            <h3 className="text-2xl font-bold tracking-tight mb-4">{experiences[activeCardIndex]?.title}</h3>
            <p className="text-sm leading-relaxed opacity-90 font-sans whitespace-pre-wrap">{experiences[activeCardIndex]?.content}</p>
            
            <div className="mt-8 pt-4 border-t border-neutral-500/10 flex justify-end">
              <button 
                onClick={() => setActiveCardIndex(null)}
                className={activeTheme.button}
              >
                Close Viewport
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FORM SCHEME MAILTO CONTACT CONTROLLER --- */}
      <footer className="max-w-3xl mx-auto mt-20 pt-12 border-t border-neutral-500/10">
        <div className={`p-6 rounded-xl ${activeTheme.cards}`}>
          <h3 className="text-lg font-bold uppercase tracking-wider mb-2 font-mono">Initiate Pipeline Connection</h3>
          <p className="text-xs opacity-70 mb-6 font-mono">Fill data blocks below to build an automated localized mail client message dispatch packet.</p>
          
          <form onSubmit={executeMailto} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono tracking-widest uppercase opacity-60">Identity Name</label>
                <input required type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className={activeTheme.input} placeholder="Elon Musk" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono tracking-widest uppercase opacity-60">Corporate/Organization Entity</label>
                <input required type="text" value={formOrg} onChange={(e) => setFormOrg(e.target.value)} className={activeTheme.input} placeholder="SpaceX Propulsion Group" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono tracking-widest uppercase opacity-60">Resource Links / Shared Attachments</label>
              <input type="url" value={formLink} onChange={(e) => setFormLink(e.target.value)} className={activeTheme.input} placeholder="https://drive.google.com/recruiter-brief" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono tracking-widest uppercase opacity-60">Message Packet Text</label>
              <textarea required value={formMsg} onChange={(e) => setFormMsg(e.target.value)} className={`h-24 ${activeTheme.input}`} placeholder="Reviewing your mechanical engineering telemetry specs..." />
            </div>

            <div className="pt-2">
              <button type="submit" className={`w-full md:w-auto ${activeTheme.button}`}>
                Dispatch Mailto Manifest
              </button>
            </div>
          </form>
        </div>
        
        <div className="text-center text-[10px] font-mono opacity-30 mt-12 mb-6">
          System Core Online // Built for Touch Rotation & High-Speed Device Profiling
        </div>
      </footer>

    </div>
  );
}