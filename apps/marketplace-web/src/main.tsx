import { createRoot } from "react-dom/client";
import { storyblokInit, apiPlugin } from "@storyblok/react";
import App from "./App.tsx";
import "./index.css";

storyblokInit({
  accessToken: import.meta.env.VITE_STORYBLOK_PREVIEW_TOKEN,
  use: [apiPlugin],
  bridge: typeof window !== "undefined" && window.location.search.includes("_storyblok"),
});

createRoot(document.getElementById("root")!).render(<App />);
