import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ScratchCardProps } from '../types';

const ScratchCard: React.FC<ScratchCardProps> = ({ item, onReveal, width = 200, height = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isFullyRevealed, setIsFullyRevealed] = useState(item.isRevealed);
  const containerRef = useRef<HTMLDivElement>(null);

  // If the parent says it's revealed, ensure local state matches (e.g. restart game)
  useEffect(() => {
    if (item.isRevealed !== isFullyRevealed) {
        setIsFullyRevealed(item.isRevealed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.isRevealed]);

  // Draw the "Christmas Gift" wrapping paper on the canvas
  const drawGiftCover = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // 1. Base Fill (Red or Green based on parity of value for variety, or just random)
    const isRed = (item.value % 2 === 0);
    ctx.fillStyle = isRed ? '#D42426' : '#165B33';
    ctx.fillRect(0, 0, w, h);

    // 2. Pattern (Diagonal Gold Stripes)
    ctx.save();
    ctx.strokeStyle = '#F8B229'; // Gold
    ctx.lineWidth = 10;
    ctx.beginPath();
    for (let i = -w; i < w + h; i += 30) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i + h, h);
    }
    ctx.stroke();
    ctx.restore();

    // 3. Ribbon (Vertical and Horizontal)
    ctx.fillStyle = '#F8B229'; // Gold Ribbon
    const ribbonWidth = 30;
    // Vertical
    ctx.fillRect((w / 2) - (ribbonWidth / 2), 0, ribbonWidth, h);
    // Horizontal
    ctx.fillRect(0, (h / 2) - (ribbonWidth / 2), w, ribbonWidth);

    // 4. Bow Center
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700'; // Brighter gold for knot
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.stroke();

    // 5. Text Label
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText("SCRATCH ME", w / 2, h - 10);
    ctx.restore();

  }, [item.value]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (!item.isRevealed) {
        // Setup canvas
        canvas.width = width;
        canvas.height = height;
        
        // Draw the cover
        drawGiftCover(ctx, width, height);
    } else {
        // If already revealed (from props), clear it
        ctx.clearRect(0, 0, width, height);
    }
  }, [drawGiftCover, height, item.isRevealed, width]);


  const checkRevealStatus = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Get image data to count transparent pixels
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    
    // Iterate through alpha channel (every 4th value)
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) { // Less than 50% opacity counts as revealed
        transparentPixels++;
      }
    }

    const totalPixels = width * height;
    const percentage = (transparentPixels / totalPixels) * 100;

    // If more than 40% is scratched, reveal the whole thing
    if (percentage > 40) {
      reveal();
    }
  };

  const reveal = () => {
    setIsFullyRevealed(true);
    onReveal(item.id);
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
             // Create a smooth fade out effect simply by clearing
             // In a real game, CSS transition on opacity is smoother, see className
             ctx.clearRect(0, 0, width, height); 
        }
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratching || isFullyRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Scratch Effect
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2); // Brush size
    ctx.fill();
    
    // Throttle check status to improve performance? 
    // Here we just check every time for simplicity in small grid, 
    // but in production consider wrapping checkRevealStatus in a throttle/debounce or only on mouseUp.
    // However, to get instant "pop" feedback, we check now.
    // Optimization: Math.random() < 0.2 to check only 20% of the time during move
    if (Math.random() < 0.1) {
        checkRevealStatus();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative select-none overflow-hidden rounded-xl shadow-xl transform transition-transform duration-300 hover:scale-[1.02]"
      style={{ width, height }}
    >
      {/* Background (The Prize) */}
      <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-holiday-cream to-white border-4 border-holiday-gold rounded-xl ${isFullyRevealed ? 'animate-pulse-slow' : ''}`}>
        <div className="flex flex-col items-center">
            <span className="text-holiday-red font-christmas font-bold text-5xl drop-shadow-md">
                {item.value}
            </span>
            <span className="text-holiday-green text-xs font-bold uppercase tracking-widest mt-2">
                Winner!
            </span>
        </div>
      </div>

      {/* Foreground (The Scratch Layer) */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 rounded-xl cursor-pointer touch-none transition-opacity duration-700 ${isFullyRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onMouseDown={() => setIsScratching(true)}
        onMouseUp={() => {
            setIsScratching(false);
            checkRevealStatus();
        }}
        onMouseLeave={() => setIsScratching(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsScratching(true)}
        onTouchEnd={() => {
            setIsScratching(false);
            checkRevealStatus();
        }}
        onTouchMove={handleMouseMove}
      />
    </div>
  );
};

export default ScratchCard;
