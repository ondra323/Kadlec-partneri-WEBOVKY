#!/usr/bin/env python3
"""Generuje stránky služeb a O mně (pojisteni, penze, investice, o-mne).

Texty se mění tady, ne v HTML: FAQ ve stránce a JSON-LD FAQPage se tak nikdy nerozejdou.
Spuštění z kořene repozitáře:  python3 tools/build_pages.py
"""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://kadlec-partneri.cz"
ORG_ID = SITE + "/#poradce"
PERSON_ID = SITE + "/#ondrej-kadlec"
TEL, TEL_HREF = "733 651 217", "+420733651217"
EMAIL = "kadlec.ondrej@insia.com"
CNB = "https://apl.cnb.cz/apljerrsdad/JERRS.WEB07.INTRO_PAGE?p_lang=cz"
MESTA = "Jemnice, Moravských Budějovic, Dačic a Třebíče"

NAV = [("/investice", "Investice"), ("/penze", "Penze"), ("/pojisteni", "Pojištění"), ("/o-mne", "O mně"), ("/blog", "Blog")]


def head(p):
    ld = json.dumps(p["ld"], ensure_ascii=False, indent=1)
    return f"""<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{p['title']}</title>
<meta name="description" content="{html.escape(p['desc'])}">
<link rel="canonical" href="{SITE}{p['path']}">
<meta property="og:type" content="website">
<meta property="og:locale" content="cs_CZ">
<meta property="og:site_name" content="Kadlec &amp; partneři">
<meta property="og:title" content="{p['title']}">
<meta property="og:description" content="{html.escape(p['desc'])}">
<meta property="og:url" content="{SITE}{p['path']}">
<meta property="og:image" content="{SITE}/assets/ondrej-jemnice-1400.webp">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#0f3b2a">
<link rel="preload" href="/assets/fonts/montserrat-latin.woff2" as="font" type="font/woff2" crossorigin>
<link href="/assets/fonts/fonts.css" rel="stylesheet">
<link href="/assets/page.css" rel="stylesheet">
<script type="application/ld+json">
{ld}
</script>
<script>window.kt=window.kt||function(){{(kt.q=kt.q||[]).push(arguments)}}</script>
<script src="/assets/track.js" defer></script>
<script src="/assets/pixel.js" defer></script>
</head>
<body>

<header class="topbar"><div class="topbar-in">
  <a href="/" class="logo" aria-label="Kadlec &amp; partneři – úvod"><span class="l1">Kadlec</span><span class="amp">&amp;</span> partneři</a>
  <nav class="topnav" aria-label="Hlavní">{''.join(f'<a href="{h}"' + (' aria-current="page"' if h == p['path'] else '') + f'>{t}</a>' for h, t in NAV)}</nav>
  <a href="/konzultace{p['tema']}" class="pill" data-track="{p['track']} · hlavička">Domluvit schůzku</a>
</div></header>
"""


def facts(items):
    return '<dl class="facts">' + "".join(f"<div><dt>{a}</dt><dd>{b}</dd></div>" for a, b in items) + "</dl>"


def faq_html(faq):
    return '<div class="faq">' + "".join(
        f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in faq) + "</div>"


def faq_ld(faq):
    strip = lambda s: html.unescape(s.replace("<strong>", "").replace("</strong>", ""))
    return {"@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": strip(q), "acceptedAnswer": {"@type": "Answer", "text": strip(a)}} for q, a in faq]}


def crumbs(name, path):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Úvod", "item": SITE + "/"},
        {"@type": "ListItem", "position": 2, "name": name, "item": SITE + path}]}


def aside(p):
    rel = "".join(f'<a href="{h}">{t} →</a>' for h, t in NAV[:3] if h != p["path"])
    return f"""<aside class="aside">
    <img src="/assets/ondrej-jemnice-600.webp" alt="Ondřej Kadlec, finanční poradce, na náměstí v Jemnici" width="600" height="665" loading="lazy">
    <p>Kancelář Havlíčkovo náměstí 8, Jemnice. Přijedu i za vámi domů.</p>
    <a class="tel" href="tel:{TEL_HREF}" data-track="{p['track']} · telefon">{TEL}</a>
    <a class="pill" href="/konzultace{p['tema']}" data-track="{p['track']} · bok">Krátký dotazník</a>
    <nav class="related" aria-label="Další služby">{rel}<a href="/o-mne">Kdo jsem →</a></nav>
  </aside>"""


def tail(p):
    return f"""
<section class="cta"><div class="cta-in">
  <div>
    <h2>{p['cta']}</h2>
    <p>Ozvu se do 24 hodin. Na první schůzce se nic nepodepisuje.</p>
  </div>
  <div class="cta-act">
    <a class="tel" href="tel:{TEL_HREF}" data-track="{p['track']} · výzva telefon">{TEL}</a>
    <a class="pill solid" href="/konzultace{p['tema']}" data-track="{p['track']} · výzva">Domluvit schůzku</a>
  </div>
</div></section>

<footer class="foot">
  <div>
    <b>Kadlec &amp; partneři – Ondřej Kadlec</b>
    Finanční poradce<br>
    Havlíčkovo náměstí 8, 675 31 Jemnice<br>
    <a href="tel:{TEL_HREF}">{TEL}</a> · <a href="mailto:{EMAIL}">{EMAIL}</a>
  </div>
  <nav aria-label="Služby"><b>Služby</b>{''.join(f'<a href="{h}">{t}</a>' for h, t in NAV)}</nav>
  <nav aria-label="Informace"><b>Informace</b><a href="/informace">Informace pro klienty</a><a href="/gdpr">Ochrana osobních údajů</a><a href="{CNB}" target="_blank" rel="noopener">Registr ČNB</a><a href="/klientsky-portal/">Klientská zóna</a></nav>
  <div class="foot-legal">© 2026 Ondřej Kadlec · IČO 14311569 · sídlo Polická 1106, 675 31 Jemnice · vázaný zástupce INSIA a.s. a In Investments a.s. pod dohledem ČNB. Působím v Jemnici, Moravských Budějovicích, Dačicích, Třebíči a okolí.</div>
</footer>
</body>
</html>
"""


def service_ld(p, service_name, service_type):
    return {"@context": "https://schema.org", "@graph": [
        {"@type": "Service", "@id": SITE + p["path"] + "#sluzba", "name": service_name, "serviceType": service_type,
         "url": SITE + p["path"], "provider": {"@id": ORG_ID},
         "areaServed": [{"@type": "City", "name": c} for c in ("Jemnice", "Moravské Budějovice", "Dačice", "Třebíč")]},
        faq_ld(p["faq"]), crumbs(p["crumb"], p["path"])]}


def service_page(p):
    s = p["sections"]
    body = f"""
<main>
<div class="hero">
  <p class="eyebrow">{p['eyebrow']}</p>
  <h1>{p['h1']}</h1>
  <p class="answer">{p['answer']}</p>
  {facts(p['facts'])}
</div>

<div class="body">
  <div>
    <section id="komu"><h2><span>01</span>{s['komu'][0]}</h2>{s['komu'][1]}</section>
    <section id="chyby"><h2><span>02</span>{s['chyby'][0]}</h2>{s['chyby'][1]}</section>
    <section id="postup"><h2><span>03</span>Jak spolupráce probíhá</h2>{s['postup']}</section>
    <section id="otazky"><h2><span>04</span>Časté otázky</h2>{faq_html(p['faq'])}{p.get('note', '')}</section>
  </div>
  {aside(p)}
</div>
</main>
"""
    return head(p) + body + tail(p)


def ul(items):
    return "<ul>" + "".join(f"<li>{i}</li>" for i in items) + "</ul>"


def mistakes(items):
    return '<ol class="mistakes">' + "".join(f"<li><b>{a}</b>{b}</li>" for a, b in items) + "</ol>"


def steps(items):
    return '<ol class="steps">' + "".join(f"<li><b>{a}</b>{b}</li>" for a, b in items) + "</ol>"


POSTUP_START = ("Ozvete se", f'Zavolejte na <a href="tel:{TEL_HREF}">{TEL}</a>, nebo vyplňte krátký dotazník. Ozvu se do 24 hodin a domluvíme termín.')
POSTUP_END = ("Zůstanu u vás", "Smlouvy a dokumenty máte v klientské zóně a pravidelně dostáváte report, jak si vaše peníze vedou proti cílům. Když se změní zákon nebo se objeví lepší nabídka, ozvu se sám.")

PAGES = []

# ---------------------------------------------------------------- PENZE
p = dict(
    path="/penze", tema="/penze", track="Penze", crumb="Penze",
    title="Penzijní spoření Jemnice | Ondřej Kadlec – DPS, DIP, státní příspěvek",
    desc="Penzijní spoření a DIP v Jemnici, Moravských Budějovicích, Dačicích a Třebíči. Nastavím spoření tak, abyste dostali maximální státní příspěvek i daňový odpočet.",
    eyebrow="Penze · Jemnice a okolí",
    h1="Penzijní spoření a důchod v Jemnici",
    answer=f"Ondřej Kadlec je finanční poradce v Jemnici, který lidem z {MESTA} nastavuje doplňkové penzijní spoření (DPS) a dlouhodobý investiční produkt (DIP) tak, aby dostali maximální státní příspěvek i daňový odpočet. Spočítá, kolik budete na důchod potřebovat, projde vaši současnou smlouvu a řekne, jestli ji ponechat, upravit, nebo převést.",
    facts=[("Státní příspěvek", "až 340 Kč měsíčně"), ("Daňový odpočet", "až 48 000 Kč ročně"), ("Kde se sejdeme", "Jemnice, nebo u vás doma")],
    cta="Kolik vám stát k důchodu přidá?",
    sections=dict(
        komu=("Komu pomáhám", "<p>Penzijní spoření má skoro každý, ale málokdo ví, jestli mu dává maximum. Nejčastěji za mnou chodí lidé, kteří:</p>" + ul([
            "mají staré penzijní připojištění (transformovaný fond) a neví, jestli je pro ně pořád nejlepší,",
            "spoří méně než 1 700 Kč měsíčně a nechávají ležet část státního příspěvku,",
            "mají zaměstnavatele, který na penzi přispívá nebo by mohl přispívat,",
            "jsou po padesátce a chtějí vědět, jak spoření dokončit a jak peníze vybrat,",
            "chtějí dítěti založit spoření, které mu stát podpoří od prvního dne.",
        ])),
        chyby=("Časté chyby u penzijního spoření", mistakes([
            ("Konzervativní fond u mladého člověka.", "Kdo má do důchodu dvacet a více let, v nejopatrnější strategii obvykle ztrácí na inflaci. Strategii lze změnit v rámci stejné penzijní společnosti."),
            ("Vklad, který nevyčerpá státní podporu.", "Stát přidává 20 % z vašeho vkladu. Nárok vzniká od 500 Kč měsíčně, maximum 340 Kč dostanete při vkladu 1 700 Kč."),
            ("Zapomenutý daňový odpočet.", "Co spoříte nad 1 700 Kč měsíčně, si můžete odečíst od základu daně. Limit 48 000 Kč ročně je společný pro penzijní spoření, DIP a životní pojištění."),
            ("Nevyužitý příspěvek zaměstnavatele.", "Příspěvky zaměstnavatele na penzijní spoření a DIP jsou do 50 000 Kč ročně osvobozené od daně i odvodů. Pro firmu i pro vás je to výhodnější než stejná částka ve mzdě."),
            ("Výběr bez propočtu.", "Jednorázový výběr, renta, nebo kombinace: každá možnost se jinak daní. Rozhodněte se až po propočtu, ne podle toho, co je nejrychlejší."),
        ])),
        postup=steps([
            POSTUP_START,
            ("Schůzka", "Sejdeme se v kanceláři v Jemnici, nebo přijedu za vámi. Přineste výpis z penzijního spoření. Projdeme, kolik spoříte, v jaké strategii a kolik vám stát přidává."),
            ("Propočet", "Spočítám, kolik budete na důchod potřebovat a jak k tomu dojít. Na schůzce se nic nepodepisuje."),
            ("Změna", "Pokud se rozhodnete něco změnit, vyřídím to za vás: úpravu vkladu, změnu strategie, převod nebo DIP."),
            POSTUP_END,
        ]),
    ),
    faq=[
        ("Kolik musím spořit, abych dostal maximální státní příspěvek?", "Maximální státní příspěvek 340 Kč měsíčně dostanete při vlastním vkladu 1 700 Kč. Nárok na příspěvek vzniká od vkladu 500 Kč měsíčně, kdy stát přidá 100 Kč."),
        ("Vyplatí se převést staré penzijní připojištění do nového fondu?", "Ne vždy. Staré transformované fondy garantují, že nepřijdete o vložené peníze, ale jejich výnosy bývají nízké. Při převodu se garance ztrácí. Rozhoduje hlavně to, kolik let vám zbývá do důchodu, a to spočítám na schůzce."),
        ("Jaký je rozdíl mezi penzijním spořením a DIP?", "Penzijní spoření má státní příspěvek i daňový odpočet. Dlouhodobý investiční produkt (DIP) státní příspěvek nemá, ale nabízí daňový odpočet, osvobozený příspěvek zaměstnavatele a širší výběr investic. U obou platí společný limit odpočtu 48 000 Kč ročně."),
        ("Můžu si spoření snížit nebo přerušit?", "Ano. Výši vkladu můžete měnit a spoření lze i přerušit. Za měsíce bez vkladu ale nedostanete státní příspěvek."),
        ("Kde se můžeme sejít?", "V kanceláři na Havlíčkově náměstí 8 v Jemnici, nebo přijedu za vámi domů do Moravských Budějovic, Dačic, Třebíče a okolí."),
    ],
    note='<p class="note">Částky platí pro rok 2026. Vláda připravuje novelu zákona o doplňkovém penzijním spoření. Pokud projde, klientům se ozvu s tím, co se pro ně mění.</p>',
)
p["ld"] = service_ld(p, "Penzijní spoření a příprava na důchod", "Finanční poradenství – penzijní spoření")
PAGES.append(("penze.html", service_page(p)))

# ---------------------------------------------------------------- INVESTICE
p = dict(
    path="/investice", tema="/investice", track="Investice", crumb="Investice",
    title="Investice Jemnice | Ondřej Kadlec – finanční poradce pro úspory a investice",
    desc="Investiční poradce v Jemnici pro Moravské Budějovice, Dačice a Třebíč. Spočítám, kolik platíte na poplatcích, a navrhnu investice podle toho, kdy budete peníze potřebovat.",
    eyebrow="Investice · Jemnice a okolí",
    h1="Investice a úspory s poradcem v Jemnici",
    answer=f"Ondřej Kadlec je finanční poradce v Jemnici, který lidem z {MESTA} pomáhá investovat úspory podle toho, kdy budou peníze potřebovat. Nejdřív spočítá, kolik dnes platíte na poplatcích a jak velkou rezervu mít po ruce, a teprve potom navrhne změny. Investice zprostředkovává jako vázaný zástupce společnosti In Investments a.s. (ININVEST) pod dohledem České národní banky.",
    facts=[("Pro koho", "úspory na účtu i pravidelné investování"), ("Dohled", "Česká národní banka"), ("Kde se sejdeme", "Jemnice, nebo u vás doma")],
    cta="Kolik vás dnes stojí vaše investice?",
    sections=dict(
        komu=("Komu pomáhám", "<p>Investice jsou můj hlavní obor. Pomáhám lidem, kteří:</p>" + ul([
            "mají peníze na běžném nebo spořicím účtu a úrok nestačí na inflaci,",
            "už investují, ale neví, kolik je to stojí a jestli to dává smysl,",
            "spoří dětem nebo na bydlení a potřebují vědět, jestli to stačí,",
            "dostali dědictví nebo prodali nemovitost a chtějí větší částku rozumně rozložit,",
            "chtějí investovat pravidelně, třeba od stovek korun měsíčně.",
        ])),
        chyby=("Časté chyby při investování", mistakes([
            ("Investice bez rezervy.", "Do investic patří jen peníze, které v nejbližších letech nebudete potřebovat. Nejdřív rezerva na nečekané výdaje, obvykle na několik měsíců života, teprve potom investice."),
            ("Poplatky, které nikdo nespočítal.", "Vstupní poplatek, roční správa a náklady fondu se sčítají. Jedno procento ročně navíc vám za dvacet let ukrojí téměř pětinu výsledné částky."),
            ("Strategie neodpovídá cíli.", "Akciový fond na peníze, které potřebujete za dva roky, je stejná chyba jako opatrný fond na důchod za třicet let."),
            ("Prodej v panice.", "Když trhy klesnou, lidé prodávají se ztrátou. Plán, se kterým počítáme dopředu, říká, co dělat, když přijde propad."),
            ("Všechno v jednom.", "Jeden fond, jedna měna, jedno odvětví. Rozložení mezi více investic snižuje riziko, že vás jedna špatná zpráva připraví o velkou část úspor."),
        ])),
        postup=steps([
            POSTUP_START,
            ("Schůzka", "Projdeme vaše cíle a termíny: rezervu, bydlení, děti, důchod. Přineste výpisy z investic a spoření, pokud nějaké máte."),
            ("Investiční dotazník", "Před doporučením vyplníme dotazník, který vyžaduje zákon. Zjistí vaše zkušenosti, cíle a to, jak velké výkyvy unesete."),
            ("Návrh a náklady", "Dostanete písemný návrh se všemi poplatky předem. Spočítám i to, kolik platíte dnes. Na první schůzce se nic nepodepisuje."),
            POSTUP_END,
        ]),
    ),
    faq=[
        ("Od jaké částky má smysl investovat?", "Pravidelně lze investovat už od stovek korun měsíčně. Důležitější než částka je mít rezervu a dostatek času, ideálně několik let."),
        ("Kolik stojí vaše služby?", "Odměnu dostávám od finanční instituce, nebo přímo od vás. Všechny poplatky a moji odměnu uvidíte písemně dřív, než cokoli podepíšete."),
        ("Je investování bezpečné?", "Investice nesou riziko a jejich hodnota může klesat i stoupat. Riziko snižuje delší doba investování a rozložení do více investic. Garantovaný výnos u investic neslibuji."),
        ("Co je DIP a komu se vyplatí?", "Dlouhodobý investiční produkt (DIP) je investiční účet s daňovým odpočtem až 48 000 Kč ročně (společný limit s penzijním spořením a životním pojištěním). Vyplatí se hlavně lidem, kterým přispívá zaměstnavatel nebo kteří chtějí využít daňový odpočet. Peníze lze bez ztráty výhod vybrat po deseti letech a po dosažení 60 let."),
        ("Musím kvůli schůzce jezdit do Jemnice?", "Nemusíte. Rád přijedu za vámi domů do Moravských Budějovic, Dačic, Třebíče a okolí."),
    ],
    note='<p class="note">Investování je spojeno s rizikem. Hodnota investice může klesat i stoupat a návratnost vložené částky není zaručena. Minulé výnosy nejsou zárukou budoucích.</p>',
)
p["ld"] = service_ld(p, "Investice a zhodnocení úspor", "Finanční poradenství – investice")
PAGES.append(("investice.html", service_page(p)))

# ---------------------------------------------------------------- POJIŠTĚNÍ
p = dict(
    path="/pojisteni", tema="/pojisteni", track="Pojištění", crumb="Pojištění",
    title="Pojištění Jemnice | Ondřej Kadlec – životní pojištění, domácnost, nemovitost",
    desc="Pojištění v Jemnici, Moravských Budějovicích, Dačicích a Třebíči. Zkontroluji vaše životní pojištění i pojištění domu a domácnosti a porovnám nabídky více pojišťoven.",
    eyebrow="Pojištění · Jemnice a okolí",
    h1="Pojištění v Jemnici: život, dům a domácnost",
    answer=f"Ondřej Kadlec je finanční poradce v Jemnici, který lidem z {MESTA} kontroluje a nastavuje životní pojištění, pojištění nemovitosti a domácnosti i cestovní pojištění. Projde vaše smlouvy, řekne, co kryjí a co ne, a porovná nabídky více pojišťoven. Pojištění zprostředkovává jako vázaný zástupce společnosti INSIA a.s.",
    facts=[("Co zkontroluji", "životní pojištění, dům, domácnost, cestování"), ("Pojišťovny", "porovnám nabídky více pojišťoven"), ("Kde se sejdeme", "Jemnice, nebo u vás doma")],
    cta="Víte, za co platíte pojistné?",
    sections=dict(
        komu=("Komu pomáhám", "<p>Pojistka se pozná až ve chvíli, kdy je potřeba. Proto ji kontroluji dřív. Nejčastěji pomáhám lidem, kteří:</p>" + ul([
            "platí životní pojištění roky a neví, co přesně kryje,",
            "mají hypotéku a potřebují pojistit, že ji rodina zvládne splácet i bez nich,",
            "postavili nebo koupili dům a pojistná částka neodpovídá dnešním cenám,",
            "mají nové dítě, novou práci nebo splacenou hypotéku a pojištění tomu neodpovídá,",
            "cestují a chtějí mít jistotu, že pojištění v zahraničí opravdu zaplatí.",
        ])),
        chyby=("Časté chyby v pojištění", mistakes([
            ("Investiční životní pojištění místo ochrany.", "Část pojistného jde na investici a poplatky a na krytí rizik zbývá málo. Ochranu a investice je obvykle lepší oddělit."),
            ("Pojištěné maličkosti, nepojištěná velká rizika.", "Odškodné za zlomeninu je příjemné, ale rodinu nepodrží. Důležitější je dostatečné krytí invalidity a smrti, hlavně když splácíte hypotéku."),
            ("Podpojištěný dům.", "Pojistná částka často pochází z doby uzavření smlouvy a ceny stavebních prací mezitím vzrostly. Při škodě pak pojišťovna může plnit jen poměrnou část."),
            ("Smlouva, která neodpovídá životu.", "Nová práce, děti, splacená hypotéka: pojištění se má měnit s vámi. Smlouva stará deset let málokdy sedí na dnešní situaci."),
            ("Zrušení staré smlouvy dřív, než platí nová.", "Nová pojišťovna zkoumá zdravotní stav a může mít čekací doby. Starou smlouvu rušte až ve chvíli, kdy je nová sjednaná a platí."),
        ])),
        postup=steps([
            POSTUP_START,
            ("Schůzka", "Přineste pojistné smlouvy, které máte. Projdu, co kryjí, na jaké částky a kolik za to platíte."),
            ("Porovnání", "Řeknu, co ponechat, co upravit a co zrušit. Kde to dává smysl, porovnám nabídky více pojišťoven. Na schůzce se nic nepodepisuje."),
            ("Sjednání", "Pokud se rozhodnete pro změnu, vyřídím ji, včetně bezpečného ukončení staré smlouvy."),
            POSTUP_END,
        ]),
    ),
    faq=[
        ("Jak zjistím, jestli mám pojištění nastavené správně?", "Přineste své pojistné smlouvy. Projdu krytí a pojistné částky a porovnám je s tím, co skutečně potřebujete: výší příjmu, hypotékou a rodinou."),
        ("Vyplatí se životní pojištění s investiční složkou?", "Většinou je výhodnější mít ochranu v čistém rizikovém pojištění a investovat zvlášť. Investiční složka má často vyšší poplatky. Záleží ale na konkrétní smlouvě, proto ji vždy nejdřív spočítám."),
        ("Na jakou částku pojistit dům?", "Na takzvanou novou cenu, tedy na částku, za kterou byste dům dnes znovu postavili. Ne na tržní cenu, za kterou byste ho prodali."),
        ("Můžu si životní pojištění odečíst z daní?", "Ano, pokud smlouva splňuje zákonné podmínky (mimo jiné trvá alespoň pět let a vyplácí se nejdříve v 60 letech). Odečíst lze až 48 000 Kč ročně, společně s penzijním spořením a DIP."),
        ("Kde se můžeme sejít?", "V kanceláři na Havlíčkově náměstí 8 v Jemnici, nebo přijedu za vámi domů do Moravských Budějovic, Dačic, Třebíče a okolí."),
    ],
)
p["ld"] = service_ld(p, "Pojištění osob a majetku", "Pojišťovací zprostředkování")
PAGES.append(("pojisteni.html", service_page(p)))

# ---------------------------------------------------------------- O MNĚ
p = dict(
    path="/o-mne", tema="", track="O mně", crumb="O mně",
    title="O mně | Ondřej Kadlec, finanční poradce z Jemnice",
    desc="Ondřej Kadlec, finanční poradce z Jemnice. Vázaný zástupce INSIA a.s. a In Investments a.s. zapsaný v registru ČNB, absolvent Právnické fakulty Masarykovy univerzity.",
)
p["ld"] = {"@context": "https://schema.org", "@graph": [
    {"@type": "ProfilePage", "@id": SITE + "/o-mne", "url": SITE + "/o-mne", "name": p["title"],
     "mainEntity": {"@id": PERSON_ID}},
    {"@type": "Person", "@id": PERSON_ID, "name": "Ondřej Kadlec", "jobTitle": "Finanční poradce",
     "url": SITE + "/o-mne", "image": SITE + "/assets/ondrej-jemnice-900.webp", "telephone": "+420733651217", "email": EMAIL,
     "worksFor": {"@id": ORG_ID},
     "alumniOf": {"@type": "CollegeOrUniversity", "name": "Právnická fakulta Masarykovy univerzity", "url": "https://www.law.muni.cz/"},
     "homeLocation": {"@type": "City", "name": "Jemnice"},
     "knowsAbout": ["Investice", "Penzijní spoření", "Dlouhodobý investiční produkt", "Životní pojištění", "Pojištění majetku", "Hypotéky"],
     "memberOf": [{"@type": "Organization", "name": "INSIA a.s.", "url": "https://www.insia.cz/"},
                  {"@type": "Organization", "name": "In Investments a.s.", "url": "https://www.ininvest.cz/"}],
     "sameAs": ["https://www.facebook.com/profile.php?id=61582855272315", "https://www.instagram.com/kadlec_a_partneri/"]},
    crumbs("O mně", "/o-mne")]}
o_mne = f"""
<main>
<div class="hero">
  <p class="eyebrow">O mně</p>
  <h1>Ondřej Kadlec, finanční poradce z Jemnice</h1>
  <p class="answer">Jsem Ondřej Kadlec, finanční poradce z Jemnice. Jako vázaný zástupce společností INSIA a.s. a In Investments a.s. (ININVEST), zapsaný v registru České národní banky, pomáhám lidem z {MESTA} s investicemi, penzí, pojištěním, hypotékami a úvěry. Vzdělání mám z Právnické fakulty Masarykovy univerzity v Brně.</p>
  {facts([("Kancelář", "Havlíčkovo náměstí 8, Jemnice"), ("Působím", "Jemnice, Mor. Budějovice, Dačice, Třebíč"), ("Ověření", f'<a href="{CNB}" target="_blank" rel="noopener">Registr ČNB</a> · IČO 14311569')])}
</div>

<div class="body">
  <div>
    <section id="kdo"><h2><span>01</span>Kdo jsem</h2>
      <p>Jsem z Jemnice a pracuji tady. Kancelář mám na Havlíčkově náměstí, ale za klienty jezdím i domů, do Moravských Budějovic, Dačic, Třebíče a do okolních obcí.</p>
      <p>Mým hlavním oborem jsou investice a příprava na důchod. Protože peníze v domácnosti spolu souvisí, řeším s klienty i pojištění, hypotéky a úvěry. Svěřilo se mi už přes sto klientů.</p>
    </section>
    <section id="vzdelani"><h2><span>02</span>Vzdělání a oprávnění</h2>
      <h3>Právnická fakulta Masarykovy univerzity</h3>
      <p>Právní vzdělání se mi hodí každý den: smlouvy, pojistné podmínky i daňová pravidla čtu tak, jak jsou napsané, ne jak je popisuje reklama.</p>
      <h3>Vázaný zástupce pod dohledem ČNB</h3>
      <p>Jednám jménem a na odpovědnost dvou společností, které za mou činnost ručí:</p>
      <ul>
        <li><strong>INSIA a.s.</strong> pro distribuci pojištění podle zákona č. 170/2018 Sb.,</li>
        <li><strong>In Investments a.s. (ININVEST)</strong> pro investiční služby podle zákona č. 256/2004 Sb.</li>
      </ul>
      <p>Zápis si můžete ověřit v <a href="{CNB}" target="_blank" rel="noopener">registru České národní banky</a> podle jména nebo IČO 14311569. Podrobnosti najdete v <a href="/informace">informacích pro klienty</a>.</p>
    </section>
    <section id="jak"><h2><span>03</span>Jak pracuji</h2>
      <ul>
        <li><strong>Na první schůzce nic neprodávám.</strong> Nejdřív zjistím, co máte a kam chcete dojít, a teprve potom řeknu, jestli a co změnit.</li>
        <li><strong>Poplatky vidíte předem.</strong> Odměnu dostávám od finanční instituce, nebo přímo od vás, a vždy ji uvidíte dřív, než cokoli podepíšete.</li>
        <li><strong>Zůstávám i po podpisu.</strong> Pro klienty jsem vytvořil vlastní klientskou zónu se smlouvami, dokumenty a pravidelným reportem, jak si jejich peníze vedou.</li>
      </ul>
    </section>
  </div>
  {aside(p)}
</div>
</main>
"""
p["cta"] = "Pojďme se poznat."
PAGES.append(("o-mne.html", head(p) + o_mne + tail(p)))

for name, content in PAGES:
    (ROOT / name).write_text(content, encoding="utf-8")
    print("✓", name, len(content.split()), "slov (vč. kódu)")
