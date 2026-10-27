import HeroVignette from "@/components/landing/HeroVignette";

const videos = [
  {
    src: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/a2287461f_Mariage_fruits_v2.mp4",
    title: "Mariage de fruits",
  },
  {
    src: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/88193005f_Air_Sngal_dcollage_htesses.mp4",
    title: "Air Sénégal",
  },
  {
    src: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/eaf4bde31_Sadio_Man_dribble_lion.mp4",
    title: "Sadio Mané vs lion",
  },
  {
    src: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/7054c060a_Singe_surfeur_vagues.mp4",
    title: "Singe surfeur",
  },
];

export default function HeroDemo() {
  return (
    <div className="mt-6 grid grid-cols-4 gap-3">
      {videos.map((v, i) => (
        <HeroVignette key={v.src} src={v.src} title={v.title} delay={i * 0.6} />
      ))}
    </div>
  );
}