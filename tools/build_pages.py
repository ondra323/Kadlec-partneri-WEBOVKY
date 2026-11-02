#!/usr/bin/env python3
"""Generuje stránky služeb a O mně + společnou hlavičku a patičku pro články blogu.

Texty se mění tady, ne v HTML: FAQ ve stránce a JSON-LD FAQPage se tak nikdy nerozejdou.
Spuštění z kořene repozitáře:  python3 tools/build_pages.py
Výstup: pojisteni.html, hypoteky.html, penze.html, investice.html, o-mne.html, api/_shell.js
"""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://kadlec-partneri.cz"
ORG_ID = SITE + "/#poradce"
PERSON_ID = SITE + "/#ondrej-kadlec"

# ---- Údaje firmy: všude přesně takhle (shodně s Firemním profilem Google a Firmy.cz)
NAME = "Kadlec &amp; partneři"
ADDR = "Havlíčkovo nám. 8, 675 31 Jemnice"
TEL, TEL_HREF = "+420 733 651 217", "+420733651217"
EMAIL = "kadlec.ondrej@insia.com"
HOURS = "Po–Pá 8:00–22:00"
CNB = "https://apl.cnb.cz/apljerrsdad/JERRS.WEB07.INTRO_PAGE?p_lang=cz"
GOOGLE = "https://share.google/q5W7nTjL4THlAzep5"
FIRMY = "https://www.firmy.cz/detail/14092496-kadlec-partneri-jemnice.html"
FACEBOOK = "https://www.facebook.com/profile.php?id=61582855272315"
MAPY = "https://mapy.cz/?q=Havl%C3%AD%C4%8Dkovo%20n%C3%A1m%C4%9Bst%C3%AD%208%2C%20Jemnice"
MESTA = ("Jemnice", "Moravské Budějovice", "Dačice", "Třebíč", "Telč", "Slavonice")
MESTA_2P = "Jemnice, Moravských Budějovic, Dačic, Třebíče, Telče a Slavonic"
RISK = "Investování je spojeno s rizikem. Hodnota investice může klesat i stoupat a návratnost vložené částky není zaručena."

NAV = [("/pojisteni", "Pojištění"), ("/hypoteky", "Hypotéky"), ("/penze", "Penze"), ("/investice", "Investice"),
       ("/o-mne", "O mně"), ("/blog", "Blog")]
SERVICES = NAV[:4]
LOGO = '<a href="/" class="logo" aria-label="Kadlec &amp; partneři – úvod"><span class="l1">Kadlec</span><span class="amp">&amp;</span> partneři</a>'


def esc(s):
    return html.escape(s, quote=True)


def head(p):
    assert len(p["title"]) <= 60, (p["path"], len(p["title"]))
    assert len(p["desc"]) <= 155, (p["path"], len(p["desc"]))
    ld = json.dumps(p["ld"], ensure_ascii=False, indent=1)
    return f"""<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(p['title'])}</title>
<meta name="description" content="{esc(p['desc'])}">
<link rel="canonical" href="{SITE}{p['path']}">
<meta property="og:type" content="website">
<meta property="og:locale" content="cs_CZ">
<meta property="og:site_name" content="Kadlec &amp; partneři">
<meta property="og:title" content="{esc(p['title'])}">
<meta property="og:description" content="{esc(p['desc'])}">
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
""" + topbar(p["path"], p["tema"], p["track"])


def topbar(path, tema, track):
    links = "".join(f'<a href="{h}"' + (' aria-current="page"' if h == path else '') + f'>{t}</a>' for h, t in NAV)
    return f"""
<header class="topbar"><div class="topbar-in">
  {LOGO}
  <nav class="topnav" aria-label="Hlavní">{links}</nav>
  <a href="/konzultace{tema}" class="pill" data-track="{track} · hlavička">Domluvit schůzku</a>
</div></header>
"""


def facts(items):
    return '<dl class="facts">' + "".join(f"<div><dt>{a}</dt><dd>{b}</dd></div>" for a, b in items) + "</dl>"


def faq_html(faq):
    return '<div class="faq">' + "".join(f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in faq) + "</div>"


def plain(s):
    import re
    return html.unescape(re.sub(r"<[^>]+>", "", s))


def faq_ld(faq):
    return {"@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": plain(q), "acceptedAnswer": {"@type": "Answer", "text": plain(a)}} for q, a in faq]}


def crumbs(name, path):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Úvod", "item": SITE + "/"},
        {"@type": "ListItem", "position": 2, "name": name, "item": SITE + path}]}


def aside(path, tema, track):
    rel = "".join(f'<a href="{h}">{t} →</a>' for h, t in SERVICES if h != path)
    if path != "/o-mne":
        rel += '<a href="/o-mne">Kdo jsem →</a>'
    return f"""<aside class="aside">
    <img src="/assets/ondrej-jemnice-600.webp" alt="Ondřej Kadlec, finanční poradce, na náměstí v Jemnici" width="600" height="665" loading="lazy">
    <p>Kancelář {ADDR}. Přijedu i za vámi domů, nebo se sejdeme online.</p>
    <a class="tel" href="tel:{TEL_HREF}" data-track="{track} · telefon">{TEL}</a>
    <a class="pill" href="/konzultace{tema}" data-track="{track} · bok">Krátký dotazník</a>
    <nav class="related" aria-label="Další služby">{rel}</nav>
  </aside>"""


def cta(title, tema, track):
    return f"""
<section class="cta"><div class="cta-in">
  <div>
    <h2>{title}</h2>
    <p>Ozvu se do 24 hodin. Na první schůzce se nic nepodepisuje.</p>
  </div>
  <div class="cta-act">
    <a class="tel" href="tel:{TEL_HREF}" data-track="{track} · výzva telefon">{TEL}</a>
    <a class="pill solid" href="/konzultace{tema}" data-track="{track} · výzva">Domluvit schůzku</a>
  </div>
</div></section>
"""


FOOTER = f"""
<footer class="foot">
  <div>
    <b>Kadlec &amp; partneři</b>
    Ondřej Kadlec, finanční poradce<br>
    {ADDR}<br>
    <a href="tel:{TEL_HREF}">{TEL}</a><br>
    {HOURS}
  </div>
  <nav aria-label="Služby"><b>Služby</b>{''.join(f'<a href="{h}">{t}</a>' for h, t in NAV)}</nav>
  <nav aria-label="Profily a informace"><b>Najdete mě také</b><a href="{GOOGLE}" target="_blank" rel="noopener">Recenze na Googlu</a><a href="{FIRMY}" target="_blank" rel="noopener">Firmy.cz</a><a href="{FACEBOOK}" target="_blank" rel="noopener">Facebook</a><a href="/informace">Informace pro klienty</a><a href="/gdpr">Ochrana osobních údajů</a><a href="/klientsky-portal/">Klientská zóna</a></nav>
  <div class="foot-legal">© 2026 Ondřej Kadlec · IČO 14311569 · sídlo Polická 1106, 675 31 Jemnice · vázaný zástupce INSIA a.s. a In Investments a.s. (ININVEST), <a href="{CNB}" target="_blank" rel="noopener">registrován u ČNB</a>. Působím v Jemnici a okolí, Moravských Budějovicích, Dačicích, Třebíči, Telči a Slavonicích.</div>
</footer>
"""


def tail(title, tema, track):
    return cta(title, tema, track) + FOOTER + "</body>\n</html>\n"


def area():
    return [{"@type": "City", "name": c} for c in MESTA]


def service_ld(p, service_name, service_type):
    return {"@context": "https://schema.org", "@graph": [
        {"@type": "Service", "@id": SITE + p["path"] + "#sluzba", "name": service_name, "serviceType": service_type,
         "url": SITE + p["path"], "provider": {"@id": ORG_ID}, "areaServed": area()},
        faq_ld(p["faq"]), crumbs(p["crumb"], p["path"])]}


def ul(items):
    return "<ul>" + "".join(f"<li>{i}</li>" for i in items) + "</ul>"


def mistakes(items):
    return '<ol class="mistakes">' + "".join(f"<li><b>{a}</b>{b}</li>" for a, b in items) + "</ol>"


def steps(items):
    return '<ol class="steps">' + "".join(f"<li><b>{a}</b>{b}</li>" for a, b in items) + "</ol>"


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
  {aside(p['path'], p['tema'], p['track'])}
</div>
</main>
"""
    return head(p) + body + tail(p["cta"], p["tema"], p["track"])


# Společné kroky spolupráce – jak skutečně pracuji
START = ("Ozvete se", f'Zavolejte na <a href="tel:{TEL_HREF}">{TEL}</a>, nebo vyplňte krátký dotazník. Ozvu se do 24 hodin a domluvíme termín v kanceláři, u vás doma, nebo online.')
PREHLED = ("Přehled na jedné stránce", "Projdu smlouvy, které máte. Ve svém analytickém programu vám pak na jedné stránce ukážu, co je kryté a co ne, a kolik za to platíte. Na první schůzce se nic nepodepisuje.")
PLAN = ("Plán", "Navrhnu, co ponechat, co upravit a co doplnit: rezervu, zajištění příjmu, spoření pro děti. Náklady i svoji odměnu vám ukážu předem v korunách.")
REVIZE = ("Každý rok revize", "Každý rok se vám sám ozvu a smlouvy spolu projdeme znovu. Mezitím máte všechno v klientské zóně.")

MEET_FAQ = ("Kde se můžeme sejít?", f"V kanceláři na Havlíčkově náměstí 8 v Jemnici, u vás doma, nebo online. Za klienty jezdím do Moravských Budějovic, Dačic, Třebíče, Telče, Slavonic a okolních obcí.")
COST_FAQ = ("Kolik za vaše služby zaplatím?", "Odměnu dostávám od finanční instituce, nebo přímo od vás. Vždy ji uvidíte předem v korunách, dřív než cokoli podepíšete.")

PAGES = []

# ================================================================ POJIŠTĚNÍ
p = dict(
    path="/pojisteni", tema="/pojisteni", track="Pojištění", crumb="Pojištění",
    title="Pojištění Jemnice | život, dům, auto | Ondřej Kadlec",
    desc="Pojištění v Jemnici a okolí: životní pojištění, dům a domácnost, auto. Zkontroluji vaše smlouvy a ukážu na jedné stránce, co je kryté a co ne.",
    eyebrow="Pojištění · Jemnice a okolí",
    h1="Pojištění v Jemnici: život, dům, domácnost a auto",
    answer=f"Ondřej Kadlec je finanční poradce v Jemnici, který lidem z {MESTA_2P} kontroluje a nastavuje životní pojištění, pojištění domu a domácnosti a pojištění auta. Projde smlouvy, které máte, a na jedné stránce vám ukáže, co je kryté a co ne. Pojištění zprostředkovává jako vázaný zástupce společnosti INSIA a.s.",
    facts=[("Co zkontroluji", "život, dům, domácnost, auto, cestování"), ("Nejčastější problém", "dům pojištěný na starou částku"), ("Kde se sejdeme", "Jemnice, u vás doma, online")],
    cta="Víte, za co platíte pojistné?",
    sections=dict(
        komu=("Komu pomáhám", "<p>Pojistka se pozná až ve chvíli, kdy je potřeba. Proto ji kontroluji dřív. Nejčastěji pomáhám lidem, kteří:</p>" + ul([
            "platí životní pojištění roky a nevědí, co přesně kryje,",
            "mají hypotéku a potřebují pojistit, že ji rodina zvládne splácet, i kdyby přišli o příjem,",
            "postavili nebo koupili dům a pojistná částka neodpovídá dnešním cenám,",
            "chtějí porovnat povinné ručení a havarijní pojištění auta,",
            "mají nové dítě, novou práci nebo splacenou hypotéku a pojištění tomu neodpovídá.",
        ])),
        chyby=("Nejčastější chyby, které vidím", mistakes([
            ("Dům pojištěný na starou částku.", "Pojistná částka často pochází z doby uzavření smlouvy a ceny stavebních prací mezitím vzrostly. Při škodě pak pojišťovna může plnit jen poměrnou část. Tomu se říká podpojištění a vidím ho u klientů nejčastěji."),
            ("Životní pojistka bez krytí invalidity.", "Smlouva platí odškodné za zlomeniny, ale invaliditu nekryje vůbec, nebo na malou částku. Přitom právě dlouhodobá ztráta příjmu rodinu zasáhne nejvíc."),
            ("Investiční životní pojištění místo ochrany.", "Část pojistného jde na investici a poplatky a na krytí rizik zbývá málo. Ochranu a investice je obvykle lepší oddělit."),
            ("Smlouva, která neodpovídá životu.", "Nová práce, děti, splacená hypotéka: pojištění se má měnit s vámi. Smlouva stará deset let málokdy sedí na dnešní situaci."),
            ("Zrušení staré smlouvy dřív, než platí nová.", "Nová pojišťovna zkoumá zdravotní stav a může mít čekací doby. Starou smlouvu rušte až ve chvíli, kdy je nová sjednaná a platí."),
        ])),
        postup=steps([START, PREHLED, PLAN, ("Sjednání", "Pokud se rozhodnete pro změnu, vyřídím ji, včetně bezpečného ukončení staré smlouvy."), REVIZE]),
    ),
    faq=[
        ("Jak zjistím, jestli mám pojištění nastavené správně?", "Přineste své pojistné smlouvy. Projdu krytí a pojistné částky a porovnám je s tím, co skutečně potřebujete: výší příjmu, hypotékou a rodinou. Výsledek uvidíte na jedné stránce."),
        ("Na jakou částku pojistit dům?", "Na takzvanou novou cenu, tedy na částku, za kterou byste dům dnes znovu postavili. Ne na tržní cenu, za kterou byste ho prodali."),
        ("Proč je důležité krytí invalidity?", "Invalidita znamená dlouhodobou ztrátu příjmu, často na mnoho let. Pojištění invalidity vám v takové situaci vyplatí peníze, ze kterých můžete dál splácet a žít. U mnoha starších smluv chybí, nebo je nastavené na nízkou částku."),
        ("Můžu si životní pojištění odečíst z daní?", "Ano, pokud smlouva splňuje zákonné podmínky (mimo jiné trvá alespoň pět let a vyplácí se nejdříve v 60 letech). Odečíst lze až 48 000 Kč ročně, společně s penzijním spořením a DIP."),
        COST_FAQ,
        MEET_FAQ,
    ],
)
p["ld"] = service_ld(p, "Pojištění osob, majetku a vozidel", "Pojišťovací zprostředkování")
PAGES.append(("pojisteni.html", service_page(p)))

# ================================================================ HYPOTÉKY A ÚVĚRY
# Úvěry sám nezprostředkovávám: kontakt předávám partnerovi, specialistovi na úvěry.
# Proto tady žádné srovnávání nabídek, výpočty úvěru ani rady k jeho nastavení – jen propojení
# a to, co k úvěru patří z mého oboru: pojištění nemovitosti a pojištění schopnosti splácet.
p = dict(
    path="/hypoteky", tema="/hypoteka", track="Hypotéky", crumb="Hypotéky",
    title="Hypotéka Jemnice | partner na úvěry a pojištění k hypotéce",
    desc="Řešíte hypotéku nebo úvěr v Jemnici a okolí? Propojím vás se svým partnerem, specialistou na úvěry, a postarám se o pojištění nemovitosti i splácení.",
    eyebrow="Hypotéky a úvěry · Jemnice a okolí",
    h1="Hypotéka v Jemnici: partner na úvěr, pojištění ode mě",
    answer=f"Hypotéky a úvěry pro lidi z {MESTA_2P} zajišťuje partner Ondřeje Kadlece, specialista na úvěry. Ondřej Kadlec vás s ním propojí a sám se postará o to, co k úvěru patří z jeho oboru: pojištění nemovitosti, které banka vyžaduje, a životní pojištění, aby rodina zvládla splácet, i kdyby přišla o příjem.",
    facts=[("Úvěr řeší", "partner, specialista na úvěry"), ("Pojištění k úvěru", "nemovitost a schopnost splácet"), ("Kde se sejdeme", "Jemnice, u vás doma, online")],
    cta="Řešíte hypotéku nebo konec fixace?",
    sections=dict(
        komu=("S čím vám pomohu", "<p>Hypotéka je na dlouho a kolem ní je víc než jen úvěr. Ozvěte se, když:</p>" + ul([
            "kupujete nebo stavíte bydlení a potřebujete hypotéku,",
            "vám končí fixace a chcete, aby se na úvěr podíval specialista,",
            "splácíte více úvěrů a chcete vědět, jestli jde situaci řešit,",
            "potřebujete pojistit nemovitost, kterou bance dáváte do zástavy,",
            "chcete mít jistotu, že rodina zvládne splácet, i kdyby se něco stalo.",
        ]) + "<p>Úvěr samotný řeší můj partner, specialista na úvěry. Já vás s ním propojím a postarám se o pojištění.</p>"),
        chyby=("Nejčastější chyby kolem hypotéky, které vidím", mistakes([
            ("Hypotéka bez zajištění splácení.", "Když splácí jeden příjem a ten vypadne, je problém. Ke každé hypotéce proto kontroluji životní pojištění, hlavně krytí invalidity."),
            ("Životní pojistka bez krytí invalidity.", "Smlouva kryje zlomeniny, ale ne dlouhodobou ztrátu příjmu. Právě ta by ohrozila splácení nejvíc."),
            ("Dům pojištěný na nízkou částku.", "Banka chce mít zástavu pojištěnou. Pojistná částka ale musí odpovídat tomu, za kolik byste dům dnes postavili, jinak při škodě dostanete jen část."),
            ("Pozdní začátek.", "Konec fixace i nová hypotéka potřebují čas. Ozvěte se několik měsíců předem, ne pár týdnů."),
            ("Pojištění sjednané narychlo u banky.", "Pojištění nabízené k úvěru nemusí být to nejvhodnější. Před podpisem ho rád porovnám s jinými možnostmi."),
        ])),
        postup=steps([START,
                      ("Propojení s partnerem", "Předám váš kontakt svému partnerovi, specialistovi na úvěry. Ten se vám ozve a hypotéku nebo úvěr s vámi vyřeší. O schválení úvěru rozhoduje vždy banka."),
                      ("Pojištění k úvěru", "Já mezitím projdu pojištění nemovitosti a životní pojištění, které máte, a ukážu vám na jedné stránce, co je kryté a co ne. Náklady i svoji odměnu uvidíte předem v korunách."),
                      REVIZE]),
    ),
    faq=[
        ("Kdo mi s hypotékou pomůže?", "Hypotéky a úvěry zajišťuje můj partner, specialista na úvěry. Já vás s ním propojím a postarám se o pojištění, které k hypotéce patří."),
        ("Kdy se ozvat, když mi končí fixace hypotéky?", "Ideálně několik měsíců před koncem fixace. Partner tak má čas se na váš úvěr podívat bez spěchu."),
        ("Jak pojistit nemovitost k hypotéce?", "Banka obvykle vyžaduje pojištění nemovitosti, kterou dáváte do zástavy. Pojistná částka by měla odpovídat tomu, za kolik byste nemovitost dnes znovu postavili. Pojištění vám zkontroluji a sjednám."),
        ("Potřebuji k hypotéce životní pojištění?", "Banka ho většinou nevyžaduje, ale doporučuji ho. Hlavně krytí invalidity a smrti chrání rodinu před tím, aby musela splácet bez vašeho příjmu."),
        COST_FAQ,
        MEET_FAQ,
    ],
    note='<p class="note">Hypotéky a úvěry nezprostředkovávám. Kontakt předávám partnerovi, specialistovi na úvěry. O poskytnutí úvěru rozhoduje banka nebo jiný věřitel.</p>',
)
p["ld"] = service_ld(p, "Pojištění k hypotéce a propojení se specialistou na úvěry", "Pojištění nemovitosti a životní pojištění k úvěru")
PAGES.append(("hypoteky.html", service_page(p)))

# ================================================================ PENZE
p = dict(
    path="/penze", tema="/penze", track="Penze", crumb="Penze",
    title="Penzijní spoření Jemnice | státní příspěvek | O. Kadlec",
    desc="Penzijní spoření a DIP v Jemnici a okolí. Nastavím spoření tak, abyste dostali plný státní příspěvek i daňový odpočet. Projdu i vaši starou smlouvu.",
    eyebrow="Penze · Jemnice a okolí",
    h1="Penzijní spoření a důchod v Jemnici",
    answer=f"Ondřej Kadlec je finanční poradce v Jemnici, který lidem z {MESTA_2P} nastavuje doplňkové penzijní spoření (penzijko) a dlouhodobý investiční produkt (DIP) tak, aby dostali plný státní příspěvek i daňový odpočet. Spočítá, kolik budete na důchod potřebovat, projde vaši současnou smlouvu a řekne, jestli ji ponechat, upravit, nebo převést.",
    facts=[("Státní příspěvek", "až 340 Kč měsíčně"), ("Daňový odpočet", "až 48 000 Kč ročně"), ("Kde se sejdeme", "Jemnice, u vás doma, online")],
    cta="Dostáváte plný státní příspěvek?",
    sections=dict(
        komu=("Komu pomáhám", "<p>Penzijko má skoro každý, ale málokdo ví, jestli mu dává maximum. Nejčastěji za mnou chodí lidé, kteří:</p>" + ul([
            "mají staré penzijní připojištění (transformovaný fond) a nevědí, jestli je pro ně pořád nejlepší,",
            "spoří méně než 1 700 Kč měsíčně a nechávají ležet část státního příspěvku,",
            "mají zaměstnavatele, který na penzi přispívá, nebo by mohl přispívat,",
            "jsou po padesátce a chtějí vědět, jak spoření dokončit a jak peníze vybrat,",
            "chtějí dítěti založit spoření, které stát podpoří od prvního dne.",
        ])),
        chyby=("Nejčastější chyby, které vidím", mistakes([
            ("Penzijko bez plného státního příspěvku.", "Stát přidává 20 % z vašeho vkladu. Nárok vzniká od 500 Kč měsíčně, ale plný příspěvek 340 Kč dostanete až při vkladu 1 700 Kč. U klientů to vidím velmi často."),
            ("Konzervativní fond u mladého člověka.", "Kdo má do důchodu dvacet a více let, v nejopatrnější strategii obvykle ztrácí na inflaci. Strategii lze změnit v rámci stejné penzijní společnosti."),
            ("Zapomenutý daňový odpočet.", "Co spoříte nad 1 700 Kč měsíčně, si můžete odečíst od základu daně. Limit 48 000 Kč ročně je společný pro penzijní spoření, DIP a životní pojištění. Potvrzení pro zaměstnavatele je potřeba dodat do 15. února."),
            ("Nevyužitý příspěvek zaměstnavatele.", "Příspěvky zaměstnavatele na penzijní spoření a DIP jsou do 50 000 Kč ročně osvobozené od daně i odvodů. Pro firmu i pro vás je to výhodnější než stejná částka ve mzdě."),
            ("Výběr bez propočtu.", "Jednorázový výběr, renta, nebo kombinace: každá možnost se jinak daní. Rozhodněte se až po propočtu, ne podle toho, co je nejrychlejší."),
        ])),
        postup=steps([START,
                      ("Přehled", "Přineste výpis z penzijního spoření. Ukážu vám, kolik spoříte, v jaké strategii a kolik vám stát přidává, a kolik budete na důchod potřebovat. Na první schůzce se nic nepodepisuje."),
                      ("Změna", "Pokud se rozhodnete něco změnit, vyřídím to za vás: úpravu vkladu, změnu strategie, převod nebo DIP. Náklady i odměnu uvidíte předem v korunách."),
                      REVIZE]),
    ),
    faq=[
        ("Kolik musím spořit, abych dostal plný státní příspěvek?", "Plný státní příspěvek 340 Kč měsíčně dostanete při vlastním vkladu 1 700 Kč. Nárok na příspěvek vzniká od vkladu 500 Kč měsíčně, kdy stát přidá 100 Kč."),
        ("Vyplatí se převést staré penzijní připojištění do nového fondu?", "Ne vždy. Staré transformované fondy garantují, že nepřijdete o vložené peníze, ale jejich výnosy bývají nízké. Při převodu se garance ztrácí. Rozhoduje hlavně to, kolik let vám zbývá do důchodu, a to spočítám na schůzce."),
        ("Jaký je rozdíl mezi penzijním spořením a DIP?", "Penzijní spoření má státní příspěvek i daňový odpočet. Dlouhodobý investiční produkt (DIP) státní příspěvek nemá, ale nabízí daňový odpočet, osvobozený příspěvek zaměstnavatele a širší výběr investic. U obou platí společný limit odpočtu 48 000 Kč ročně."),
        ("Můžu založit penzijní spoření dítěti?", "Ano. Penzijní spoření lze založit i dítěti a stát na něj přispívá stejně jako dospělým. Pro děti ale často dává smysl i investiční spoření, ze kterého lze peníze vybrat dřív, třeba na studium nebo bydlení."),
        ("Můžu si spoření snížit nebo přerušit?", "Ano. Výši vkladu můžete měnit a spoření lze i přerušit. Za měsíce bez vkladu ale nedostanete státní příspěvek."),
        MEET_FAQ,
    ],
    note=f'<p class="note">{RISK}</p><p class="note">Částky platí pro rok 2026. Vláda připravuje novelu zákona o doplňkovém penzijním spoření. Pokud projde, klientům se ozvu s tím, co se pro ně mění.</p>',
)
p["ld"] = service_ld(p, "Penzijní spoření a příprava na důchod", "Finanční poradenství – penzijní spoření")
PAGES.append(("penze.html", service_page(p)))

# ================================================================ INVESTICE
p = dict(
    path="/investice", tema="/investice", track="Investice", crumb="Investice",
    title="Investice a DIP Jemnice | spoření pro děti | O. Kadlec",
    desc="Investice, DIP a spoření pro děti v Jemnici a okolí. Spočítám, kolik dnes platíte na poplatcích, a navrhnu plán podle toho, kdy budete peníze potřebovat.",
    eyebrow="Investice · Jemnice a okolí",
    h1="Investice, DIP a spoření pro děti v Jemnici",
    answer=f"Ondřej Kadlec je finanční poradce v Jemnici, který lidem z {MESTA_2P} pomáhá investovat úspory, nastavit dlouhodobý investiční produkt (DIP) a spořit pro děti. Nejdřív spočítá, kolik dnes platíte na poplatcích a jak velkou rezervu mít po ruce, a teprve potom navrhne změny. Investice zprostředkovává jako vázaný zástupce společnosti In Investments a.s. (ININVEST) pod dohledem České národní banky.",
    facts=[("Pro koho", "úspory na účtu, pravidelné investování, děti"), ("Dohled", "Česká národní banka"), ("Kde se sejdeme", "Jemnice, u vás doma, online")],
    cta="Kolik vás dnes stojí vaše investice?",
    sections=dict(
        komu=("Komu pomáhám", "<p>Investice jsou můj hlavní obor. Pomáhám lidem, kteří:</p>" + ul([
            "mají peníze na běžném nebo spořicím účtu a úrok nestačí na inflaci,",
            "už investují, ale nevědí, kolik je to stojí a jestli to dává smysl,",
            "chtějí spořit dětem na studium nebo na start do života,",
            "dostali dědictví nebo prodali nemovitost a chtějí větší částku rozumně rozložit,",
            "chtějí využít daňový odpočet přes DIP.",
        ])),
        chyby=("Nejčastější chyby, které vidím", mistakes([
            ("Investice bez rezervy.", "Do investic patří jen peníze, které v nejbližších letech nebudete potřebovat. Nejdřív rezerva na nečekané výdaje, obvykle na několik měsíců života, teprve potom investice."),
            ("Poplatky, které nikdo nespočítal.", "Vstupní poplatek, roční správa a náklady fondu se sčítají. Jedno procento ročně navíc vám za dvacet let ukrojí téměř pětinu výsledné částky."),
            ("Strategie neodpovídá cíli.", "Akciový fond na peníze, které potřebujete za dva roky, je stejná chyba jako opatrný fond na důchod za třicet let."),
            ("Spoření pro děti na spořicím účtu.", "Když do plnoletosti zbývá patnáct let, peníze na spořicím účtu obvykle nestačí na inflaci. Pro dlouhý horizont dává smysl pravidelná investice."),
            ("Prodej v panice.", "Když trhy klesnou, lidé prodávají se ztrátou. Plán, se kterým počítáme dopředu, říká, co dělat, když přijde propad."),
        ])),
        postup=steps([START,
                      ("Přehled a cíle", "Projdeme vaše cíle a termíny: rezervu, bydlení, děti, důchod. Přineste výpisy z investic a spoření, pokud nějaké máte. Na první schůzce se nic nepodepisuje."),
                      ("Investiční dotazník", "Před doporučením vyplníme dotazník, který vyžaduje zákon. Zjistí vaše zkušenosti, cíle a to, jak velké výkyvy unesete."),
                      ("Návrh a náklady", "Dostanete písemný návrh. Všechny poplatky i svoji odměnu vám ukážu předem v korunách, včetně toho, kolik platíte dnes."),
                      REVIZE]),
    ),
    faq=[
        ("Od jaké částky má smysl investovat?", "Pravidelně lze investovat už od stovek korun měsíčně. Důležitější než částka je mít rezervu a dostatek času, ideálně několik let."),
        ("Jak spořit pro děti?", "Pro dlouhý horizont, třeba do plnoletosti, obvykle dává smysl pravidelná investice. Dítěti lze založit i penzijní spoření se státním příspěvkem. Co je lepší, záleží na tom, kdy a na co budou peníze potřeba."),
        ("Je investování bezpečné?", "Investice nesou riziko a jejich hodnota může klesat i stoupat. Riziko snižuje delší doba investování a rozložení do více investic. Garantovaný výnos u investic neslibuji."),
        ("Co je DIP a komu se vyplatí?", "Dlouhodobý investiční produkt (DIP) je investiční účet s daňovým odpočtem až 48 000 Kč ročně (společný limit s penzijním spořením a životním pojištěním). Vyplatí se hlavně lidem, kterým přispívá zaměstnavatel nebo kteří chtějí využít daňový odpočet. Peníze lze bez ztráty výhod vybrat po deseti letech a po dosažení 60 let."),
        COST_FAQ,
        MEET_FAQ,
    ],
    note=f'<p class="note">{RISK} Minulé výnosy nejsou zárukou budoucích.</p>',
)
p["ld"] = service_ld(p, "Investice, DIP a spoření pro děti", "Finanční poradenství – investice")
PAGES.append(("investice.html", service_page(p)))

# ================================================================ O MNĚ
p = dict(
    path="/o-mne", tema="", track="O mně", crumb="O mně",
    title="O mně | Ondřej Kadlec, finanční poradce z Jemnice",
    desc="Ondřej Kadlec, finanční poradce z Jemnice. Vázaný zástupce INSIA a.s. a ININVEST registrovaný u ČNB, absolvent Právnické fakulty MU. Jak pracuji.",
)
p["ld"] = {"@context": "https://schema.org", "@graph": [
    {"@type": "ProfilePage", "@id": SITE + "/o-mne", "url": SITE + "/o-mne", "name": p["title"], "mainEntity": {"@id": PERSON_ID}},
    {"@type": "Person", "@id": PERSON_ID, "name": "Ondřej Kadlec", "jobTitle": "Finanční poradce",
     "url": SITE + "/o-mne", "image": SITE + "/assets/ondrej-jemnice-900.webp", "telephone": TEL_HREF, "email": EMAIL,
     "worksFor": {"@id": ORG_ID},
     "alumniOf": {"@type": "CollegeOrUniversity", "name": "Právnická fakulta Masarykovy univerzity", "url": "https://www.law.muni.cz/"},
     "homeLocation": {"@type": "City", "name": "Jemnice"},
     "knowsAbout": ["Pojištění", "Penzijní spoření", "Investice", "Dlouhodobý investiční produkt", "Spoření pro děti"],
     "memberOf": [{"@type": "Organization", "name": "INSIA a.s.", "url": "https://www.insia.cz/"},
                  {"@type": "Organization", "name": "In Investments a.s.", "url": "https://www.ininvest.cz/"}],
     "sameAs": [GOOGLE, FIRMY, FACEBOOK]},
    crumbs("O mně", "/o-mne")]}
o_mne = f"""
<main>
<div class="hero">
  <p class="eyebrow">O mně</p>
  <h1>Ondřej Kadlec, finanční poradce z Jemnice</h1>
  <p class="answer">Jsem Ondřej Kadlec, finanční poradce z Jemnice. Jako vázaný zástupce společností INSIA a.s. a In Investments a.s. (ININVEST), registrovaný u České národní banky, pomáhám lidem z {MESTA_2P} s pojištěním, penzí a investicemi. S hypotékou vás propojím se svým partnerem, specialistou na úvěry. Vystudoval jsem Právnickou fakultu Masarykovy univerzity.</p>
  {facts([("Kancelář", ADDR), ("Otevírací doba", HOURS), ("Ověření", f'<a href="{CNB}" target="_blank" rel="noopener">Registr ČNB</a> · IČO 14311569')])}
</div>

<div class="body">
  <div>
    <section id="kdo"><h2><span>01</span>Kdo jsem</h2>
      <p>Jsem z Jemnice a pracuji tady. Kancelář mám na Havlíčkově náměstí, ale za klienty jezdím i domů, do Moravských Budějovic, Dačic, Třebíče, Telče, Slavonic a okolních obcí. Sejít se můžeme i online.</p>
      <p>Svěřilo se mi kolem 100 klientů, hlavně z Jemnice a okolí. Řeším s nimi pojištění, penzijní spoření, investice a spoření pro děti, protože peníze v domácnosti spolu souvisí. Kdo potřebuje hypotéku nebo úvěr, toho propojím se svým partnerem, specialistou na úvěry.</p>
    </section>
    <section id="vzdelani"><h2><span>02</span>Vzdělání a oprávnění</h2>
      <h3>Právnická fakulta Masarykovy univerzity</h3>
      <p>Právní vzdělání se mi hodí každý den: smlouvy, pojistné podmínky i daňová pravidla čtu tak, jak jsou napsané, ne jak je popisuje reklama.</p>
      <h3>Vázaný zástupce registrovaný u ČNB</h3>
      <p>Jednám jménem a na odpovědnost společností, které za mou činnost odpovídají:</p>
      <ul>
        <li><strong>INSIA a.s.</strong> pro distribuci pojištění podle zákona č. 170/2018 Sb.,</li>
        <li><strong>In Investments a.s. (ININVEST)</strong> pro investiční služby podle zákona č. 256/2004 Sb.</li>
      </ul>
      <p>Zápis si můžete ověřit v <a href="{CNB}" target="_blank" rel="noopener">registru České národní banky</a> podle jména nebo IČO 14311569. Podrobnosti najdete v <a href="/informace">informacích pro klienty</a>.</p>
    </section>
    <section id="jak"><h2><span>03</span>Jak pracuji</h2>
      <ol class="steps">
        <li><b>Projdu, co máte</b>Na začátku se podívám na smlouvy, které už máte: pojištění, penzijko, investice.</li>
        <li><b>Přehled na jedné stránce</b>Ve svém analytickém programu vám na jedné stránce ukážu, co je kryté a co ne. Nejčastěji najdu dům pojištěný na starou částku, penzijko bez plného státního příspěvku a životní pojistku bez krytí invalidity.</li>
        <li><b>Plán</b>Navrhnu plán: rezervu, zajištění příjmu, spoření pro děti. Na první schůzce se nic nepodepisuje.</li>
        <li><b>Náklady předem v korunách</b>Odměnu dostávám od finanční instituce, nebo přímo od vás. Náklady i svoji odměnu vždy uvidíte předem v korunách.</li>
        <li><b>Každý rok revize</b>Každý rok se vám sám ozvu a smlouvy spolu projdeme znovu. Mezitím máte všechno v klientské zóně.</li>
      </ol>
      <p style="margin-top:22px"><a class="pill" href="{GOOGLE}" target="_blank" rel="noopener" data-track="O mně · recenze Google">Recenze na Googlu</a></p>
    </section>
  </div>
  {aside(p['path'], p['tema'], p['track'])}
</div>
</main>
"""
PAGES.append(("o-mne.html", head(p) + o_mne + tail("Pojďme se poznat.", "", "O mně")))

for name, content in PAGES:
    (ROOT / name).write_text(content, encoding="utf-8")
    import re
    words = len(re.sub(r"<[^>]+>", " ", re.search(r"<main>(.*)</main>", content, re.S).group(1)).split())
    print("✓", name, words, "slov")

# ---- společné kusy pro články blogu (api/clanek.js) – ať vypadají stejně jako stránky služeb
SHELL = {"topbar": topbar("/blog", "", "Blog"), "footer": FOOTER, "site": SITE, "orgId": ORG_ID, "personId": PERSON_ID,
         "tel": TEL, "telHref": TEL_HREF,
         "services": {"pojisteni": ["/pojisteni", "Pojištění", "/pojisteni"], "hypoteky": ["/hypoteky", "Hypotéky a úvěry", "/hypoteka"],
                      "uvery": ["/hypoteky", "Hypotéky a úvěry", "/uvery"], "penze": ["/penze", "Penzijní spoření", "/penze"],
                      "investice": ["/investice", "Investice a DIP", "/investice"]}}
(ROOT / "api" / "_shell.js").write_text(
    "// Generováno z tools/build_pages.py – neupravujte ručně.\nmodule.exports = " + json.dumps(SHELL, ensure_ascii=False, indent=1) + ";\n",
    encoding="utf-8")
print("✓ api/_shell.js")
