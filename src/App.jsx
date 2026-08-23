import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TechBackground from './TechBackground';
import { verifyGithubAccess, uploadImageToGithub, publishProjectsJson } from './githubService';

function App() {
  const [projects, setProjects] = useState([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [themeIdx, setThemeIdx] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [viewingImage, setViewingImage] = useState(null); 
  const [cardImgIdxs, setCardImgIdxs] = useState({}); // Tracking active image index per card
  const [activeEmailMenu, setActiveEmailMenu] = useState(null);
  
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
  const [uploadTarget, setUploadTarget] = useState(null);

  const themes = [
    { name: 'Elegant Serif', classes: 'bg-stone-50 text-stone-900 font-serif', card: 'bg-white border border-stone-200 rounded-none shadow-sm', accent: 'text-stone-700', titleFont: 'font-bold tracking-tight', modalBg: 'bg-stone-50 text-stone-900 border border-stone-200' },
    { name: 'Tech Demo', classes: 'bg-[#080b11] text-emerald-400 font-mono', card: 'bg-[#0f1420]/80 border border-emerald-500/20 backdrop-blur-md rounded-xl hover:border-emerald-400/50 transition-all duration-300', accent: 'text-emerald-300', titleFont: 'font-bold uppercase tracking-wider', modalBg: 'bg-[#0d121d] text-emerald-400 border border-emerald-500/35' },
    { name: 'Modern Brutalist', classes: 'bg-zinc-100 text-zinc-950 font-sans', card: 'bg-white border-4 border-zinc-950 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all', accent: 'text-zinc-950 font-bold', titleFont: 'font-black uppercase tracking-tighter', modalBg: 'bg-zinc-100 text-zinc-950 border-4 border-zinc-950' },
    { name: 'Midnight Glass', classes: 'bg-slate-950 text-slate-200 font-sans', card: 'bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl hover:border-white/20 hover:bg-white/10 transition-all duration-300', accent: 'text-sky-400', titleFont: 'font-light tracking-widest uppercase', modalBg: 'bg-slate-900/95 backdrop-blur-xl text-slate-200 border border-white/10' },
    { name: 'Paper Minimalist', classes: 'bg-[#f4f1ea] text-[#2c2c2c] font-sans', card: 'bg-[#e9e6de] border-0 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300', accent: 'text-[#8b5e3c]', titleFont: 'font-medium tracking-tight', modalBg: 'bg-[#f4f1ea] text-[#2c2c2c] border border-stone-300' },
    { name: 'Frutiger Aero', classes: 'bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-100 text-sky-900 font-sans', card: 'bg-white/70 backdrop-blur-md border border-white/60 rounded-[2rem] shadow-lg shadow-sky-200/40 hover:shadow-xl hover:bg-white/80 transition-all duration-300', accent: 'text-blue-600 font-semibold', titleFont: 'font-extrabold tracking-tighter italic', modalBg: 'bg-white/95 text-sky-900 border border-white/70 shadow-2xl', bgAnimation: 'animate-pulse' },
    { name: 'Y2K', classes: 'bg-fuchsia-600 text-yellow-300 font-mono', card: 'bg-black border-4 border-yellow-300 rounded-none shadow-[8px_8px_0px_0px_#fff] hover:shadow-[12px_12px_0px_0px_#fff] transition-all', accent: 'text-yellow-400 font-bold', titleFont: 'font-black tracking-widest uppercase', modalBg: 'bg-black text-yellow-300 border-4 border-yellow-300' }
  ];

  const activeTheme = themes[themeIdx];

  // Load projects database
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

  // Save changes to localStorage for local persistence
  useEffect(() => {
    if (!projectsLoaded) return;
    localStorage.setItem('port_projects_v5', JSON.stringify(projects));
  }, [projects, projectsLoaded]);

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

  // Handle updates to specific project fields
  const updateProject = (idx, field, val) => {
    const updatedProjects = [...projects];
    updatedProjects[idx][field] = val;
    setProjects(updatedProjects);
  };

  const addProject = () => {
    setProjects([...projects, { title: "New Project", desc: "Project description here...", imgs: [], tags: ["New Asset"] }]);
  };

  const deleteProject = (idx) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter((_, i) => i !== idx));
    }
  };

  const triggerUpload = (idx) => {
    setUploadTarget(idx);
    fileInputRef.current.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || uploadTarget === null) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const p = [...projects];
      if (!p[uploadTarget].imgs) p[uploadTarget].imgs = [];
      p[uploadTarget].imgs.push(event.target.result); // Temporarily store as base64 for preview
      setProjects(p);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const deleteImage = (projIdx, imgIdx) => {
    const p = [...projects];
    p[projIdx].imgs.splice(imgIdx, 1);
    // Reset active card index if out of bounds
    const activeIdx = cardImgIdxs[projIdx] || 0;
    if (activeIdx >= p[projIdx].imgs.length) {
      setCardImgIdxs(prev => ({ ...prev, [projIdx]: Math.max(0, p[projIdx].imgs.length - 1) }));
    }
    setProjects(p);
  };

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

  const handlePublishToGithub = async () => {
    // Open credentials config modal if credentials are missing
    if (!githubToken || !githubOwner || !githubRepo) {
      setShowGithubModal(true);
      return;
    }

    setIsPublishing(true);
    setPublishProgress('Authenticating with GitHub...');

    try {
      // 1. Validate GitHub Token Write Permissions
      const hasAccess = await verifyGithubAccess(githubToken, githubOwner, githubRepo);
      if (!hasAccess) {
        throw new Error('Access denied. Please check your token validity and repository write permissions.');
      }

      setPublishProgress('Analyzing and packing image assets...');
      const updatedProjects = JSON.parse(JSON.stringify(projects)); // Deep copy projects state

      // 2. Loop through all projects to detect and upload base64 images
      for (let pIdx = 0; pIdx < updatedProjects.length; pIdx++) {
        const project = updatedProjects[pIdx];
        if (!project.imgs) project.imgs = [];

        for (let imgIdx = 0; imgIdx < project.imgs.length; imgIdx++) {
          const imgPath = project.imgs[imgIdx];
          
          // Check if the image is a base64 string (meaning it was newly uploaded in the browser)
          if (imgPath.startsWith('data:image/')) {
            const match = imgPath.match(/data:image\/([a-zA-Z+]+);base64,/);
            const ext = match ? (match[1] === 'jpeg' ? 'jpg' : match[1]) : 'jpg';
            
            const timestamp = Date.now();
            const rand = Math.floor(Math.random() * 10000);
            const cleanTitle = project.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15);
            const filename = `img_${cleanTitle}_${pIdx}_${imgIdx}_${timestamp}_${rand}.${ext}`;
            
            setPublishProgress(`Uploading dynamic asset for "${project.title}" (${imgIdx + 1}/${project.imgs.length})...`);
            
            // Upload base64 image directly to public/images/ on GitHub
            const relativeRepoPath = await uploadImageToGithub(githubToken, githubOwner, githubRepo, imgPath, filename);
            
            // Replace local base64 preview URL with the relative repository path
            project.imgs[imgIdx] = relativeRepoPath;
          }
        }
      }

      // 3. Save modified projects database back to public/projects.json on GitHub
      setPublishProgress('Publishing catalog metadata to repository...');
      await publishProjectsJson(githubToken, githubOwner, githubRepo, updatedProjects);

      // Save credentials in local storage for future edit sessions
      localStorage.setItem('port_github_token', githubToken);
      localStorage.setItem('port_github_owner', githubOwner);
      localStorage.setItem('port_github_repo', githubRepo);
      localStorage.setItem('port_github_branch', githubBranch);

      // Update state and cache
      setProjects(updatedProjects);
      setPublishProgress('Publication Successful! Deploying changes on Vercel...');
      
      setTimeout(() => {
        setIsPublishing(false);
        setIsEditMode(false);
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
    // Proceed with publishing flow immediately after saving settings
    setTimeout(() => {
      handlePublishToGithub();
    }, 100);
  };

  // Local JSON File export fallback
  const exportData = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'projects.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Local JSON File import fallback
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

  return (
    <div className={`min-h-screen transition-colors duration-500 relative ${activeTheme.classes}`}>
      {/* Custom Particle background for high-tech themes */}
      {(activeTheme.name === 'Tech Demo' || activeTheme.name === 'Midnight Glass') && <TechBackground />}

      {/* Floating Top Control Deck */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button 
          onClick={() => setThemeIdx((p) => (p + 1) % themes.length)} 
          className="px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs shadow-md backdrop-blur-md border border-white/10 transition-all hover:scale-105 active:scale-95"
        >
          Theme: {activeTheme.name}
        </button>
        <button 
          onClick={handleEditToggle} 
          className={`px-4 py-2 rounded-full text-xs shadow-md border transition-all hover:scale-105 active:scale-95 text-white ${isEditMode ? 'bg-red-600 hover:bg-red-500 border-red-700' : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700'}`}
        >
          {isEditMode ? 'Exit Edit' : 'Edit Mode'}
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="h-screen flex flex-col justify-center items-center text-center p-6 relative z-10" ref={emailMenuRef}>
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
          <p className="text-sm md:text-base font-mono mb-12 opacity-80">
            Voted "This Eon's Coolest"
          </p>
        </motion.div>

        {/* Contact Links Floating Pills Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto text-sm"
        >
          {/* LinkedIn */}
          <a 
            href="https://www.linkedin.com/in/jimmyslimofficial" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-current bg-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg hover:shadow-blue-500/10 hover:text-blue-500"
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-current bg-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg hover:shadow-pink-500/10 hover:text-pink-500"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.514 1.41 4.662 4.662.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.148 3.252-1.41 4.514-4.662 4.662-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.514-1.41-4.662-4.662-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.148-3.252 1.41-4.514 4.662-4.662 1.266-.058 1.646-.07 4.85-.07m0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Instagram
          </a>

          {/* Resume */}
          <a 
            href="https://resume-pink-three.vercel.app/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-current bg-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/10 hover:text-purple-500"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Resume Portal
          </a>

          {/* Emails with Dropdowns */}
          {['bbqsepnu48@gmail.com', 'zvc8fd@virginia.edu'].map((email) => (
            <div key={email} className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveEmailMenu(activeEmailMenu === email ? null : email); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-current bg-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg hover:text-cyan-500"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
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
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-neutral-900 border border-neutral-800 shadow-2xl rounded-xl z-50 flex flex-col text-xs text-white overflow-hidden min-w-[140px]"
                  >
                    <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`} target="_blank" rel="noreferrer" className="px-4 py-3 hover:bg-neutral-800 transition-colors border-b border-neutral-800/50 text-center font-medium">Open in Gmail</a>
                    <a href={`https://outlook.live.com/owa/?path=/mail/action/compose&to=${email}`} target="_blank" rel="noreferrer" className="px-4 py-3 hover:bg-neutral-800 transition-colors text-center font-medium">Open in Outlook</a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Phone */}
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-current bg-white/5 backdrop-blur-md text-emerald-500 hover:bg-emerald-500/5 transition-all">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.82 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            (757) 581-5684
          </div>
        </motion.div>
      </section>

      {/* PORTFOLIO GRID SECTION */}
      <main className="max-w-7xl mx-auto p-6 md:p-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 border-b border-white/10 pb-6 gap-4">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight">Featured Projects</h2>
            <p className="text-xs opacity-50 mt-1 font-mono uppercase">Engineering & Prototyping Registry</p>
          </div>
          
          {isEditMode && (
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={addProject} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full font-bold transition-all shadow-lg hover:scale-105"
              >
                + Add Project
              </button>

              <button 
                onClick={handlePublishToGithub} 
                className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-full font-bold transition-all shadow-lg hover:scale-105 flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Publish to GitHub
              </button>

              <button onClick={exportData} className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-full font-bold transition-all">Export JSON</button>
              
              <label className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-full font-bold cursor-pointer transition-all">
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
            const hasImages = imgs.length > 0;
            const cycleNextImg = (e) => {
              e.stopPropagation();
              setCardImgIdxs(prev => ({ ...prev, [i]: (activeImgIdx + 1) % imgs.length }));
            };
            const cyclePrevImg = (e) => {
              e.stopPropagation();
              setCardImgIdxs(prev => ({ ...prev, [i]: (activeImgIdx - 1 + imgs.length) % imgs.length }));
            };

            return (
              <div key={i} className={`p-6 border relative group flex flex-col justify-between ${activeTheme.card}`}>
                {isEditMode && (
                  <button 
                    onClick={() => deleteProject(i)} 
                    className="absolute top-3 right-3 bg-red-600 hover:bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold shadow-md z-20"
                  >
                    ✕
                  </button>
                )}
                
                <div>
                  {/* Schematic Asset Cover Frame */}
                  <div 
                    className="h-52 mb-6 relative flex items-center justify-center overflow-hidden rounded-xl bg-black/10 cursor-pointer group/image shadow-inner border border-white/5" 
                    onClick={() => !isEditMode && setExpandedIdx(i)}
                  >
                    {hasImages ? (
                      <>
                        <img 
                          src={imgs[activeImgIdx]} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105" 
                          alt={`${p.title} media`}
                        />
                        {imgs.length > 1 && (
                          <>
                            {/* Hover Navigation Controls */}
                            <button 
                              onClick={cyclePrevImg} 
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 font-bold border border-white/10"
                            >
                              &larr;
                            </button>
                            <button 
                              onClick={cycleNextImg} 
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 font-bold border border-white/10"
                            >
                              &rarr;
                            </button>
                            
                            {/* Index Dots */}
                            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                              {imgs.map((_, dotIdx) => (
                                <div 
                                  key={dotIdx} 
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${dotIdx === activeImgIdx ? 'bg-white scale-125 shadow-md' : 'bg-white/40'}`} 
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-6 opacity-40 font-mono text-xs">
                        <svg className="w-10 h-10 mb-2 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                        </svg>
                        <span>No Schematic Data</span>
                      </div>
                    )}
                  </div>

                  {isEditMode ? (
                    <div className="flex flex-col gap-4">
                      {/* Title Edit */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-mono uppercase opacity-50">Project Title</label>
                        <input 
                          value={p.title} 
                          onChange={(e) => updateProject(i, 'title', e.target.value)} 
                          className="bg-black/30 border border-white/10 rounded-lg p-2 w-full text-base font-bold text-white focus:outline-none focus:border-current" 
                          placeholder="Project Title"
                        />
                      </div>
                      
                      {/* Description Edit */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-mono uppercase opacity-50">Description</label>
                        <textarea 
                          value={p.desc} 
                          onChange={(e) => updateProject(i, 'desc', e.target.value)} 
                          className="bg-black/30 border border-white/10 rounded-lg p-2 w-full text-xs h-28 text-white focus:outline-none focus:border-current" 
                          placeholder="Project Description"
                        />
                      </div>

                      {/* Tags Edit */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-mono uppercase opacity-50">Tags (comma-separated)</label>
                        <input 
                          value={p.tags ? p.tags.join(', ') : ''} 
                          onChange={(e) => updateProject(i, 'tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                          className="bg-black/30 border border-white/10 rounded-lg p-2 w-full text-xs font-mono text-white focus:outline-none focus:border-current" 
                          placeholder="SolidWorks, React, Mechanical"
                        />
                      </div>

                      {/* Media Thumbnails Area */}
                      <div>
                        <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Media Assets</label>
                        <div className="flex flex-wrap gap-2 border border-white/10 rounded-lg p-2 bg-black/10">
                          {p.imgs?.map((img, imgIdx) => (
                            <div key={imgIdx} className="relative w-14 h-14 group/thumb rounded-md overflow-hidden border border-white/10">
                              <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
                              <button 
                                type="button"
                                onClick={() => deleteImage(i, imgIdx)} 
                                className="absolute -top-0.5 -right-0.5 bg-red-600 hover:bg-red-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-bold opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          <button 
                            type="button"
                            onClick={() => triggerUpload(i)}
                            className="w-14 h-14 border-2 border-dashed border-white/20 rounded-md flex flex-col items-center justify-center text-[10px] opacity-60 hover:opacity-100 hover:border-current transition-all"
                          >
                            <span className="text-sm">+</span>
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => !isEditMode && setExpandedIdx(i)} className="cursor-pointer">
                      <h3 className={`text-2xl mb-3 tracking-tight ${activeTheme.titleFont}`}>{p.title}</h3>
                      <p className="opacity-70 text-sm leading-relaxed mb-6 line-clamp-3">{p.desc}</p>
                    </div>
                  )}
                </div>

                {!isEditMode && (
                  <div>
                    {/* Technology Tag Pills */}
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {p.tags.map((tag, tIdx) => (
                          <span 
                            key={tIdx} 
                            className="text-[9px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div 
                      onClick={() => setExpandedIdx(i)} 
                      className="text-xs font-mono uppercase tracking-widest text-right flex justify-end items-center gap-1 opacity-55 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      Expand Telemetry &rarr;
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* PROJECT EXPANSION MODAL */}
      {expandedIdx !== null && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6" 
          onClick={() => setExpandedIdx(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`w-full max-w-4xl p-6 md:p-10 rounded-2xl max-h-[90vh] overflow-y-auto ${activeTheme.modalBg}`} 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{projects[expandedIdx].title}</h2>
                {projects[expandedIdx].tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {projects[expandedIdx].tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setExpandedIdx(null)} 
                className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-full font-mono text-xs shadow-md transition-all active:scale-95"
              >
                Close [ESC]
              </button>
            </div>
            
            <p className="text-sm md:text-base leading-relaxed opacity-80 mb-8 whitespace-pre-wrap font-sans">{projects[expandedIdx].desc}</p>
            
            {projects[expandedIdx].imgs && projects[expandedIdx].imgs.length > 0 && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest mb-4 opacity-50">Visual Assets Grid</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects[expandedIdx].imgs.map((img, idx) => (
                    <motion.div 
                      key={idx} 
                      onClick={() => setViewingImage({ projIdx: expandedIdx, imgIdx: idx })} 
                      className="relative h-56 md:h-64 overflow-hidden rounded-xl border border-white/10 bg-black/20 cursor-pointer shadow-md group/gallery"
                      whileHover={{ scale: 1.01 }}
                    >
                      <img 
                        src={img} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-105" 
                        alt="Project detail view"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/gallery:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs font-mono text-white bg-black/60 px-3 py-1.5 rounded-full border border-white/10">Maximize View</span>
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
      {viewingImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg flex items-center justify-center" 
          onClick={() => setViewingImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white text-3xl font-light hover:scale-110 active:scale-95 transition-transform" 
            onClick={() => setViewingImage(null)}
          >
            ✕
          </button>
          
          <img 
            src={projects[viewingImage.projIdx].imgs[viewingImage.imgIdx]} 
            className="max-w-[90vw] max-h-[80vh] object-contain shadow-2xl rounded-lg" 
            alt="Maximized view"
          />
          
          {projects[viewingImage.projIdx].imgs.length > 1 && (
            <div className="absolute bottom-8 flex items-center gap-6">
              <button 
                onClick={(e) => { e.stopPropagation(); setViewingImage(p => ({...p, imgIdx: (p.imgIdx - 1 + projects[p.projIdx].imgs.length) % projects[p.projIdx].imgs.length})) }} 
                className="text-white px-5 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 shadow-md transition-all font-bold"
              >
                &larr; Prev
              </button>
              <span className="text-xs font-mono text-white/55">
                {viewingImage.imgIdx + 1} / {projects[viewingImage.projIdx].imgs.length}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); setViewingImage(p => ({...p, imgIdx: (p.imgIdx + 1) % projects[p.projIdx].imgs.length})) }} 
                className="text-white px-5 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 shadow-md transition-all font-bold"
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
          <div className="bg-[#0f1420] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-md text-white shadow-2xl">
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
                  className="bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono" 
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
                  className="bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono" 
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
                  className="bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono" 
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
                  className="bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono" 
                  placeholder="main"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-2 text-xs">
                <button 
                  type="button" 
                  onClick={() => setShowGithubModal(false)}
                  className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg font-mono transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg font-bold transition shadow-md"
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
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-t-sky-500 border-r-transparent border-white/15 rounded-full animate-spin mb-6" />
          <h3 className="text-xl font-bold font-mono tracking-tight mb-2">Publishing to GitHub</h3>
          <p className="text-sm font-mono opacity-60 max-w-sm text-center px-4">{publishProgress}</p>
        </div>
      )}

      {/* Hidden file input for uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleImageUpload} 
        accept="image/*" 
      />
    </div>
  );
}

export default App;