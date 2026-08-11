# Campaign Readiness Check — Implementation Foundations

## Backend and Railway boundary

No Railway connector or deployment credential is configured in the current session. The project can be upgraded to a production-ready TypeScript backend with a database, server-side API boundary, validation, and environment-variable configuration. The build will remain compatible with Railway’s standard Node service model: a build command, a production start command that respects `PORT`, and server-only environment variables. Deploying to a particular Railway project still requires that project to be connected or its deployment credentials to be provided by the owner.

## Saudi geographic validation

The existing city choices are geographically valid Saudi cities. Riyadh is the national capital and the administrative capital of Riyadh Province. Jeddah and Makkah are cities in Makkah al-Mukarramah Province. Al-Madinah al-Munawwarah is the administrative capital of its province. Dammam is the administrative capital of the Eastern Province. The readiness check should keep these labels as city choices and preserve the broader option “Anywhere in Saudi Arabia”; it must not present them as the full list of Saudi regions.

## Arabic and mobile interaction requirements

The English flow will remain LTR while the Arabic route uses native `dir="rtl"`, mirrored layout direction, Arabic labels, and logical button/icon ordering. The design will keep city and role names unambiguous and avoid assumptions about a single "Arab" audience. The interaction will be mobile-first, concise, respectful, and transparent about data use. The Saudi Digital Government Authority’s current design-system description explicitly supports Arabic RTL and English LTR, while its regulatory framework emphasizes mobile-first and beneficiary-centric experiences.

## Authoritative references

- Saudi Digital Government Authority, Platforms Code Design System: https://oss.dga.gov.sa/en/products/6c0378d656d94cfba6981a7862f05303
- Saudi Digital Government Authority, Digital Government Regulatory Framework: https://dga.gov.sa/en/regulatory_framework
- Saudipedia, Provinces of Saudi Arabia: https://saudipedia.com/en/provinces-of-saudi-arabia
- Ministry of Foreign Affairs, About the Kingdom: https://bf.saudiembassy.sa/en/AboutKSA/Pages/default.aspx
- Railway, Config as Code reference: https://docs.railway.com/config-as-code/reference — Railway reads `railway.toml` or `railway.json` and supports explicit build, start, and health-check settings.
- Railway, Healthchecks: https://docs.railway.com/deployments/healthchecks — Railway injects `PORT` and waits for a configured endpoint to return HTTP 200 before switching traffic; its deployment health check is not continuous monitoring.
