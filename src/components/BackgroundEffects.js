import React, { useEffect, useRef } from 'react';

const BackgroundEffects = () => {
  const particlesRef = useRef(null);

  useEffect(() => {
    // Create floating particles
    const createParticles = () => {
      const container = particlesRef.current;
      if (!container) return;

      // Clear existing particles
      container.innerHTML = '';

      // Create 20 particles for better visibility
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random positioning
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Larger, more visible particles
        const size = Math.random() * 15 + 8;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 6 + 's';
        
        // Random animation duration
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        
        container.appendChild(particle);
      }
    };

    createParticles();

    // Recreate particles every 30 seconds for variety
    const interval = setInterval(createParticles, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Background Video Container */}
      <div className="background-video-container">
        {/* You can add a video here */}
        {/* <video className="background-video" autoPlay muted loop>
          <source src="/path-to-your-video.mp4" type="video/mp4" />
        </video> */}
      </div>

      {/* Animated Particles */}
      <div className="particles-container" ref={particlesRef}>
        {/* Particles will be dynamically created here */}
      </div>

      {/* Geometric Background Shapes */}
      <div className="geometric-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <style jsx>{`
        .geometric-shapes {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          pointer-events: none;
          overflow: hidden;
        }

        .shape {
          position: absolute;
          opacity: 0.05;
          animation: rotate 20s linear infinite;
        }

        .shape-1 {
          width: 200px;
          height: 200px;
          background: linear-gradient(45deg, var(--primary-dark), var(--primary-medium));
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          top: 10%;
          left: 10%;
          animation-duration: 25s;
        }

        .shape-2 {
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, var(--primary-medium), var(--accent));
          border-radius: 50% 20% 80% 40%;
          top: 60%;
          right: 15%;
          animation-duration: 30s;
          animation-direction: reverse;
        }

        .shape-3 {
          width: 100px;
          height: 100px;
          background: linear-gradient(225deg, var(--accent), var(--primary-light));
          border-radius: 20% 80% 20% 80%;
          bottom: 20%;
          left: 20%;
          animation-duration: 35s;
        }

        .shape-4 {
          width: 120px;
          height: 120px;
          background: linear-gradient(315deg, var(--primary-light), var(--primary-dark));
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          top: 30%;
          right: 40%;
          animation-duration: 40s;
          animation-direction: reverse;
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.1);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        @media (max-width: 768px) {
          .shape {
            opacity: 0.12;
          }
          
          .shape-1, .shape-2 {
            width: 80px;
            height: 80px;
          }
          
          .shape-3, .shape-4 {
            width: 50px;
            height: 50px;
          }
        }
        
        @media (max-width: 576px) {
          .shape {
            opacity: 0.18;
          }
        }
      `}</style>
    </>
  );
};

export default BackgroundEffects;