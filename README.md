# Studio Lemovices — site vitrine

Le site est en ligne ici : **https://studiolemovices.be**

Tout ce qui s'affiche sur le site (textes en français et en anglais, pièces, photos) vient d'un seul fichier : **`contenu.json`**. Vous n'avez jamais besoin de toucher aux autres fichiers.

Après chaque modification enregistrée sur github.com, le site se met à jour tout seul en 1 à 2 minutes. Si vous ne voyez pas le changement, rechargez la page (sur téléphone : fermez et rouvrez l'onglet).

---

## Où sont les choses

| Dossier / fichier | Ce qu'il contient |
|---|---|
| `contenu.json` | Tous les textes et la liste des pièces |
| `pieces/` | Un dossier par pièce, avec les photos de la fiche (`01-ensemble.jpg`, `02-detail.jpg`) |
| `making-of/` | Un dossier par pièce, avec les photos d'atelier (`01.jpg`, `02.jpg`, `03.jpg`…) |
| `methode/` | Les 4 photos de « Comment naît une pièce » |
| `site/` | La photo de la rubrique « À propos » |
| `logo/` | Le logo |

Les autres fichiers (`modele.html`, `style.css`, `app.js`, `scripts/`, `fonts/`) font fonctionner le site : n'y touchez pas.

**Pages générées automatiquement.** `index.html` (l'accueil), un dossier par pièce (`table-quercus-aguacate/index.html`…), `404.html`, `sitemap.xml` et `robots.txt` sont fabriqués à partir de `contenu.json` par une GitHub Action, à chaque modification (onglet **Actions** du dépôt : « Générer les pages »). Ne les modifiez pas à la main : vos changements seraient écrasés. Chaque pièce a ainsi sa vraie page, que Google peut lire et référencer.

---

## Modifier un texte

1. Sur github.com, ouvrez le dépôt, puis cliquez sur **`contenu.json`**.
2. Cliquez sur le **crayon** (✏️ « Edit this file ») en haut à droite du fichier.
3. Trouvez le texte (raccourci : Ctrl+F ou Cmd+F) et modifiez-le **entre les guillemets**.
   Chaque texte existe en trois versions : `"fr": "…"`, `"en": "…"` et `"es": "…"` (espagnol).
4. Cliquez sur le bouton vert **Commit changes…**, puis encore sur **Commit changes**.

⚠️ Trois règles pour ne rien casser :
- garder les guillemets droits `"` autour de chaque texte ;
- si vous voulez des guillemets à l'intérieur d'un texte, utilisez « » ou “ ” (jamais `"`) ;
- ne pas supprimer les virgules à la fin des lignes.

Si le site devient tout blanc après une modification, c'est presque toujours une virgule ou un guillemet oublié : ouvrez `contenu.json`, cliquez sur **History** (l'horloge), et revenez à la version précédente, ou corrigez l'erreur.

---

## Ajouter une pièce

**Étape 1 — les photos de la fiche**
1. Préparez vos photos (format JPG, 2000 px maximum sur le plus grand côté).
   Nommez-les `01-ensemble.jpg` (la photo d'ensemble, utilisée pour la vignette) et `02-detail.jpg`.
2. Sur github.com, ouvrez le dossier `pieces/`, cliquez sur **Add file → Upload files**.
3. Glissez-déposez les photos. Elles doivent aller dans un **nouveau dossier** au nom de la pièce : pour créer ce dossier, le plus simple est de glisser-déposer **le dossier entier** depuis votre ordinateur (par exemple un dossier `table-nouvelle` contenant les deux photos).
   Le nom du dossier : en minuscules, sans accents ni espaces, avec des tirets (`table-nouvelle`).
4. Cliquez sur **Commit changes**.

**Étape 2 — les photos d'atelier (facultatif)**
Même chose dans le dossier `making-of/` : un dossier au même nom (`table-nouvelle`), avec des photos nommées `01.jpg`, `02.jpg`, `03.jpg`… sans trou dans la numérotation. Le site les trouve tout seul.

**Rendu 3D (SketchUp)** : nommez-le `00.jpg` et mettez-le dans le dossier `making-of/` de la pièce. Il s'affiche en premier dans la rangée « À l'atelier » de la page de la pièce. Ça marche aussi pour une pièce sans photos d'atelier : créez simplement `making-of/<nom-de-la-pièce>/00.jpg`, la rangée apparaît avec ce seul dessin, sans rien changer dans `contenu.json`.

**Étape 3 — la fiche dans `contenu.json`**
1. Ouvrez `contenu.json` et cliquez sur le crayon.
2. Repérez une pièce existante, par exemple le bloc qui commence par `"slug": "table-prunus-orbita"`.
   Copiez tout le bloc, de l'accolade `{` jusqu'à l'accolade `},` qui le ferme.
3. Collez-le juste après, et modifiez :
   - `"slug"` : le nom du dossier (`table-nouvelle`) — c'est aussi l'adresse de la page de la pièce : `studiolemovices.be/table-nouvelle/` (créée automatiquement) ;
   - `"famille"` : `dining`, `living`, `working` ou `chess` ;
   - `"nom"` (par exemple « Banc Nouveau » en français, « New Bench » en anglais, « Banco Nuevo » en espagnol), `"sous_titre"`, `"matieres"`, `"texte"` : chacun en français, en anglais et en espagnol ;
   - `"photos"` : les chemins de vos photos, par exemple `"pieces/table-nouvelle/01-ensemble.jpg"` ;
   - `"vignette"` (facultatif) : la vignette de l'accueil, toujours en vertical 4:5, par exemple `"pieces/table-nouvelle/00-vignette.jpg"`. Utile quand la photo d'ensemble est horizontale (meuble long, format 5:4). Sans ce champ, l'accueil montre la première photo.
   - `"making_of"` : `"making-of/table-nouvelle/"`, ou `null` s'il n'y a pas de photos d'atelier.
4. Vérifiez la virgule entre deux blocs : chaque `}` est suivi d'une virgule, **sauf le dernier de la liste**.
5. **Commit changes**.

L'ordre des pièces dans `contenu.json` est l'ordre d'affichage sur le site (et celui des boutons « pièce précédente / suivante »).

## Modifier ou retirer une pièce
- **Changer une photo** : dans le dossier de la pièce, envoyez une nouvelle photo **avec exactement le même nom** (Add file → Upload files) : elle remplace l'ancienne.
- **Retirer une pièce** : supprimez son bloc dans `contenu.json` (attention à la virgule). Les photos peuvent rester, elles ne s'affichent plus.

---

## Formulaire de contact et statistiques

- Les messages du formulaire arrivent par e-mail grâce à **Web3Forms** (gratuit). L'adresse de réception est réglée sur le site web3forms.com, jamais sur ce site. La clé se trouve dans `contenu.json`, rubrique `"web3forms_key"`.
- Les visites sont comptées par **GoatCounter** (gratuit, sans cookies) : consultez-les sur https://studiolemovices.goatcounter.com. Pour couper le comptage, remplacez `"studiolemovices"` par `""` dans la rubrique `"goatcounter_code"`.

---

## Le domaine studiolemovices.be

Le site est branché sur **studiolemovices.be**. Les anciennes adresses en `studiolemovices.github.io` renvoient automatiquement vers la nouvelle (y compris les QR codes déjà imprimés).

Ce qui est en place, pour mémoire :
1. **Chez le vendeur du domaine**, dans la zone « DNS » :
   - 4 enregistrements **A** pour `studiolemovices.be` vers : `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` ;
   - 1 enregistrement **CNAME** pour `www` vers : `studiolemovices.github.io` (c'est normal : c'est l'adresse technique de GitHub, à laisser telle quelle).
2. **Sur github.com** : **Settings → Pages → Custom domain** = `studiolemovices.be`, avec **Enforce HTTPS** coché. Le fichier `CNAME` à la racine du dépôt garde ce réglage : ne le supprimez pas.
3. **Dans `contenu.json`**, tout en haut : `"site_url": "https://studiolemovices.be"`. C'est le seul endroit où l'adresse du site est écrite : toutes les pages, `sitemap.xml` et `robots.txt` sont régénérés automatiquement à partir de lui. Seule la page `liens/` (QR code) a sa propre adresse, écrite dans `liens/index.html`.
4. **Google Search Console** : ajoutez la propriété `https://studiolemovices.be` et envoyez-y `sitemap.xml`.
5. **GoatCounter** : vous pouvez indiquer le nouveau domaine dans les réglages pour que les statistiques restent propres.
6. **Mentions légales** : quand vous aurez une adresse ou un numéro d'entreprise, ajoutez-les dans `contenu.json`, rubrique `"mentions_texte"`.

---

## Numéro de version des fichiers du site

Les fichiers `style.css` et `app.js` sont appelés avec un numéro de version (`style.css?v=2026-10-30`…), réglé en haut de `scripts/generer.py` (ligne `VERSION = …`). Quand l'un de ces deux fichiers change, on change aussi ce numéro (par exemple la date du jour) : les navigateurs des visiteurs chargent alors tout de suite la nouvelle version, au lieu de garder l'ancienne en mémoire pendant quelques minutes.

Ce n'est pas nécessaire quand on modifie seulement `contenu.json` ou des photos.

---

## Référencement (Google)

- **Titre et description de l'accueil** : dans `contenu.json`, rubrique `"seo"` (`"titre_accueil"`, `"description_accueil"`).
- **Pages de pièces** : titre « Nom de la pièce · Studio Lemovices », description tirée du texte français, image de partage = la première photo. Tout est automatique.
- **Anciens liens** en `#/nom-de-la-piece` (déjà partagés sur Instagram ou WhatsApp) : ils mènent toujours à la bonne page.
- **Données structurées** (fiche « entreprise locale » pour Google) : générées dans l'accueil, sans adresse postale ni téléphone.

