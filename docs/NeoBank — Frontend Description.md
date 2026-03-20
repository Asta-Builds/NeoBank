---
title: "📱 NeoBank Maroc — Frontend Description"
tags:
  - fintech
  - neobank
  - frontend
  - flutter
  - nextjs
  - ux
  - design
  - "#project/neobank"
project: Neobank
stack: Flutter · Next.js · Tailwind CSS
author: Abdelilah Dahou
status: design
created: 2026-03-19
updated: 2026-03-19
---

# 📱 NeoBank Maroc — Frontend Description

> [!info] Contexte Frontend
> **Mobile App :** Flutter (iOS + Android)
> **Web App :** Next.js + Tailwind CSS (dashboard client + admin panel)
> **Design System :** Custom — Inspired by Revolut & N26, adapted for Moroccan UX
> **Languages :** Arabe (RTL) · Français · Anglais
> **Auth :** JWT + MFA (TOTP biométrique)

---

## 🗂️ Navigation

- [[#1. Design Philosophy]]
- [[#2. Design System & Visual Identity]]
- [[#3. App Architecture — Screens & Flows]]
- [[#4. Screen-by-Screen Description]]
- [[#5. Web Admin Panel]]
- [[#6. Component Library]]
- [[#7. Responsive & Accessibility]]
- [[#8. Micro-interactions & Animations]]
- [[#9. Offline & Error States]]
- [[#10. Flutter Project Structure]]

---

## 1. Design Philosophy

> [!abstract] Principe Fondateur
> **"Simple comme un SMS, sûr comme une banque."**
> Chaque écran doit pouvoir être compris par un utilisateur n'ayant jamais utilisé une app bancaire. Zéro jargon financier sans explication. Zéro friction inutile.

### Les 5 Piliers UX

```
┌─────────────────────────────────────────────────────────┐
│  1. CLARTÉ      → Une action principale par écran       │
│  2. CONFIANCE   → Design sérieux, couleurs stables      │
│  3. RAPIDITÉ    → Chaque flow en < 3 taps               │
│  4. ACCESSIBILITÉ → RTL Arabe natif, taille police ≥16  │
│  5. FEEDBACK    → Chaque action a une réponse visuelle  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Design System & Visual Identity

### Palette de Couleurs

```
PRIMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Bleu Océan       #1A56DB   → Actions principales, CTAs
  Bleu Nuit        #0F2B6F   → Header, navbar, textes forts

SECONDARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Or Sablé         #D4A853   → Premium badge, accents
  Vert Menthe      #10B981   → Succès, solde positif, KYC OK
  Rouge Corail     #EF4444   → Erreurs, alertes, débit
  Orange Ambre     #F59E0B   → Avertissements, KYC en cours

NEUTRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Blanc Pur        #FFFFFF   → Fonds cartes
  Gris Clair       #F9FAFB   → Fond général app
  Gris Moyen       #6B7280   → Labels secondaires
  Gris Foncé       #111827   → Texte principal
```

### Typographie

| Usage | Police | Taille | Poids |
|---|---|---|---|
| Titre principal | Poppins | 28px | Bold 700 |
| Titre section | Poppins | 20px | SemiBold 600 |
| Montant (solde) | Poppins | 38px | Bold 700 |
| Corps texte | Inter | 16px | Regular 400 |
| Labels | Inter | 14px | Medium 500 |
| Micro-texte | Inter | 12px | Regular 400 |
| Arabe (RTL) | Cairo | 16px | Regular 400 |

### Iconographie

- Bibliothèque : **Lucide Icons** (cohérence, open-source)
- Style : Outlined (pas de filled) → sensation moderne et légère
- Taille minimum : 24×24px pour accessibilité tactile
- Toutes les icônes ont un label texte (accessibilité)

### Spacing & Grid

```
Base unit : 4px
━━━━━━━━━━━━━━━━━━━━━━━
  xs  →  4px
  sm  →  8px
  md  →  16px
  lg  →  24px
  xl  →  32px
  2xl →  48px
  3xl →  64px

Border radius :
  Boutons   → 12px
  Cartes    → 20px
  Inputs    → 12px
  Chips     → 999px (pill)

Ombres :
  Card shadow → 0 4px 24px rgba(0,0,0,0.08)
  Modal shadow → 0 8px 48px rgba(0,0,0,0.16)
```

---

## 3. App Architecture — Screens & Flows

### Carte Globale des Écrans

```
APP NEOBANK MAROC
│
├── 🔓 ONBOARDING (non connecté)
│   ├── Splash Screen
│   ├── Welcome / Présentation (3 slides)
│   ├── Inscription
│   │   ├── Étape 1 : Email + Téléphone + Mot de passe
│   │   ├── Étape 2 : Vérification OTP (SMS + Email)
│   │   └── Étape 3 : Création profil (Nom, Date naissance)
│   ├── Connexion
│   │   ├── Email + Mot de passe
│   │   └── MFA (TOTP / Biométrie)
│   └── Mot de passe oublié
│
├── 🪪 KYC (après connexion, avant accès wallet)
│   ├── Explication KYC (pourquoi ?)
│   ├── Choix document (CIN / Passeport)
│   ├── Capture recto CIN
│   ├── Capture verso CIN
│   ├── Selfie + liveness check
│   ├── Récapitulatif & envoi
│   └── Écran d'attente / Statut KYC
│
├── 🏠 HOME (connecté + KYC validé)
│   ├── Dashboard principal
│   ├── Notifications
│   └── Recherche utilisateur
│
├── 💳 WALLET
│   ├── Solde détaillé
│   ├── Recharger le portefeuille
│   ├── Carte virtuelle
│   └── Limites de dépense
│
├── 💸 TRANSFERTS
│   ├── Envoyer de l'argent
│   ├── Choisir bénéficiaire
│   ├── Saisir montant + description
│   ├── Confirmation (récapitulatif)
│   └── Résultat (succès / échec)
│
├── 📋 TRANSACTIONS
│   ├── Historique complet
│   ├── Filtres (date, type, statut)
│   └── Détail transaction
│
├── 👤 PROFIL
│   ├── Informations personnelles
│   ├── Sécurité (MFA, mot de passe)
│   ├── Préférences notifications
│   ├── Langue (FR / AR / EN)
│   └── Déconnexion
│
└── 🔔 NOTIFICATIONS
    ├── Liste des notifications
    └── Détail notification
```

---

## 4. Screen-by-Screen Description

### 🌊 Splash Screen

```
┌─────────────────────────┐
│                         │
│                         │
│         [LOGO]          │
│       NeoBank           │
│        Maroc            │
│                         │
│    ████████████████     │  ← Progress bar animée
│                         │
│    Sécurisé par         │
│    Bank Al-Maghrib      │
└─────────────────────────┘
```

**Description :**
- Fond dégradé vertical **Bleu Nuit → Bleu Océan** (`#0F2B6F → #1A56DB`)
- Logo centré avec animation **scale-in** (0.8 → 1.0, 800ms, ease-out)
- Tagline : *"Votre banque, partout avec vous"* en Inter Regular
- Progress bar animée en bas (durée : 2s, chargement des configs)
- Badge discret "Sécurisé · Certifié DGSSI" en bas

---

### 👋 Welcome Screens (3 slides onboarding)

#### Slide 1 — Ouverture de compte
```
┌─────────────────────────┐
│  ← skip                 │
│                         │
│   [Illustration SVG]    │
│   Téléphone + compte    │
│                         │
│  Ouvrez votre compte    │
│  en 5 minutes           │
│                         │
│  Plus besoin d'agence.  │
│  Juste votre CIN et     │
│  votre téléphone.       │
│                         │
│  ● ○ ○                  │
│                         │
│  [  Suivant  →  ]       │
└─────────────────────────┘
```

#### Slide 2 — Transferts instantanés
```
┌─────────────────────────┐
│  ← skip                 │
│                         │
│   [Illustration SVG]    │
│   Flèches d'argent      │
│                         │
│  Envoyez de l'argent    │
│  en un instant          │
│                         │
│  P2P gratuit entre      │
│  membres NeoBank.       │
│  0 frais cachés.        │
│                         │
│  ○ ● ○                  │
│                         │
│  [  Suivant  →  ]       │
└─────────────────────────┘
```

#### Slide 3 — Sécurité totale
```
┌─────────────────────────┐
│  ← skip                 │
│                         │
│   [Illustration SVG]    │
│   Bouclier + cadenas    │
│                         │
│  Votre argent,          │
│  100% protégé           │
│                         │
│  Chiffrement AES-256,   │
│  MFA, alertes temps     │
│  réel sur chaque tx.    │
│                         │
│  ○ ○ ●                  │
│                         │
│  [ Créer mon compte ]   │
│  [ J'ai déjà un compte ]│
└─────────────────────────┘
```

**Notes UX :**
- Illustrations : style **flat design** avec personnages diversifiés (représentation marocaine)
- Swipe horizontal natif entre slides
- Indicateur de progression (dots) animé
- Bouton "skip" discret en haut à droite

---

### 📝 Inscription — Étape 1/3

```
┌─────────────────────────┐
│  ←   Créer un compte    │
│  ━━━━━●○○━━━━━━━━━━━━  │  ← Progress steps
│                         │
│  Vos informations       │
│  de base                │
│                         │
│  Email *                │
│  ┌─────────────────┐    │
│  │ vous@email.com  │    │
│  └─────────────────┘    │
│                         │
│  Téléphone *            │
│  ┌────┐ ┌────────────┐  │
│  │+212│ │ 06XXXXXXXX │  │
│  └────┘ └────────────┘  │
│                         │
│  Mot de passe *         │
│  ┌─────────────────┐    │
│  │ - - - - - - - - - -    👁 │    │
│  └─────────────────┘    │
│  ████░░░░  Moyen        │  ← Force mdp
│                         │
│  ☑ J'accepte les CGU    │
│                         │
│  [  Continuer  →  ]     │
└─────────────────────────┘
```

**Validations temps réel :**
- Email → format RFC 5322
- Téléphone → format `06/07 XXXXXXXX` Maroc, auto-préfixe `+212`
- Mot de passe → min 8 chars, 1 majuscule, 1 chiffre, 1 spécial
- Barre de force colorée : Rouge → Orange → Vert

---

### 🔐 Vérification OTP — Étape 2/3

```
┌─────────────────────────┐
│  ←   Vérification       │
│  ━━━━━━━━━●○━━━━━━━━━  │
│                         │
│  Code envoyé au         │
│  +212 06XX XXX XXX      │
│                         │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐   │
│  │  │ │  │ │  │ │  │   │  ← OTP 4 inputs séparés
│  └──┘ └──┘ └──┘ └──┘   │
│                         │
│  ⏱ Code valide : 08:42  │
│                         │
│  Vous n'avez pas reçu   │
│  le code ?              │
│  [Renvoyer] dans 30s    │
│                         │
│  Vérifier aussi Email   │
│  [Vérifier email OTP]   │
└─────────────────────────┘
```

**Comportement :**
- Auto-focus sur le prochain input après chaque chiffre
- Coller un code à 4 chiffres remplit automatiquement tous les inputs
- Compte à rebours visible, bouton renvoyer actif après 30s
- Sur succès : animation **check
