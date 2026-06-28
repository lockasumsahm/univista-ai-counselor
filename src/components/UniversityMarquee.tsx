// University showcase marquee with real institutional logos.
// Logos are bundled with the app (no hotlinking) — Wikimedia rate-limits hotlinks
// with HTTP 429 and many universities block cross-origin requests. Imperial
// College falls back to a branded SVG shield since no public PNG is available.

import harvard from "@/assets/unis/harvard.webp";
import mit from "@/assets/unis/mit.webp";
import stanford from "@/assets/unis/stanford.webp";
import yale from "@/assets/unis/yale.webp";
import princeton from "@/assets/unis/princeton.webp";
import columbia from "@/assets/unis/columbia.webp";
import oxford from "@/assets/unis/oxford.webp";
import cambridge from "@/assets/unis/cambridge.webp";
import caltech from "@/assets/unis/caltech.webp";
import upenn from "@/assets/unis/upenn.webp";
import brown from "@/assets/unis/brown.webp";
import cornell from "@/assets/unis/cornell.webp";
import dartmouth from "@/assets/unis/dartmouth.webp";
import eth from "@/assets/unis/eth.webp";
import uchicago from "@/assets/unis/uchicago.webp";
import jhu from "@/assets/unis/jhu.webp";
import duke from "@/assets/unis/duke.webp";
import northwestern from "@/assets/unis/northwestern.webp";
import berkeley from "@/assets/unis/berkeley.webp";

type Uni = {
  name: string;
  short: string;
  logo?: string;
  // Fallback shield (used when no logo image available)
  fallback?: { monogram: string; primary: string; secondary: string };
};

const UNIVERSITIES: Uni[] = [
  { name: "Harvard University", short: "Harvard", logo: harvard },
  { name: "Massachusetts Institute of Technology", short: "MIT", logo: mit },
  { name: "Stanford University", short: "Stanford", logo: stanford },
  { name: "Yale University", short: "Yale", logo: yale },
  { name: "Princeton University", short: "Princeton", logo: princeton },
  { name: "Columbia University", short: "Columbia", logo: columbia },
  { name: "University of Oxford", short: "Oxford", logo: oxford },
  { name: "University of Cambridge", short: "Cambridge", logo: cambridge },
  { name: "California Institute of Technology", short: "Caltech", logo: caltech },
  { name: "University of Pennsylvania", short: "UPenn", logo: upenn },
  { name: "Brown University", short: "Brown", logo: brown },
  { name: "Cornell University", short: "Cornell", logo: cornell },
  { name: "Dartmouth College", short: "Dartmouth", logo: dartmouth },
  { name: "ETH Zürich", short: "ETH Zürich", logo: eth },
  {
    name: "Imperial College London",
    short: "Imperial",
    fallback: { monogram: "IC", primary: "#003E74", secondary: "#0066CC" },
  },
  { name: "University of Chicago", short: "UChicago", logo: uchicago },
  { name: "Johns Hopkins University", short: "Johns Hopkins", logo: jhu },
  { name: "Duke University", short: "Duke", logo: duke },
  { name: "Northwestern University", short: "Northwestern", logo: northwestern },
  { name: "UC Berkeley", short: "UC Berkeley", logo: berkeley },
];

const ShieldFallback = ({
  monogram,
  primary,
  secondary,
  id,
}: {
  monogram: string;
  primary: string;
  secondary: string;
  id: string;
}) => (
  <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" className="flex-shrink-0">
    <defs>
      <linearGradient id={`fb-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={primary} />
        <stop offset="100%" stopColor={secondary} />
      </linearGradient>
    </defs>
    <path
      d="M32 2 L60 10 V32 C60 48 48 58 32 62 C16 58 4 48 4 32 V10 Z"
      fill={`url(#fb-${id})`}
      stroke="rgba(255,255,255,0.25)"
      strokeWidth="1.2"
    />
    <text
      x="32"
      y="40"
      textAnchor="middle"
      fontFamily="Georgia, 'Times New Roman', serif"
      fontWeight="700"
      fontSize={monogram.length > 2 ? 14 : 20}
      fill="#FFFFFF"
    >
      {monogram}
    </text>
  </svg>
);

export const UniversityMarquee = ({
  heading = "Our students get accepted at",
}: {
  heading?: string;
}) => {
  // Duplicate list for seamless infinite loop
  const items = [...UNIVERSITIES, ...UNIVERSITIES];

  return (
    <div className="relative z-10 py-14 border-y border-border/20 bg-card/40 backdrop-blur-sm overflow-hidden">
      <p className="text-center text-xs sm:text-sm uppercase tracking-[0.25em] text-muted-foreground/80 mb-10 font-medium">
        🎓 {heading}
      </p>

      <div className="relative">
        {/* Edge fades for premium feel */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex overflow-hidden">
          <div className="marquee-track flex w-max gap-5 md:gap-8 whitespace-nowrap items-center will-change-transform">
            {items.map((uni, i) => (
              <div
                key={`${uni.name}-${i}`}
                title={uni.name}
                aria-label={uni.name}
                className="group flex items-center gap-4 h-28 md:h-32 px-5 md:px-7 flex-shrink-0 rounded-2xl bg-card/80 dark:bg-white/[0.06] border border-border/40 backdrop-blur-md hover:border-primary/50 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
              >
                {uni.logo ? (
                  <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5 flex-shrink-0">
                    <img
                      src={uni.logo}
                      alt={`${uni.name} logo`}
                      width={96}
                      height={96}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain [image-rendering:-webkit-optimize-contrast]"
                    />
                  </div>
                ) : uni.fallback ? (
                  <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5 flex-shrink-0">
                    <ShieldFallback
                      monogram={uni.fallback.monogram}
                      primary={uni.fallback.primary}
                      secondary={uni.fallback.secondary}
                      id={uni.short.replace(/\s+/g, "")}
                    />
                  </div>
                ) : null}
                <span className="text-base md:text-lg font-display font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                  {uni.short}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
