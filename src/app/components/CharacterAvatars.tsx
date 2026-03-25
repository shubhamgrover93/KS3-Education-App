interface AvatarProps {
  size?: number;
}

export function EllaAvatar({ size = 80 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="50" cy="45" r="25" fill="#8B5A3C" />
      {/* Hair - curly/coily */}
      <circle cx="35" cy="30" r="12" fill="#2C1810" />
      <circle cx="50" cy="25" r="14" fill="#2C1810" />
      <circle cx="65" cy="30" r="12" fill="#2C1810" />
      <circle cx="40" cy="22" r="10" fill="#2C1810" />
      <circle cx="60" cy="22" r="10" fill="#2C1810" />
      {/* Eyes */}
      <circle cx="42" cy="45" r="3" fill="#1A1A1A" />
      <circle cx="58" cy="45" r="3" fill="#1A1A1A" />
      {/* Smile */}
      <path d="M 42 52 Q 50 56 58 52" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Body - bright hoodie */}
      <rect x="30" y="68" width="40" height="32" rx="8" fill="#F59E0B" />
      {/* Pattern on hoodie */}
      <circle cx="40" cy="80" r="3" fill="#FCD34D" />
      <circle cx="50" cy="85" r="3" fill="#FCD34D" />
      <circle cx="60" cy="80" r="3" fill="#FCD34D" />
    </svg>
  );
}

export function EthanAvatar({ size = 80 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="50" cy="45" r="25" fill="#C4915B" />
      {/* Hair - short, neat */}
      <ellipse cx="50" cy="28" rx="26" ry="16" fill="#2C1810" />
      <rect x="24" y="28" width="52" height="8" fill="#2C1810" />
      {/* Glasses */}
      <circle cx="42" cy="45" r="7" fill="none" stroke="#14B8A6" strokeWidth="2" />
      <circle cx="58" cy="45" r="7" fill="none" stroke="#14B8A6" strokeWidth="2" />
      <line x1="49" y1="45" x2="51" y2="45" stroke="#14B8A6" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="42" cy="45" r="3" fill="#1A1A1A" />
      <circle cx="58" cy="45" r="3" fill="#1A1A1A" />
      {/* Smile */}
      <path d="M 42 52 Q 50 55 58 52" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Body - plain hoodie */}
      <rect x="30" y="68" width="40" height="32" rx="8" fill="#6B7280" />
    </svg>
  );
}

export function JamieAvatar({ size = 80 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="50" cy="45" r="25" fill="#F5CBA7" />
      {/* Hair - wavy/tousled */}
      <path d="M 30 35 Q 28 28 32 25 Q 38 22 45 24 Q 50 20 55 24 Q 62 22 68 25 Q 72 28 70 35" fill="#A0522D" />
      <ellipse cx="50" cy="28" rx="24" ry="14" fill="#A0522D" />
      {/* Eyes */}
      <circle cx="42" cy="45" r="3" fill="#1A1A1A" />
      <circle cx="58" cy="45" r="3" fill="#1A1A1A" />
      {/* Smile */}
      <path d="M 40 52 Q 50 57 60 52" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Body - sporty hoodie */}
      <rect x="30" y="68" width="40" height="32" rx="8" fill="#14B8A6" />
      {/* Graphic on hoodie */}
      <rect x="45" y="75" width="10" height="2" fill="white" />
      <rect x="42" y="80" width="16" height="2" fill="white" />
      <rect x="45" y="85" width="10" height="2" fill="white" />
    </svg>
  );
}
