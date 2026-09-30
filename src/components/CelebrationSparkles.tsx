import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  rotationSpeed: number;
  type: 'star' | 'circle' | 'heart';
}

interface CelebrationSparklesProps {
  durationMs?: number;
  onComplete?: () => void;
}

export const CelebrationSparkles: React.FC<CelebrationSparklesProps> = ({
  durationMs = 3500,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Gentle mobile celebratory haptic feedback if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 50, 60]);
      } catch {
        // Ignored on unsupported devices
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const colors = [
      '#FFE7A8', // Warm light gold
      '#E8C56A', // Rich treasure gold
      '#FFD700', // Classic pure gold
      '#FFFFFF', // Starlight white
      '#FFAAA6', // Rose blush
      '#FF6B8B', // Soft romantic heart pink
    ];

    const particles: Particle[] = [];
    const particleCount = 65;
    const originX = width / 2;
    const originY = height * 0.45;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      const types: ('star' | 'circle' | 'heart')[] = ['star', 'star', 'circle', 'heart'];
      const type = types[Math.floor(Math.random() * types.length)];

      particles.push({
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: type === 'heart' ? Math.random() * 8 + 8 : Math.random() * 5 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.012 + 0.008,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        type,
      });
    }

    const drawStar = (x: number, y: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = (Math.PI / 2) * 3;
      let step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(x, y - outerRadius);
      for (let i = 0; i < spikes; i++) {
        let curX = x + Math.cos(rot) * outerRadius;
        let curY = y + Math.sin(rot) * outerRadius;
        ctx.lineTo(curX, curY);
        rot += step;
        curX = x + Math.cos(rot) * innerRadius;
        curY = y + Math.sin(rot) * innerRadius;
        ctx.lineTo(curX, curY);
        rot += step;
      }
      ctx.lineTo(x, y - outerRadius);
      ctx.closePath();
      ctx.fill();
    };

    const drawHeart = (x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      // top left curve
      ctx.bezierCurveTo(-size / 2, -size / 2, -size, topCurveHeight / 3, 0, size);
      // top right curve
      ctx.bezierCurveTo(size, topCurveHeight / 3, size / 2, -size / 2, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0) continue;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        if (p.type === 'star') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          drawStar(0, 0, 4, p.size, p.size * 0.35);
        } else if (p.type === 'heart') {
          drawHeart(p.x, p.y, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Update physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // subtle gravity
        p.vx *= 0.98; // air resistance
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;
      }

      if (elapsed < durationMs) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        onComplete?.();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [durationMs, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[60] w-full h-full"
    />
  );
};
