import { useEffect, useRef } from 'react';

interface ParticleHeroProps {
  particleCount?: number;
}

export function ParticleHero({ particleCount = 120 }: ParticleHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = { x: -1000, y: -1000 };

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      z: number;
      size: number;
      length: number;
      angle: number;
      color: string;
      speed: number;

      constructor() {
        const c = canvasRef.current;
        if (!c) {
          this.baseX = 0;
          this.baseY = 0;
          this.x = 0;
          this.y = 0;
          this.z = 1;
          this.size = 1;
          this.length = 10;
          this.angle = 0;
          this.speed = 0.1;
          this.color = '';
          return;
        }
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.max(c.width, c.height) * 0.8;
        this.baseX = c.width / 2 + Math.cos(angle) * radius;
        this.baseY = c.height / 2 + Math.sin(angle) * radius;
        this.x = this.baseX;
        this.y = this.baseY;
        
        this.z = Math.random() * 2 + 1;
        this.size = (Math.random() * 1.5 + 0.5) / this.z;
        this.length = (Math.random() * 15 + 5) / this.z;
        this.angle = Math.atan2(this.y - c.height / 2, this.x - c.width / 2);
        this.speed = Math.random() * 0.2 + 0.1;
        
        const colors = [
          'hsla(260, 80%, 70%, ',
          'hsla(280, 70%, 65%, ',
          'hsla(240, 60%, 75%, ',
          'hsla(200, 80%, 70%, '
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        const c = canvasRef.current;
        if (!c) return;
        this.baseX += Math.cos(this.angle) * this.speed;
        this.baseY += Math.sin(this.angle) * this.speed;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200; // Increased radius
        
        let forceX = 0;
        let forceY = 0;

        if (distance < maxDist) {
          const force = (maxDist - distance) / maxDist;
          forceX = (dx / distance) * force * 45; // Increased force for more sensitivity
          forceY = (dy / distance) * force * 45;
        }

        const targetX = this.baseX - forceX;
        const targetY = this.baseY - forceY;
        
        this.x += (targetX - this.x) * 0.15; // Faster reaction
        this.y += (targetY - this.y) * 0.15;

        if (this.x < -100 || this.x > c.width + 100 || this.y < -100 || this.y > c.height + 100) {
          this.baseX = c.width / 2;
          this.baseY = c.height / 2;
          this.x = this.baseX;
          this.y = this.baseY;
        }
      }

      draw() {
        if (!ctx) return;
        const alpha = (1 / this.z) * 1; // Full brightness
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color + '0.8)';
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.length, 0);
        ctx.strokeStyle = this.color + alpha + ')';
        ctx.lineWidth = this.size * 1.5; // Slightly thicker for "illumination"
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear instead of trail for absolute clarity
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[15]"
    />
  );
}
