import React, { useState } from 'react';

/**
 * ProjectCard with 3D Mouse Parallax Tilt & Specular Dynamic Glare Effect
 */
const ProjectCard = ({ 
  project, 
  index, 
  activeTheme, 
  isEditMode, 
  onExpand, 
  onDelete, 
  onMoveUp, 
  onMoveDown, 
  isFirst, 
  isLast,
  onCopyLink,
  renderFormattedText,
  activeImgIdx,
  onCyclePrevImg,
  onCycleNextImg,
  onAddImages,
  onDeleteImage,
  onUpdateField,
  onDropFiles
}) => {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, opacity: 0 });
  const [isDragOver, setIsDragOver] = useState(false);

  const handleMouseMove = (e) => {
    if (isEditMode) return; // Disable tilt in edit mode for ease of clicking inputs
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7; // Max tilt 7deg
    const rotateY = ((x - centerX) / centerX) * 7;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glareX, glareY, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, opacity: 0 });
  };

  const imgs = project.imgs || [];
  const hasImages = imgs.length > 0;
  const currentImg = hasImages ? imgs[activeImgIdx % imgs.length] : null;

  const handleCardDragOver = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleCardDragLeave = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleCardDrop = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFiles(index, e.dataTransfer.files);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onDragOver={handleCardDragOver}
      onDragLeave={handleCardDragLeave}
      onDrop={handleCardDrop}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1, 1, 1)`,
        transition: tilt.opacity === 0 ? 'transform 0.5s ease-out' : 'none'
      }}
      className={`relative group flex flex-col justify-between p-6 transition-all duration-300 ${activeTheme.card} ${isDragOver ? 'ring-2 ring-sky-400 bg-sky-500/10' : ''}`}
    >
      {/* Specular Glare Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(circle 320px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.12), transparent 70%)`,
          opacity: tilt.opacity
        }}
      />

      {/* Edit Mode Quick Action Header */}
      {isEditMode && (
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10 z-20">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isFirst}
              onClick={() => onMoveUp(index)}
              title="Move project up"
              className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-xs disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ▲
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={() => onMoveDown(index)}
              title="Move project down"
              className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-xs disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ▼
            </button>
            <span className="text-[10px] font-mono opacity-50 ml-1">#{index + 1}</span>
          </div>

          <button
            type="button"
            onClick={() => onDelete(index)}
            title="Delete project"
            className="px-2.5 py-1 bg-red-600/90 hover:bg-red-500 text-white rounded-md text-[11px] font-bold shadow transition flex items-center gap-1"
          >
            <span>✕</span> Delete
          </button>
        </div>
      )}

      <div>
        {/* Schematic Asset Cover Frame */}
        <div 
          className="h-56 mb-6 relative flex items-center justify-center overflow-hidden rounded-xl bg-black/20 cursor-pointer group/image shadow-inner border border-white/5 select-none" 
          onClick={() => !isEditMode && onExpand(index)}
        >
          {hasImages ? (
            <>
              <img 
                src={currentImg} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105" 
                alt={`${project.title} media`}
                loading="lazy"
              />
              {imgs.length > 1 && (
                <>
                  {/* Hover Navigation Controls */}
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onCyclePrevImg(index); }} 
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 font-bold border border-white/15 shadow-lg active:scale-95"
                  >
                    &larr;
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onCycleNextImg(index); }} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 font-bold border border-white/15 shadow-lg active:scale-95"
                  >
                    &rarr;
                  </button>
                  
                  {/* Index Indicator Pill */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white/90 z-20">
                    {(activeImgIdx % imgs.length) + 1} / {imgs.length}
                  </div>

                  {/* Index Dots */}
                  <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
                    {imgs.map((_, dotIdx) => (
                      <div 
                        key={dotIdx} 
                        className={`w-1.5 h-1.5 rounded-full transition-all ${dotIdx === (activeImgIdx % imgs.length) ? 'bg-white scale-125 shadow-md' : 'bg-white/40'}`} 
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
              <span>No Visual Data Loaded</span>
              {isEditMode && <span className="text-[10px] mt-1 text-sky-400">Drag & drop files or click Add</span>}
            </div>
          )}
        </div>

        {/* Card Content & Fields */}
        {isEditMode ? (
          <div className="flex flex-col gap-4 text-left z-20 relative">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono uppercase opacity-55">Project Title</label>
              <input 
                value={project.title || ''} 
                onChange={(e) => onUpdateField(index, 'title', e.target.value)} 
                className="bg-black/30 border border-white/15 rounded-lg p-2.5 w-full text-base font-bold text-white focus:outline-none focus:border-sky-400 font-sans" 
                placeholder="Project Title"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono uppercase opacity-55">Description (supports Markdown **bold**, - lists, `code`)</label>
              <textarea 
                value={project.desc || ''} 
                onChange={(e) => onUpdateField(index, 'desc', e.target.value)} 
                className="bg-black/30 border border-white/15 rounded-lg p-2.5 w-full text-xs h-32 text-white focus:outline-none focus:border-sky-400 font-sans leading-relaxed" 
                placeholder="Project Description..."
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono uppercase opacity-55">Tags (comma-separated)</label>
              <input 
                value={project.tags ? project.tags.join(', ') : ''} 
                onChange={(e) => onUpdateField(index, 'tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                className="bg-black/30 border border-white/15 rounded-lg p-2.5 w-full text-xs font-mono text-white focus:outline-none focus:border-sky-400" 
                placeholder="SolidWorks, React, Kinematics"
              />
            </div>

            {/* Media Thumbnails with Batch Add Area */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-mono uppercase opacity-55">Visual Assets ({imgs.length})</label>
                <span className="text-[9px] font-mono opacity-40">Drag files directly onto card</span>
              </div>
              
              <div className="flex flex-wrap gap-2 border border-white/15 rounded-xl p-2.5 bg-black/15 min-h-[70px] items-center">
                {imgs.map((img, imgIdx) => (
                  <div key={imgIdx} className="relative w-14 h-14 group/thumb rounded-lg overflow-hidden border border-white/10 shadow">
                    <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
                    <button 
                      type="button"
                      onClick={() => onDeleteImage(index, imgIdx)} 
                      title="Remove image"
                      className="absolute top-0.5 right-0.5 bg-red-600 hover:bg-red-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-bold opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                
                <button 
                  type="button"
                  onClick={() => onAddImages(index)}
                  className="w-14 h-14 border-2 border-dashed border-white/25 hover:border-sky-400 rounded-lg flex flex-col items-center justify-center text-[10px] opacity-70 hover:opacity-100 transition-all text-sky-400"
                >
                  <span className="text-base font-bold leading-none">+</span>
                  <span className="text-[9px] font-mono">Upload</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div onClick={() => onExpand(index)} className="cursor-pointer text-left">
            <h3 className={`text-2xl mb-3 tracking-tight ${activeTheme.titleFont}`}>{project.title}</h3>
            <div className="opacity-80 text-sm leading-relaxed mb-6 line-clamp-3">
              {renderFormattedText ? renderFormattedText(project.desc) : project.desc}
            </div>
          </div>
        )}
      </div>

      {/* Visitor Mode Footer */}
      {!isEditMode && (
        <div className="pt-4 border-t border-white/5 mt-4">
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tags.map((tag, tIdx) => (
                <span 
                  key={tIdx} 
                  className="text-[9px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-current opacity-80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs font-mono">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onCopyLink(index); }}
              title="Copy link to this project"
              className="opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[11px] p-1 rounded hover:bg-white/5"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Share</span>
            </button>

            <div 
              onClick={() => onExpand(index)} 
              className="uppercase tracking-widest flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer group-hover:translate-x-0.5 duration-200"
            >
              <span>Deep Dive</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;