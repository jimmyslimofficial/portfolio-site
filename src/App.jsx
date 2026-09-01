import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TechBackground from './TechBackground';
import ProjectCard from './ProjectCard';
import { verifyGithubAccess, uploadImageToGithub, uploadResumePdfToGithub, publishProjectsJson } from './githubService';
import { saveDraftProjects, loadDraftProjects, clearDraftProjects, compressImageFile } from './storageService';

function App() {
  const [projects, setProjects] = useState([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [themeIdx, setThemeIdx] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [viewingImage, setViewingImage] = useState(null); 
  const [cardImgIdxs, setCardImgIdxs] = useState({});
  const [activeEmailMenu, setActiveEmailMenu] = useState(null);
  
  // PDF Resume Staging state
  const [stagedResumePdf, setStagedResumePdf] = useState(null); // base64 data URL if uploaded in current edit session
  const [resumePdfUrl, setResumePdfUrl] = useState(() => `${import.meta.env.BASE_URL}resume.pdf`);
  const [hasPdfResume, setHasPdfResume] = useState(false);

  // Toast Notification System
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Scroll Progress & Back to Top
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // GitHub Publishing States
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState('');
  const [showGithubModal, setShowGithubModal] = useState(false);
  
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('port_github_token') || '');
  const [githubOwner, setGithubOwner] = useState(() => localStorage.getItem('port_github_owner') || 'jimmyslimofficial');
  const [githubRepo, setGithubRepo] = useState(() => localStorage.getItem('port_github_repo') || 'portfolio-site');
  const [githubBranch, setGithubBranch] = useState(() => localStorage.getItem('port_github_branch') || 'main');

  const EDIT_PASSCODE = '2148';
  const emailMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const uploadTargetRef = useRef(null);

  const showToast = (message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const themes = [
    { 
      name: 'Elegant Serif', 
      classes: 'bg-stone-50 text-stone-900 font-serif', 
      card: 'bg-white border border-stone-200 rounded-none shadow-sm', 
      accent: 'text-stone-700', 
      titleFont: 'font-bold tracking-tight', 
      modalBg: 'bg-stone-50 text-stone-900 border border-stone-200' 
    },
    { 
      name: 'Bleeding-Edge Cyber', 
      classes: 'bg-[#06090e] text-cyan-400 font-mono selection:bg-cyan-500 selection:text-black', 
      card: 'bg-[#0b121e]/85 border border-cyan-500/25 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.08)] hover:border-cyan-400/60 transition-all duration-300', 
      accent: 'text-emerald-400', 
      titleFont: 'font-black uppercase tracking-wider', 
      modalBg: 'bg-[#090e17]/95 text-cyan-300 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl shadow-cyan-950/50' 
    },
    { 
      name: 'Liquid Titanium', 
      classes: 'bg-[#0b0c10] text-slate-200 font-sans selection:bg-slate-300 selection:text-black', 
      card: 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-white/30 transition-all duration-300', 
      accent: 'text-slate-300 font-medium', 
      titleFont: 'font-bold tracking-tight', 
      modalBg: 'bg-[#12141a]/95 text-slate-100 border border-white/20 backdrop-blur-3xl shadow-2xl' 
    },
    { 
      name: 'Neo-Tokyo Synthwave', 
      classes: 'bg-[#090514] text-pink-400 font-sans selection:bg-pink-500 selection:text-white', 
      card: 'bg-[#150a2e]/80 border border-fuchsia-500/30 backdrop-blur-xl rounded-2xl shadow-[0_0_35px_rgba(236,72,153,0.12)] hover:border-pink-400/70 hover:shadow-[0_0_45px_rgba(236,72,153,0.25)] transition-all duration-300', 
      accent: 'text-purple-300', 
      titleFont: 'font-extrabold uppercase tracking-widest', 
      modalBg: 'bg-[#120726]/95 text-pink-300 border border-fuchsia-500/50 backdrop-blur-2xl' 
    },
    { 
      name: 'Swiss Industrial', 
      classes: 'bg-[#f4f4f5] text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white', 
      card: 'bg-white border-2 border-zinc-950 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-200', 
      accent: 'text-zinc-950 font-black', 
      titleFont: 'font-black uppercase tracking-tight', 
      modalBg: 'bg-zinc-100 text-zinc-950 border-4 border-zinc-950 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]' 
    },
    { 
      name: 'Frutiger Aero', 
      classes: 'bg-gradient-to-b from-sky-200 via-sky-50 to-emerald-50 text-sky-950 font-sans selection:bg-sky-500 selection:text-white', 
      card: 'bg-white/65 backdrop-blur-2xl border border-white/80 rounded-[2.2rem] shadow-[0_20px_45px_rgba(14,165,233,0.15)] hover:bg-white/80 hover:shadow-[0_25px_60px_rgba(14,165,233,0.25)] transition-all duration-300', 
      accent: 'text-sky-700 font-bold', 
      titleFont: 'font-extrabold tracking-tight', 
      modalBg: 'bg-white/90 text-sky-950 border border-white/90 backdrop-blur-2xl shadow-2xl' 
    }
  ];

  const activeTheme = themes[themeIdx];

  // Window scroll listener for reading progress and back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentScroll = window.scrollY;
        setScrollProgress((currentScroll / totalScroll) * 100);
        setShowBackToTop(currentScroll > 400);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation & modal close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setExpandedIdx(null);
        setViewingImage(null);
        setShowGithubModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check if PDF resume exists on the server
  useEffect(() => {
    const checkPdf = async () => {
      try {
        const cacheBuster = `t=${Date.now()}`;
        const res = await fetch(`${import.meta.env.BASE_URL}resume.pdf?${cacheBuster}`, { method: 'HEAD' });
        if (res.ok && res.status < 400) {
          setHasPdfResume(true);
        }
      } catch {
        // PDF not uploaded yet
      }
    };
    checkPdf();
  }, []);

  // Load projects database with aggressive cache-busting
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const draft = await loadDraftProjects();
        if (draft && Array.isArray(draft) && draft.length > 0) {
          setProjects(draft);
          setProjectsLoaded(true);
          return;
        }

        const cacheBuster = `t=${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const url = `${import.meta.env.BASE_URL}projects.json?${cacheBuster}`;

        const response = await fetch(url, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (!response.ok) throw new Error(`Failed to load projects.json: ${response.status}`);

        const data = await response.json();
        const validProjects = Array.isArray(data) ? data : [];
        setProjects(validProjects);
      } catch (error) {
        console.error('Unable to load project data:', error);
        setProjects([]);
      } finally {
        setProjectsLoaded(true);
      }
    };

    loadProjects();
  }, []);

  // Save changes to IndexedDB draft storage
  useEffect(() => {
    if (!projectsLoaded || !isEditMode) return;
    saveDraftProjects(projects);
  }, [projects, projectsLoaded, isEditMode]);

  // Click outside listener for email select menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emailMenuRef.current && !emailMenuRef.current.contains(event.target)) {
        setActiveEmailMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Deep Link URL Hash Anchor on Load (e.g. #project-2)
  useEffect(() => {
    if (projectsLoaded && window.location.hash) {
      const match = window.location.hash.match(/#project-(\d+)/);
      if (match) {
        const targetIndex = parseInt(match[1], 10);
        if (targetIndex >= 0 && targetIndex < projects.length) {
          setTimeout(() => {
            const el = document.getElementById(`project-card-${targetIndex}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    }
  }, [projectsLoaded, projects.length]);

  // Handle updates to specific project fields
  const updateProject = (idx, field, val) => {
    const updated = [...projects];
    updated[idx] = { ...updated[idx], [field]: val };
    setProjects(updated);
  };

  const addProject = () => {
    const newProj = { 
      title: "New Prototyping System", 
      desc: "-High-precision mechanical subsystem designed for optimized kinematics.\n\n-Structured to maximize durability and performance metrics under load constraints.\n\n-Fabricated and validated through iterative physical test sequences.", 
      imgs: [], 
      tags: ["CAD", "Prototyping", "Validation"] 
    };
    setProjects([newProj, ...projects]);
    showToast("Added new project card to top of registry");
  };

  const deleteProject = (idx) => {
    if (window.confirm(`Are you sure you want to delete "${projects[idx].title || 'this project'}"?`)) {
      setProjects(projects.filter((_, i) => i !== idx));
      showToast("Project deleted from staging");
    }
  };

  const moveProject = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= projects.length) return;
    const updated = [...projects];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setProjects(updated);
  };

  const triggerUpload = (idx) => {
    uploadTargetRef.current = idx;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processFilesForProject = async (targetIdx, files) => {
    if (!files || files.length === 0 || targetIdx === null) return;
    
    showToast(`Processing ${files.length} asset(s)...`);

    try {
      const newImgs = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const compressed = await compressImageFile(file, 1920, 0.85);
          newImgs.push(compressed);
        }
      }

      if (newImgs.length > 0) {
        setProjects(prev => {
          return prev.map((proj, idx) => {
            if (idx !== targetIdx) return proj;
            return { ...proj, imgs: [...(proj.imgs || []), ...newImgs] };
          });
        });
        showToast(`Added ${newImgs.length} image asset(s) successfully!`);
      }
    } catch (err) {
      console.error('Image processing failed:', err);
      showToast('Could not process some image files.');
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    const targetIdx = uploadTargetRef.current;
    if (files && files.length > 0) {
      await processFilesForProject(targetIdx, files);
    }
    e.target.value = '';
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      window.alert('Please select a valid PDF file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setStagedResumePdf(base64);
      setResumePdfUrl(base64);
      setHasPdfResume(true);
      showToast('New PDF Resume staged! Click "Publish to GitHub" to deploy it.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const deleteImage = (projIdx, imgIdx) => {
    const p = [...projects];
    p[projIdx].imgs.splice(imgIdx, 1);
    const activeIdx = cardImgIdxs[projIdx] || 0;
    if (activeIdx >= p[projIdx].imgs.length) {
      setCardImgIdxs(prev => ({ ...prev, [projIdx]: Math.max(0, p[projIdx].imgs.length - 1) }));
    }
    setProjects(p);
    showToast("Image removed from project");
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  const copyProjectLink = (index) => {
    const url = `${window.location.origin}${window.location.pathname}#project-${index}`;
    navigator.clipboard.writeText(url);
    showToast(`Project direct link copied to clipboard!`);
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      setIsEditMode(false);
      showToast("Exited edit mode");
      return;
    }

    const enteredCode = window.prompt('Enter edit passcode:');
    if (enteredCode === null) return;

    if (enteredCode.trim() === EDIT_PASSCODE) {
      setIsEditMode(true);
      showToast("Edit mode active — modify projects directly");
    } else {
      window.alert('Incorrect passcode');
    }
  };

  const handlePublishToGithub = async () => {
    if (!githubToken || !githubOwner || !githubRepo) {
      setShowGithubModal(true);
      return;
    }

    setIsPublishing(true);
    setPublishProgress('Authenticating with GitHub...');

    try {
      const hasAccess = await verifyGithubAccess(githubToken, githubOwner, githubRepo);
      if (!hasAccess) {
        throw new Error('Access denied. Please check your token validity and repository write permissions.');
      }

      // If a new PDF resume is staged, upload it to public/resume.pdf on GitHub
      if (stagedResumePdf) {
        setPublishProgress('Uploading latest PDF Resume to repository...');
        await uploadResumePdfToGithub(githubToken, githubOwner, githubRepo, stagedResumePdf);
        setStagedResumePdf(null);
      }

      setPublishProgress('Analyzing and packing image assets...');
      const updatedProjects = JSON.parse(JSON.stringify(projects));

      for (let pIdx = 0; pIdx < updatedProjects.length; pIdx++) {
        const project = updatedProjects[pIdx];
        if (!project.imgs) project.imgs = [];

        for (let imgIdx = 0; imgIdx < project.imgs.length; imgIdx++) {
          const imgPath = project.imgs[imgIdx];
          
          if (imgPath.startsWith('data:image/')) {
            const match = imgPath.match(/data:image\/([a-zA-Z+]+);base64,/);
            const ext = match ? (match[1] === 'jpeg' ? 'jpg' : (match[1] === 'webp' ? 'webp' : match[1])) : 'jpg';
            
            const timestamp = Date.now();
            const rand = Math.floor(Math.random() * 10000);
            const cleanTitle = (project.title || 'asset').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15);
            const filename = `img_${cleanTitle}_${pIdx}_${imgIdx}_${timestamp}_${rand}.${ext}`;
            
            setPublishProgress(`Uploading asset for "${project.title || 'Project'}" (${imgIdx + 1}/${project.imgs.length})...`);
            
            const relativeRepoPath = await uploadImageToGithub(githubToken, githubOwner, githubRepo, imgPath, filename);
            project.imgs[imgIdx] = relativeRepoPath;
          }
        }
      }

      setPublishProgress('Publishing catalog metadata to repository...');
      await publishProjectsJson(githubToken, githubOwner, githubRepo, updatedProjects);

      localStorage.setItem('port_github_token', githubToken);
      localStorage.setItem('port_github_owner', githubOwner);
      localStorage.setItem('port_github_repo', githubRepo);
      localStorage.setItem('port_github_branch', githubBranch);

      await clearDraftProjects();
      setProjects(updatedProjects);
      setPublishProgress('Publication Successful! Deploying changes on Vercel...');
      
      setTimeout(() => {
        setIsPublishing(false);
        setIsEditMode(false);
        showToast("Site published successfully to GitHub!");
      }, 2500);

    } catch (err) {
      console.error(err);
      window.alert(`Publication Failed: ${err.message}`);
      setIsPublishing(false);
    }
  };

  const handleSaveGithubSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('port_github_token', githubToken);
    localStorage.setItem('port_github_owner', githubOwner);
    localStorage.setItem('port_github_repo', githubRepo);
    localStorage.setItem('port_github_branch', githubBranch);
    setShowGithubModal(false);
    setTimeout(() => {
      handlePublishToGithub();
    }, 100);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'projects.json');
    linkElement.click();
    showToast("Exported projects.json backup");
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          setProjects(parsed);
          setProjectsLoaded(true);
          showToast(`Imported ${parsed.length} projects successfully`);
        } else {
          throw new Error('Root JSON element must be an array');
        }
      } catch (error) {
        console.error('Invalid project JSON:', error);
        window.alert('That file is not valid project data.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  /**
   * Helper to format markdown in descriptions
   */
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div className="space-y-2">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lIdx} className="h-2" />;

          const isBullet = trimmed.startsWith('-') || trimmed.startsWith('*');
          const content = isBullet ? trimmed.slice(1).trim() : line;

          const parts = [];
          const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
          let lastIndex = 0;
          let match;

          while ((match = regex.exec(content)) !== null) {
            if (match.index > lastIndex) {
              parts.push(content.substring(lastIndex, match.index));
            }
            const matchedStr = match[0];
            if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
              parts.push(<strong key={match.index} className="font-bold opacity-100">{matchedStr.slice(2, -2)}</strong>);
            } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
              parts.push(<code key={match.index} className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs">{matchedStr.slice(1, -1)}</code>);
            }
            lastIndex = regex.lastIndex;
          }
          if (lastIndex < content.length) {
            parts.push(content.substring(lastIndex));
          }

          if (isBullet) {
            return (
              <div key={lIdx} className="flex items-start gap-2 text-left">
                <span className="text-current opacity-60 font-bold select-none mt-0.5">&bull;</span>
                <span className="flex-1">{parts}</span>
              </div>
            );
          }

          return <p key={lIdx} className="text-left">{parts}</p>;
        })}
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 relative ${activeTheme.classes}`}>
      {/* Dynamic atmospheric theme backdrop */}
      {activeTheme.name !== 'Elegant Serif' && <TechBackground themeName={activeTheme.name} />}

      {/* Floating Top Control Deck */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button 
          onClick={() => setThemeIdx((p) => (p + 1) % themes.length)} 
          className="px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs shadow-md backdrop-blur-md border border-white/15 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Theme: <strong>{activeTheme.name}</strong></span>
        </button>
        <button 
          onClick={handleEditToggle} 
          className={`px-4 py-2 rounded-full text-xs shadow-md border transition-all hover:scale-105 active:scale-95 text-white font-medium cursor-pointer ${isEditMode ? 'bg-red-600 hover:bg-red-500 border-red-500 shadow-red-500/20' : 'bg-neutral-800/80 hover:bg-neutral-700 border-white/10 backdrop-blur-md'}`}
        >
          {isEditMode ? 'Exit Edit' : 'Edit Mode'}
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center p-6 relative z-10" ref={emailMenuRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className={`text-5xl md:text-8xl uppercase tracking-tighter mb-4 ${activeTheme.titleFont}`}>
            Qua'Tarious A. Bowman
          </h1>
          <p className="text-xs md:text-sm italic mb-8 opacity-60">"Say that five times fast"</p>
          <p className={`text-xl md:text-3xl font-light mb-2 tracking-wide ${activeTheme.accent}`}>
            B.S. Mechanical Engineering Student
          </p>
          <p className="text-sm md:text-base font-mono mb-12 opacity-80 tracking-wide font-semibold">
            "Send me."
          </p>
        </motion.div>

        {/* Organized Sleek Badges Deck */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex flex-col items-center gap-4 max-w-4xl mx-auto w-full text-sm"
        >
          {/* Primary Badges (Resumes & Portals) */}
          <div className="flex flex-wrap justify-center items-center gap-3">
            {/* Interactive PDF Resume Badge with Edit / Replace */}
            <div className="relative group/pdf">
              <a 
                href={resumePdfUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-rose-500/30 bg-rose-500/10 backdrop-blur-md text-rose-400 transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-500/20 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-500/20 active:scale-95"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M11.363 2c4.155 0 2.637 6 2.637 6s6-1.65 6 2.457v11.543h-16v-20h7.363zm.637-2h-10v24h20v-14.543l-10-9.457zm2 18h-8v-2h8v2zm4-4h-12v-2h12v2zm0-4h-12v-2h12v2z"/>
                </svg>
                <span className="font-semibold">{stagedResumePdf ? 'Staged PDF Resume' : (hasPdfResume ? 'PDF Resume' : 'Upload PDF Resume')}</span>
                {stagedResumePdf && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>}
              </a>

              {isEditMode && (
                <button
                  type="button"
                  onClick={() => pdfInputRef.current && pdfInputRef.current.click()}
                  title="Upload / Replace PDF Resume"
                  className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-mono font-bold shadow-lg transition-transform hover:scale-110 active:scale-95 z-30 cursor-pointer flex items-center gap-1 border border-white/20"
                >
                  <span>✎</span> {hasPdfResume ? 'Replace' : 'Upload'}
                </button>
              )}
            </div>

            {/* Resume Interactive Portal */}
            <a 
              href="https://resume-pink-three.vercel.app/" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md text-purple-400 transition-all duration-300 hover:-translate-y-0.5 hover:bg-purple-500/20 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
              <span>Interactive Resume</span>
            </a>

            {/* LinkedIn */}
            <a 
              href="https://www.linkedin.com/in/jimmyslimofficial" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md text-blue-400 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500/20 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              LinkedIn
            </a>

            {/* Instagram */}
            <a 
              href="https://www.instagram.com/jimmyslimofficial" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-pink-500/30 bg-pink-500/10 backdrop-blur-md text-pink-400 transition-all duration-300 hover:-translate-y-0.5 hover:bg-pink-500/20 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.514 1.41 4.662 4.662.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.148 3.252-1.41 4.514-4.662 4.662-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.514-1.41-4.662-4.662-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.148-3.252 1.41-4.514 4.662-4.662 1.266-.058 1.646-.07 4.85-.07m0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>
          </div>

          {/* Secondary Badges (Direct Contacts) */}
          <div className="flex flex-wrap justify-center items-center gap-3">
            {/* Emails with Dropdowns */}
            {['bbqsepnu48@gmail.com', 'zvc8fd@virginia.edu'].map((email) => (
              <div key={email} className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveEmailMenu(activeEmailMenu === email ? null : email); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md text-cyan-400 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer text-xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  {email}
                </button>
                
                <AnimatePresence>
                  {activeEmailMenu === email && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-neutral-900 border border-neutral-800 shadow-2xl rounded-2xl z-50 flex flex-col text-xs text-white overflow-hidden min-w-[170px]"
                    >
                      <button
                        type="button"
                        onClick={() => { copyToClipboard(email, email); setActiveEmailMenu(null); }}
                        className="px-4 py-3 hover:bg-neutral-800 transition-colors border-b border-neutral-800/60 text-center font-medium text-cyan-400 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy Address
                      </button>
                      <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`} target="_blank" rel="noreferrer" className="px-4 py-3 hover:bg-neutral-800 transition-colors border-b border-neutral-800/50 text-center font-medium">Open in Gmail</a>
                      <a href={`https://outlook.live.com/owa/?path=/mail/action/compose&to=${email}`} target="_blank" rel="noreferrer" className="px-4 py-3 hover:bg-neutral-800 transition-colors text-center font-medium">Open in Outlook</a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Phone */}
            <button 
              type="button"
              onClick={() => copyToClipboard('(757) 581-5684', 'Phone Number')}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-emerald-400 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500/20 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer text-xs"
              title="Click to copy phone number"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.82 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span>(757) 581-5684</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* PORTFOLIO GRID SECTION */}
      <main className="max-w-7xl mx-auto p-6 md:p-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 border-b border-white/10 pb-6 gap-4">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight">Featured Projects</h2>
            <p className="text-xs opacity-50 mt-1 font-mono uppercase">Engineering & Prototyping Registry &bull; {projects.length} Systems Active</p>
          </div>
          
          {isEditMode && (
            <div className="flex flex-wrap gap-2 items-center">
              <button 
                onClick={addProject} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full font-bold transition-all shadow-lg hover:scale-105 cursor-pointer text-xs flex items-center gap-1"
              >
                <span>+</span> Add Project
              </button>

              <button 
                onClick={handlePublishToGithub} 
                className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-full font-bold transition-all shadow-lg hover:scale-105 flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Publish to GitHub
              </button>

              <button onClick={exportData} className="bg-orange-500 hover:bg-orange-400 text-white px-3.5 py-2 rounded-full font-bold transition-all text-xs cursor-pointer">
                Export JSON
              </button>
              
              <label className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-full font-bold cursor-pointer transition-all text-xs">
                Import JSON
                <input type="file" onChange={importData} className="hidden" accept=".json" />
              </label>
            </div>
          )}
        </div>        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p, i) => {
            const activeImgIdx = cardImgIdxs[i] || 0;
            const imgs = p.imgs || [];

            return (
              <div id={`project-card-${i}`} key={i}>
                <ProjectCard 
                  project={p}
                  index={i}
                  activeTheme={activeTheme}
                  isEditMode={isEditMode}
                  onExpand={(idx) => setExpandedIdx(idx)}
                  onDelete={deleteProject}
                  onMoveUp={(idx) => moveProject(idx, idx - 1)}
                  onMoveDown={(idx) => moveProject(idx, idx + 1)}
                  isFirst={i === 0}
                  isLast={i === projects.length - 1}
                  onCopyLink={copyProjectLink}
                  renderFormattedText={renderFormattedText}
                  activeImgIdx={activeImgIdx}
                  onCyclePrevImg={(idx) => {
                    setCardImgIdxs(prev => ({ ...prev, [idx]: (activeImgIdx - 1 + imgs.length) % imgs.length }));
                  }}
                  onCycleNextImg={(idx) => {
                    setCardImgIdxs(prev => ({ ...prev, [idx]: (activeImgIdx + 1) % imgs.length }));
                  }}
                  onAddImages={triggerUpload}
                  onDeleteImage={deleteImage}
                  onUpdateField={updateProject}
                  onDropFiles={processFilesForProject}
                />
              </div>
            );
          })}
        </div>
      </main>

      {/* PROJECT EXPANSION MODAL */}
      {expandedIdx !== null && projects[expandedIdx] && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6" 
          onClick={() => setExpandedIdx(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className={`w-full max-w-4xl p-6 md:p-10 rounded-3xl max-h-[90vh] overflow-y-auto ${activeTheme.modalBg}`} 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{projects[expandedIdx].title}</h2>
                {projects[expandedIdx].tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {projects[expandedIdx].tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[9px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => copyProjectLink(expandedIdx)}
                  className="px-3.5 py-2 border border-white/15 bg-white/5 hover:bg-white/10 rounded-full font-mono text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Share
                </button>
                <button 
                  onClick={() => setExpandedIdx(null)} 
                  className="px-4 py-2 border border-white/15 bg-white/5 hover:bg-white/10 rounded-full font-mono text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Close [ESC]
                </button>
              </div>
            </div>
            
            <div className="text-sm md:text-base leading-relaxed opacity-90 mb-8 font-sans">
              {renderFormattedText(projects[expandedIdx].desc)}
            </div>
            
            {projects[expandedIdx].imgs && projects[expandedIdx].imgs.length > 0 && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest mb-4 opacity-50">Visual Assets Gallery ({projects[expandedIdx].imgs.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects[expandedIdx].imgs.map((img, idx) => (
                    <motion.div 
                      key={idx} 
                      onClick={() => setViewingImage({ projIdx: expandedIdx, imgIdx: idx })} 
                      className="relative h-56 md:h-64 overflow-hidden rounded-2xl border border-white/10 bg-black/20 cursor-pointer shadow-md group/gallery"
                      whileHover={{ scale: 1.01 }}
                    >
                      <img 
                        src={img} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-105" 
                        alt="Project detail view"
                      />
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/gallery:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs font-mono text-white bg-black/70 px-3.5 py-1.5 rounded-full border border-white/15 shadow-lg">Maximize View</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* FULL SCREEN IMAGE CAROUSEL OVERLAY */}
      {viewingImage && projects[viewingImage.projIdx] && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center" 
          onClick={() => setViewingImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white text-3xl font-light hover:scale-110 active:scale-95 transition-transform cursor-pointer" 
            onClick={() => setViewingImage(null)}
          >
            ✕
          </button>
          
          <img 
            src={projects[viewingImage.projIdx].imgs[viewingImage.imgIdx]} 
            className="max-w-[90vw] max-h-[82vh] object-contain shadow-2xl rounded-2xl border border-white/10" 
            alt="Maximized view"
          />
          
          {projects[viewingImage.projIdx].imgs.length > 1 && (
            <div className="absolute bottom-8 flex items-center gap-6">
              <button 
                onClick={(e) => { e.stopPropagation(); setViewingImage(p => ({...p, imgIdx: (p.imgIdx - 1 + projects[p.projIdx].imgs.length) % projects[p.projIdx].imgs.length})) }} 
                className="text-white px-5 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 shadow-md transition-all font-bold cursor-pointer"
              >
                &larr; Prev
              </button>
              <span className="text-xs font-mono text-white/70">
                {viewingImage.imgIdx + 1} / {projects[viewingImage.projIdx].imgs.length}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); setViewingImage(p => ({...p, imgIdx: (p.imgIdx + 1) % projects[p.projIdx].imgs.length})) }} 
                className="text-white px-5 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 shadow-md transition-all font-bold cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* GITHUB PAT & CONFIG MODAL */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1420] border border-white/15 rounded-3xl p-6 md:p-8 w-full max-w-md text-white shadow-2xl">
            <h3 className="text-xl font-bold tracking-tight mb-2">Publish Settings Credentials</h3>
            <p className="text-xs opacity-60 mb-6">Enter details below to allow directly committing your web catalog changes to your GitHub repository.</p>
            
            <form onSubmit={handleSaveGithubSettings} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase opacity-55">Personal Access Token (PAT)</label>
                <input 
                  required
                  type="password"
                  value={githubToken} 
                  onChange={(e) => setGithubToken(e.target.value)} 
                  className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono" 
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase opacity-55">GitHub Username</label>
                <input 
                  required
                  type="text"
                  value={githubOwner} 
                  onChange={(e) => setGithubOwner(e.target.value)} 
                  className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono" 
                  placeholder="jimmyslimofficial"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase opacity-55">Repository Name</label>
                <input 
                  required
                  type="text"
                  value={githubRepo} 
                  onChange={(e) => setGithubRepo(e.target.value)} 
                  className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono" 
                  placeholder="portfolio-site"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase opacity-55">Branch</label>
                <input 
                  required
                  type="text"
                  value={githubBranch} 
                  onChange={(e) => setGithubBranch(e.target.value)} 
                  className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono" 
                  placeholder="main"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-2 text-xs">
                <button 
                  type="button" 
                  onClick={() => setShowGithubModal(false)}
                  className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl font-mono transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-xl font-bold transition shadow-md cursor-pointer"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PUBLISHING PROGRESS LOADER OVERLAY */}
      {isPublishing && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-transparent border-white/15 rounded-full animate-spin mb-6" />
          <h3 className="text-xl font-bold font-mono tracking-tight mb-2">Publishing to GitHub</h3>
          <p className="text-sm font-mono opacity-70 max-w-sm text-center px-4">{publishProgress}</p>
        </div>
      )}

      {/* TOAST NOTIFICATION POPUP */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] bg-neutral-900/95 text-white border border-white/20 shadow-2xl px-5 py-3 rounded-full text-xs font-mono backdrop-blur-xl flex items-center gap-2.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING BACK TO TOP WITH SCROLL PROGRESS CIRCLE */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="Back to Top"
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/15 flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <svg className="w-12 h-12 -rotate-90 pointer-events-none absolute inset-0" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                className="opacity-20"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#06b6d4"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (scrollProgress / 100) * 125.6}
                className="transition-all duration-150"
              />
            </svg>
            <span className="text-sm font-bold">&uarr;</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Hidden batch file input for image uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleImageUpload} 
        accept="image/*"
        multiple
      />

      {/* Hidden file input for PDF Resume uploads */}
      <input 
        type="file" 
        ref={pdfInputRef} 
        className="hidden" 
        onChange={handlePdfUpload} 
        accept=".pdf,application/pdf"
      />
    </div>
  );
}

export default App;