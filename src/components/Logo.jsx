export const LOGO_ICON_URL = "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/e8b942adc_fab0447d-1647-4e5d-849a-0d3eba2ba65b.png";
export const LOGO_FULL_URL = "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/e8b942adc_fab0447d-1647-4e5d-849a-0d3eba2ba65b.png";

export default function Logo({ size = "md", showText = true, full = false, className = "" }) {
  const sizeMap = {
    sm: { box: "w-7 h-7", img: "w-4 h-4", text: "text-base" },
    md: { box: "w-8 h-8", img: "w-5 h-5", text: "text-xl" },
    lg: { box: "w-10 h-10", img: "w-6 h-6", text: "text-2xl" },
  };
  const s = sizeMap[size] || sizeMap.md;

  if (full) {
    return (
      <img
        src={LOGO_FULL_URL}
        alt="Story221"
        className={`object-contain ${className}`}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src={LOGO_ICON_URL} alt="Story221" className={`${s.box} object-contain`} />
      {showText && (
        <span className={`${s.text} font-bold tracking-tight text-white`}>
          Story<span className="gradient-text-red">221</span>
        </span>
      )}
    </span>
  );
}