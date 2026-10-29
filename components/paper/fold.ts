import type { useAnimate } from "motion/react";

/*
 * Paper physics shared by the hero demo and the real ask page.
 * fold: the chit folds in half twice and disappears.
 * fly: a small folded chit travels on an arc into a tray.
 * unfold: a fresh chit slides back into place.
 * With reduced motion each step becomes a short crossfade.
 */

type Animate = ReturnType<typeof useAnimate>[1];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function stamp(animate: Animate, el: Element, reduce: boolean) {
  if (reduce) {
    await animate(el, { opacity: 1 }, { duration: 0.15 });
    await wait(450);
    return;
  }
  await animate(el, { opacity: [0, 1], scale: [1.9, 1], rotate: [-26, -9] }, { duration: 0.34, ease: [0.3, 1.6, 0.5, 1] });
  await wait(420);
}

export async function foldAway(animate: Animate, el: Element, reduce: boolean) {
  if (reduce) {
    await animate(el, { opacity: 0 }, { duration: 0.18 });
    return;
  }
  await animate(el, { rotateX: 72, scaleY: 0.55, y: 18 }, { duration: 0.26, ease: [0.55, 0, 0.75, 0.2] });
  await animate(el, { scaleX: 0.28, scaleY: 0.2, opacity: 0 }, { duration: 0.2, ease: "easeIn" });
}

export async function unfoldIn(animate: Animate, el: Element, reduce: boolean) {
  await animate(el, { rotateX: 0, scaleX: 1, scaleY: 1, y: reduce ? 0 : 40, rotate: reduce ? 0 : 2.5, opacity: 0 }, { duration: 0 });
  if (reduce) {
    await animate(el, { opacity: 1 }, { duration: 0.2 });
    return;
  }
  await animate(el, { y: 0, rotate: 0, opacity: 1 }, { type: "spring", stiffness: 260, damping: 22 });
}

function center(rect: DOMRect, origin: DOMRect) {
  return { x: rect.left + rect.width / 2 - origin.left, y: rect.top + rect.height / 2 - origin.top };
}

/** Flies `flyer` (absolutely positioned inside `container`) from one element to another. */
export async function flyBetween(
  animate: Animate,
  flyer: HTMLElement,
  container: HTMLElement,
  from: Element,
  to: Element | { x: number; y: number },
  reduce: boolean,
) {
  const origin = container.getBoundingClientRect();
  const start = center(from.getBoundingClientRect(), origin);
  const end = to instanceof Element ? center(to.getBoundingClientRect(), origin) : to;
  const w = flyer.offsetWidth;
  const h = flyer.offsetHeight;
  flyer.style.left = `${start.x - w / 2}px`;
  flyer.style.top = `${start.y - h / 2}px`;

  if (reduce) {
    await animate(flyer, { opacity: [0, 1, 0], x: end.x - start.x, y: end.y - start.y }, { duration: 0.4 });
    await animate(flyer, { x: 0, y: 0 }, { duration: 0 });
    return;
  }

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lift = Math.min(-90, -160 + dy * 0.1);
  await animate(
    flyer,
    {
      opacity: [0, 1, 1, 1],
      x: [0, dx * 0.3, dx * 0.82, dx],
      y: [0, lift, dy - 26, dy],
      rotate: [0, -30, 10, 16],
      scale: [0.7, 1.18, 0.95, 0.72],
    },
    { duration: 0.82, ease: "easeInOut", times: [0, 0.38, 0.82, 1] },
  );
  await animate(flyer, { opacity: 0 }, { duration: 0.1 });
  await animate(flyer, { x: 0, y: 0, rotate: 0, scale: 1 }, { duration: 0 });
}

export async function bump(animate: Animate, el: Element, reduce: boolean) {
  if (reduce) return;
  await animate(el, { scale: [1, 1.1, 1], rotate: [0, -3, 0] }, { duration: 0.38, ease: "easeOut" });
}
