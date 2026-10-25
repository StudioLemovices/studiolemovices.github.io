#!/usr/bin/env python3
"""Génère les pages du site à partir de contenu.json et de modele.html.

Fichiers produits (à ne pas modifier à la main) :
  index.html            l'accueil
  <slug>/index.html     une vraie page par pièce, lisible sans JavaScript
  404.html              page de secours de GitHub Pages
  sitemap.xml, robots.txt

Lancé automatiquement par la GitHub Action .github/workflows/generer-pages.yml
à chaque modification ; à la main : python3 scripts/generer.py
Aucune dépendance en dehors de Python 3.
"""
import html
import json
import os
import re
import shutil
import struct
from urllib.parse import urlsplit

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Numéro de version de style.css et app.js : à changer quand l'un des deux change,
# pour que les navigateurs chargent aussitôt la nouvelle version.
VERSION = '2026-10-27'

# Dossiers du dépôt qui ne sont pas des pages de pièces (jamais effacés).
RESERVES = {'pieces', 'making-of', 'methode', 'site', 'logo', 'fonts', 'liens', 'scripts', '.github'}


def lire(chemin):
    with open(os.path.join(RACINE, chemin), encoding='utf-8') as f:
        return f.read()


def ecrire(chemin, texte):
    chemin = os.path.join(RACINE, chemin)
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    with open(chemin, 'w', encoding='utf-8') as f:
        f.write(texte)


def e(texte):
    return html.escape(str(texte), quote=True)


def fr(valeur):
    return valeur.get('fr', '') if isinstance(valeur, dict) else (valeur or '')


def resume(texte, limite=155):
    """Meta description : le texte coupé proprement à ~155 caractères."""
    texte = ' '.join(texte.split())
    if len(texte) <= limite:
        return texte
    coupe = texte[:limite].rsplit(' ', 1)[0].rstrip(' ,;:—-')
    return coupe + '…'


def taille_jpeg(chemin):
    """Largeur et hauteur d'un JPEG, sans bibliothèque externe."""
    with open(os.path.join(RACINE, chemin), 'rb') as f:
        if f.read(2) != b'\xff\xd8':
            return None
        while True:
            octet = f.read(1)
            while octet and octet != b'\xff':
                octet = f.read(1)
            while octet == b'\xff':
                octet = f.read(1)
            if not octet:
                return None
            marqueur = octet[0]
            longueur = struct.unpack('>H', f.read(2))[0]
            if marqueur in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                hauteur, largeur = struct.unpack('>xHH', f.read(5))
                return largeur, hauteur
            f.seek(longueur - 2, 1)


def classe_format(chemin):
    """Même règle que app.js : 4:5 par défaut, .wide pour 5:4, .free sinon."""
    dims = taille_jpeg(chemin) if chemin.lower().endswith(('.jpg', '.jpeg')) else None
    if not dims:
        return ''
    r = dims[0] / dims[1]
    if abs(r - 1.25) < 0.03:
        return ' wide'
    if abs(r - 0.8) >= 0.03:
        return ' free'
    return ''


def main():
    C = json.loads(lire('contenu.json'))
    site = C['site_url'].rstrip('/')
    base = (urlsplit(site).path.rstrip('/') or '') + '/'
    modele = lire('modele.html')
    ui = {k: fr(v) for k, v in C['interface'].items()}
    nom = C['nom']
    pieces = C['pieces']
    familles = {f['id']: f for f in C['familles']}

    def page(tete, piece='', piece_cachee=True, noscript=''):
        return (modele
                .replace('{{BASE}}', base)
                .replace('{{VERSION}}', VERSION)
                .replace('{{TETE}}', tete)
                .replace('{{PIECE_HIDDEN}}', ' hidden' if piece_cachee else '')
                .replace('{{PIECE}}', piece)
                .replace('{{NOSCRIPT}}', noscript))

    def og(titre, description, url, image, image_alt, largeur=None, hauteur=None):
        lignes = [
            '<meta property="og:type" content="website">',
            f'<meta property="og:site_name" content="{e(nom)}">',
            f'<meta property="og:title" content="{e(titre)}">',
            f'<meta property="og:description" content="{e(description)}">',
            f'<meta property="og:url" content="{e(url)}">',
            f'<meta property="og:image" content="{e(image)}">',
        ]
        if largeur and hauteur:
            lignes += [f'<meta property="og:image:width" content="{largeur}">',
                       f'<meta property="og:image:height" content="{hauteur}">']
        lignes += [f'<meta property="og:image:alt" content="{e(image_alt)}">',
                   '<meta name="twitter:card" content="summary_large_image">']
        return '\n'.join(lignes)

    liens_pieces = ''.join(f'<li><a href="{e(p["slug"])}/">{e(p["nom"])}</a></li>' for p in pieces)
    noscript = (f'<p class="noscript">{e(nom)} — {e(fr(C["accueil"]["lieux"]))} — '
                f'<a href="{e(C["contact"]["instagram"])}">Instagram</a></p>'
                f'<nav class="noscript"><ul>{liens_pieces}</ul></nav>')

    # ---------- Accueil ----------
    seo = C['seo']
    jsonld = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': nom,
        'description': seo['description_accueil'],
        'url': site + '/',
        'logo': site + '/' + C['accueil']['logo'],
        'image': site + '/og-image.png',
        'areaServed': [{'@type': 'City', 'name': 'Bruxelles'}, {'@type': 'City', 'name': 'Lyon'}],
        'sameAs': [C['contact']['instagram']],
    }
    tete_accueil = '\n'.join([
        f'<title>{e(seo["titre_accueil"])}</title>',
        f'<meta name="description" content="{e(seo["description_accueil"])}">',
        f'<link rel="canonical" href="{e(site)}/">',
        '',
        og(nom, 'Chaque pièce est unique. Mobilier sur mesure en bois massif — Bruxelles / Lyon.',
           site + '/', site + '/og-image.png', nom, 1200, 630),
        '<script type="application/ld+json">',
        json.dumps(jsonld, ensure_ascii=False, indent=2),
        '</script>',
    ])
    ecrire('index.html', page(tete_accueil, noscript=noscript))

    # ---------- 404 (adresse inconnue : le script ramène à l'accueil) ----------
    tete_404 = '\n'.join([
        f'<title>{e(seo["titre_accueil"])}</title>',
        '<meta name="robots" content="noindex">',
    ])
    ecrire('404.html', page(tete_404, noscript=noscript))

    # ---------- Une page par pièce ----------
    n = len(pieces)
    slugs = []
    for i, p in enumerate(pieces):
        slug = p['slug']
        assert re.fullmatch(r'[\w-]+', slug) and slug not in RESERVES, slug
        slugs.append(slug)
        prec, suiv = pieces[(i - 1) % n], pieces[(i + 1) % n]
        f = familles.get(p['famille'])
        titre = f'{p["nom"]} · {nom}'
        description = resume(fr(p['texte']))
        url = f'{site}/{slug}/'
        photo = p['photos'][0]
        dims = taille_jpeg(photo) if photo.lower().endswith(('.jpg', '.jpeg')) else None

        photos = ''.join(
            f'\n              <button class="fiche-photo{classe_format(src)}" type="button" data-i="{k}" aria-label="{e(p["nom"])} {k + 1}/{len(p["photos"])}">'
            f'\n                <img src="{e(src)}" alt="{e(p["nom"])}" {"loading=\"lazy\"" if k else "fetchpriority=\"high\""} decoding="async" width="1500" height="2000">'
            f'\n              </button>'
            for k, src in enumerate(p['photos']))
        mo_dir = (p.get('making_of') or f'making-of/{slug}/').rstrip('/') + '/'
        fiche = f'''
      <article class="fiche wrap">
        <div class="fiche-grid">
          <div class="fiche-photos">{photos}
            <div class="mo-row" data-slug="{e(slug)}" data-dir="{e(mo_dir)}" data-name="{e(p["nom"])}" hidden>
              <div class="mo-head"><h3>{e(fr(C["making_of"]["titre"]))}</h3><span class="count"></span></div>
              <div class="mo-strip"></div>
            </div>
          </div>
          <div class="fiche-info">
            <a class="back" href="./" data-back>← {e(ui["retour"])}</a>
            <p class="eyebrow">{e(f"{f['num']} — {f['nom']}" if f else '')}</p>
            <h1 class="fiche-title">{e(p["nom"])}</h1>
            <p class="fiche-sub lead">« {e(fr(p["sous_titre"]))} »</p>
            <p class="fiche-mat"><span class="eyebrow">{e(ui["matieres"])}</span><span>{e(fr(p["matieres"]))}</span></p>
            <p class="fiche-text">{e(fr(p["texte"]))}</p>
            <p class="fiche-mention">{e(fr(C["contact"]["mention"]))}</p>
            <div class="fiche-actions">
              <a class="btn" href="./#contact" data-goto="contact">{e(ui["nav_contact"])}</a>
            </div>
          </div>
        </div>
        <nav class="fiche-nav">
          <a class="pn prev" href="{e(prec["slug"])}/"><span class="eyebrow">← {e(ui["precedente"])}</span><strong>{e(prec["nom"])}</strong></a>
          <a class="back mid" href="./" data-back>{e(ui["retour"])}</a>
          <a class="pn next" href="{e(suiv["slug"])}/"><span class="eyebrow">{e(ui["suivante"])} →</span><strong>{e(suiv["nom"])}</strong></a>
        </nav>
      </article>'''
        tete = '\n'.join([
            f'<title>{e(titre)}</title>',
            f'<meta name="description" content="{e(description)}">',
            f'<link rel="canonical" href="{e(url)}">',
            '',
            og(titre, description, url, f'{site}/{photo}', p['nom'], *(dims or (None, None))),
        ])
        ecrire(f'{slug}/index.html', page(tete, piece=fiche, piece_cachee=False, noscript=noscript))

    # Pages de pièces retirées de contenu.json : on efface leur dossier généré.
    for dossier in os.listdir(RACINE):
        chemin = os.path.join(RACINE, dossier)
        if (os.path.isdir(chemin) and dossier not in RESERVES and dossier not in slugs
                and not dossier.startswith('.') and os.listdir(chemin) == ['index.html']
                and 'class="fiche wrap"' in lire(f'{dossier}/index.html')):
            shutil.rmtree(chemin)

    # ---------- sitemap.xml et robots.txt ----------
    urls = [site + '/'] + [f'{site}/{s}/' for s in slugs]
    ecrire('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + ''.join(f'  <url>\n    <loc>{e(u)}</loc>\n  </url>\n' for u in urls)
           + '</urlset>\n')
    ecrire('robots.txt', f'User-agent: *\nAllow: /\n\nSitemap: {site}/sitemap.xml\n')
    print(f'{len(slugs)} pages de pièces, accueil, 404, sitemap.xml ({len(urls)} adresses) et robots.txt générés.')


if __name__ == '__main__':
    main()
