import type { Policy } from "./types";

export const belgiumPolicies: Policy[] = [
  // ── BELGIUM — LEAVE ───────────────────────────────────────
  {
    id: "be-annual-leave",
    title: "Congé Annuel — Belgique",
    description: "20 jours légaux (4 semaines) pour temps plein 38h. Pécule double ~92% salaire mensuel.",
    country: "Belgium",
    topic: "leave",
    icon: "🏖️",
    updatedAt: "2024-01-01",
    legalRefs: [
      "Loi du 28 juin 1971 relative aux vacances annuelles",
      "Arrêté Royal du 30 mars 1967",
      "Loi 17 juillet 2023 (report maladie)",
    ],
    content: `4 semaines (20 jours ouvrables) pour un CDI à temps plein 38h/semaine. Droits calculés sur l'année de référence N-1.

Pécule simple : salaire normal pendant le congé.
Pécule double : ~92% du salaire mensuel brut, versé par l'employeur annuellement (généralement en mai/juin).

Pour les ouvriers : pécule géré par les Caisses de Vacances (paiement direct au travailleur).

Report en cas de maladie : autorisé par la Loi du 17 juillet 2023 (transposition Dir. UE 2019/1158) — report possible jusqu'à 24 mois.`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },
  {
    id: "be-sick-leave",
    title: "Arrêt Maladie — Belgique",
    description: "Salaire garanti 30 jours (Art. 52 Loi 3 juillet 1978), puis indemnités INAMI.",
    country: "Belgium",
    topic: "leave",
    icon: "🏥",
    updatedAt: "2024-01-01",
    legalRefs: [
      "Loi du 3 juillet 1978, Art. 52-70",
      "Loi coordonnée 14 juillet 1994 (INAMI)",
    ],
    content: `Phase 1 — Salaire Garanti (employés) : 30 premiers jours à charge de l'employeur, dès le 1er jour, sans délai de carence. Certificat médical requis dans les 2 jours ouvrables.

Pour les ouvriers : 7 jours garantis dès le 1er épisode à partir de la 2ème absence.

Phase 2 — INAMI (à partir du 31ème jour) :
- Incapacité primaire (an 1) : 60% du salaire plafonné via mutualité
- Invalidité (> 1 an) : 65% (isolé/chef de famille) ou 40% (cohabitant)

Prévoyance complémentaire : complément aux indemnités INAMI.`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },
  {
    id: "be-holidays",
    title: "Jours Fériés — Belgique",
    description: "10 jours fériés nationaux légaux. Jour de remplacement si férié = dimanche.",
    country: "Belgium",
    topic: "leave",
    icon: "🗓️",
    updatedAt: "2024-01-01",
    legalRefs: ["Loi du 4 janvier 1974 relative aux jours fériés"],
    content: `10 jours fériés nationaux : 1er jan, Lundi de Pâques, 1er mai, Ascension, Lundi de Pentecôte, 21 juillet, 15 août, 1er nov, 11 nov, 25 déc.

Si un férié tombe un dimanche ou jour non travaillé : un jour de remplacement est accordé, à fixer par accord employeur/délégués.

Tous les fériés sont rémunérés. La société octroie les 10 jours à tous les collaborateurs avec maintien de salaire.`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── BELGIUM — MOBILITY ────────────────────────────────────
  {
    id: "be-mobility",
    title: "Mobilité Globale & Locale — Belgique",
    description: "Mutation interne, détachement UE/hors-UE, relocation et clause de mobilité.",
    country: "Belgium",
    topic: "mobility",
    icon: "✈️",
    updatedAt: "2024-03-01",
    legalRefs: [
      "Loi du 3 juillet 1978 Art. 37 (mutation)",
      "Règlement UE 883/2004 (sécurité sociale)",
      "Directive 96/71/CE (détachement)",
    ],
    content: `Mobilité interne : une clause de mobilité dans le contrat ou un avenant est nécessaire pour toute mutation géographique significative. Préavis raisonnable obligatoire.

Détachement international : pour missions > 3 mois hors Belgique, avenant de détachement précisant durée, maintien du contrat belge, conditions salariales et protection sociale (formulaire A1 pour UE).

Comment démarrer : contacter HR Mobility BE (hr-be@mistralhr.demo) → dossier de mobilité → validation manager + Legal → avenant → brief destination → support relocation.

Split payroll (missions longues) : possible selon la durée et le pays d'accueil — à analyser avec le Payroll Manager.`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── BELGIUM — TAX ─────────────────────────────────────────
  {
    id: "be-tax",
    title: "Fiscalité Locale — Belgique",
    description: "IPP, précompte professionnel, cotisations ONSS (13,07% salariales).",
    country: "Belgium",
    topic: "tax",
    icon: "🧾",
    updatedAt: "2024-01-01",
    legalRefs: [
      "Code des Impôts sur les Revenus 1992 (CIR92)",
      "Loi du 27 juin 1969 (ONSS)",
    ],
    content: `Impôt des Personnes Physiques (IPP) — Barème fédéral 2024 :
- 25% jusqu'à 15 200 €
- 40% de 15 200 € à 26 830 €
- 45% de 26 830 € à 46 440 €
- 50% au-delà de 46 440 €

+ additionnels communaux (5 à 9% de l'IPP de base selon commune).

Précompte professionnel : retenu mensuellement par l'employeur sur base des barèmes SPF Finances.

Cotisations ONSS salariales : 13,07% du salaire brut (sécurité sociale — pension, chômage, soins de santé, allocations familiales).

Avantages de toute nature (ATN) : voiture de société, GSM, PC privé imposés sur base forfaitaire (barèmes SPF Finances).`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── BELGIUM — HEALTH ──────────────────────────────────────
  {
    id: "be-health",
    title: "Assurance Santé & Hospitalisation — Belgique",
    description: "Assurance hospitalisation collective + mutualité légale INAMI. Couverture collective.",
    country: "Belgium",
    topic: "health",
    icon: "🩺",
    updatedAt: "2024-01-01",
    legalRefs: [
      "Loi coordonnée 14 juillet 1994 (assurance maladie-invalidité)",
      "Loi du 25 juin 1992 (assurances privées)",
    ],
    content: `Mutualité légale (INAMI) : tout salarié belge est affilié à une mutualité de son choix (Mutualité Chrétienne, Solidaris, Partenamut, etc.). Elle rembourse une partie des soins de santé ambulatoires sur base des tarifs INAMI.

Assurance hospitalisation collective : couverture des frais hospitaliers (chambre individuelle ou double selon option), honoraires médecins au-delà des tarifs INAMI, soins avant/après hospitalisation (30/60 jours selon police).

Portabilité : maintien de la couverture hospitalisation possible après départ (conversion en police individuelle, sans questionnaire médical, dans les 30 jours suivant la fin du contrat).`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── BELGIUM — PREMIUMS ────────────────────────────────────
  {
    id: "be-premiums",
    title: "Primes & Avantages — Belgique",
    description: "Chèques-repas, transport, participation bénéfices, pension complémentaire, prime home office.",
    country: "Belgium",
    topic: "premiums",
    icon: "💶",
    updatedAt: "2024-01-01",
    legalRefs: [
      "Loi du 22 avril 2012 (chèques-repas)",
      "Loi du 28 avril 2003 (pension complémentaire — LPC)",
      "CIR92 Art. 38 §1 19° (home working)",
    ],
    content: `Chèques-repas : valeur faciale 8€/jour prestés (limite exonération ONSS 2024 : 8€). Part patronale : 6,91€ max exonéré. Distribués via Edenred/Sodexo.

Intervention transport : remboursement abonnement train (100% SNCB 2e classe), ou forfait vélo 0,27€/km (exonéré ONSS jusqu'à 40km aller-retour). Voiture de société selon niveau de fonction.

Participation bénéfices : plan de bonus annuel selon objectifs collectifs et individuels.

Pension complémentaire (2e pilier — LPC 2003) : plan de pension de groupe, cotisations employeur, capital disponible à la pension légale. Rendement légal garanti minimum.

Actions société : plan d'actionnariat salarié (même programme que FR).

Intervention home office : indemnité forfaitaire nette 151,70€/mois maximum (plafond ONSS 2024) pour les télétravailleurs structurels (> 5 jours/mois à domicile).`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── BELGIUM — WORKSITE ────────────────────────────────────
  {
    id: "be-worksite",
    title: "Télétravail & Conditions de Travail — Belgique",
    description: "Accord collectif télétravail, 38h/semaine, flexibilité et droit à la déconnexion (Belgique).",
    country: "Belgium",
    topic: "worksite",
    icon: "🏠",
    updatedAt: "2024-01-01",
    legalRefs: [
      "Loi du 5 mars 2017 (travail faisable et maniable)",
      "CCT n°85 (télétravail)",
      "Code du Bien-être au Travail",
    ],
    content: `Durée du travail : 38h/semaine légale. Heures supplémentaires : +50% (semaine) ou +100% (dimanche/nuit). Contingent libre 143h/an.

Télétravail (CCT n°85 + accord collectif BE) : jusqu'à 3 jours/semaine pour postes éligibles, avec accord écrit. Matériel fourni par l'employeur.

Loi Travail Faisable (2017) : droit au crédit-temps, annualisation possible, travail de nuit et week-end encadré par CCT sectorielle.

Droit à la déconnexion : obligation légale depuis 2022 pour entreprises >20 salariés — charte interne.

Intervention home office : 151,70€/mois max (plafond ONSS 2024) pour télétravailleurs structurels.`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── BELGIUM — ONBOARDING ──────────────────────────────────
  {
    id: "be-onboarding",
    title: "Onboarding & Offboarding — Belgique",
    description: "Intégration J1-J90, politique IT/PC, procédure de départ et solde de tout compte.",
    country: "Belgium",
    topic: "onboarding",
    icon: "🚀",
    updatedAt: "2024-01-01",
    legalRefs: [
      "Loi du 3 juillet 1978 Art. 37 (préavis)",
      "Loi 26 déc. 2013 (statut unique — délais de préavis)",
    ],
    content: `Onboarding (J-1 à J+90) :
- J-1 : remise PC, création comptes (AD, M365, Slack, Jira, Workday, ServiceNow)
- J1 : Welcome Day Belgium — présentation RH, bien-être au travail, politique sécurité IT
- J7 : accès Learning Academy + enregistrement à la pension complémentaire
- J30 : point d'étonnement manager
- J90 : bilan RH (pas de période d'essai depuis 2014 — Loi Statut Unique)

Politique IT & PC :
- PC : Windows 11 standard. Exceptions (Mac) : validation IT Manager requise
- Logiciels : catalogue approuvé via ServiceNow. Installation hors catalogue → validation RSSI
- BYOD non autorisé. Accès VPN obligatoire en télétravail

Offboarding — délais de préavis (Loi Statut Unique, Art. 37/2) :
- 0-3 mois : 1 semaine | 3-6 mois : 3 semaines | 6-9 mois : 6 semaines | 9-12 mois : 7 semaines
- Par tranche de 6 mois supplémentaires : +1 semaine (jusqu'à 5 ans), puis +3 sem./année entamée
- Restitution matériel dans les 3 jours ouvrés suivant le départ
- Documents remis : certificat de travail + formulaire C4 (chômage) + attestation pension`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── BELGIUM — COMPENSATION ────────────────────────────────
  {
    id: "be-pay-transparency",
    title: "Pay Transparency — Belgique",
    description: "Égalité salariale (Loi 22 avril 2012) et EU Dir. 2023/970.",
    country: "Belgium",
    topic: "compensation",
    icon: "⚖️",
    updatedAt: "2024-06-01",
    legalRefs: [
      "Loi du 22 avril 2012 visant à lutter contre l'écart salarial",
      "EU Directive 2023/970",
    ],
    content: `Loi du 22 avril 2012 : entreprises ≥ 50 salariés → analyse bisannuelle de la structure des rémunérations par genre. Plan d'action si écarts injustifiés. Rapport annuel pour entreprises ≥ 100 salariés.

EU Dir. 2023/970 (transposition requise avant juin 2026) : droit individuel à l'information salariale, interdiction clauses de confidentialité sur salaires.

Période d'essai : abolie depuis le 1er janvier 2014 (Loi du 26 décembre 2013, Statut Unique). Tout CDI démarre sans période probatoire. Préavis calculé dès le 1er jour sur ancienneté totale.

Contrôle : Institut pour l'Égalité des Femmes et des Hommes + Inspection sociale.`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },
];
