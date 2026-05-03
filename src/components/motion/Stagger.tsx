"use client";

import { motion } from "framer-motion";
import { motionVariants } from "@/lib/tokens";
import { cn } from "@/lib/utils";

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function Stagger({ children, className, delay = 0 }: StaggerProps) {
  return (
    <motion.div
      variants={motionVariants.stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delayChildren: delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
