# Kadlec UI kit — jak to dát AI, aby se neodchylovala

**Proč to AI kazí:** z popisu („krémová, zelená, elegantní…“) si každý model domyslí vlastní hodnoty. Řešení: AI nedostane popis, ale **hotové CSS + obrázky cíle** a zákaz cokoli vymýšlet.

## Postup (3 kroky)
1. Přilož do chatu soubory **`kit.css`**, **`components.html`** a obrázky ze **`screens/`** (ideálně 2–4 výřezy ze `screens/sekce/`, které odpovídají tomu, co stavíš).
2. Vlož prompt níže a doplň, co má vzniknout.
3. Po vygenerování přilož screenshot výsledku vedle `01-kit-desktop.png` a napiš: *„Porovnej se vzorem a oprav všechny odchylky.“*

---

## Prompt (zkopíruj)

```
Vytvoř [CO – např. přihlašovací stránku klientské zóny / přehled smluv / formulář].

PRAVIDLA VZHLEDU – závazná, bez výjimek:
1. Připoj přiložený kit.css (<link rel="stylesheet" href="kit.css">) a Google Fonts:
   https://fonts.googleapis.com/css2?family=Gloock&family=Montserrat:wght@400;500;600;700&display=swap
2. Používej POUZE třídy a CSS proměnné z kit.css. Žádné vlastní barvy (hex/rgb), stíny,
   gradienty, border-radius, fonty ani velikosti písma. Vlastní CSS jen na layout
   (grid/flex, mezery přes násobky 8px, šířky).
3. Komponenty skládej přesně podle přiloženého components.html a screenshotů.
   Když prvek v kitu není, slož ho z existujících – nevymýšlej nový styl.
4. Plochy: .s-cream / .s-stone / .s-green / .s-forest. Tmavá plocha je VŽDY forest, nikdy černá.
   Sousední sekce nesmí mít stejnou plochu.
5. Kontrast: na cream/stone nikdy zelený text var(--g) → použij var(--g-ink) nebo var(--forest).
   Na zelené ploše vždy tmavý text, nikdy bílý.
6. Tlačítka jen .btn + varianta (.btn-dark primární, .btn-green, .btn-ghost, .btn-ghost-g na forest).
   Tvar „půl-pilulka“ (rovná levá, kulatá pravá) mají jen tlačítka, štítky a popisky – vše ostatní ostré rohy.
7. Nadpisy: Gloock (.t-hero .t-display .t-h2 .t-h3), vše ostatní Montserrat. Žádná kurzíva, žádný tučný Gloock.
8. Bez emoji, bez ikon v kolečkách, bez stínů, bez animací kromě přechodů z kit.css.
9. Responzivita: pod 980px jeden sloupec; testuj na 375px šířce bez vodorovného scrollu.

Před odevzdáním projdi kód a odstraň každou hodnotu barvy, stínu nebo zaoblení, která není z kit.css.
```

---

## Obsah balíčku
| Soubor | K čemu |
|---|---|
| `kit.css` | tokeny + všechny komponenty – jediný zdroj pravdy |
| `components.html` | živý katalog: barvy, kontrasty, typo, tlačítka, formuláře, tabulky, panely, vzory |
| `screens/01-kit-desktop.png` | celý katalog, desktop |
| `screens/02-kit-mobile.png` | celý katalog, mobil |
| `screens/03-profil-desktop.png` | hotová stránka v systému, desktop |
| `screens/04-profil-mobile.png` | hotová stránka v systému, mobil |
| `screens/sekce/01–08-*.png` | jednotlivé sekce katalogu v plném rozlišení – přikládej ty, které se týkají tvé obrazovky (AI dlouhé obrázky zmenšuje a ztrácí detail) |
| `screens/05-kit-hero-detail.png` | detail v 2× rozlišení (ostrost písma a tvarů) |
| `reference-profil.html` | zdroj hotové stránky (vzor skladby sekcí) |

## Rychlá kontrola výsledku (5 s)
- Je někde černá plocha? → chyba
- Je zelený text na krémové? → chyba
- Mají karty stín nebo zaoblené rohy? → chyba
- Je jiné písmo než Gloock / Montserrat? → chyba
- Mají tlačítka jiný tvar než rovná levá / kulatá pravá? → chyba
