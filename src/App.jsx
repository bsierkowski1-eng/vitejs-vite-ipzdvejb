import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Image as ImageIcon, SlidersHorizontal, RefreshCcw, Camera } from 'lucide-react';

const FILTER_PRESETS = [
  { name: 'Normal', filter: 'none' },
  { name: 'Sepia', filter: 'sepia(100%)' },
  { name: 'Nostalgia', filter: 'sepia(50%) contrast(110%) saturate(130%) hue-rotate(-10deg)' },
  { name: 'B&W', filter: 'grayscale(100%)' },
  { name: 'Faded', filter: 'sepia(40%) contrast(90%) brightness(110%) saturate(80%)' },
  { name: 'High Contrast', filter: 'contrast(150%) saturate(120%)' },
  { name: 'Retro 80s', filter: 'saturate(150%) hue-rotate(20deg) contrast(120%)' },
  { name: 'Old Film', filter: 'sepia(30%) grayscale(40%) contrast(120%) brightness(90%)' },
  { name: 'Washout', filter: 'brightness(120%) contrast(80%) saturate(60%)' },
  { name: 'Cinematic', filter: 'contrast(130%) saturate(80%) brightness(80%)' },
  { name: 'Polaroid', filter: 'sepia(20%) contrast(110%) brightness(110%) saturate(120%) hue-rotate(-5deg)' },
  { name: 'Warm Glow', filter: 'sepia(30%) saturate(140%) brightness(110%)' },
  { name: 'Cool Tint', filter: 'hue-rotate(180deg) saturate(80%) brightness(110%)' },
  { name: 'Overexposed', filter: 'brightness(150%) contrast(90%)' },
  { name: 'Gritty', filter: 'grayscale(80%) contrast(140%) brightness(90%)' },
  { name: '1970s', filter: 'sepia(60%) saturate(130%) contrast(110%) hue-rotate(-15deg)' },
  { name: 'Sunset', filter: 'sepia(30%) saturate(200%) hue-rotate(-20deg) brightness(95%)' },
];

export default function VintageFilterApp() {
  const [imageSrc, setImageSrc] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(FILTER_PRESETS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
        setSelectedFilter(FILTER_PRESETS[0]); // Reset to normal on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas dimensions to match the original image for high-quality download
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply the selected CSS filter to the canvas context
      ctx.filter = selectedFilter.filter;
      
      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setIsProcessing(false);
    };

    img.src = imageSrc;
  }, [imageSrc, selectedFilter]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    // Get the data URL from the canvas (JPEG format, 90% quality)
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
    
    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.download = `vintage-edit-${Date.now()}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-neutral-200 font-sans">
      
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#181818]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <Camera size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-wide text-white">Visual.af <span className="text-neutral-500 font-normal text-sm ml-2">Vintage Studio</span></h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-sm font-medium rounded-md transition-colors"
          >
            <Upload size={16} />
            <span>Open Image</span>
          </button>
          
          <button 
            onClick={handleDownload}
            disabled={!imageSrc}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              imageSrc 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <Download size={16} />
            <span>Save Output</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Left Side: Image Preview Area */}
        <section className="flex-1 relative flex items-center justify-center p-8 bg-[#0a0a0a] overflow-hidden">
          {!imageSrc ? (
            <div className="flex flex-col items-center justify-center text-neutral-600 max-w-sm text-center">
              <ImageIcon size={64} className="mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-neutral-400 mb-2">No Image Loaded</h2>
              <p className="text-sm">Click "Open Image" in the top bar to load a photo and start applying vintage effects.</p>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Canvas acts as the preview and the render target */}
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain shadow-2xl rounded-sm transition-opacity duration-300"
                style={{ opacity: isProcessing ? 0.5 : 1 }}
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCcw className="animate-spin text-emerald-500" size={32} />
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right Side: Filters Sidebar */}
        <aside className="w-80 flex flex-col bg-[#181818] border-l border-neutral-800 h-full">
          <div className="p-5 border-b border-neutral-800 flex items-center space-x-2">
            <SlidersHorizontal size={18} className="text-neutral-400" />
            <h3 className="font-semibold text-neutral-200">Filter Gallery</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-2 gap-3">
              {FILTER_PRESETS.map((preset, index) => (
                <button
                  key={preset.name}
                  onClick={() => setSelectedFilter(preset)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                    selectedFilter.name === preset.name
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                      : 'bg-[#222222] border-transparent hover:bg-[#2a2a2a] hover:border-neutral-700 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {/* Subtle visual indicator of the filter (simplified) */}
                  <div 
                    className="w-12 h-12 rounded-full mb-3 bg-neutral-700 shadow-inner overflow-hidden relative"
                  >
                     <div 
                        className="absolute inset-0 bg-gradient-to-tr from-neutral-500 to-neutral-300"
                        style={{ filter: preset.filter }}
                     />
                  </div>
                  <span className="text-xs font-medium text-center">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Footer Info in Sidebar */}
          <div className="p-4 bg-[#141414] border-t border-neutral-800 text-xs text-neutral-500 text-center leading-relaxed">
            Select a preset above to apply. Effects are rendered locally in your browser.
          </div>
        </aside>

      </main>

      {/* Basic Custom Scrollbar Styles injected directly */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #333;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #444;
        }
      `}} />
    </div>
  );
}