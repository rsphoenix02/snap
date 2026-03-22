"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Animation variants for the container to stagger children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Animation variants for each grid item
// Adapted from original: replaced spring physics with ease curve
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

/**
 * Props for the BentoGridShowcase component.
 * Each prop represents a "slot" in the grid.
 * Adapted from original 6-slot layout to 4 slots for SNAP features.
 */
interface BentoGridShowcaseProps {
  /** Slot for the tall card (e.g., main feature) */
  primary: React.ReactNode;
  /** Slot for the top-right card */
  secondary: React.ReactNode;
  /** Slot for the bottom-right card */
  tertiary: React.ReactNode;
  /** Slot for the wide bottom card */
  wide: React.ReactNode;
  /** Optional class names for the grid container */
  className?: string;
}

/**
 * A responsive, animated bento grid layout component.
 * It arranges four content slots in an asymmetric bento layout.
 * Adapted from ui_components/bento_grid.md BentoGridShowcase.
 */
export const BentoGridShowcase = ({
  primary,
  secondary,
  tertiary,
  wide,
  className,
}: BentoGridShowcaseProps) => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={cn(
        // Core grid layout: 1 col on mobile, 2 on desktop
        "grid w-full grid-cols-1 gap-6 md:grid-cols-2",
        // Defines 2 explicit rows on medium screens and up
        "md:grid-rows-2",
        // Use minmax to ensure cards can grow but have a minimum height
        "auto-rows-[minmax(180px,auto)]",
        className
      )}
    >
      {/* Slot 1: Primary (Spans 2 rows) */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-2">
        {primary}
      </motion.div>

      {/* Slot 2: Secondary */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
        {secondary}
      </motion.div>

      {/* Slot 3: Tertiary */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
        {tertiary}
      </motion.div>

      {/* Slot 4: Wide (Spans 2 cols) */}
      <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-1">
        {wide}
      </motion.div>
    </motion.section>
  );
};
