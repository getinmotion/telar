import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Storyblok desmontado — el CMS ahora vive en el backend NestJS / Mongo
// (cms-sections, cms-territories, blog-posts, collections).

createRoot(document.getElementById("root")!).render(<App />);
