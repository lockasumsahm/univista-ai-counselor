import { useEffect, useRef } from "react";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;
const VISIBLE = !!clientToken?.startsWith("test_");

export function PaymentTestModeBanner() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!VISIBLE) {
      document.documentElement.style.setProperty("--banner-h", "0px");
      return;
    }
    let scheduled = false;
    const update = () => {
      scheduled = false;
      const h = ref.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--banner-h", `${h}px`);
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("resize", schedule);
      document.documentElement.style.setProperty("--banner-h", "0px");
    };
  }, []);

  if (!VISIBLE) return null;

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 right-0 z-[60] w-full bg-orange-100 border-b border-orange-300 px-3 py-1.5 text-center text-[11px] sm:text-sm text-orange-800 leading-tight"
    >
      <span className="hidden sm:inline">All payments made in the preview are in test mode. </span>
      <span className="sm:hidden">Test mode preview. </span>
      <a
        href="https://docs.lovable.dev/features/payments#test-and-live-environments"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-medium"
      >
        Read more about payment testing
      </a>
    </div>
  );
}
