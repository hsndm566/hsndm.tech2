import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
const m=vi.hoisted(()=>({getUser:vi.fn(),upsertUser:vi.fn(),getUserByOpenId:vi.fn()}));
vi.mock('@supabase/supabase-js',()=>({createClient:()=>({auth:{getUser:m.getUser}})}));
vi.mock('./db',()=>({upsertUser:m.upsertUser,getUserByOpenId:m.getUserByOpenId}));
import {authenticateSupabaseRequest} from './_core/context';
const req=(token?:string)=>({headers:token?{authorization:'Bearer '+token}:{}} as any);
beforeEach(()=>{vi.resetAllMocks();vi.stubEnv('SUPABASE_URL','https://test.supabase.co');vi.stubEnv('SUPABASE_PUBLISHABLE_KEY','test-public');vi.stubEnv('SUPABASE_LEGACY_ID_MAP','{}');m.getUser.mockResolvedValue({data:{user:{id:'abc',email:'test@example.test',email_confirmed_at:'2026-01-01',user_metadata:{role:'admin',openId:'clerk:attacker'}}},error:null});m.getUserByOpenId.mockResolvedValue({id:1,openId:'supabase:abc',role:'user'});});afterEach(()=>vi.unstubAllEnvs());
describe('Supabase bearer authentication',()=>{
it('rejects missing and invalid bearer tokens',async()=>{expect(await authenticateSupabaseRequest(req())).toBeNull();expect(m.getUser).not.toHaveBeenCalled();m.getUser.mockResolvedValue({data:{user:null},error:Error()});expect(await authenticateSupabaseRequest(req('bad'))).toBeNull();expect(m.upsertUser).not.toHaveBeenCalled();});
it('derives ownership from the verified ID, never editable metadata',async()=>{await authenticateSupabaseRequest(req('valid'));expect(m.getUser).toHaveBeenCalledWith('valid');expect(m.upsertUser).toHaveBeenCalledWith(expect.objectContaining({openId:'supabase:abc',loginMethod:'supabase'}));expect(m.upsertUser.mock.calls[0][0]).not.toHaveProperty('role');});
it('rejects unverified email',async()=>{m.getUser.mockResolvedValue({data:{user:{id:'abc'}},error:null});expect(await authenticateSupabaseRequest(req('valid'))).toBeNull();expect(m.upsertUser).not.toHaveBeenCalled();});
it('preserves ownership only through the server-side reviewed map',async()=>{vi.stubEnv('SUPABASE_LEGACY_ID_MAP','{"abc":"clerk:user_123"}');await authenticateSupabaseRequest(req('valid'));expect(m.getUserByOpenId).toHaveBeenCalledWith('clerk:user_123');});
it('fails closed on malformed migration configuration',async()=>{vi.stubEnv('SUPABASE_LEGACY_ID_MAP','broken');expect(await authenticateSupabaseRequest(req('valid'))).toBeNull();});
});
