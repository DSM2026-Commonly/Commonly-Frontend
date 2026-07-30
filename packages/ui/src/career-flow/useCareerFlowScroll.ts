import { useLayoutEffect } from "react";
import animateScrollToTop from "../hooks/animateScrollToTop";

function useCareerFlowScroll(view: string | number) {
  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    return animateScrollToTop();
  }, [view]);
}

export default useCareerFlowScroll;
