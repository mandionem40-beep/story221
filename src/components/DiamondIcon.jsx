export default function DiamondIcon({ className = "w-5 h-5", filled = true }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4466" />
          <stop offset="50%" stopColor="#ff0033" />
          <stop offset="100%" stopColor="#cc0029" />
        </linearGradient>
        <linearGradient id="diamondShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M6 3h12l4 6-10 12L2 9l4-6z"
        fill={filled ? "url(#diamondGrad)" : "none"}
        stroke="#ff0033"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {filled && (
        <>
          <path d="M2 9h20M12 3L7 9l5 12M12 3l5 6-5 12" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="0.8" strokeLinejoin="round" />
          <path d="M6 3h5L7 9H2L6 3z" fill="url(#diamondShine)" />
        </>
      )}
    </svg>
  );
}