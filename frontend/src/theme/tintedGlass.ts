export const tintedGlass = {
  background: "rgba(255, 255, 255, 0.02)",

  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",

  border: "0.5px solid rgba(255, 255, 255, 0.05)",

  boxShadow: `
    inset 0 -2px 4px rgba(0, 0, 0, 0.20),
    inset 0 2px 4px rgba(255, 255, 255, 0.25)
  `,
};
