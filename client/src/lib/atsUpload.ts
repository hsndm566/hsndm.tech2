import { readCvText } from "./careerMatcher";

/** Keeps ATS file parsing local while reporting only the route when parsing fails. */
export async function extractAtsCvText(file: File, reportFailure: (route: "/ats") => void) {
  return readCvText(file, { onExtractionFailure: () => reportFailure("/ats") });
}
