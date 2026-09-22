import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { User } from '../../drizzle/schema';
import { createClient } from '@supabase/supabase-js';
import { getUserByOpenId, upsertUser } from '../db';
export type TrpcContext = {req:CreateExpressContextOptions['req'];res:CreateExpressContextOptions['res'];user:User|null};
export async function authenticateSupabaseRequest(req:CreateExpressContextOptions['req']):Promise<User|null>{
 const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY;
 const authorization=req.headers.authorization;
 if(!url||!key||!authorization?.startsWith('Bearer '))return null;
 const token=authorization.slice(7).trim();if(!token)return null;
 try{
  const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await client.auth.getUser(token);
  if(error||!data.user||!data.user.email_confirmed_at)return null;
  // A reviewed, server-only map preserves existing ownership. Never map by user-editable metadata or email.
  const map:Record<string,string>=JSON.parse(process.env.SUPABASE_LEGACY_ID_MAP||'{}');
  const mapped=map[data.user.id];
  if(mapped && !/^clerk:[A-Za-z0-9_]+$/.test(mapped))return null;
  const openId=mapped||`supabase:${data.user.id}`;
  await upsertUser({openId,loginMethod:'supabase',email:data.user.email,name:data.user.user_metadata?.full_name||null});
  return await getUserByOpenId(openId)??null;
 }catch{return null;}
}
export async function createContext(opts:CreateExpressContextOptions):Promise<TrpcContext>{return {...opts,user:await authenticateSupabaseRequest(opts.req)};}
