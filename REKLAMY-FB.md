# Reklamy na Facebook a Instagram · funnel „Druhý názor"

Sedm reklam, každá vede na vlastní variantu `konzultace.html`. **Nadpis stránky říká totéž co reklama** — tomu se říká message match a je to nejlevnější způsob, jak zvednout počet vyplněných formulářů. Když v reklamě něco přepíšeš, přepiš to i v `konzultace.html` (blok `var T = {`).

Každé téma má dvě verze textu, **A** (krátká, slib) a **B** (delší, přiznání proti vlastnímu zájmu). Pusť obě a po pár dnech nech běžet tu, která má levnější lead.

---

## Než to pustíš: tři pravidla, která reklamu shodí

**1. Neptej se na osobní finanční situaci.** Facebook zakazuje reklamy, které tvrdí nebo naznačují, že víš něco o člověku: „Máte dluhy?", „Končí vám fixace?", „Nestačí vám na splátky?". Proto jsou texty níže psané obecně („Fixace končí…", „Víc splátek jde sloučit…"), ne „vám". Neměň to.

**2. Hypotéky a úvěry jsou zvláštní kategorie reklam.** Ve Správci reklam u kampaně zaškrtni **Zvláštní kategorie reklam → Finanční produkty a služby**. Facebook pak nedovolí cílit podle věku, pohlaví a úzké oblasti (místo „Jemnice + 10 km" nastav širší okruh). Bez zaškrtnutí reklamu zamítne nebo zablokuje účet. Pojištění, investice a penze do kategorie obvykle nespadají, ale Facebook si to posuzuje sám — když reklamu přeřadí, nech ho.

**3. U úvěrů a hypoték žádná čísla o ceně.** Jakmile v reklamě uvedeš sazbu, splátku nebo úsporu, musí podle zákona o spotřebitelském úvěru obsahovat i reprezentativní příklad s RPSN. Texty níže proto žádné číslo o ceně neobsahují.

A obecně: žádné „zdarma", žádná vymyšlená čísla a úspory, žádné emoji.

---

## Společné nastavení

| Pole | Hodnota |
|---|---|
| Cíl kampaně | Potenciální zákazníci (leady) → na webu, konverze = odeslání formuláře |
| Tlačítko | **Další informace** (pro studené publikum funguje líp než „Zaregistrovat se") |
| Oblast | Jemnice, Moravské Budějovice, Dačice a okolí |
| Fotka | Černobílý portrét na zelené ploše jako v heru webu, nebo obyčejná fotka z Jemnice. Stockové fotky ne. |
| Text v obrázku | Jen nadpis reklamy, nic víc |

**Odkaz** má vždy tvar:

```
https://TVOJE-DOMENA/konzultace.html?tema=TEMA&utm_source=facebook&utm_medium=paid&utm_campaign=druhy-nazor&utm_content=TEMA-a
```

Za `TVOJE-DOMENA` dosaď adresu webu. U verze B změň konec na `TEMA-b`. Podle `utm_content` pak v adminu uvidíš, která reklama přivedla který lead.

---

## 1 · Investice a úspory

`?tema=investice` · stránka: *Leží vaše úspory tam, kde jim inflace ubírá?*

**Text A**
> Peníze na spořicím účtu každý rok tiše ztrácejí hodnotu. Podívám se, kde svoje úspory máte a kolik si za to instituce bere. Když je to nastavené dobře, řeknu vám to.

**Text B**
> Každý radí něco jiného a každý na tom vydělává. Já taky — provizi dostávám od instituce, ne od vás. Proto vám řeknu i to, co se mi nevyplatí: když máte úspory nastavené dobře, nechte je být.
> Srovnám, co máte, s tím, co dnes nabízí trh. Ondřej Kadlec, Jemnice.

| Nadpis (max 40 znaků) | Popis |
|---|---|
| Kde vaše úspory ztrácejí hodnotu? | Druhý názor z Jemnice |
| Druhý názor na vaše úspory | Řeknu vám to na rovinu |

---

## 2 · Penze

`?tema=penze` · stránka: *Víte, kolik vám stát v penzi doopravdy pošle?*

**Text A**
> Kolik vám stát v penzi doopravdy pošle? Spočítáme to a podíváme se, co s tím jde dělat, včetně daňových úlev. Když už máte dobře nastaveno, řeknu vám to.

**Text B**
> DIP, DPS, transformované fondy. Tři zkratky a nikdo pořádně nevysvětlí rozdíl.
> Projdu, co dnes máte, a řeknu vám to česky. U penze je jediná drahá věc čas, který proteče — a ten se nevrátí.

| Nadpis | Popis |
|---|---|
| Kolik vám stát v penzi pošle? | Spočítáme to spolu |
| Staré penzijko pod lupou | Druhý názor z Jemnice |

---

## 3 · Životní a úrazové pojištění

`?tema=osoby` · stránka: *Vyplatí vaše pojistka, když to bude potřeba?*

**Text A**
> Smlouvu jste podepsali před lety a od té doby do ní nikdo nekoukl. Projdu, na co máte nárok, jaké jsou výluky a kolik za to platíte. Když je v pořádku, necháme ji být.

**Text B**
> „Sjednali mi to na pobočce, ten člověk už tam nepracuje — a já nevím, na koho se obrátit."
> Tohle slyším nejčastěji. Podmínky pojistky se většinou zjistí až po úrazu, kdy už je pozdě je měnit. Podívám se na ni dřív. A když je dobrá, řeknu vám to.

| Nadpis | Popis |
|---|---|
| Vyplatí vaše pojistka, až bude třeba? | Kontrola životní pojistky |
| Víte, co vaše pojistka kryje? | Druhý názor z Jemnice |

---

## 4 · Pojištění domu a domácnosti

`?tema=majetek` · stránka: *Je váš dům pojištěný na dnešní ceny?*

**Text A**
> Ceny oprav šly nahoru, pojistné částky ve starších smlouvách často ne. Když je dům podpojištěný, pojišťovna při škodě krátí plnění. Podívám se, jestli by vám zaplatila celou opravu.

**Text B**
> Pojistka se pozná až při škodě. Lepší to vědět dřív.
> Projdu pojištění domu i domácnosti: jestli sedí částka, co kryje a jestli máte odpovědnost za škodu sousedům. Když je všechno v pořádku, nic nového vám nesjednám.

| Nadpis | Popis |
|---|---|
| Je váš dům pojištěný na dnešní ceny? | Kontrola pojištění domu |
| Zaplatí pojišťovna celou opravu? | Druhý názor z Jemnice |

---

## 5 · Cestovní pojištění

`?tema=cestovni` · stránka: *Zaplatí cestovní pojištění i nemocnici v zahraničí?*

**Text A**
> Pojištění ke kartě i roční smlouvy mají limity, o kterých se často ví až v nemocnici. Než odjedete, projdu, co máte, a řeknu vám, jestli to stačí.

**Text B**
> Cestovní pojištění je levné. Drahé je to, které nekryje.
> Hory, sporty, léčebné výlohy mimo Evropu — tam bývají výluky a nízké limity. Podívám se na vaše a když stačí, nic nového vám nesjednám.

| Nadpis | Popis |
|---|---|
| Zaplatí pojištění i nemocnici? | Než odjedete |
| Co kryje pojištění ke kartě? | Kontrola před cestou |

Tip: tuhle reklamu pouštěj **3–4 týdny před sezonou** (jarní prázdniny, léto, hory). Mimo sezonu bude drahá.

---

## 6 · Hypotéka

`?tema=hypoteka` · stránka: *Kolik by hypotéka stála u jiné banky?*
**Zvláštní kategorie: Finanční produkty a služby.** Žádná čísla o sazbě.

**Text A**
> Fixace končí a nabídka banky počítá s tím, že se nikdo nebude ptát. Srovnám sazbu i podmínky s nabídkou celého trhu. Když je ta vaše dobrá, měnit nebudeme nic.

**Text B**
> Obíhat patnáct bank nemá kdo. Tak se vezme to, co přijde poštou.
> Udělám to za vás: refixace, refinancování i nová koupě. Provizi dostávám od banky, ne od vás — a když je nejlepší zůstat, řeknu vám to.

| Nadpis | Popis |
|---|---|
| Kolik by hypotéka stála jinde? | Srovnání napříč bankami |
| Končící fixace: srovnejte trh | Druhý názor z Jemnice |

---

## 7 · Úvěry a splátky

`?tema=uvery` · stránka: *Víc splátek jde někdy sloučit do jedné, levnější.*
**Zvláštní kategorie: Finanční produkty a služby.** Žádná čísla o úroku ani úspoře. Nikdy „Máte dluhy?".

**Text A**
> Víc splátek jde někdy sloučit do jedné, levnější. Projdu úvěry, kreditky i kontokorent a spočítám, jestli se to vyplatí. Když je to nastavené dobře, řeknu vám to.

**Text B**
> Řešit splátky zní jako ostuda. Přitom je to jenom počítání.
> Kreditka a kontokorent jsou nejdražší peníze na trhu a používají se nejsnáz. Sečtu to za vás a ukážu, co jde udělat. Osobně, v Jemnici nebo u vás.

| Nadpis | Popis |
|---|---|
| Splátky se dají sečíst | Sloučení úvěrů |
| Splátky dohromady, levněji | Druhý názor z Jemnice |

---

## Až to poběží

- Po **3–5 dnech** porovnej A a B u každého tématu podle ceny za lead, ne za kliknutí. Horší verzi vypni.
- Leady najdeš v adminu, v poznámce je `z reklamy: TÉMA` a zdroj.
- Pokud nějaké téma nepřivede nic ani po týdnu, nehledej chybu v textu reklamy jako první — zkontroluj, jestli nadpis stránky pořád odpovídá reklamě.
