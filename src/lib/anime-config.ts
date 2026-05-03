import { animate, createTimeline, createTimer, stagger } from "animejs";

export const createScrollObserver = (
  targets: string | Element | Element[],
  options: {
    enter?: string;
    leave?: string;
    sync?: boolean;
  } = {}
) => {
  const els = typeof targets === "string"
    ? Array.from(document.querySelectorAll(targets))
    : Array.isArray(targets) ? targets : [targets];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.dispatchEvent(new CustomEvent("anime:enter"));
        } else {
          entry.target.dispatchEvent(new CustomEvent("anime:leave"));
        }
      });
    },
    { threshold: 0.1 }
  );

  els.forEach((el) => observer.observe(el as Element));
  return () => observer.disconnect();
};

export const fractalEntrance = (
  targets: string | Element | Element[],
  staggerMs = 80
) =>
  animate(targets, {
    opacity:    [0, 1],
    translateY: [32, 0],
    duration:   600,
    ease:       "outExpo",
    delay:      stagger(staggerMs),
  });

export const hudReveal = (
  targets: string | Element | Element[],
  staggerMs = 40
) =>
  animate(targets, {
    opacity:   [0, 1],
    scaleX:    [0, 1],
    duration:  400,
    ease:      "outQuart",
    delay:     stagger(staggerMs),
    transformOrigin: "left center",
  });

export { animate, createTimeline, createTimer, stagger };
