export const CAMPAIGN_ERRORS = {
  notFound: "Campagne introuvable",
  managerExists: "Ce manager existe deja pour cette campagne",
  serviceExists: "Ce service existe deja pour cette campagne",
  linksLoadFailed: "Echec du chargement des liens.",
} as const;

export const URL_ERRORS = {
  appUrlInvalid: "L'URL de base de l'application est invalide",
} as const;
