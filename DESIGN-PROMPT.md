# Design prompt — Ondřej Kadlec & partneři

> Zkopíruj celý text pod čarou do nového chatu / nástroje (Claude, Cursor, v0, Lovable…) a připiš, co má vzniknout. Zdroj pravdy: `profil.html`.

---

Navrhuj v tomto vizuálním systému. Dodrž ho přesně — barvy, písma, tvary i kontrasty. Nepřidávej vlastní barvy, stíny, přechody ani zaoblené karty.

## 1. Charakter

Klidné, sebevědomé, lidské. Redakční (časopisecká) velká patková písma, hodně vzduchu, plné barevné plochy místo karet a stínů. Krémový papír, hluboká lesní zelená a jedna jasná zelená jako signál. **Žádná černá plocha** — tmavá je vždy lesní zelená. Nesmí působit sterilně ani „bankovně“; má působit jako člověk z regionu, který ví, o čem mluví.

Cílovka: lidé 30–60 let z Jemnice a okolí, nedůvěřiví k prodejcům. Uhlazený marketing čtou jako prodejní signál → jasnost a čitelnost má přednost před efekty.

## 2. Barvy (CSS tokeny)

```css
:root{
  --cream:   #f4eee3; /* hlavní pozadí (papír) */
  --stone:   #ebe3d4; /* druhé pozadí: střídání sekcí, plochy obrázků */
  --paper:   #fffaf1; /* nejsvětlejší – nadpisy na tmavé zelené */
  --ink:     #1c1a17; /* text (teplá téměř-černá, jen pro text a linky, nikdy plocha) */
  --muted:   #5c564d; /* sekundární text na krémové */
  --forest:  #0f3b2a; /* tmavá plocha: patička, tmavé sekce, primární tlačítko */
  --forest-2:#164d37; /* hover tmavého tlačítka */
  --g:       #2bd47f; /* jasná zelená: hero plocha, sekce „proces“, akcenty na tmavé */
  --g-deep:  #1fb86a; /* hover zeleného tlačítka */
  --g-ink:   #0d6b3e; /* zelená pro TEXT na krémové (štítky, hover odkazů) */
  --on-forest-text:#cfe0d5; /* odstavce na lesní zelené */
  --on-forest-muted:#b9cbbf; /* patička, drobný text na lesní zelené */
}
```

Linky / oddělovače: `rgba(28,26,23,.2)` na krémové, `rgba(10,2,3,.25)` na jasné zelené, `rgba(43,212,127,.25)` na lesní zelené.

### Poměr ploch
- ~60 % krémová/stone, ~25 % jasná zelená, ~15 % lesní zelená.
- Sekce se střídají plnými plochami: **cream → stone → zelená → forest → cream…** Nikdy dvě stejné za sebou.

### Kontrast (WCAG, ověřeno)
| Text | Pozadí | Poměr | Použití |
|---|---|---|---|
| ink #1c1a17 | cream | 15.0 | běžný text |
| ink | jasná zelená #2bd47f | 9.0 | text na zelené ploše (vždy tmavý!) |
| muted #5c564d | cream / stone | 6.3 / 5.7 | sekundární text |
| forest | cream | 10.8 | nadpisy na krémové |
| g-ink #0d6b3e | cream | 5.7 | zelený text/štítky na krémové |
| jasná zelená | forest | 6.4 | akcent, tlačítko, odkazy na tmavé |
| paper / cream | forest | 12.0 / 10.8 | nadpisy a text na tmavé |
| #cfe0d5 | forest | 9.1 | odstavce na tmavé |

**Zakázáno:** jasná zelená `#2bd47f` jako text na krémové (1.7 : 1 — nečitelné). Na krémové vždy `--g-ink` nebo `--forest`. Na jasné zelené vždy tmavý text (`--ink` / `--forest`), nikdy bílý.

## 3. Typografie

```html
<link href="https://fonts.googleapis.com/css2?family=Gloock&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
```
- **Display:** `'Gloock', Georgia, serif` — jen váha 400. Velké nadpisy, čísla kroků, telefon, monogram „K“.
- **Text a UI:** `'Montserrat', system-ui, sans-serif` — 400 text, 500 accordeony/menu, 600 tlačítka/štítky, 700 logo.

| Role | Písmo | Velikost / proklad | Pozn. |
|---|---|---|---|
| H1 hero | Gloock 400 | `clamp(3rem, 6.2vw, 5.4rem)` / 1.02 | letter-spacing −.01em |
| Statement H2 | Gloock 400 | `clamp(2.4rem, 5.2vw, 4.4rem)` / 1.08 | max 20ch, klíčová část v akcentní barvě |
| Sekční H2 | Gloock nebo Montserrat 400 | `clamp(2.4rem, 5vw, 4rem)` / 1.05 | |
| H3 karta | Gloock 400 | `clamp(1.7rem, 2.8vw, 2.4rem)` / 1.1 | |
| Lead | Montserrat 400 | `clamp(1.6rem, 3vw, 2.4rem)` / 1.3 | max 30ch |
| Perex | Montserrat 400 | `clamp(1.05rem, 1.5vw, 1.25rem)` / 1.55 | max 30–44ch |
| Body | Montserrat 400 | 16px / 1.65–1.75 | max 52–56ch |
| Kicker / label | Montserrat 600 | 13–15px, UPPERCASE, tracking .06–.08em | |
| Tlačítko | Montserrat 600 | 15px, UPPERCASE, tracking .04em | |
| Patička | Montserrat 400 | 13px / 1.7 | |

Pravidla: kurzívu nepoužívat (`<em>` = barva, ne sklon). Nadpisy bez tučného řezu — hierarchii dělá velikost a patka. Čeština: pevné mezery po předložkách a spojkách (v, k, s, z, a, i, o, u).

## 4. Tvary a komponenty

**Podpis systému = „půl-pilulka“:** rovná levá strana, plně zaoblená pravá.
```css
--pill: 0 9999px 9999px 0;
```
Platí pro tlačítka, štítky (tagy), popisky fotek, mobilní menu. Nic jiného se nezaobluje — plochy, karty, obrázky mají ostré rohy (radius 0). Žádné stíny.

### Tlačítka (min-height 52px, padding 14px 30px 14px 22px, border 2px, šipka „→“ za textem, při hoveru posun o 4px)
| Varianta | Pozadí | Text | Hover | Kde |
|---|---|---|---|---|
| primární tmavé | forest | jasná zelená | forest-2 | na jasné zelené a krémové |
| zelené | jasná zelená | ink | g-deep | na krémové / stone |
| ghost zelené | transparent, border zelená | zelená | výplň zelená, text ink | na lesní zelené |
| ghost tmavé | transparent, border ink | ink | výplň forest, text zelená | na krémové / zelené |

Text tlačítek v první osobě klienta: „Chci druhý názor“, „Chci srovnat hypotéku“, „Domluvit první schůzku“.

### Další prvky
- **Štítek (tag):** pill, 14px/600 uppercase, padding 8px 22px 8px 14px; forest + zelený text, nebo zelená + forest text na tmavé.
- **Accordion:** `<details>`, linky 1px, chevron (2px rámeček otočený 45°) nebo „+“ rotující na „×“, otázka 500 / `clamp(1.1rem,1.8vw,1.5rem)`.
- **Menu (desktop):** boxovaný svislý seznam vpravo nahoře, 220px, rámečky 1px ink, polo-průhledné krémové pozadí, hover forest + zelený text. **Mobil:** forest pill „MENU“ → rozbalovací forest seznam.
- **Kroky procesu:** velké číslo Gloock 44px vlevo (56px sloupec), štítek + text vpravo, linky mezi kroky. Klíčový krok = plná forest karta (padding 36px), checklist s zelenými „fajfkami“ (rámeček 2px otočený −45°).
- **Fakta (důvěra):** řádek 4 sloupců nad linkou; label 13px uppercase v `--g-ink`, hodnota 16px muted.
- **Klientská zóna:** ghost-tmavý pill se zámkem (SVG, stroke 2) vpravo vedle loga.
- **Fotky:** asymetrická mřížka (1.4fr 1fr 1fr, jedna fotka přes dva řádky), ostré rohy, mezera 16px, hover zoom 1.04 / 0.8s. Popisek = krémová půl-pilulka vlevo dole.
- **Portrét:** výřez bez pozadí, černobílý (`grayscale(1) contrast(1.08)`), před obřím monogramem „K“ v Gloocku (jasná zelená, opacity .9) na stone ploše.

## 5. Layout a rytmus
- Kontejner max 1240px, okraje 32px (mobil 24px).
- Sekce: padding 120px nahoře/dole (mobil 80px).
- Dvousloupcová mřížka `minmax(0,1fr) minmax(0,1.25fr)`, mezera 72px — vlevo nadpis, vpravo obsah. Pod 980px jeden sloupec, mezera 40px.
- Hero: 50/50 split — vlevo jasně zelená plocha s nadpisem dole, vpravo stone s portrétem; výška `min(820px, 100vh)`.
- Hodně prázdného místa; text nikdy přes celou šířku (max 52–56ch).

## 6. Pohyb a přístupnost
- Přechody 0.2s (barvy), 0.25s (accordion), 0.8s `cubic-bezier(.2,.7,.2,1)` (zoom fotek). Žádné běžící pásky, točící se prvky, parallax ani autoplay.
- `prefers-reduced-motion` → vypnout animace.
- Focus: `outline 3px` jasná zelená na tmavé, forest na světlé, offset 3px.
- Dotykové cíle min. 44px, sémantické HTML (`<details>`, `<nav>`, `<dl>`), alt texty česky.

## 7. Obsah a tón
- Čeština, vykání, krátké věty, konkrétní místo (Jemnice a okolí). Bez superlativů a frází typu „komplexní řešení“, „na míru“, „zdarma“.
- Nevymýšlet reference, čísla ani certifikáty. Právní fakta: vázaný zástupce INSIA a.s. a ININVEST, dohled ČNB, IČO 14311569 — patří do patičky / řádku důvěry. Neoznačovat se jako „nezávislý“.
- Schůzky: v Jemnici nebo u klienta doma (bez zmínek o online).

## 8. Nedělej
Černé plochy · gradienty · stíny · zaoblené karty · ikonky v kolečkách · jasná zelená jako text na světlé · bílý text na jasné zelené · kurzíva · víc než 2 písma · stock fotky „podání rukou“ · emoji · běžící pásky a rotující odznaky.
