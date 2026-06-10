import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Smartphone, Tv, Wallet, ArrowRight } from "lucide-react";

export default Onboarding;

const slides = [
  {
    Icon: Smartphone,
    title: "Buy Airtime Instantly",
    body: "Top up any Nigerian network in seconds — anytime, anywhere.",
  },
  {
    Icon: Tv,
    title: "Pay Bills With Ease",
    body: "Settle electricity, TV and internet bills without leaving home.",
  },
  {
    Icon: Wallet,
    title: "Your Money, Your Control",
    body: "Track every kobo with a secure wallet built around you.",
  },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const slide = slides[i];
  const next = () => (i < slides.length - 1 ? setI(i + 1) : navigate("/signup"));

  return (
    <div className="min-h-dvh bg-background">
      <div className="app-shell flex flex-col min-h-dvh">
        <div className="flex justify-end p-4">
          <button onClick={() => navigate("/signup")} className="text-sm text-muted-foreground font-medium">
            Skip
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-64 h-64 rounded-full bg-accent flex items-center justify-center relative">
            <div className="absolute inset-6 rounded-full bg-white shadow-card" />
            <slide.Icon size={88} strokeWidth={1.6} className="text-primary relative" />
          </div>
          <h2 className="mt-10 text-2xl font-bold text-foreground">{slide.title}</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">{slide.body}</p>
        </div>
        <div className="p-6">
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-1.5 bg-border"}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-full gradient-primary text-primary-foreground rounded-full py-4 text-sm font-semibold flex items-center justify-center gap-2 shadow-glow active:scale-[0.98] transition"
          >
            {i === slides.length - 1 ? "Get Started" : "Next"} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
