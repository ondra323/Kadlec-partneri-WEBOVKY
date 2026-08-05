---
target: konzultace.html
total_score: 18
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 2
timestamp: 2026-08-05T06-11-27Z
slug: konzultace-html
---
Method: dual-agent (A: design review · B: detektor + browser evidence)

Pozn.: soubor se během běhu na disku změnil (742 → 765 řádků, přibyl `#hero-photo`). Čísla řádků jsou proti aktuální verzi.

## Design Health Score

| # | Heuristika | Skóre | Klíčový problém |
|---|---|---|---|
| 1 | Viditelnost stavu systému | 2 | Progress bar 100 % ještě před odesláním; „Začneme jednou otázkou" vs. „Otázka 1 ze 4"; žádné aria-live. |
| 2 | Shoda se skutečným světem | 4 | Čeština je mluvená, ne přeložená. |
| 3 | Kontrola a svoboda | 2 | Zpět v prohlížeči opustí stránku a smaže odpovědi; auto-advance 170 ms potvrdí překlik. |
| 4 | Konzistence a standardy | 3 | Povinný souhlas GDPR pod odesílacím tlačítkem (:404 vs :410); radio chování bez radio sémantiky. |
| 5 | Prevence chyb | 1 | Nezaškrtnutý souhlas = tichý no-op; hláška „9 číslic", kód přijme 9–13. |
| 6 | Rozpoznání místo vybavování | 3 | `.recap` nad telefonním polem je nejlepší UX rozhodnutí v souboru. |
| 7 | Flexibilita a efektivita | n/a | Jednorázová landing page z placené reklamy. |
| 8 | Estetika a minimalismus | 2 | Řemeslně čisté, ale kategoriálně zaměnitelné. |
| 9 | Zotavení z chyby | 1 | `alert()` jako jediné failure UI; číslo v něm nejde na mobilu poklepat. |
| 10 | Nápověda a dokumentace | n/a | Tři otázky a dvě pole. |
| **Celkem** | | **18/32 (56 %)** | **Acceptable** |

## Verdikt originality

Zaměnitelné. Vyměň pět podstatných jmen a kompozice odjede jako hypoteční makléř, life-coach, zubní klinika nebo B2B SaaS. Všechno nefalšovatelné je řetězec textu, ne designové rozhodnutí.

Hlavní diagnóza: **design má na sobě kostým té věci, kterou text popírá.** Copy říká „nic vám nebudu prodávat", stránka je postavená jako učebnicový konverzní trychtýř. Nedůvěřivý padesátník rozpor vyřeší ve prospěch designu.

Deterministický sken (detect.mjs, exit 2): 3 nálezy — side-tab ×2 (.testi :103, .spot :169), layout-transition ×1 (transition:width). Runtime detektor: 9 typů / 18 instancí — low-contrast ×4 (zlaté CTA 3.20:1), dark-glow ×2, repeated-section-kickers ×5, skipped-heading ×1 (h2→h4 v Rozcestí), cream-palette ×1. Rozdíl v side-tab je artefakt (CLI = zdroj, runtime = instance); správně 2. cream-palette a kickers jsou stylové signály, ne vady.

## Deset otisků AI slopu a náhrady

1. Zeleno-zlatá paleta (:15–17) → paleta z papírového srovnání: kancelářská bílá, propisková modrá, razítková červená, manila.
2. Playfair Display + DM Sans (:11) → české písmo s kreslenými háčky, nebo jeden grotesk + Ondřejův skutečný rukopis jako jediná ozdoba.
3. Pět různých border-radius (14/16/11/10/9) → žádné karty; linky a odsazení jako A4 tabulka.
4. Eyebrow pilulka opakující h1 → datace: „Jemnice · Polická 1106 · volám osobně", nebo smazat.
5. Trojkrokový timeline s konektorem → tři reálné objekty (telefon, dvě židle, list) vyfocené na stole, nebo tři holé věty.
6. ✓/× rozcestí (.fork :306) → jeden artefakt: anonymizovaná fotka skutečného srovnání s reálným číslem.
7. Emoji trust badges (:415–417) → ověřitelná fakta textem: reg. číslo ČNB, IČO 14311569, Polická 1106. Dnes je adresa v patičce 12px/50 %.
8. Gradientový hero → plochá zelená + mask-image fade z index.html.
9. StoryBrand kostra přiznaná v komentářích → artefakt první, pak slib odmítnutí, pak kdo jsi, pak tři skutečná jména.
10. `100+`, `15+`, `ČNB` (:254–256) → přesná čísla („117 rodin"), a místo „15+ bank" jmenný seznam institucí.

Originalita dnes žije v pěti větách: :251 „přijdu o provizi a stejně vám to řeknu", :514 „Řešit to zní jako ostuda, přitom je to jenom počítání", „podle toho, co má pobočka v plánu", „Na místě se nic nepodepisuje", „vysvětlit doma".

## Co funguje

1. Nabídka je nezkopírovatelná — prodávat možnost, že řekneš „ne".
2. Mikrocopy v kvízu předjímá důvody abandonu („Na částky se ptát nebudu", „Něco mám, ale nevím co → Přesně proto to chci probrat").
3. Attention ratio (--gold jen pro CTA, dodrženo) a message match přes ?tema= (přepisuje hero, bolesti, CTA, title).

## Prioritní problémy

- **[P0] Souhlas GDPR je tichá slepá ulička.** .consent (:410) pod .submit (:404); nezaškrtnutí = žádná chyba, jen focus mimo obrazovku. → nad tlačítko + viditelná hláška. `/impeccable harden`
- **[P0] Zástupné reference v provozu.** „Jméno Příjmení" :286/:291/:296 a :379 (uvnitř uklidnění u telefonu), pod nadpisem „Ne obecné pochvaly. Konkrétní čísla." (:281). Tři 404 (ref-1/2/3.jpg neexistují). `/impeccable clarify`
- **[P1] Zaměnitelnost designu.** Odvodit paletu, písmo a hero artefakt z papírového srovnání; smazat rozcestí a emoji pečeti. `/impeccable bolder`
- **[P1] Kontrast CTA 3.20:1** (#fff na #c8801f, 17px/600, potřeba 4.5:1), 4 výskyty. → ~#a8690f. `/impeccable audit`
- **[P2] Stavy a chyby.** alert() → inline blok s tel: odkazem; focus se ztrácí na <body>; aria-live na krok; role=status na #done; bar nesmí ukazovat 100 % před odesláním. `/impeccable harden`
- **[P2] Kognitivní zátěž.** Q1 má 5 možností s podtitulky (10 jednotek) včetně žargonu „DIP, penzijko"; Q4 má 10 bloků a čtyři samostatné uklidňovací blobky. `/impeccable distill`

## Persona red flags

- **Jordan:** slovo „zdarma" na stránce chybí; „100% nezávazné" odpovídá na závazek, ne na cenu. Žargon u prvního rozhodnutí.
- **Casey:** ~5 700 px scrollu před formulářem; auto-advance 170 ms + smooth scroll; .qback 50×33,6 px (pod 44).
- **Riley:** souhlas → nic; obě sítě selžou → alert s nepoklepatelným číslem, bez retry; Zpět = ztráta všeho; reload = restart. Double-submit ošetřen správně.
- **Pavel (55, Jemnice, už mu volali poradci):** emoji pečeti u telefonu, „Jméno Příjmení" 4×, sekce o roku lítosti, portrét ukazující na tlačítko, „spam" 2×, „100%". Nenajde: cenu, fotku listu, pevnou linku, adresu. Prostší stránce by věřil víc.

## Drobnosti

- Nula width breakpointů (jediné @media je prefers-reduced-motion); obsah v 560px sloupci bez desktopového ošetření.
- ?tema= nepřepisuje meta description; chybí canonical → indexovatelné near-duplicate URL.
- „60 sekund" ×3 vs. „5 sekund" (:403); ani jedno není pravda.
- Aforismus „Nejdražší není špatné rozhodnutí" použit doslova 2× pro dvě témata → výplň slotu.
- Nula :focus-visible pravidel (nativní kroužky přežily, není to tvrdý fail).
- .spot vedle telefonního pole je koncepčně nejlepší nápad na stránce.

## Otázky

1. Když je „přijdu o provizi a stejně vám to řeknu" celý byznys, proč to není h1?
2. Jak by stránka vypadala bez gradientu, karet a ikon, s jedinou fotkou skutečného srovnání?
3. Co kdyby stránka BYLA ten list papíru?
4. Proč dostala méně autorský hero zrovna stránka, za jejíž kliky platíš?
5. Je strach-rozcestí strategie, nebo zděděná šablona?
6. Co přesvědčí víc: „15+ bank", nebo čtrnáct názvů v seznamu?
7. Kdyby sekce 5 a 6 zmizely, spadla by konverze, nebo stoupla důvěra?
