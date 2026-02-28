import type { Policy } from "./types";

export const francePolicies: Policy[] = [
  // ── FRANCE — LEAVE ────────────────────────────────────────
  {
    id: "fr-annual-leave",
    title: "Congés Payés — France",
    description: "5 semaines de congés payés légaux (30 jours ouvrables). Acquisition: 2,5 jours/mois.",
    country: "France",
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
    country: "France",
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
    country: "France",
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
    country: "France",
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
    country: "France",
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
    country: "France",
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
    country: "France",
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
    country: "France",
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
    country: "France",
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
    country: "France",
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
];
