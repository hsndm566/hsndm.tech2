export type ClerkTokenGetter = () => Promise<string | null>;

let clerkTokenGetter: ClerkTokenGetter | null = null;

export function setClerkTokenGetter(getter: ClerkTokenGetter | null) {
  clerkTokenGetter = getter;
}

export async function getClerkToken(): Promise<string | null> {
  return clerkTokenGetter ? clerkTokenGetter() : null;
}
