export const loginTexts = {
  fields: {
    email: {
      label: "Adresse e-mail",
      placeholder: "exemple@domaine.com",
    },
    password: {
      label: "Mot de passe",
      placeholder: "Votre mot de passe",
    },
  },
  submitButton: "Connexion",
  error: {
    default: "Une erreur est survenue. Veuillez réessayer.",
  },
  footer: {
    prompt: "Vous n'avez pas encore de compte ?",
    createButton: "Créer mon entreprise",
  },
  forgotPassword: {
    title: "Mot de passe oublié ?",
    button: "Réinitialiser mon mot de passe",
    modal: {
      description: "Veuillez entrer votre adresse e-mail pour recevoir un lien de réinitialisation.",
      confirmButton: "Envoyer le lien",
      success: "Un lien de réinitialisation a été envoyé à votre adresse e-mail.",
    },
  },
};
export const colors = {
  lime: {
    100: "#D9ED92",
    200: "#B5E48C",
    300: "#99D98C",
    400: "#76C893",
    500: "#52B69A",
  },
  teal: {
    200: "#A7F3D0",
    400: "#34A0A4",
    500: "#168AAD",
    600: "#1A759F",
    700: "#1E6091",
    800: "#184E77",
  },
  primary: "#52B69A",
  secondary: "#168AAD",
  accent: "#76C893",
  success: "#99D98C",
  warning: "#D9ED92",
  info: "#1A759F",
  dark: "#184E77",
  light: "#D9ED92",
};
export const colorUtils = {
  gradients: {
    primary: `linear-gradient(135deg, ${colors.lime[400]} 0%, ${colors.teal[500]} 100%)`,
    secondary: `linear-gradient(135deg, ${colors.teal[600]} 0%, ${colors.teal[800]} 100%)`,
    success: `linear-gradient(135deg, ${colors.lime[300]} 0%, ${colors.lime[500]} 100%)`,
    ocean: `linear-gradient(135deg, ${colors.teal[400]} 0%, ${colors.teal[700]} 100%)`,
    lime: `linear-gradient(135deg, ${colors.lime[100]} 0%, ${colors.lime[400]} 100%)`,
  },
  backgrounds: {
    primary: `${colors.primary}10`,
    secondary: `${colors.secondary}10`,
    accent: `${colors.accent}10`,
    success: `${colors.success}15`,
    warning: `${colors.warning}15`,
  },
  text: {
    primary: colors.dark,
    secondary: colors.teal[700],
    muted: colors.teal[600],
    light: colors.lime[100],
  },
  borders: {
    light: colors.lime[200],
    medium: colors.lime[400],
    dark: colors.teal[600],
  },
};
export const legacyColors = {
  submit: colors.primary,
  secondary: colors.teal[600],
};
