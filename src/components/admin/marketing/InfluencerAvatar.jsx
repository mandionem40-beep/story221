import React, { useState, useEffect } from "react";

/**
 * Displays an influencer photo with automatic fallback to an initial-based avatar.
 * Handles broken URLs, hotlink-protected images, and data URLs.
 */
export default function InfluencerAvatar({ photo_url, name, size = "md" }) {
  const [errored, setErrored] = useState(false);

  // Reset error state when the URL changes
  useEffect(() => { setErrored(false); }, [photo_url]);

  const sizeClasses = {
    sm: "w-10 h-10 rounded-lg text-sm",
    md: "w-12 h-12 rounded-xl text-base",
    lg: "w-14 h-14 rounded-2xl text-xl",
    xl: "w-24 h-24 rounded-3xl text-3xl",
  };

  const cls = sizeClasses[size] || sizeClasses.md;

  if (photo_url && !errored) {
    return (
      <img
        src={photo_url}
        alt={name || ""}
        onError={() => setErrored(true)}
        className={`${cls} object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div className={`${cls} bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0`}>
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}