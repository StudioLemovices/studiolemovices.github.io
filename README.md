# Studio Lemovices — site vitrine

Le site est en ligne ici : **https://studiolemovices.github.io**

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

Les autres fichiers (`index.html`, `style.css`, `app.js`, `fonts/`) font fonctionner le site : n'y touchez pas.

---

## Modifier un texte

1. Sur github.com, ouvrez le dépôt, puis cliquez sur **`contenu.json`**.
2. Cliquez sur le **crayon** (✏️ « Edit this file ») en haut à droite du fichier.
3. Trouvez le texte (raccourci : Ctrl+F ou Cmd+F) et modifiez-le **entre les guillemets**.
   Chaque texte existe en deux versions : `"fr": "…"` et `"en": "…"`.
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

**Étape 3 — la fiche dans `contenu.json`**
1. Ouvrez `contenu.json` et cliquez sur le crayon.
2. Repérez une pièce existante, par exemple le bloc qui commence par `"slug": "table-prunus-orbita"`.
   Copiez tout le bloc, de l'accolade `{` jusqu'à l'accolade `},` qui le ferme.
3. Collez-le juste après, et modifiez :
   - `"slug"` : le nom du dossier (`table-nouvelle`) — c'est aussi l'adresse de la fiche : `studiolemovices.github.io/#/table-nouvelle` ;
   - `"famille"` : `dining`, `living`, `working` ou `chess` ;
   - `"nom"`, `"sous_titre"`, `"matieres"`, `"texte"` (en français et en anglais) ;
   - `"photos"` : les chemins de vos photos, par exemple `"pieces/table-nouvelle/01-ensemble.jpg"` ;
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

## Le jour où vous branchez le domaine studiolemovices.be

1. **Chez le vendeur du domaine** (OVH, Gandi, one.com…), dans la zone « DNS », ajoutez :
   - 4 enregistrements **A** pour `studiolemovices.be` vers : `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` ;
   - 1 enregistrement **CNAME** pour `www` vers : `studiolemovices.github.io`.
2. **Sur github.com**, dans le dépôt : **Settings → Pages → Custom domain**, tapez `studiolemovices.be`, cliquez sur **Save**. Attendez que la vérification passe au vert (de quelques minutes à 24 h), puis cochez **Enforce HTTPS**.
3. **Dans `index.html`** (seule exception à la règle « n'y touchez pas ») : remplacez les 3 occurrences de `https://studiolemovices.github.io/` par `https://studiolemovices.be/` (ce sont les liens utilisés pour l'aperçu quand on partage le site sur Instagram, WhatsApp…).
4. **Sur web3forms.com** et **goatcounter.com** : rien d'obligatoire. Sur GoatCounter, vous pouvez indiquer le nouveau domaine dans les réglages pour que les statistiques restent propres.
5. **Mentions légales** : quand vous aurez une adresse ou un numéro d'entreprise, ajoutez-les dans `contenu.json`, rubrique `"mentions_texte"` (français et anglais).
