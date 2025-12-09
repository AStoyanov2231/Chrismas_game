import React, { useEffect, useRef } from 'react';

const Snowfall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const snowflakes: { x: number; y: number; r: number; d: number }[] = [];
    const maxFlakes = 100;

    for (let i = 0; i < maxFlakes; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1, // radius
        d: Math.random() * maxFlakes // density/falling speed factor
      });
    }

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();

      for (let i = 0; i < maxFlakes; i++) {
        const p = snowflakes[i];
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
      }

      ctx.fill();
      update();
      animationFrameId = requestAnimationFrame(draw);
    };

    let angle = 0;

    const update = () => {
      angle += 0.01;
      for (let i = 0; i < maxFlakes; i++) {
        const p = snowflakes[i];
        // Updating x and y coordinates
        // We add 1 to cos function to prevent negative values which move flakes upwards
        // Every particle has its own density which can be used to make the downward movement different for each flake
        // Let's make it more simple
        p.y += Math.cos(angle + p.d) + 1 + p.r / 2;
        p.x += Math.sin(angle) * 2;

        // Sending flakes back from the top when it exits
        // Lets make it a bit more organic and let flakes enter from the left and right also.
        if (p.x > width + 5 || p.x < -5 || p.y > height) {
          if (i % 3 > 0) { // 66.67% of the flakes
            snowflakes[i] = { x: Math.random() * width, y: -10, r: p.r, d: p.d };
          } else {
            // If the flake is exiting from the right
            if (Math.sin(angle) > 0) {
              // Enter from the left
              snowflakes[i] = { x: -5, y: Math.random() * height, r: p.r, d: p.d };
            } else {
              // Enter from the right
              snowflakes[i] = { x: width + 5, y: Math.random() * height, r: p.r, d: p.d };
            }
          }
        }
      }
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" 
    />
  );
};

export default Snowfall;