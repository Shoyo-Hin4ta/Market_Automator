'use client'

import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { ArrowRight, Sparkles, Zap, Globe, Mail, FileText } from 'lucide-react'
import MarketingWizardFlow from '@/app/components/ui/MarketingWizardFlow'
import '@/app/styles/magical-theme.css'

interface LandingPageContentProps {
  isAuthenticated: boolean
}

export default function LandingPageContent({ isAuthenticated }: LandingPageContentProps) {

  return (
    <div className="overflow-x-hidden text-white">
      <style jsx global>{`
        :root {
          --dark-gradient: linear-gradient(135deg, var(--thunder-dark) 0%, var(--thunder-purple) 50%, var(--wizard-purple-darker) 100%);
        }

        body {
          background: var(--dark-gradient);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        .hero-title {
          animation: fadeInUp 1s ease-out;
        }

        .hero-subtitle {
          animation: fadeInUp 1s ease-out 0.2s both;
        }

        .hero-buttons {
          animation: fadeInUp 1s ease-out 0.4s both;
        }

        .floating-orb {
          filter: drop-shadow(0 0 30px var(--wizard-glow));
          animation: float 3s ease-in-out infinite;
        }

        .hero-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, var(--wizard-glow) 0%, transparent 70%);
          filter: blur(80px);
          animation: pulse-glow 4s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        .section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reveal-section {
          animation: fadeIn 0.8s ease-out;
        }

        .sparkle-effect {
          position: absolute;
          width: 2px;
          height: 2px;
          background: var(--wizard-gold);
          border-radius: 50%;
          pointer-events: none;
          animation: sparkle 3s linear infinite;
        }

        .feature-card {
          background: var(--card-bg);
          border: 1px solid var(--border-magical);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease-out;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: var(--wizard-gold);
          box-shadow: 0 20px 40px var(--wizard-glow);
        }

        .feature-card:nth-child(1) {
          animation-delay: 0.1s;
        }

        .feature-card:nth-child(2) {
          animation-delay: 0.2s;
        }

        .feature-card:nth-child(3) {
          animation-delay: 0.3s;
        }
      `}</style>

      {/* Hero Section: The Summoning */}
      <section className="section hero relative magical-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at top right, rgba(251, 191, 36, 0.1), transparent 50%)' }}></div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at bottom left, rgba(102, 126, 234, 0.1), transparent 50%)' }}></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="hero-title text-6xl md:text-8xl font-bold mb-6">
            <span className="shimmer-text">Marketing Wizard</span>
          </h1>
          <p className="hero-subtitle text-2xl md:text-3xl mb-8" style={{ color: 'var(--text-secondary)' }}>
            Transform your Canva designs into magical marketing campaigns
          </p>
          <div className="floating-orb inline-block relative">
            <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center relative z-10" style={{ background: 'linear-gradient(135deg, var(--wizard-gold) 0%, var(--wizard-gold-light) 100%)' }}>
              <Sparkles className="w-16 h-16 md:w-24 md:h-24 text-white" />
            </div>
          </div>
          <div className="hero-buttons mt-12 space-x-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="btn-magical golden-glow" style={{ background: 'linear-gradient(135deg, var(--wizard-gold) 0%, var(--wizard-gold-dark) 100%)', border: 'none', color: 'white' }}>
                  Go to Dashboard <ArrowRight className="ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="btn-magical golden-glow" style={{ background: 'linear-gradient(135deg, var(--wizard-gold) 0%, var(--wizard-gold-dark) 100%)', border: 'none', color: 'white' }}>
                    Start Your Journey <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="btn-magical" style={{ borderColor: 'var(--wizard-gold)', color: 'var(--wizard-gold)' }}>
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: The Marketing Magic Flow */}
      <section className="section reveal-section relative" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, rgba(102, 126, 234, 0.05) 50%, #0a0a0a 100%)' }}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1), transparent 70%)' }}></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 shimmer-text pb-2">The Marketing Magic Flow</h2>
          <p className="text-xl md:text-2xl mb-12" style={{ color: 'var(--text-secondary)' }}>
            See how your designs transform into powerful campaigns
          </p>
          <MarketingWizardFlow />
        </div>
      </section>

      {/* Section 3: The Distribution Spell */}
      <section className="section reveal-section relative" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, rgba(251, 191, 36, 0.03) 100%)' }}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15), transparent 60%)' }}></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 shimmer-text">The Distribution Spell</h2>
          <p className="text-xl md:text-2xl mb-12" style={{ color: 'var(--text-secondary)' }}>
            Cast your campaigns across multiple realms with a single incantation
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 card-magical">
                <Mail className="w-12 h-12" style={{ color: 'var(--wizard-gold)' }} />
              </div>
              <span className="text-lg">Mailchimp</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 card-magical">
                <FileText className="w-12 h-12" style={{ color: 'var(--wizard-gold)' }} />
              </div>
              <span className="text-lg">Notion</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 card-magical">
                <Globe className="w-12 h-12" style={{ color: 'var(--wizard-gold)' }} />
              </div>
              <span className="text-lg">GitHub Pages</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: The Enchanted Results */}
      <section className="section reveal-section relative" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, rgba(102, 126, 234, 0.08) 50%, rgba(251, 191, 36, 0.05) 100%)' }}>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 shimmer-text">The Enchanted Results</h2>
          <p className="text-xl md:text-2xl mb-12" style={{ color: 'var(--text-secondary)' }}>
            Witness the power of your campaigns through mystical analytics
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="feature-card p-8 rounded-lg">
              <h3 className="text-4xl font-bold mb-2" style={{ color: 'var(--wizard-gold)' }}>95%</h3>
              <p className="text-lg">Open Rate Enchantment</p>
            </div>
            <div className="feature-card p-8 rounded-lg">
              <h3 className="text-4xl font-bold mb-2" style={{ color: 'var(--wizard-gold)' }}>10x</h3>
              <p className="text-lg">Engagement Amplification</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section: Enter the Portal */}
      <section className="section reveal-section relative magical-gradient">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.15), transparent 50%)' }}></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 shimmer-text">Enter the Portal</h2>
          <p className="text-xl md:text-2xl mb-12" style={{ color: 'var(--text-secondary)' }}>
            Begin your transformation into a Marketing Wizard today
          </p>
          <div className="space-y-6">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="btn-magical golden-glow text-lg px-8 py-6" style={{ background: 'linear-gradient(135deg, var(--wizard-gold) 0%, var(--wizard-gold-dark) 100%)', border: 'none', color: 'white' }}>
                  Go to Dashboard <ArrowRight className="ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg" className="btn-magical golden-glow text-lg px-8 py-6" style={{ background: 'linear-gradient(135deg, var(--wizard-gold) 0%, var(--wizard-gold-dark) 100%)', border: 'none', color: 'white' }}>
                  Start Now <ArrowRight className="ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}