export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export type PolicyTopic =
  | "leave"
  | "mobility"
  | "tax"
  | "health"
  | "premiums"
  | "worksite"
  | "onboarding"
  | "compensation"
  | "other";

export interface Policy {
  id: string;
  title: string;
  description: string;
  desc?: string;
  countries: string[];
  topic: PolicyTopic;
  icon: string;
  updatedAt: string;
  legalRefs: string[];
  content: string;
  ring?: string;
}

export const policies: Policy[] = [
  // ── FRANCE — LEAVE ────────────────────────────────────────
  {
    id: "fr-annual-leave",
    title: "Congés Payés — France",
    description: "5 semaines de congés payés légaux (30 jours ouvrables). Acquisition: 2,5 jours/mois.",
    desc: "5 semaines de congés payés légaux (30 jours ouvrables). Acquisition: 2,5 jours/mois.",
    countries: ["France"],
    topic: "leave",
    icon: "🏖️",
    updatedAt: "2024-01-01",
    legalRefs: [
      "Code du Travail L3141-3",
      "Code du Travail L3141-5",
      "Loi 22 avril 2024 (extension maladie)",
    ],
    content: `Tout salarié acquiert 2,5 jours ouvrables par mois de travail effectif (L3141-3), soit 30 jours ouvrables (5 semaines) pour une année complète.

Période légale de prise : 1er mai – 31 octobre. Le congé principal doit être d'au moins 12 jours ouvrables consécutifs sur cette période.

Congé non pris : ne peut être payé en cours de contrat. La Loi du 22 avril 2024 permet le report des congés en cas d'arrêt maladie (transposition Dir. UE 2019/1158).`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },
  {
    id: "fr-sick-leave",
    title: "Arrêt Maladie — France",
    description: "Maintien de salaire 90 jours via subrogation. Zéro délai de carence.",
    desc: "Maintien de salaire 90 jours via subrogation. Zéro délai de carence.",
    countries: ["France"],
    topic: "leave",
    icon: "🏥",
    updatedAt: "2024-01-01",
    legalRefs: [
      "Code du Travail L1226-1",
      "Convention Collective Syntec",
    ],
    content: `L1226-1 : maintien de salaire dès 1 an d'ancienneté. La CCN Syntec s'applique : maintien 100% salaire pendant 90 jours (subrogation — l'employeur avance le salaire et récupère les IJSS auprès de la CPAM).

Délai de carence IJSS (3 jours) supprimé par accord d'entreprise : le salarié perçoit son salaire dès le 1er jour d'arrêt.

Au-delà de 90 jours : indemnités IJSS + contrat prévoyance collectif (niveau de remplacement défini dans l'accord de prévoyance).`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },
  {
    id: "fr-holidays",
    title: "Jours Fériés — France",
    description: "11 jours fériés légaux (L3133-1). Tous chômés avec maintien de salaire.",
    desc: "11 jours fériés légaux (L3133-1). Tous chômés avec maintien de salaire.",
    countries: ["France"],
    topic: "leave",
    icon: "🗓️",
    updatedAt: "2024-01-01",
    legalRefs: ["Code du Travail L3133-1"],
    content: `11 jours fériés légaux : 1er jan, Lundi de Pâques, 1er mai (seul obligatoirement chômé), 8 mai, Ascension, Lundi de Pentecôte, 14 juillet, 15 août, 1er nov, 11 nov, 25 déc.

La société chôme l'ensemble des 11 jours fériés avec maintien de salaire. Si un jour férié coïncide avec un jour de RTT ou congé planifié, un jour de remplacement est accordé.`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── FRANCE — MOBILITY ─────────────────────────────────────
  {
    id: "fr-mobility",
    title: "Mobilité Globale & Locale — France",
    description: "Processus de transfert interne, détachement international et relocation.",
    desc: "Processus de transfert interne, détachement international et relocation.",
    countries: ["France"],
    topic: "mobility",
    icon: "✈️",
    updatedAt: "2024-03-01",
    legalRefs: [
      "Code du Travail L1231-5 (mutation)",
      "Convention de détachement UE 883/2004",
    ],
    content: `Mobilité interne (locale) : toute mutation géographique doit être prévue par une clause de mobilité dans le contrat ou faire l'objet d'un avenant signé. Un délai de prévenance raisonnable est requis (L1231-5).

Détachement international : pour les missions > 3 mois, un avenant de détachement précise la durée, le maintien du contrat français, les conditions de rémunération et la couverture sociale. La France reste compétente pour la sécurité sociale (règlement UE 883/2004 intra-UE).

Comment démarrer : contacter HR Mobility (hr-mobility@mistralhr.demo) → ouverture d'un dossier → validation manager + Finance → avenant signé → briefing RH destination → logistique relocation (si applicable, budget plafonné selon politique interne).`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── FRANCE — TAX ──────────────────────────────────────────
  {
    id: "fr-tax",
    title: "Fiscalité Locale — France",
    description: "Impôt sur le revenu, prélèvement à la source et cotisations sociales salariales.",
    desc: "Impôt sur le revenu, prélèvement à la source et cotisations sociales salariales.",
    countries: ["France"],
    topic: "tax",
    icon: "🧾",
    updatedAt: "2024-01-01",
    legalRefs: [
      "CGI Art. 197 (barème IR)",
      "Code de la Sécurité Sociale (cotisations)",
      "Décret 2018-514 (PAS)",
    ],
    content: `Prélèvement à la source (PAS) depuis 2019 : l'impôt sur le revenu est prélevé directement par l'employeur sur le salaire net imposable au taux personnalisé transmis par la DGFiP. Le salarié peut le modifier sur impots.gouv.fr.

Barème IR 2024 (revenus 2023) :
- 0% jusqu'à 11 294 €
- 11% de 11 294 € à 28 797 €
- 30% de 28 797 € à 82 341 €
- 41% de 82 341 € à 177 106 €
- 45% au-delà

Cotisations sociales salariales (approximatif) : ~22% du salaire brut (assurance maladie, retraite de base CNAV, retraite complémentaire AGIRC-ARRCO, chômage, CSG/CRDS).

À noter : la CSG (9,2%) et la CRDS (0,5%) s'appliquent sur 98,25% du salaire brut.`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── FRANCE — HEALTH ───────────────────────────────────────
  {
    id: "fr-health",
    title: "Mutuelle & Prévoyance — France",
    description: "Couverture santé complémentaire obligatoire et prévoyance collective.",
    desc: "Couverture santé complémentaire obligatoire et prévoyance collective.",
    countries: ["France"],
    topic: "health",
    icon: "🩺",
    updatedAt: "2024-01-01",
    legalRefs: [
      "ANI du 11 janvier 2013 (généralisation complémentaire santé)",
      "Code de la Sécurité Sociale L911-7",
    ],
    content: `Mutuelle santé (complémentaire) : toute entreprise est tenue de proposer une couverture santé collective (ANI 2013, codifié à L911-7 CSS). La société a souscrit un contrat collectif obligatoire.

Niveaux de couverture :
- Base légale (panier de soins minimal) incluse pour tous
- Options renforcées disponibles (optique, dentaire, médecines douces)
- L'employeur prend en charge au minimum 50% de la cotisation de base

Prévoyance : accord de prévoyance collectif couvrant incapacité de travail, invalidité, décès. Taux de remplacement et délais de carence définis dans l'accord (disponible sur l'intranet RH).

Portabilité : en cas de départ, la couverture santé et prévoyance est maintenue pendant la période de chômage (max 12 mois) via le mécanisme de portabilité (L911-8 CSS).`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── FRANCE — PREMIUMS ─────────────────────────────────────
  {
    id: "fr-premiums",
    title: "Primes & Avantages — France",
    description: "Titre-restaurant, transport, intéressement, PEE, retraite supplémentaire, prime home office.",
    desc: "Titre-restaurant, transport, intéressement, PEE, retraite supplémentaire, prime home office.",
    countries: ["France"],
    topic: "premiums",
    icon: "💶",
    updatedAt: "2024-01-01",
    legalRefs: [
      "Code du Travail L3262-1 (titre-restaurant)",
      "Code du Travail L3312-1 (intéressement)",
      "Code Monétaire L214-39 (PEE)",
    ],
    content: `Titre-restaurant : valeur faciale ~10€/jour (L3262-1). Part patronale : 60% (exonérée de charges si ≤ 6,91€ en 2024). Distribués via carte Swile/Ticket Restaurant.

Transport : prise en charge obligatoire de 50% de l'abonnement transport en commun (Navigo, TER, etc.). Forfait mobilités durables jusqu'à 700€/an net pour vélo, covoiturage.

Intéressement / Participation : accord d'intéressement — versement annuel selon résultats. Participation légale obligatoire si >50 salariés (L3312-1). Versement possible sur PEE ou en numéraire.

PEE / PERCO : Plan d'Épargne Entreprise (abondement employeur) et PERCO/PER Collectif pour la retraite supplémentaire. Fonds disponibles sur l'espace Amundi dédié.

Actions société : plan d'actionnariat salarié annuel (conditions et prix préférentiel publiés lors de chaque ouverture).

Prime home office : indemnité télétravail fixée par accord d'entreprise (montant exact sur intranet).`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── FRANCE — WORKSITE ─────────────────────────────────────
  {
    id: "fr-worksite",
    title: "Télétravail & Conditions de Travail — France",
    description: "Modalités remote/hybride/présentiel. Accord télétravail France.",
    desc: "Modalités remote/hybride/présentiel. Accord télétravail France.",
    countries: ["France"],
    topic: "worksite",
    icon: "🏠",
    updatedAt: "2024-01-01",
    legalRefs: [
      "Code du Travail L1222-9 à L1222-11",
      "ANI Télétravail du 26 novembre 2020",
    ],
    content: `Cadre légal : le télétravail est régi par L1222-9 à L1222-11 (accord collectif ou charte employeur requise). L'ANI du 26 novembre 2020 fixe les principes (volontariat, réversibilité, droit à la déconnexion, prise en charge des équipements).

Accord télétravail : jusqu'à 3 jours de télétravail par semaine pour les postes éligibles (déterminé avec le manager). Les nouveaux embauchés suivent une période d'intégration sur site (min. 3 mois) avant accès au télétravail régulier.

Équipement : PC portable fourni par IT. Écran supplémentaire et chaise ergonomique pris en charge via prime home office.

Durée du travail : 35h/semaine légale (L3121-27). Heures supplémentaires : +25% pour les 8 premières, +50% au-delà. Cadres au forfait jours : 218j/an max (L3121-64).

Sécurité informatique : connexion VPN obligatoire en télétravail.`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── FRANCE — ONBOARDING ───────────────────────────────────
  {
    id: "fr-onboarding",
    title: "Onboarding & Offboarding — France",
    description: "Processus d'intégration, IT setup, politique PC/logiciels et procédure de départ.",
    desc: "Processus d'intégration, IT setup, politique PC/logiciels et procédure de départ.",
    countries: ["France"],
    topic: "onboarding",
    icon: "🚀",
    updatedAt: "2024-01-01",
    legalRefs: [
      "Code du Travail L1221-1 (contrat)",
      "Code du Travail L1221-19 (période d'essai)",
      "RGPD Art. 17 (droit à l'effacement)",
    ],
    content: `Onboarding (J-1 à J+90) :
- J-1 : accueil IT, remise PC, création comptes (AD, Microsoft 365, Slack, Jira, Workday)
- J1 : Welcome Day France — présentation RH, politique sécurité, visite site
- J7 : accès Learning Academy (catalogue formations en ligne)
- J30 : point d'étonnement avec le manager
- J90 : fin période d'intégration, bilan avec RH

Période d'essai (L1221-19 CDI) : Employés 2 mois, Techniciens 3 mois, Cadres 4 mois (renouvelable 1 fois si accord de branche).

Politique IT & PC :
- PC standard : Windows 11, Office 365, Teams, Zoom
- Logiciels supplémentaires : demande via ServiceNow (validation RSSI requise)
- BYOD non autorisé

Offboarding :
- Préavis selon CCN et ancienneté
- Restitution matériel sous 5 jours ouvrés après départ
- Accès systèmes révoqués le jour du départ (automatique via AD)
- Solde de tout compte remis lors du dernier jour`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── FRANCE — COMPENSATION ─────────────────────────────────
  {
    id: "fr-pay-transparency",
    title: "Pay Transparency — France",
    description: "Égalité salariale et reporting sur l'écart femmes-hommes (EU Dir. 2023/970).",
    desc: "Égalité salariale et reporting sur l'écart femmes-hommes (EU Dir. 2023/970).",
    countries: ["France"],
    topic: "compensation",
    icon: "⚖️",
    updatedAt: "2024-06-01",
    legalRefs: [
      "Code du Travail L3221-1 à L3221-7",
      "EU Directive 2023/970",
    ],
    content: `L3221-1 pose le principe d'égalité de rémunération pour un travail de valeur égale. L'employeur est tenu de supprimer les écarts injustifiés (L3221-2).

Index Égalité Professionnelle : publication annuelle avant le 1er mars pour toute entreprise ≥ 50 salariés.

EU Dir. 2023/970 (applicable 2026) : droit individuel à l'information salariale, interdiction des clauses de confidentialité sur salaires, obligation de reporting public par genre et catégorie.`,
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── BELGIUM — LEAVE ───────────────────────────────────────
  {
    id: "be-annual-leave",
    title: "Congé Annuel — Belgique",
    description: "20 jours légaux (4 semaines) pour temps plein 38h. Pécule double ~92% salaire mensuel.",
    desc: "20 jours légaux (4 semaines) pour temps plein 38h. Pécule double ~92% salaire mensuel.",
    countries: ["Belgium"],
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
    desc: "Salaire garanti 30 jours (Art. 52 Loi 3 juillet 1978), puis indemnités INAMI.",
    countries: ["Belgium"],
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
    desc: "10 jours fériés nationaux légaux. Jour de remplacement si férié = dimanche.",
    countries: ["Belgium"],
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
    desc: "Mutation interne, détachement UE/hors-UE, relocation et clause de mobilité.",
    countries: ["Belgium"],
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
    desc: "IPP, précompte professionnel, cotisations ONSS (13,07% salariales).",
    countries: ["Belgium"],
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
    countries: ["Belgium"],
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
    desc: "Assurance hospitalisation collective + mutualité légale INAMI. Couverture collective.",
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── BELGIUM — PREMIUMS ────────────────────────────────────
  {
    id: "be-premiums",
    title: "Primes & Avantages — Belgique",
    description: "Chèques-repas, transport, participation bénéfices, pension complémentaire, prime home office.",
    countries: ["Belgium"],
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
    desc: "Chèques-repas, transport, participation bénéfices, pension complémentaire, prime home office.",
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── BELGIUM — WORKSITE ────────────────────────────────────
  {
    id: "be-worksite",
    title: "Télétravail & Conditions de Travail — Belgique",
    description: "Accord collectif télétravail, 38h/semaine, flexibilité et droit à la déconnexion (Belgique).",
    countries: ["Belgium"],
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
    desc: "Accord collectif télétravail, 38h/semaine, flexibilité et droit à la déconnexion (Belgique).",
    ring: "linear-gradient(135deg, #FF7000, #FF9A40)",
  },

  // ── BELGIUM — ONBOARDING ──────────────────────────────────
  {
    id: "be-onboarding",
    title: "Onboarding & Offboarding — Belgique",
    description: "Intégration J1-J90, politique IT/PC, procédure de départ et solde de tout compte.",
    desc: "Intégration J1-J90, politique IT/PC, procédure de départ et solde de tout compte.",
    countries: ["Belgium"],
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
    desc: "Égalité salariale (Loi 22 avril 2012) et EU Dir. 2023/970.",
    countries: ["Belgium"],
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

export const francePolicies: Policy[] = policies.filter((p) =>
  p.countries.includes("France")
);

export const belgiumPolicies: Policy[] = policies.filter((p) =>
  p.countries.includes("Belgium")
);

export function getPoliciesForCountry(country: string): Policy[] {
  const COUNTRY_POLICIES: Record<string, Policy[]> = {
    France: francePolicies,
    Belgium: belgiumPolicies,
  };
  return COUNTRY_POLICIES[country] ?? [];
}
