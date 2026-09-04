# AutoApply customer journey

1. Customer reaches AutoApply SA.
2. Customer opens the private dashboard.
3. Clerk authenticates the customer inside the dashboard shell.
4. Candidate-scoped profile, campaign approval, applications, and evidence load through protected API procedures.
5. First-time customers confirm targeting and campaign authorization.
6. Application records show queued/applied/interview/offer state and available evidence.
7. Customers who want local browser assistance open **Browser helper** and use the AutoApply ApplyPilot fork in dry-run mode first.
8. Outbound email acceptance can be represented as `email_accepted` evidence. Employer response can be represented as `employer_confirmation`; inbound mailbox synchronization must write an authenticated candidate-scoped event before the dashboard may claim a reply was received.
