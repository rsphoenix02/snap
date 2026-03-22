"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

interface BentoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export function BentoCard({ title, description, icon, className }: BentoCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-8 transition-colors duration-300 hover:border-zinc-700 hover:bg-zinc-900/80",
        className
      )}
    >
      <div className="relative z-10">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-red-500/5 blur-3xl" />
      </div>
    </motion.div>
  );
}

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={cn(
        "grid w-full grid-cols-1 gap-4 md:grid-cols-2",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
