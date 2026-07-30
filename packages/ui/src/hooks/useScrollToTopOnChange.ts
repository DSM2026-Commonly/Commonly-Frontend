import { useEffect } from "react";
import animateScrollToTop from "./animateScrollToTop";

function useScrollToTopOnChange(trigger: string, enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    return animateScrollToTop();
  }, [enabled, trigger]);
}

export default useScrollToTopOnChange;
