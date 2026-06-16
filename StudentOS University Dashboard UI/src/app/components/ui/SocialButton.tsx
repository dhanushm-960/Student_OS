import React from "react";

export interface SocialButtonProps {
  provider: "Google" | "Microsoft";
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function SocialButton({ provider, onClick, className = "", children }: SocialButtonProps) {
  const base = "w-full flex items-center justify-center gap-3 py-2 rounded-xl border transition-transform transform hover:scale-[1.01]";
  const googleLogo = (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M44.5 20H24v8.5h11.9C34.9 32.8 30 36 24 36c-8 0-14.5-6.5-14.5-14.5S16 7 24 7c3.8 0 7.1 1.4 9.6 3.6l6-6C35.6 1.9 30.1 0 24 0 11 0 0 11 0 24s11 24 24 24c12 0 22-8.6 24-20 0-1.3-.1-2.6-.5-3.7z" fill="#FFC107"/>
      <path d="M6.3 14.7l6.6 4.8C14.2 16.1 18.7 13 24 13c3.8 0 7.1 1.4 9.6 3.6l6-6C35.6 7.9 30.1 6 24 6 16.6 6 10.1 9.9 6.3 14.7z" fill="#FF3D00"/>
      <path d="M24 44c6 0 11.1-2 14.8-5.4l-7-5.6C29.5 33.6 27 34.5 24 34.5c-6 0-10.9-3.2-13.6-7.9l-6.7 5.1C6.1 39.5 14.6 44 24 44z" fill="#4CAF50"/>
      <path d="M44.5 20H24v8.5h11.9C35.2 31.1 30 34 24 34c-6 0-10.9-3.2-13.6-7.9l-6.7 5.1C6.1 39.5 14.6 44 24 44c12 0 22-8.6 24-20 0-1.3-.1-2.6-.5-3.7z" fill="#1976D2"/>
    </svg>
  );

  const msLogo = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="10" height="10" fill="#F35325"/>
      <rect x="13" y="1" width="10" height="10" fill="#81BC06"/>
      <rect x="1" y="13" width="10" height="10" fill="#05A6F0"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFBA08"/>
    </svg>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${className}`}
      aria-label={`Continue with ${provider}`}
    >
      <span className="flex items-center">{provider === "Google" ? googleLogo : msLogo}</span>
      <span className="text-sm font-600 text-[#111827]">{children ?? `Continue with ${provider}`}</span>
    </button>
  );
}

export default SocialButton;
