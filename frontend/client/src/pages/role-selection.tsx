import { motion } from "framer-motion";
import { Link } from "wouter";
import creatorIcon from "@assets/generated_images/creator_role_abstract_3d_icon.png";
import participantIcon from "@assets/generated_images/participant_role_abstract_3d_icon.png";
import { cn } from "@/lib/utils";

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Choose Your Path</h1>
        <p className="text-muted-foreground text-lg">Select how you want to interact with the protocol</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full relative z-10">
        <RoleCard 
          title="Creator" 
          description="Create polls, manage quests, and analyze project data."
          image={creatorIcon}
          href="/creator/projects"
          color="primary"
        />
        <RoleCard 
          title="Participant" 
          description="Vote on active polls, complete quests, and earn rewards."
          image={participantIcon}
          href="/participant/dashboard"
          color="secondary"
        />
      </div>
    </div>
  );
}

function RoleCard({ title, description, image, href, color }: { title: string, description: string, image: string, href: string, color: "primary" | "secondary" }) {
  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ y: -10, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative h-96 rounded-3xl overflow-hidden border border-white/10 bg-card cursor-pointer flex flex-col items-center justify-end pb-10 text-center p-6",
          color === "primary" ? "hover:border-primary/50" : "hover:border-secondary/50"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
        
        <img 
          src={image} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
        />

        <div className="relative z-20">
          <h2 className="text-3xl font-display font-bold mb-2 text-white">{title}</h2>
          <p className="text-gray-300 leading-relaxed">{description}</p>
          
          <div className={cn(
            "mt-6 py-2 px-6 rounded-full text-sm font-semibold uppercase tracking-wider transition-colors",
            color === "primary" 
              ? "bg-primary text-primary-foreground group-hover:bg-primary/90" 
              : "bg-secondary text-secondary-foreground group-hover:bg-secondary/90"
          )}>
            Enter Dashboard
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
