import React, { useEffect, useRef } from 'react';

const BackgroundEffects = () => {
  const particlesRef = useRef(null);
  const wavesRef = useRef(null);

  useEffect(() => {
    // Create floating particles with 3D effect
    const createParticles = () => {
      const container = particlesRef.current;
      if (!container) return;

      container.innerHTML = '';

      // Create 30 particles for better visibility
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle-3d';
        
        // Random positioning
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Varied sizes for depth
        const size = Math.random() * 20 + 10;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random colors from theme palette
        const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Random animation properties
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 6 + 6) + 's';
        
        container.appendChild(particle);
      }
    };

    // Create animated waves
    const createWaves = () => {
      const container = wavesRef.current;
      if (!container) return;

      for (let i = 0; i < 3; i++) {
        const wave = document.createElement('div');
        wave.className = `wave wave-${i + 1}`;
        container.appendChild(wave);
      }
    };

    createParticles();
    createWaves();

    const interval = setInterval(createParticles, 45000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Animated Gradient Background */}
      <div className="gradient-background"></div>

      {/* 3D Floating Particles */}
      <div className="particles-3d-container" ref={particlesRef}></div>

      {/* Animated Waves */}
      <div className="waves-container" ref={wavesRef}></div>

      {/* Enhanced Geometric Shapes */}
      <div className="geometric-shapes-3d">
        <div className="shape-3d shape-3d-1"></div>
        <div className="shape-3d shape-3d-2"></div>
        <div className="shape-3d shape-3d-3"></div>
        <div className="shape-3d shape-3d-4"></div>
        <div className="shape-3d shape-3d-5"></div>
        <div className="shape-3d shape-3d-6"></div>
      </div>

      {/* Floating Orbs */}
      <div className="floating-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <style jsx>{`
        /* Animated Gradient Background */
        .gradient-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -10;
          background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* 3D Particles */
        .particles-3d-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -8;
          pointer-events: none;
          overflow: hidden;
        }

        .particle-3d {
          position: absolute;
          border-radius: 50%;
          opacity: 0.7;
          animation: float3D 8s ease-in-out infinite;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(2px);
        }

        @keyframes float3D {
          0%, 100% {
            transform: translateY(0px) rotateX(0deg) rotateY(0deg) scale(1);
            opacity: 0.7;
          }
          25% {
            transform: translateY(-30px) rotateX(90deg) rotateY(90deg) scale(1.1);
            opacity: 0.9;
          }
          50% {
            transform: translateY(-60px) rotateX(180deg) rotateY(180deg) scale(0.9);
            opacity: 0.5;
          }
          75% {
            transform: translateY(-30px) rotateX(270deg) rotateY(270deg) scale(1.2);
            opacity: 0.8;
          }
        }

        /* Animated Waves */
        .waves-container {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 200px;
          z-index: -9;
          pointer-events: none;
        }

        .wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.1), transparent);
          border-radius: 50% 50% 0 0;
          animation: waveMove 10s ease-in-out infinite;
        }

        .wave-1 {
          animation-delay: 0s;
          opacity: 0.3;
        }

        .wave-2 {
          animation-delay: -3s;
          opacity: 0.2;
          animation-duration: 12s;
        }

        .wave-3 {
          animation-delay: -6s;
          opacity: 0.1;
          animation-duration: 14s;
        }

        @keyframes waveMove {
          0%, 100% {
            transform: translateX(-50%) rotateZ(0deg);
          }
          50% {
            transform: translateX(-50%) rotateZ(180deg);
          }
        }

        /* Enhanced 3D Geometric Shapes */
        .geometric-shapes-3d {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -7;
          pointer-events: none;
          overflow: hidden;
          perspective: 1000px;
        }

        .shape-3d {
          position: absolute;
          opacity: 0.15;
          animation: rotate3D 20s linear infinite;
          transform-style: preserve-3d;
          backdrop-filter: blur(1px);
        }

        .shape-3d-1 {
          width: 200px;
          height: 200px;
          background: linear-gradient(45deg, #2563eb, #3b82f6);
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          top: 10%;
          left: 10%;
          animation-duration: 25s;
          box-shadow: 0 0 40px rgba(37, 99, 235, 0.3);
        }

        .shape-3d-2 {
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, #10b981, #34d399);
          border-radius: 50% 20% 80% 40%;
          top: 60%;
          right: 15%;
          animation-duration: 30s;
          animation-direction: reverse;
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
        }

        .shape-3d-3 {
          width: 100px;
          height: 100px;
          background: linear-gradient(225deg, #f59e0b, #fbbf24);
          border-radius: 20% 80% 20% 80%;
          bottom: 20%;
          left: 20%;
          animation-duration: 35s;
          box-shadow: 0 0 25px rgba(245, 158, 11, 0.3);
        }

        .shape-3d-4 {
          width: 120px;
          height: 120px;
          background: linear-gradient(315deg, #ef4444, #f87171);
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          top: 30%;
          right: 40%;
          animation-duration: 40s;
          animation-direction: reverse;
          box-shadow: 0 0 35px rgba(239, 68, 68, 0.3);
        }

        .shape-3d-5 {
          width: 80px;
          height: 80px;
          background: linear-gradient(45deg, #8b5cf6, #a78bfa);
          border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%;
          top: 70%;
          left: 60%;
          animation-duration: 28s;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }

        .shape-3d-6 {
          width: 180px;
          height: 180px;
          background: linear-gradient(180deg, #06b6d4, #67e8f9);
          border-radius: 70% 30% 30% 70% / 30% 70% 30% 70%;
          bottom: 40%;
          right: 20%;
          animation-duration: 45s;
          animation-direction: reverse;
          box-shadow: 0 0 45px rgba(6, 182, 212, 0.3);
        }

        @keyframes rotate3D {
          0% {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);
          }
          25% {
            transform: rotateX(90deg) rotateY(90deg) rotateZ(90deg) scale(1.1);
          }
          50% {
            transform: rotateX(180deg) rotateY(180deg) rotateZ(180deg) scale(0.9);
          }
          75% {
            transform: rotateX(270deg) rotateY(270deg) rotateZ(270deg) scale(1.2);
          }
          100% {
            transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg) scale(1);
          }
        }

        /* Floating Orbs */
        .floating-orbs {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -6;
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 70%, transparent 100%);
          animation: orbFloat 12s ease-in-out infinite;
          backdrop-filter: blur(10px);
        }

        .orb-1 {
          width: 300px;
          height: 300px;
          top: 20%;
          left: 70%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 200px;
          height: 200px;
          bottom: 30%;
          left: 10%;
          animation-delay: -4s;
        }

        .orb-3 {
          width: 150px;
          height: 150px;
          top: 50%;
          right: 30%;
          animation-delay: -8s;
        }

        @keyframes orbFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
            opacity: 0.5;
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
            opacity: 0.4;
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .shape-3d {
            opacity: 0.08;
          }
          
          .shape-3d-1, .shape-3d-2, .shape-3d-6 {
            width: 100px;
            height: 100px;
          }
          
          .shape-3d-3, .shape-3d-4, .shape-3d-5 {
            width: 60px;
            height: 60px;
          }

          .orb {
            opacity: 0.2;
          }

          .orb-1 {
            width: 150px;
            height: 150px;
          }

          .orb-2, .orb-3 {
            width: 100px;
            height: 100px;
          }

          .particle-3d {
            opacity: 0.4;
          }
        }
        
        @media (max-width: 576px) {
          .shape-3d {
            opacity: 0.05;
          }

          .waves-container {
            height: 100px;
          }
        }

        /* Performance optimization */
        @media (prefers-reduced-motion: reduce) {
          .shape-3d,
          .particle-3d,
          .wave,
          .orb,
          .gradient-background {
            animation: none;
          }
        }
      `}</style>
    </>
  );
};

export default BackgroundEffects;