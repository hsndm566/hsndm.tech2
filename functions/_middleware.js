const MARKDOWN_404 = (pathname) => [
  "# Page not found",
  `\nNo public page exists at **${pathname}**. Check the [developer documentation](https://www.hsndm.tech/developers/), [sitemap](https://www.hsndm.tech/sitemap.xml), or [AI agent guide](https://www.hsndm.tech/llms.txt).`,
  "",
].join("");

const HOME_MARKDOWN = `# AutoApply SA — Saudi job-search organiser

AutoApply SA helps job seekers across Saudi Arabia organise a search, review CV skills, choose target roles and cities, and track opportunities in Arabic or English.

## Current capabilities

Candidates can review skills from a CV, set role and location preferences, save opportunities, and track next actions. CV keyword suggestions and ATS feedback are guidance, not a hiring outcome.

Employer submission is not currently enabled. The public preview does not submit applications for candidates.

## Public API

The unauthenticated, read-only API provides product information, monthly plans, and API health:
- [Developer documentation](https://www.hsndm.tech/developers/)
- [OpenAPI specification](https://www.hsndm.tech/openapi.json)
- [AI agent instructions](https://www.hsndm.tech/llms.txt)
`;

function acceptsMarkdown(value) {
  return (value || "").split(",").some((part) => {
    const [mediaType, ...parameters] = part.trim().toLowerCase().split(";");
    const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
    return mediaType === "text/markdown" && (!quality || Number(quality.trim().slice(2)) > 0);
  });
}

function withVary(response, token) {
  const headers = new Headers(response.headers);
  const vary = new Set((headers.get("Vary") || "").split(",").map((item) => item.trim()).filter(Boolean));
  vary.add(token);
  headers.set("Vary", [...vary].join(", "));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function markdownResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
      "Vary": "Accept",
      "Link": '<https://www.hsndm.tech/developers/>; rel="help", <https://www.hsndm.tech/llms.txt>; rel="describedby"',
    },
  });
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const wantsMarkdown = acceptsMarkdown(request.headers.get("Accept"));

  if (url.pathname === "/" && wantsMarkdown) {
    return markdownResponse(HOME_MARKDOWN);
  }

  const response = await context.next();
  if (response.status === 404 && wantsMarkdown) {
    return markdownResponse(MARKDOWN_404(url.pathname), 404);
  }
  if (url.pathname === "/" || response.status === 404) {
    return withVary(response, "Accept");
  }
  return response;
}
