
import React, { useState, useEffect } from 'react';
import { Shield, Eye, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

export function Logo({ size = 'md', className, animated = true }: LogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger initial animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Handle hover animation cycle
  useEffect(() => {
    if (isHovered && animated) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isHovered, animated]);

  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-3 select-none transition-all duration-500",
        isHovered && "scale-105",
        isLoaded && "translate-y-0 opacity-100",
        !isLoaded && "translate-y-3 opacity-0",
        sizeClasses[size],
        className
      )}
      onMouseEnter={() => animated && setIsHovered(true)}
      onMouseLeave={() => animated && setIsHovered(false)}
    >
      <div className="relative">
        {/* Animated background glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-500",
          isHovered 
            ? "blur-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 opacity-80 scale-150" 
            : "blur-md bg-gradient-to-r from-indigo-600 to-purple-500 opacity-50 scale-110"
        )}></div>
        
        {/* Particles effect (visible on hover) */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i}
            className={cn(
              "absolute h-1 w-1 rounded-full bg-white transition-all duration-700",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            style={{
              top: `${15 + Math.random() * 70}%`,
              left: `${15 + Math.random() * 70}%`,
              transform: isHovered ? `translate(${(Math.random() - 0.5) * 30}px, ${(Math.random() - 0.5) * 30}px)` : 'none',
              boxShadow: '0 0 4px 2px rgba(255,255,255,0.8)',
              transitionDelay: `${i * 50}ms`,
            }}
          />
        ))}
        
        {/* Main shield background with 3D effect */}
        <div className={cn(
          "relative bg-gradient-to-br text-white p-1.5 rounded-full transition-all duration-500",
          isHovered 
            ? "from-indigo-500 via-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/50 rotate-6" 
            : "from-indigo-600 to-purple-600 rotate-0"
        )}>
          {isHovered ? (
            <ShieldCheck className="h-full w-full drop-shadow-lg" strokeWidth={2.5} />
          ) : (
            <Shield className="h-full w-full drop-shadow-md" strokeWidth={2.5} />
          )}
        </div>
        
        {/* Center icon with animation */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white transition-all duration-300">
          <div className={cn(
            "transition-all duration-500 flex items-center justify-center",
            isAnimating ? "rotate-180 scale-110" : "",
            isHovered && !isAnimating ? "scale-110" : ""
          )}>
            {isHovered ? (
              <Lock 
                className={cn(
                  "h-2/3 w-2/3 transition-all duration-300",
                  isAnimating && "animate-pulse"
                )} 
                strokeWidth={3} 
              />
            ) : (
              <Eye 
                className="h-2/3 w-2/3 transition-all duration-300" 
                strokeWidth={3} 
              />
            )}
          </div>
        </div>
        
        {/* Inner glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-700 opacity-0",
          isHovered && "opacity-50 animate-pulse"
        )}
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
          }}
        ></div>
      </div>
      
      {/* Logo text with enhanced 3D and metallic effect - REMOVED "Guard" from text */}
      <div className={cn(
        "font-bold leading-none transition-all duration-500",
        isHovered ? "translate-x-0.5" : ""
      )}>
        <div className={cn(
          "text-transparent bg-clip-text tracking-tight relative font-[900]",
          isHovered 
            ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-400" 
            : "bg-gradient-to-r from-indigo-600 to-purple-500"
        )}>
          <span className="relative">
            PII
            
            {/* Top light reflection */}
            <span className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white/30 to-transparent opacity-70"></span>
            
            {/* Bottom reflection */}
            <span className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white/10 to-transparent opacity-70"></span>
          </span>
        </div>
        
        {/* Subtitle with neon effect */}
        <div className={cn(
          "text-[0.6em] font-medium tracking-wider mt-0.5 transition-all duration-300",
          isHovered ? "text-fuchsia-400 tracking-[0.15em]" : "text-indigo-400 tracking-wider"
        )}>
          PII Guard
        </div>
        
        {/* Animated underline with glow */}
        <div className={cn(
          "h-0.5 mt-0.5 transition-all duration-500 rounded-full",
          isHovered 
            ? "opacity-100 w-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent shadow-sm shadow-fuchsia-400/50" 
            : "opacity-0 w-1/2 translate-x-1/4 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
        )}></div>
      </div>
    </div>
  );
}
