export const C = {
  bg: "#F7F7F7",
  card: "#FFFFFF",
  cardAlt: "#F0F0F0",
  border: "#E2E2E2",
  borderLight: "#EFEFEF",
  text: "#1E1E21",
  textSec: "#4A4A4D",
  textTer: "#6E6E6E",
  accent: "#1E1E21",
  accentLight: "#4A4A4D",
  accentBg: "#EFEFEF",
  accentDark: "#000000",
  navBg: "#1E1E21",
  navText: "#F7F7F7",
  success: "#2E7D32",
  error: "#DC2626",
  warning: "#B45309",
};

export const ui = {
  body: "'Inter',sans-serif",
  display: "'Inter Tight',sans-serif",
};

export const iS = {
  width: "100%",
  padding: "9px 12px",
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  fontFamily: ui.body,
  fontSize: 14,
  color: C.text,
  background: C.card,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

export const lS = {
  display: "block",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: C.textTer,
  marginBottom: 4,
  fontFamily: ui.display,
};
