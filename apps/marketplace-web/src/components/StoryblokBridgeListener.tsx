import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

declare global {
  interface Window {
    StoryblokBridge?: new (options?: { preventClicks?: boolean }) => {
      on: (events: string[], handler: (event: unknown) => void) => void;
    };
    storyblokRegisterEvent?: (cb: () => void) => void;
  }
}

export function StoryblokBridgeListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.search.includes("_storyblok")) return;

    const init = () => {
      if (!window.StoryblokBridge) return;
      const bridge = new window.StoryblokBridge();
      bridge.on(["input", "published", "change"], () => {
        queryClient.invalidateQueries({ queryKey: ["storyblok"] });
      });
    };

    if (window.StoryblokBridge) {
      init();
      return;
    }

    if (window.storyblokRegisterEvent) {
      window.storyblokRegisterEvent(init);
      return;
    }

    const interval = window.setInterval(() => {
      if (window.StoryblokBridge) {
        window.clearInterval(interval);
        init();
      }
    }, 200);
    return () => window.clearInterval(interval);
  }, [queryClient]);

  return null;
}
