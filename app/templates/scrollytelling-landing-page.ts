interface ScrollytellingContent {
  hero: {
    title: string
    subtitle: string
    cta: string
  }
  transformation: {
    title: string
    description: string
  }
  distribution: {
    title: string
    description: string
  }
  results: {
    title: string
    description: string
    metric1: string
    metric1Value: string
    metric2: string
    metric2Value: string
  }
  portal: {
    title: string
    description: string
    cta: string
  }
}

interface ScrollytellingColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export const generateScrollytellingLandingPage = (
  content: ScrollytellingContent,
  colors: ScrollytellingColors,
  canvaDesignUrl: string,
  font: string = 'Playfair Display'
) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.hero.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/ScrollTrigger.min.js"></script>
    <style>
        :root {
            --primary: ${colors.primary};
            --secondary: ${colors.secondary};
            --accent: ${colors.accent};
            --background: ${colors.background};
            --text: ${colors.text};
            --font-display: '${font}', serif;
            --font-body: 'Inter', sans-serif;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-body);
            color: var(--text);
            background-color: var(--background);
            overflow-x: hidden;
        }

        h1, h2, h3 {
            font-family: var(--font-display);
            font-weight: 700;
        }

        .section {
            position: relative;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }

        .content-wrapper {
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
            position: relative;
            z-index: 10;
        }

        /* Hero Section */
        .hero {
            background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/Scenario1.jpeg') center/cover;
        }

        .hero-title {
            font-size: clamp(3rem, 8vw, 6rem);
            margin-bottom: 1.5rem;
            background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 50%, var(--primary) 100%);
            background-size: 200% 100%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
            0% { background-position: -100% 0; }
            100% { background-position: 100% 0; }
        }

        .hero-subtitle {
            font-size: clamp(1.2rem, 3vw, 2rem);
            margin-bottom: 3rem;
            opacity: 0.9;
        }

        .floating-design {
            width: min(400px, 90vw);
            height: auto;
            margin: 3rem auto;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
            position: relative;
        }

        .floating-design img {
            width: 100%;
            height: auto;
            display: block;
        }

        .magic-glow {
            filter: drop-shadow(0 0 30px var(--primary));
        }

        .cta-button {
            display: inline-block;
            padding: 1.2rem 3rem;
            font-size: 1.2rem;
            font-weight: 600;
            color: white;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border: none;
            border-radius: 50px;
            text-decoration: none;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        /* Transformation Section */
        .transformation {
            background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/Scenario2.jpeg') center/cover;
        }

        .flow-diagram-container {
            max-width: 1000px;
            margin: 3rem auto;
            padding: 2rem;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .flow-diagram {
            width: 100%;
            height: auto;
            filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.3));
        }

        /* Distribution Section */
        .distribution {
            background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/Scenario3.jpeg') center/cover;
        }

        .platform-icons {
            display: flex;
            justify-content: center;
            gap: 3rem;
            margin-top: 3rem;
            flex-wrap: wrap;
        }

        .platform-icon {
            width: 100px;
            height: 100px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            border: 2px solid var(--accent);
        }

        /* Results Section */
        .results {
            background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/Scenario4.jpeg') center/cover;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .metric-card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.2);
        }

        .metric-value {
            font-size: 3rem;
            font-weight: 700;
            color: var(--accent);
            margin-bottom: 0.5rem;
        }

        /* Portal Section */
        .portal {
            background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/Scenario5.png') center/cover;
        }

        /* Magic Particles */
        .particles {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
        }

        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--accent);
            border-radius: 50%;
            opacity: 0;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
            .section {
                padding: 1rem;
            }
            
            .platform-icons {
                gap: 1.5rem;
            }
            
            .platform-icon {
                width: 80px;
                height: 80px;
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <!-- Hero Section: The Summoning -->
    <section class="section hero">
        <div class="particles" id="hero-particles"></div>
        <div class="content-wrapper">
            <h1 class="hero-title">${content.hero.title}</h1>
            <p class="hero-subtitle">${content.hero.subtitle}</p>
            <div class="floating-design magic-glow">
                <img src="${canvaDesignUrl}" alt="Campaign Design">
            </div>
            <a href="#portal" class="cta-button">${content.hero.cta}</a>
        </div>
    </section>

    <!-- Section 2: The Flow -->
    <section class="section transformation">
        <div class="content-wrapper">
            <h2 class="section-title">The Marketing Magic Flow</h2>
            <p class="section-description">See how your designs transform into powerful campaigns</p>
            <div class="flow-diagram-container">
                <svg viewBox="0 0 800 600" class="flow-diagram" xmlns="http://www.w3.org/2000/svg">
                    <!-- Definitions for gradients and filters -->
                    <defs>
                        <!-- Lightning gradient -->
                        <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#60A5FA" stop-opacity="1">
                                <animate attributeName="stop-color" values="#60A5FA;#A78BFA;#60A5FA" dur="3s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="100%" stop-color="#A78BFA" stop-opacity="1">
                                <animate attributeName="stop-color" values="#A78BFA;#60A5FA;#A78BFA" dur="3s" repeatCount="indefinite" />
                            </stop>
                        </linearGradient>

                        <!-- Glow filter -->
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>

                        <!-- Electric pulse filter -->
                        <filter id="electric-glow">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
                            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
                            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur3" />
                            <feMerge>
                                <feMergeNode in="blur3" />
                                <feMergeNode in="blur2" />
                                <feMergeNode in="blur1" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <!-- Canva Box -->
                    <g transform="translate(250, 50)">
                        <rect x="0" y="0" width="300" height="80" rx="16" fill="rgba(0,0,0,0.5)" stroke="url(#lightning-gradient)" stroke-width="2" filter="url(#glow)" />
                        <text x="150" y="50" font-size="32" font-family="Arial, sans-serif" fill="#00C4CC" text-anchor="middle" font-weight="bold">Canva</text>
                    </g>

                    <!-- Lightning Arrow from Canva to OpenAI -->
                    <path
                        d="M 400 130 
                           L 380 170 
                           L 390 170 
                           L 370 210
                           L 380 210
                           L 360 250
                           L 400 220
                           L 410 220
                           L 420 190
                           L 430 190
                           L 410 170
                           L 420 170
                           Z"
                        fill="url(#lightning-gradient)"
                        filter="url(#electric-glow)"
                        opacity="0.9"
                    >
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                    </path>

                    <!-- OpenAI Box -->
                    <g transform="translate(250, 250)">
                        <rect x="0" y="0" width="300" height="80" rx="16" fill="rgba(0,0,0,0.5)" stroke="url(#lightning-gradient)" stroke-width="2" filter="url(#glow)" />
                        <text x="150" y="50" font-size="28" font-family="Arial, sans-serif" fill="#10A37F" text-anchor="middle" font-weight="bold">OpenAI</text>
                    </g>

                    <!-- Triple Lightning Split -->
                    <!-- Left Lightning to Mailchimp -->
                    <path
                        d="M 300 330
                           L 280 360
                           L 290 360
                           L 270 390
                           L 280 390
                           L 250 430
                           L 280 410
                           L 290 410
                           L 300 380
                           L 310 380
                           L 300 360
                           L 310 360
                           Z"
                        fill="url(#lightning-gradient)"
                        filter="url(#electric-glow)"
                        opacity="0.9"
                    >
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="0.5s" repeatCount="indefinite" />
                    </path>

                    <!-- Center Lightning to GitHub -->
                    <path
                        d="M 400 330
                           L 385 370
                           L 395 370
                           L 380 410
                           L 390 410
                           L 375 450
                           L 400 420
                           L 410 420
                           L 420 390
                           L 430 390
                           L 415 370
                           L 425 370
                           Z"
                        fill="url(#lightning-gradient)"
                        filter="url(#electric-glow)"
                        opacity="0.9"
                    >
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="0.25s" repeatCount="indefinite" />
                    </path>

                    <!-- Right Lightning to Notion -->
                    <path
                        d="M 500 330
                           L 490 360
                           L 500 360
                           L 490 390
                           L 500 390
                           L 480 430
                           L 510 410
                           L 520 410
                           L 530 380
                           L 540 380
                           L 520 360
                           L 530 360
                           Z"
                        fill="url(#lightning-gradient)"
                        filter="url(#electric-glow)"
                        opacity="0.9"
                    >
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="0.75s" repeatCount="indefinite" />
                    </path>

                    <!-- Mailchimp Box -->
                    <g transform="translate(100, 450)">
                        <rect x="0" y="0" width="200" height="80" rx="16" fill="rgba(0,0,0,0.5)" stroke="url(#lightning-gradient)" stroke-width="2" filter="url(#glow)" />
                        <text x="100" y="50" font-size="24" font-family="Arial, sans-serif" fill="#FFE01B" text-anchor="middle" font-weight="bold">Mailchimp</text>
                    </g>

                    <!-- GitHub Box -->
                    <g transform="translate(300, 450)">
                        <rect x="0" y="0" width="200" height="80" rx="16" fill="rgba(0,0,0,0.5)" stroke="url(#lightning-gradient)" stroke-width="2" filter="url(#glow)" />
                        <text x="100" y="50" font-size="24" font-family="Arial, sans-serif" fill="#FFFFFF" text-anchor="middle" font-weight="bold">GitHub</text>
                    </g>

                    <!-- Notion Box -->
                    <g transform="translate(500, 450)">
                        <rect x="0" y="0" width="200" height="80" rx="16" fill="rgba(0,0,0,0.5)" stroke="url(#lightning-gradient)" stroke-width="2" filter="url(#glow)" />
                        <text x="100" y="50" font-size="24" font-family="Arial, sans-serif" fill="#FFFFFF" text-anchor="middle" font-weight="bold">Notion</text>
                    </g>

                    <!-- Animated energy rings -->
                    <g transform="translate(400, 290)">
                        <circle r="40" fill="none" stroke="url(#lightning-gradient)" stroke-width="1" opacity="0">
                            <animate attributeName="r" values="0;60" dur="3s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0" dur="3s" repeatCount="indefinite" />
                        </circle>
                    </g>
                </svg>
            </div>
        </div>
    </section>

    <!-- Section 3: The Distribution Spell -->
    <section class="section distribution">
        <div class="content-wrapper">
            <h2 class="section-title">${content.distribution.title}</h2>
            <p class="section-description">${content.distribution.description}</p>
            <div class="platform-icons">
                <div class="platform-icon">📧</div>
                <div class="platform-icon">📝</div>
                <div class="platform-icon">🌐</div>
            </div>
        </div>
    </section>

    <!-- Section 4: The Enchanted Results -->
    <section class="section results">
        <div class="content-wrapper">
            <h2 class="section-title">${content.results.title}</h2>
            <p class="section-description">${content.results.description}</p>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${content.results.metric1Value}</div>
                    <p>${content.results.metric1}</p>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${content.results.metric2Value}</div>
                    <p>${content.results.metric2}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section: Enter the Portal -->
    <section class="section portal" id="portal">
        <div class="content-wrapper">
            <h2 class="section-title">${content.portal.title}</h2>
            <p class="section-description">${content.portal.description}</p>
            <a href="#" class="cta-button" onclick="alert('Campaign activated!')">${content.portal.cta}</a>
        </div>
    </section>

    <script>
        // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger);

        // Floating design animation
        gsap.to(".floating-design", {
            y: -20,
            rotation: 5,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });

        // Section title animations
        gsap.utils.toArray(".section-title").forEach(title => {
            gsap.from(title, {
                opacity: 0,
                y: 50,
                duration: 1,
                scrollTrigger: {
                    trigger: title,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Flow diagram animation
        gsap.from(".flow-diagram-container", {
            opacity: 0,
            scale: 0.8,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".flow-diagram-container",
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });

        // Platform icons animation
        ScrollTrigger.batch(".platform-icon", {
            onEnter: elements => {
                gsap.from(elements, {
                    scale: 0,
                    rotation: -180,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: "back.out(1.7)"
                });
            },
            start: "top 85%"
        });

        // Parallax effect for sections
        gsap.utils.toArray(".section").forEach((section, i) => {
            const bg = section;
            gsap.to(bg, {
                backgroundPosition: \`50% \${-50 * (i + 1)}%\`,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

        // Particle system
        function createParticle(container) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            container.appendChild(particle);
            
            const startX = Math.random() * window.innerWidth;
            const startY = window.innerHeight + 10;
            
            gsap.set(particle, { x: startX, y: startY });
            
            gsap.to(particle, {
                y: -10,
                x: startX + (Math.random() - 0.5) * 200,
                opacity: 1,
                duration: 3 + Math.random() * 2,
                ease: "none",
                onComplete: () => {
                    particle.remove();
                    createParticle(container);
                }
            });
            
            gsap.to(particle, {
                opacity: 0,
                duration: 1,
                delay: 2 + Math.random()
            });
        }

        // Initialize particles
        const heroParticles = document.getElementById('hero-particles');
        for (let i = 0; i < 20; i++) {
            setTimeout(() => createParticle(heroParticles), i * 200);
        }

        // Smooth scroll for CTA
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Add premium feel with subtle animations
        gsap.to(".cta-button", {
            scale: 1.05,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
    </script>
</body>
</html>`;
};