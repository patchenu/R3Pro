/**
 * Scroll Management & Contextual Focus Utility
 * Ensures users always land cleanly at the top of new steps, views, modals,
 * and sections without needing to scroll around.
 */

/**
 * Smoothly or instantly scrolls window or a given HTML element to top (0, 0)
 */
export function scrollToTop(
  elementOrWindow?: HTMLElement | Window | null,
  behavior: ScrollBehavior = 'smooth'
): void {
  if (typeof window === 'undefined') return;

  if (!elementOrWindow || elementOrWindow === window) {
    try {
      window.scrollTo({ top: 0, left: 0, behavior });
    } catch {
      window.scrollTo(0, 0);
    }
    return;
  }

  if (elementOrWindow instanceof HTMLElement) {
    try {
      elementOrWindow.scrollTo({ top: 0, left: 0, behavior });
    } catch {
      elementOrWindow.scrollTop = 0;
    }
  }
}

/**
 * Smoothly scrolls to an element by ID or DOM reference, accounting for sticky navbar height offset
 * @param elementIdOrNode ID string or HTMLElement reference
 * @param offset Top offset in pixels to preserve breathing room below sticky header (default: 80px)
 * @param behavior ScrollBehavior (default: 'smooth')
 */
export function scrollToElement(
  elementIdOrNode: string | HTMLElement | null,
  offset: number = 80,
  behavior: ScrollBehavior = 'smooth'
): void {
  if (typeof window === 'undefined') return;

  const target = typeof elementIdOrNode === 'string'
    ? document.getElementById(elementIdOrNode)
    : elementIdOrNode;

  if (!target) return;

  const elementPosition = target.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  try {
    window.scrollTo({
      top: Math.max(0, offsetPosition),
      left: 0,
      behavior
    });
  } catch {
    window.scrollTo(0, Math.max(0, offsetPosition));
  }
}
