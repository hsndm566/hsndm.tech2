# ATS and Public Chat Verification

## Live ATS repair

On 2026-08-17, the public ATS route was tested using a non-personal sample CV. The initial request reached `campaign.ats.analyze` but returned HTTP 500 because GPT-5 mini spent its `max_tokens` allocation on internal reasoning and emitted a truncated JSON object. The client correctly presented its private local review fallback, but the remote review could not complete.

The server LLM helper now supports GPT’s `max_completion_tokens` parameter. The ATS procedure uses that parameter, minimal reasoning, and constrained JSON-schema array and string limits. A direct structured-model probe returned complete JSON with `finish_reason: "stop"`. After deployment, the live `www.hsndm.tech/api/trpc/campaign.ats.analyze` request returned HTTP 200 and a schema-valid ATS result for the same non-personal sample.

## Public chat verification

The live `Chat / دردشة` trigger was opened on the ATS route and sent a generic, non-personal visitor question. The Railway endpoint responded with the expected bilingual AutoApply SA service explanation. The 375px public-route review confirmed the persistent chat trigger remains visible on English and Arabic pages. No chat-code mutation was necessary because the current public endpoint and browser integration completed successfully.

## Privacy verification

The ATS test used non-personal sample text. The established local fallback remains available if a remote review is unavailable, and its UI explicitly states that it does not send new CV text when activated.
