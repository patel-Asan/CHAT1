export const themes = {
  default: {
    name: "Default",
    primary: "rgba(139, 92, 246, 0.7)",
    ownBubble: "rgba(139, 92, 246, 0.7)",
    otherBubble: "rgba(255, 255, 255, 0.12)",
    bg: "rgba(17,24,39,0.6)",
    text: "#fff",
  },
  ocean: {
    name: "Ocean",
    ownBubble: "rgba(14, 165, 233, 0.7)",
    otherBubble: "rgba(255, 255, 255, 0.12)",
    bg: "rgba(15, 23, 42, 0.6)",
    text: "#fff",
  },
  forest: {
    name: "Forest",
    ownBubble: "rgba(34, 197, 94, 0.7)",
    otherBubble: "rgba(255, 255, 255, 0.12)",
    bg: "rgba(20, 30, 20, 0.6)",
    text: "#fff",
  },
  sunset: {
    name: "Sunset",
    ownBubble: "rgba(249, 115, 22, 0.7)",
    otherBubble: "rgba(255, 255, 255, 0.12)",
    bg: "rgba(30, 20, 20, 0.6)",
    text: "#fff",
  },
  midnight: {
    name: "Midnight",
    ownBubble: "rgba(99, 102, 241, 0.7)",
    otherBubble: "rgba(255, 255, 255, 0.08)",
    bg: "rgba(0, 0, 10, 0.7)",
    text: "#e5e7eb",
  },
  cyberpunk: {
    name: "Cyberpunk",
    ownBubble: "rgba(236, 72, 153, 0.8)",
    otherBubble: "rgba(6, 182, 212, 0.3)",
    bg: "rgba(10, 0, 20, 0.7)",
    text: "#fff",
  },
};

export const getTheme = (themeKey) => themes[themeKey] || themes.default;
