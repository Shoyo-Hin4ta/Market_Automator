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

        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .feature-card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.2);
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

    <!-- Section 2: The Transformation -->
    <section class="section transformation">
        <div class="content-wrapper">
            <h2 class="section-title">${content.transformation.title}</h2>
            <p class="section-description">${content.transformation.description}</p>
            <div class="feature-grid">
                <div class="feature-card">
                    <h3>✨ AI Magic</h3>
                    <p>Content that resonates with your audience</p>
                </div>
                <div class="feature-card">
                    <h3>🎨 Design Alchemy</h3>
                    <p>Transform static designs into dynamic experiences</p>
                </div>
                <div class="feature-card">
                    <h3>🌐 Multi-Channel</h3>
                    <p>Deploy everywhere with one click</p>
                </div>
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

        // Feature cards stagger animation
        ScrollTrigger.batch(".feature-card", {
            onEnter: elements => {
                gsap.from(elements, {
                    opacity: 0,
                    y: 100,
                    stagger: 0.15,
                    duration: 1,
                    ease: "power3.out"
                });
            },
            start: "top 85%"
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