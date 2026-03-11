export const tintedGlass = {
  background: "rgba(28, 28, 30, 0.55)",

  backdropFilter: "blur(30px) saturate(180%)",
  WebkitBackdropFilter: "blur(30px) saturate(180%)",

  border: "1px solid rgba(255,255,255,0.12)",

  boxShadow: `
    0 10px 30px rgba(0,0,0,0.35),
    inset 0 1px 0 rgba(255,255,255,0.15)
  `,
};
