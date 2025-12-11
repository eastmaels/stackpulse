import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Layers } from "lucide-react";
import heroImg from "@assets/generated_images/abstract_blockchain_voting_visualization_dark_theme.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-display font-bold text-gradient">
            ClarityVote
          </div>
          <div className="flex gap-4">
            <Link href="/role-selection">
              <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Launch App
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Decentralized <br />
              <span className="text-gradient">Consensus</span> <br />
              Layer
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-lg">
              Build, deploy, and manage verifiable polls on Stacks using Clarity smart contracts. Secure, transparent, and immutable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/role-selection">
                <Button size="lg" className="text-lg px-8 h-12 bg-primary hover:bg-primary/90">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 h-12">
                Documentation
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
            <img 
              src={heroImg} 
              alt="Platform Visualization" 
              className="relative rounded-2xl border border-white/10 shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Features - Scroll Reveal */}
      <FeatureSection 
        title="Verifiable Logic"
        description="Every vote is a transaction on the Stacks blockchain, secured by Bitcoin."
        icon={ShieldCheck}
        align="left"
      />
      
      <FeatureSection 
        title="Quest Modules"
        description="Incentivize participation with built-in questing and reward mechanisms."
        icon={CheckCircle2}
        align="right"
      />
      
      <FeatureSection 
        title="Multi-Chain Ready"
        description="Designed to be agnostic, deploy your logic across supported layers."
        icon={Layers}
        align="left"
      />

      <footer className="py-12 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground">
          <p>© 2025 ClarityVote. Built on Stacks.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureSection({ title, description, icon: Icon, align }: { title: string, description: string, icon: any, align: 'left' | 'right' }) {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className={`flex flex-col md:flex-row gap-12 items-center ${align === 'right' ? 'md:flex-row-reverse' : ''}`}
        >
          <div className="flex-1">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 text-secondary border border-secondary/20">
              <Icon className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-display font-bold mb-4">{title}</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">{description}</p>
          </div>
          <div className="flex-1 w-full h-80 bg-muted/30 rounded-3xl border border-white/5 flex items-center justify-center relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 group-hover:opacity-100 transition-opacity duration-500" />
             {/* Abstract placeholder visual */}
             <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/30 animate-[spin_10s_linear_infinite]" />
             <div className="absolute w-20 h-20 rounded-full bg-primary/20 blur-xl" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
