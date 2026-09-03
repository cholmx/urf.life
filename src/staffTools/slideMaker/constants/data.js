export const SW = 2560;
export const SH = 1600; // 16:10
export const CORNER_R = 32;

export const ASPECT_RATIOS = [
  { id: "16:10", label: "16:10", w: 2560, h: 1600 },
  { id: "16:9",  label: "16:9",  w: 2560, h: 1440 },
  { id: "portrait_legal", label: "11x8.5", w: 2560, h: 3313 },
];

export const FONT_COMBOS = [
  { id: "inter_tight_inconsolata", name: "Inter Tight + Inconsolata", vibe: "Compact & Monospaced", h: "'Inter Tight',sans-serif", b: "'Inconsolata',monospace" },
  { id: "outfit_outfit", name: "Outfit + Outfit", vibe: "Geometric & Unified", h: "'Outfit',sans-serif", b: "'Outfit',sans-serif" },
  { id: "spartan_dm", name: "League Spartan + DM Sans", vibe: "URF Default", h: "'League Spartan',sans-serif", b: "'DM Sans',sans-serif" },
  { id: "playfair_source", name: "Playfair + Source Sans", vibe: "Elegant & Readable", h: "'Playfair Display',serif", b: "'Source Sans 3',sans-serif" },
  { id: "montserrat_lora", name: "Montserrat + Lora", vibe: "Modern & Serif", h: "'Montserrat',sans-serif", b: "'Lora',serif" },
  { id: "space_grotesk_inter", name: "Space Grotesk + Inter", vibe: "Tech & Clean", h: "'Space Grotesk',sans-serif", b: "'Inter',sans-serif" },
  { id: "fraunces_inter", name: "Fraunces + Inter", vibe: "Expressive & Precise", h: "'Fraunces',serif", b: "'Inter',sans-serif", hWeight: 400, bWeight: 600 },
  { id: "gloock_dm", name: "Gloock + DM Sans", vibe: "Editorial & Grounded", h: "'Gloock',serif", b: "'DM Sans',sans-serif", hWeight: 400, bWeight: 600 },
  { id: "lexend_plus", name: "Lexend + Plus Jakarta", vibe: "Accessible & Modern", h: "'Lexend',sans-serif", b: "'Plus Jakarta Sans',sans-serif" },
  { id: "unbounded_space", name: "Unbounded + Space Mono", vibe: "Futuristic & Tech", h: "'Unbounded',sans-serif", b: "'Space Mono',monospace" },
  { id: "bricolage_geist", name: "Bricolage Grotesque + Geist", vibe: "Editorial & Precise", h: "'Bricolage Grotesque',sans-serif", b: "'Geist',sans-serif" },
  { id: "chango_inter", name: "Chango + Inter", vibe: "Bold & Friendly", h: "'Chango',sans-serif", b: "'Inter',sans-serif", hWeight: 400, bWeight: 600 },
  { id: "caprasimo_plus_jakarta", name: "Caprasimo + Plus Jakarta Sans", vibe: "Display & Modern", h: "'Caprasimo',serif", b: "'Plus Jakarta Sans',sans-serif", hWeight: 400 },
];

export const COLOR_PALETTES = [
  { id: "deep_teal", name: "Deep Teal", vibe: "URF Default", bg: "#0A1A1F", tx: "#F2F0EB", ac: "#EC9C38" },
  { id: "forest", name: "Forest", vibe: "Earthy & Grounded", bg: "#0F1E17", tx: "#EBF0E9", ac: "#9DBE80" },
  { id: "slate_coral", name: "Slate + Coral", vibe: "Modern & Energetic", bg: "#1A1F2E", tx: "#F4F1EC", ac: "#EB8774" },
  { id: "concrete", name: "Concrete", vibe: "Minimal & Raw", bg: "#1E1E1E", tx: "#EBEBEB", ac: "#FFFFFF" },
  { id: "ember", name: "Ember", vibe: "Warm & Intense", bg: "#1A0D0A", tx: "#F6EBE5", ac: "#EB7F52" },
  { id: "carbon_green", name: "Carbon Green", vibe: "Tech & Natural", bg: "#171717", tx: "#F7F7F7", ac: "#34C494" },
  { id: "white_black", name: "White + Black", vibe: "Clean & Classic", bg: "#FFFFFF", tx: "#111111", ac: "#353535" },
  { id: "sacramento_pine", name: "Sacramento + Pine", vibe: "Forest & Salmon", bg: "#162114", tx: "#FFD2C1", ac: "#B5DEAB" },
  { id: "guardsman_gold", name: "Guardsman + Gold", vibe: "Romantic Bold", bg: "#420a0a", tx: "#FFEAA0", ac: "#B9DDA4" },
  { id: "jaguar_olive", name: "Jaguar + Olive", vibe: "Dark Romance", bg: "#040011", tx: "#D0F2C9", ac: "#FF5656" },
  { id: "cyan_mint", name: "Cyan + Mint", vibe: "Dark & Electric", bg: "#020E0E", tx: "#D2EDB2", ac: "#27E395" },
  { id: "noir_crimson", name: "Noir + Crimson", vibe: "Dark & Striking", bg: "#000000", tx: "#F7E0AC", ac: "#EB7363" },
];

export const TEMPLATES = [
  { id: "left_block", name: "Left Block" },
  { id: "minimal", name: "Minimal" },
  { id: "left_band", name: "Left Band" },
  { id: "offset_header", name: "Offset Header" },
  { id: "bottom_banner", name: "Bottom Banner" },
  { id: "side_panel", name: "Side Panel" },
  { id: "right_accent", name: "Right Accent" },
];