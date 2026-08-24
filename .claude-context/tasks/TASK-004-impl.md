# TASK-004: Implementace — Podstránky (9 stránek)

## Status: DONE
**Commit:** `2bb3b86` — "Implement 9 subpages with 15 shared components and 9 data files"

## Stránky implementované (9)

| # | Stránka | URL | Sekce |
|---|---------|-----|-------|
| 1 | O nás | /o-nas | PageHero, Company story, Values (3 karty), TeamGrid, CTA |
| 2 | Development | /sluzby/development | PageHero, Stats, Differentiators (6), ProjectCards (3), ProcessTimeline (4), CTA |
| 3 | Rekonstrukce | /sluzby/rekonstrukce | PageHero, RenovationProcess (9), BeforeAfterGallery, ProjectCards, FAQ (6), Testimonials, CTA |
| 4 | Nemovitosti | /sluzby/nemovitosti | PageHero, Real estate services (3), Differentiators (4), CTA |
| 5 | Investice | /sluzby/investice | PageHero, InvestmentModels (2), ProcessTimeline (4), Advantages (4), CTA |
| 6 | Reference | /reference | PageHero, ProjectCards (8), Testimonials, CTA |
| 7 | Kariéra | /kariera | PageHero, BenefitsGrid (6), JobPositions (2), ProcessTimeline (4), CTA |
| 8 | Blog | /blog | PageHero, BlogList (3 články), Newsletter |
| 9 | Kontakt | /kontakt | PageHero, Contact info + ContactForm, MapEmbed, Phone CTA |

## Sdílené komponenty (15)

| # | Komponenta | Typ | Použití |
|---|-----------|-----|---------|
| 1 | PageHero | Server | Všechny podstránky |
| 2 | CTASection | Server | O nás, Development, Rekonstrukce, Nemovitosti, Investice, Reference, Kariéra |
| 3 | ProcessTimeline | Server | Development, Investice, Kariéra |
| 4 | ProjectCards | Server | Development, Rekonstrukce, Reference |
| 5 | TeamGrid | Server | O nás, Homepage |
| 6 | DifferentiatorsGrid | Server | Development, Nemovitosti, Investice |
| 7 | RenovationProcess | Server | Rekonstrukce |
| 8 | BeforeAfterGallery | Client | Rekonstrukce |
| 9 | FAQ | Client | Rekonstrukce |
| 10 | InvestmentModels | Server | Investice |
| 11 | BenefitsGrid | Server | Kariéra |
| 12 | JobPositions | Client | Kariéra |
| 13 | BlogList | Server | Blog |
| 14 | ContactForm | Client | Kontakt |
| 15 | MapEmbed | Server | Kontakt |

## Data soubory (9)

team.ts, services.ts, projects.ts, testimonials.ts, blog.ts, jobs.ts, faq.ts, renovation-steps.ts, investment-models.ts

## Build output
- `npm run build` — 0 chyb, 14 statických rout, 257ms kompilace
- 34 souborů, 1515 řádků přidáno

## Bonus fix
- TASK-003-fix: TeamGrid sekce přidána na homepage mezi Stats a FeaturedProject
