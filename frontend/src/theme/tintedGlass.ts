export const tintedGlass = {
    background: `
    linear-gradient(
      135deg,
      rgba(20, 30, 50, 0.75),
      rgba(10, 15, 25, 0.65)
    )
  `,

    backdropFilter: "blur(22px) saturate(180%)",
    WebkitBackdropFilter: "blur(22px) saturate(180%)",

    border: "1px solid rgba(255,255,255,0.08)",

    boxShadow: `
    0 10px 35px rgba(0,0,0,0.45),
    inset 0 1px 0 rgba(255,255,255,0.06)
  `,
};