import React from 'react';
import { motion } from 'framer-motion';

export function BentoCard({
  children,
  className = '',
  onClick,
  hoverable = true,
  glow = false,
  expandable = false,
  isExpanded = false,
  onToggleExpand,
}) {
  return (
    <motion.div
      layout={expandable}
      whileHover={
        hoverable
          ? {
              y: -2,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      onClick={onClick}
      className={`bento-card bento-card-interactive rounded-2xl p-5 relative overflow-hidden transition-colors ${
        glow ? 'border-brand-500/30 shadow-glow' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
