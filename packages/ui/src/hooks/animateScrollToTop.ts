const SCROLL_SPEED_PX_PER_MS = 2.5;

function animateScrollToTop(): (() => void) | undefined {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const startScrollY = window.scrollY;

  if (prefersReducedMotion || startScrollY === 0) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return undefined;
  }

  const duration = startScrollY / SCROLL_SPEED_PX_PER_MS;
  const startTime = window.performance.now();
  let animationFrameId = 0;

  const scrollToTop = (currentTime: number) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);

    window.scrollTo({
      top: startScrollY * (1 - progress),
      left: 0,
      behavior: "auto",
    });

    if (progress < 1) {
      animationFrameId = window.requestAnimationFrame(scrollToTop);
    }
  };

  animationFrameId = window.requestAnimationFrame(scrollToTop);

  return () => window.cancelAnimationFrame(animationFrameId);
}

export default animateScrollToTop;
