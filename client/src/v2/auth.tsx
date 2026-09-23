import { createClient, type Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
const allowProductionFallback = import.meta.env.VITE_DISABLE_SUPABASE_FALLBACK !== 'true';
const url = import.meta.env.VITE_SUPABASE_URL || (allowProductionFallback ? 'https://ufyvelnxexjvlibhweau.supabase.co' : '');
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || (allowProductionFallback ? 'sb_publishable_JERSjyPdHUZtoSPwcIuvWA_YPiKYMsP' : '');
export const supabase = url && key ? createClient(url, key, { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
const AuthContext = createContext<{session: Session|null; loading: boolean; error: string}>({session:null,loading:true,error:''});
export function getPublicSiteOrigin(origin=typeof window==='undefined'?'':window.location.origin){
 const configured=(import.meta.env.VITE_PUBLIC_SITE_URL as string|undefined)?.trim();
 if(configured)return configured.replace(/\/$/,'');
 try{const parsed=new URL(origin);if(parsed.hostname==='localhost'||parsed.hostname==='127.0.0.1')return 'https://www.hsndm.tech';return parsed.origin;}catch{return 'https://www.hsndm.tech';}
}
export function getAuthRedirectUrl(path:string,origin=typeof window==='undefined'?'':window.location.origin){return `${getPublicSiteOrigin(origin)}${path.startsWith('/')?path:`/${path}`}`;}
export function AuthProvider({children}:{children:ReactNode}) {
 const [session,setSession]=useState<Session|null>(null), [loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{ if(!supabase){setLoading(false);return;} let active=true, receivedEvent=false;
 const timer=setTimeout(()=>{if(active){setError('session');setLoading(false);}},12000);
 const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>{if(active){receivedEvent=true;setSession(s);setError('');setLoading(false);clearTimeout(timer);}});
 supabase.auth.getSession().then(({data,error})=>{if(active&&!receivedEvent){setSession(data.session);setError(error?'session':'');setLoading(false);clearTimeout(timer);}}).catch(()=>{if(active&&!receivedEvent){setError('session');setLoading(false);clearTimeout(timer);}});
 return()=>{active=false;clearTimeout(timer);subscription.unsubscribe();}; },[]);
 return <AuthContext.Provider value={{session,loading,error}}>{children}</AuthContext.Provider>;
}
export const useSession=()=>useContext(AuthContext);
export async function getSupabaseToken(){ if(!supabase)return null; const {data}=await supabase.auth.getSession();return data.session?.access_token??null; }
