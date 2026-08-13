# Stage 2 — Authentication and Permissions

**Status:** Completed and verified.

The candidate dashboard already used Manus OAuth for session creation. This stage moved the application list, application creation, candidate-profile read, and candidate-profile update procedures from public access to authenticated access. The server now assigns application ownership from the authenticated session’s `openId`, rather than accepting a candidate identity from the browser.

| Verification | Result |
| --- | --- |
| Candidate A isolation | Passed. The real tRPC router returned only Candidate A’s record and never Candidate B’s record. |
| Candidate B isolation | Passed. The same router returned only Candidate B’s record and never Candidate A’s record. |
| Administrator access | Passed. An administrator context receives the complete operational application feed. |
| Anonymous access | Passed. An unauthenticated applications-list request is rejected as `UNAUTHORIZED`. |
| Regression check | Passed. Type checking succeeded and all 14 automated tests passed. |

No real customer records were seeded, changed, or exposed while performing this verification.
