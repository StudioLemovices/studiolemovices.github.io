# Brief : site vitrine Studio Lemovices

Tu construis le site vitrine de Studio Lemovices, studio de mobilier sur mesure en bois massif (Bruxelles / Lyon). Tout le contenu est prêt dans ce dépôt : n'écris aucun texte toi-même, prends-les dans `contenu.json`. Travaille en une seule passe, sans me poser de questions sauf blocage réel.

## Technique
- Site statique, HTML + CSS + JavaScript simple, **sans framework ni étape de build**, publié par GitHub Pages depuis la branche `main` (racine).
- Tout le contenu (pièces, textes FR/EN, photos) vient de `contenu.json`. Ajouter une pièce = ajouter un bloc dans ce fichier et un dossier de photos, rien d'autre. Garde ce principe absolu.
- Polices **auto-hébergées** (fichiers woff2 dans `fonts/`, pas d'appel à Google Fonts) : Cormorant Garamond (titres) et Work Sans (texte).
- Aucun cookie, aucun traceur, aucun service tiers sauf les deux ci-dessous. Pas de bannière cookies.
- Images : déjà allégées (2000 px max). Ajoute `loading="lazy"`, `width`/`height`, et des textes alternatifs (nom de la pièce).
- Responsive impeccable sur téléphone (la plupart des visiteurs viennent d'Instagram).
- Balises `<title>`, description, Open Graph (image de partage = photo d'ensemble de la Table Quercus Aguacate), favicon tiré de `logo/logo-noir.svg`.

## Design
- Noir et blanc, sobre, haut de gamme, dans l'esprit du portfolio PDF : grands blancs, titres en capitales espacées en Cormorant Garamond, texte en Work Sans, les photos portent la couleur.
- **Dynamique et moderne** : apparitions douces au défilement, léger zoom au survol des photos, transitions fluides entre la grille et les fiches. Rien de clinquant ; respecter `prefers-reduced-motion`.
- Design unifié : même grille, mêmes marges, même typographie partout.

## Structure (une page + fiches)
1. **Accueil** : écran plein, uniquement le logo (`logo/logo-noir.svg`), « Studio Lemovices », la phrase `accueil.phrase`, `accueil.lieux`. Pas de photo.
2. **Intro** : « Un portfolio, pas un catalogue » + texte + origine du nom.
3. **Pièces** : 4 familles (Dining, Living, Working, Chess), grille de vignettes (photo d'ensemble, nom). Clic → fiche de la pièce (adresse propre et partageable, ex. `#/table-quercus-aguacate`) : photos en grand, nom, sous-titre entre guillemets « », matières, texte, mention « Pièce unique — projet sur mesure sur demande », pièce précédente / suivante, retour.
4. **À l'atelier (making-of)** : section à part, plus bas, présentée comme une catégorie en soi. Une rangée ou une galerie par pièce (dossier `making_of` de chaque pièce, fichiers 01.jpg, 02.jpg…), avec le nom de la pièce. Clic sur une photo = visionneuse plein écran (flèches, glisser sur téléphone, Échap).
5. **Comment naît une pièce** : les 4 étapes avec leur photo.
6. **À propos** : texte (photo `a_propos.photo`, jamais de photo de Benjamin).
7. **Contact** : phrase, formulaire (nom, e-mail, message), lien Instagram, lieux. **Aucune adresse e-mail ni téléphone visible** dans la page ni dans le code.
8. **Pied de page** : © Studio Lemovices, mentions légales courtes (éditeur : Studio Lemovices ; pas de cookies), lien Instagram.

- Bouton **FR / EN** en haut, mémorisé pendant la visite ; langue par défaut selon le navigateur (français sinon anglais). Pas de prix nulle part.

## Formulaire et statistiques
- Formulaire : **Web3Forms** (gratuit). Clé d'accès : `WEB3FORMS_KEY` (je te la donne dans la session ; place-la dans `contenu.json`). Anti-spam par champ piège invisible (honeypot), message de confirmation sympathique en FR/EN, sans quitter la page.
- Statistiques : **GoatCounter** (gratuit, sans cookies), code `GOATCOUNTER_CODE` dans `contenu.json`. Si je n'ai pas encore le code, laisse l'emplacement prêt et désactivé.

## Livrables
- Le site en ligne sur GitHub Pages.
- `README.md` en français, pour un non-informaticien : comment ajouter ou modifier une pièce directement sur github.com (crayon, glisser-déposer des photos), comment changer un texte, et ce qu'il faudra faire le jour où on branche le domaine studiolemovices.be.
- Un seul commit final propre ; pas de fichiers inutiles.
