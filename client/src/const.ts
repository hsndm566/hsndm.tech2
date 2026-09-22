export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
export const startLogin = () => { window.location.href = window.location.pathname.startsWith("/ar") ? "/ar/sign-in" : "/sign-in"; };
