'use client'

import React, { useState, useEffect } from 'react';
import { Brain, Mail, FileText, Globe } from 'lucide-react';

const MarketingWizardFlow = () => {
  const [activeFlow, setActiveFlow] = useState(0);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlow((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      delay: Math.random() * 3,
      duration: 2.5 + Math.random() * 1.5
    }));
    setParticles(newParticles);
  }, []);

  const platforms = [
    { name: "Mailchimp", icon: Mail },
    { name: "Notion", icon: FileText },
    { name: "GitHub", icon: Globe }
  ];

  return (
    <div className="relative w-full px-4 md:px-8 h-[600px] flex items-center justify-center overflow-hidden">
      <style jsx global>{`
        @keyframes flow-particle-straight {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(250px, 0);
            opacity: 0;
          }
        }

        @keyframes flow-particle-up {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(200px, -80px);
            opacity: 0;
          }
        }

        @keyframes flow-particle-down {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(200px, 80px);
            opacity: 0;
          }
        }

        @keyframes node-glow {
          0%, 100% {
            box-shadow: 
              0 0 30px rgba(251, 191, 36, 0.3),
              0 0 60px rgba(251, 191, 36, 0.2),
              inset 0 0 20px rgba(255, 255, 255, 0.05);
            transform: scale(1);
          }
          50% {
            box-shadow: 
              0 0 50px rgba(251, 191, 36, 0.5),
              0 0 100px rgba(251, 191, 36, 0.3),
              inset 0 0 30px rgba(255, 255, 255, 0.1);
            transform: scale(1.02);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .platform-active {
          animation: node-glow 2s ease-in-out infinite;
          border-color: #fbbf24;
        }

        .particle-stream {
          position: absolute;
          width: 200px;
          height: 2px;
          transform-origin: left center;
          pointer-events: none;
        }

        .flow-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #fbbf24;
          border-radius: 50%;
          top: -1px;
          left: 0;
          box-shadow: 
            0 0 6px #fbbf24,
            0 0 12px rgba(251, 191, 36, 0.5);
        }

        .flow-particle-straight {
          animation: flow-particle-straight var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }

        .flow-particle-up {
          animation: flow-particle-up var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }

        .flow-particle-down {
          animation: flow-particle-down var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }

        .node {
          width: 100px;
          height: 100px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: float 4s ease-in-out infinite;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(251, 191, 36, 0.2);
          background: linear-gradient(135deg, rgba(26, 8, 39, 0.9) 0%, rgba(15, 5, 23, 0.95) 100%);
          backdrop-filter: blur(10px);
        }

        .node:hover {
          transform: scale(1.05) translateY(-5px);
          border-color: #fbbf24;
          box-shadow: 0 20px 40px rgba(251, 191, 36, 0.3);
        }

        .node-active {
          animation: node-glow 2s ease-in-out infinite;
          border-color: #fbbf24;
        }

        .node-icon {
          color: #fbbf24;
          filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.5));
        }


        .platform-card {
          width: 100px;
          height: 100px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.3s ease;
          border: 1px solid rgba(251, 191, 36, 0.2);
          backdrop-filter: blur(10px);
          cursor: pointer;
          background: linear-gradient(135deg, rgba(26, 8, 39, 0.9) 0%, rgba(15, 5, 23, 0.95) 100%);
          animation: float 4s ease-in-out infinite;
        }

        .platform-card:hover {
          transform: scale(1.05) translateY(-5px);
          border-color: #fbbf24;
          box-shadow: 0 20px 40px rgba(251, 191, 36, 0.3);
        }
        
        .platform-card:nth-child(1) {
          animation-delay: 0s;
        }
        
        .platform-card:nth-child(2) {
          animation-delay: 0.5s;
        }
        
        .platform-card:nth-child(3) {
          animation-delay: 1s;
        }

        .canva-logo {
          width: 80px;
          height: 32px;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .arrow-track {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(251, 191, 36, 0.05) 20%,
            rgba(251, 191, 36, 0.05) 80%,
            transparent 100%
          );
        }
      `}</style>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative flex items-center justify-between w-full max-w-4xl transform scale-[0.6] sm:scale-[0.7] md:scale-[0.85] lg:scale-100">
        {/* Canva Node */}
        <div className="relative">
          <div className={`node ${activeFlow === 0 ? 'node-active' : ''}`}>
            <div className="flex flex-col items-center justify-center">
              <svg className="w-12 h-12 mb-1" viewBox="0 0 100 100" fill="none">
                <circle cx="30" cy="50" r="12" fill="#00C4CC" opacity="0.9"/>
                <circle cx="50" cy="50" r="12" fill="#7D2AE8" opacity="0.9"/>
                <circle cx="70" cy="50" r="12" fill="#FF0084" opacity="0.9"/>
              </svg>
              <span className="text-xs font-medium" style={{ color: '#fbbf24' }}>Canva</span>
            </div>
          </div>
          <p className="text-center mt-2 text-xs font-medium" style={{ color: '#d1d5db' }}>Your Designs</p>
        </div>

        {/* First Arrow Track (Canva to AI) */}
        <div className="absolute hidden sm:block" style={{ left: '120px', top: '50%', transform: 'translateY(-50%)', width: 'calc(50% - 120px)', height: '2px' }}>
          <div className="arrow-track"></div>
          {(activeFlow === 1 || activeFlow === 0) && particles.slice(0, 10).map((particle) => (
            <div
              key={`p1-${particle.id}`}
              className="flow-particle flow-particle-straight"
              style={{
                '--delay': `${particle.delay}s`,
                '--duration': `${particle.duration}s`
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* AI Node */}
        <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className={`node ${activeFlow === 1 || activeFlow === 2 ? 'node-active' : ''}`}>
            <Brain className="w-10 h-10 mb-2 node-icon" />
            <span className="text-xs font-medium" style={{ color: '#fbbf24' }}>AI Magic</span>
          </div>
          <p className="text-center mt-2 text-xs font-medium" style={{ color: '#d1d5db' }}>Smart Processing</p>

          {/* Three particle streams from AI to platforms */}
          {activeFlow >= 2 && (
            <div className="absolute hidden sm:block" style={{ left: '100%', top: '50%', transform: 'translateY(-50%)', width: '200px', height: '200px' }}>
              {/* Top stream to Mailchimp */}
              <div className="particle-stream" style={{ transform: 'rotate(-20deg)', transformOrigin: '0 0', left: '0', top: '50%' }}>
                {particles.slice(10, 20).map((particle) => (
                  <div
                    key={`mail-${particle.id}`}
                    className="flow-particle flow-particle-up"
                    style={{
                      '--delay': `${particle.delay}s`,
                      '--duration': `${particle.duration}s`
                    } as React.CSSProperties}
                  />
                ))}
              </div>

              {/* Middle stream to Notion */}
              <div className="particle-stream" style={{ transform: 'rotate(0deg)', left: '0', top: '50%' }}>
                {particles.slice(20, 30).map((particle) => (
                  <div
                    key={`notion-${particle.id}`}
                    className="flow-particle flow-particle-straight"
                    style={{
                      '--delay': `${particle.delay * 0.8}s`,
                      '--duration': `${particle.duration}s`
                    }}
                  />
                ))}
              </div>

              {/* Bottom stream to GitHub */}
              <div className="particle-stream" style={{ transform: 'rotate(20deg)', transformOrigin: '0 0', left: '0', top: '50%' }}>
                {particles.slice(30, 40).map((particle) => (
                  <div
                    key={`github-${particle.id}`}
                    className="flow-particle flow-particle-down"
                    style={{
                      '--delay': `${particle.delay * 1.2}s`,
                      '--duration': `${particle.duration}s`
                    }}
                  />
                ))}
              </div>
          </div>
        )}
        </div>


        {/* Platform Stack */}
        <div className="relative" style={{ marginLeft: 'auto' }}>
          <div className="flex flex-col gap-4">
            {platforms.map((platform, index) => (
              <div 
                key={platform.name}
                className={`platform-card fade-in ${activeFlow >= 3 ? 'platform-active' : ''}`}
                style={{ 
                  animationDelay: activeFlow >= 3 ? `${index * 0.15}s` : '10s',
                  opacity: activeFlow >= 3 ? 1 : 0.3
                }}
              >
                <platform.icon className="w-10 h-10 mb-2 node-icon" />
                <span className="text-xs font-medium" style={{ color: '#fbbf24' }}>
                  {platform.name}
                </span>
              </div>
            ))}
          </div>
          <p className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap" style={{ color: '#d1d5db' }}>Auto-Deploy</p>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-3">
          {[0, 1, 2].map((phase) => (
            <div
              key={phase}
              className={`w-2 h-2 transition-all duration-500 rounded-full ${
                activeFlow === phase || (phase === 2 && activeFlow === 3)
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-400/30 scale-150' 
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketingWizardFlow;