/**
 * Microsoft Fluent Design Holographic Blue Glyphs
 * Premium Windows 11 style acrylic glyphs with depth and light
 * Author: Jonathan Sherman
 * Monaco Edition 🏎️
 */

import { LucideIcon } from 'lucide-react';

interface MicrosoftGlyphProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'destructive';
  animated?: boolean;
  className?: string;
}

export function MicrosoftGlyph({ 
  icon: Icon, 
  size = 'md', 
  variant = 'primary',
  animated = true,
  className = '' 
}: MicrosoftGlyphProps) {
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const variantStyles = {
    primary: {
      bg: 'from-[#0078D4]/20 via-[#00BCF2]/15 to-[#0078D4]/10',
      glow: 'shadow-[0_0_20px_rgba(0,188,242,0.4),0_0_40px_rgba(0,120,212,0.2),inset_0_0_20px_rgba(0,188,242,0.1)]',
      border: 'border-[#00BCF2]/40',
      icon: 'text-[#00BCF2]',
      shine: 'from-transparent via-[#00BCF2]/30 to-transparent',
    },
    accent: {
      bg: 'from-[#8764B8]/20 via-[#B146C2]/15 to-[#8764B8]/10',
      glow: 'shadow-[0_0_20px_rgba(177,70,194,0.4),0_0_40px_rgba(135,100,184,0.2),inset_0_0_20px_rgba(177,70,194,0.1)]',
      border: 'border-[#B146C2]/40',
      icon: 'text-[#B146C2]',
      shine: 'from-transparent via-[#B146C2]/30 to-transparent',
    },
    success: {
      bg: 'from-[#107C10]/20 via-[#10893E]/15 to-[#107C10]/10',
      glow: 'shadow-[0_0_20px_rgba(16,137,62,0.4),0_0_40px_rgba(16,124,16,0.2),inset_0_0_20px_rgba(16,137,62,0.1)]',
      border: 'border-[#10893E]/40',
      icon: 'text-[#10893E]',
      shine: 'from-transparent via-[#10893E]/30 to-transparent',
    },
    warning: {
      bg: 'from-[#FFB900]/20 via-[#FF8C00]/15 to-[#FFB900]/10',
      glow: 'shadow-[0_0_20px_rgba(255,140,0,0.4),0_0_40px_rgba(255,185,0,0.2),inset_0_0_20px_rgba(255,140,0,0.1)]',
      border: 'border-[#FF8C00]/40',
      icon: 'text-[#FF8C00]',
      shine: 'from-transparent via-[#FF8C00]/30 to-transparent',
    },
    destructive: {
      bg: 'from-[#D13438]/20 via-[#E81123]/15 to-[#D13438]/10',
      glow: 'shadow-[0_0_20px_rgba(232,17,35,0.4),0_0_40px_rgba(209,52,56,0.2),inset_0_0_20px_rgba(232,17,35,0.1)]',
      border: 'border-[#E81123]/40',
      icon: 'text-[#E81123]',
      shine: 'from-transparent via-[#E81123]/30 to-transparent',
    },
  };

  // Get style with fallback to primary if variant is invalid
  const style = variantStyles[variant] || variantStyles.primary;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Acrylic background with depth */}
      <div className={`
        absolute inset-0 rounded-xl
        bg-gradient-to-br ${style.bg}
        backdrop-blur-xl
        border ${style.border}
        ${style.glow}
        ${animated ? 'transition-all duration-300 hover:scale-105' : ''}
      `}>
        {/* Inner glow layer */}
        <div className="absolute inset-[2px] rounded-lg bg-gradient-to-br from-white/5 to-transparent" />
        
        {/* Light reflection */}
        <div className={`
          absolute top-0 left-0 right-0 h-1/2 rounded-t-xl
          bg-gradient-to-b from-white/10 to-transparent
          ${animated ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}
        `} />
      </div>

      {/* Animated shine effect */}
      {animated && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className={`
            absolute inset-0 -translate-x-full
            bg-gradient-to-r ${style.shine}
            animate-[shimmer_3s_ease-in-out_infinite]
            skew-x-12
          `} />
        </div>
      )}

      {/* Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className={`${iconSizes[size]} ${style.icon} drop-shadow-[0_0_8px_currentColor]`} />
      </div>

      {/* Depth shadow */}
      <div className={`
        absolute inset-0 rounded-xl
        bg-gradient-to-b from-transparent to-black/20
        ${animated ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}
      `} />
    </div>
  );
}

// Shimmer animation
const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%) skewX(-12deg);
    }
    100% {
      transform: translateX(200%) skewX(-12deg);
    }
  }
`;

// Add to global styles if needed
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}
