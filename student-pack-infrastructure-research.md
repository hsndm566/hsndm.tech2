# GitHub Student Developer Pack infrastructure research — 16 August 2026

## Official catalogue findings

The official GitHub Education catalogue currently lists the following offers that are materially relevant to the AutoApply SA deployment architecture.

| Offer | Verified current benefit | Architectural relevance |
|---|---|---|
| Microsoft Azure | Access to 25+ Azure services and $100 credit for students aged 18+ | General cloud platform; viable only if a controlled deployment and cost budget are established. |
| Heroku | $13 USD/month credit for 24 months | The simplest pack-provided PaaS candidate for one Node/Express dashboard/API service, but the credit is modest and needs usage monitoring. |
| Appwrite | Education plan for two projects with Pro-equivalent resource limits while Student Pack membership remains active | Not eligible for this commercial service: Appwrite explicitly prohibits commercial use of its Education plan. |
| Clerk | Free Pro plan while the user is a student | Directly useful: the project already uses Clerk passwordless authentication. |
| MongoDB Atlas | $50 Atlas credit plus Compass and University access | Useful only if the persistence layer is deliberately migrated to MongoDB; it does not match the current MySQL/TiDB Drizzle schema without a data-layer change. |
| New Relic | Free while the user is a student | Useful for operational monitoring once a stable production host exists. |
| Sentry | Student allocation of errors, transactions, attachments, and replays for one year | Useful for frontend/API error visibility; complementary, not a host. |
| Doppler | Free Team subscription while active student | Useful for portable production secret management across host providers. |

## Source URLs

1. https://education.github.com/pack?sort=popularity&tag=Cloud
2. https://education.github.com/pack?sort=popularity&tag=Developer%20tools
3. https://www.heroku.com/github-students/
4. https://devcenter.heroku.com/articles/github-integration
5. https://devcenter.heroku.com/articles/usage-and-billing
6. https://azure.microsoft.com/en-us/pricing/offers/ms-azr-0170p
7. https://appwrite.io/education
8. https://clerk.com/github-student-developer-pack

## Preliminary recommendation

Claim the Clerk Student plan immediately because it directly matches the existing passwordless dashboard authentication. For the deployment target, Heroku is the best Student Pack fit for the current Node/Express/tRPC dashboard API: it can deploy directly from GitHub, supports a single Node service without an architecture rewrite, and the $13 monthly student credit can cover an Eco dyno plus Mini Postgres and Mini Key-Value Store. A valid card is required, overages are billable, unused credit does not roll over, and the offer is limited to 24 months.

Do not use Appwrite Education for AutoApply SA because its official terms prohibit commercial use. Do not migrate to MongoDB merely for the $50 credit because the project currently uses a MySQL/TiDB Drizzle model. Azure is technically capable, but the student credit is only $100 for 12 months, no SLA applies to free services, resources may be removed after 90 inactive days, and it imposes substantially more operational work. Treat Azure as a staging or future planned migration, not the immediate solution to the blocked Railway source change.
