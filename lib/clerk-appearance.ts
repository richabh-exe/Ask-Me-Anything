/*
 * Clerk's sign-in screens, dressed in Poocho's notebook palette so signing in
 * doesn't feel like leaving the product.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#2940D9",
    colorForeground: "#13195A",
    colorMutedForeground: "#4A5089",
    colorBackground: "#FFFFFF",
    colorInput: "#FFFFFF",
    colorInputForeground: "#13195A",
    colorNeutral: "#13195A",
    colorDanger: "#C42A46",
    colorSuccess: "#0E8A5C",
    fontFamily: '"Anek Devanagari Variable", "Anek Devanagari", ui-sans-serif, system-ui, sans-serif',
    fontSize: "1rem",
    borderRadius: "10px",
  },
  elements: {
    card: "shadow-none border-0",
    cardBox: "shadow-none border-2 border-navy rounded-[16px]",
    headerTitle: "stretch-wide font-extrabold tracking-[-0.02em]",
    formButtonPrimary: "rounded-full font-semibold",
    socialButtonsBlockButton: "rounded-full border-2 border-navy",
    formFieldInput: "border-2 border-navy",
  },
};
