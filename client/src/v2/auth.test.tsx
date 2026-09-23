// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,render,screen} from '@testing-library/react';
const auth=vi.hoisted(()=>{
 vi.stubEnv('VITE_SUPABASE_URL','https://example.supabase.co');
 vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY','test');
 return {getSession:vi.fn(),onAuthStateChange:vi.fn(),unsubscribe:vi.fn()};
});
vi.mock('@supabase/supabase-js',()=>({createClient:()=>({auth})}));
import {AuthProvider,useSession} from './auth';
let event:(name:string,session:any)=>void;
let resolve:(value:any)=>void;
function Probe(){const {session,loading,error}=useSession();return <p>{loading?'loading':error||session?.user.id||'signed out'}</p>}
beforeEach(()=>{vi.useFakeTimers();auth.getSession.mockImplementation(()=>new Promise(r=>{resolve=r}));auth.onAuthStateChange.mockImplementation(callback=>{event=callback;return {data:{subscription:{unsubscribe:auth.unsubscribe}}}});auth.unsubscribe.mockClear();});
afterEach(()=>{cleanup();vi.useRealTimers();});
it('recovers when a session event arrives after the loading timeout',()=>{
 render(<AuthProvider><Probe/></AuthProvider>);
 act(()=>vi.advanceTimersByTime(12000));expect(screen.getByText('session')).toBeTruthy();
 act(()=>event('SIGNED_IN',{user:{id:'current-user'}}));expect(screen.getByText('current-user')).toBeTruthy();
});
it('does not overwrite a newer sign-in with a stale initial snapshot',async()=>{
 render(<AuthProvider><Probe/></AuthProvider>);
 act(()=>event('SIGNED_IN',{user:{id:'current-user'}}));
 await act(async()=>resolve({data:{session:null},error:null}));
 expect(screen.getByText('current-user')).toBeTruthy();
});
it('does not restore an old session after sign-out',async()=>{
 render(<AuthProvider><Probe/></AuthProvider>);
 act(()=>event('SIGNED_OUT',null));
 await act(async()=>resolve({data:{session:{user:{id:'old-user'}}},error:null}));
 expect(screen.getByText('signed out')).toBeTruthy();
});
it('unsubscribes and clears the timeout on unmount',()=>{
 const view=render(<AuthProvider><Probe/></AuthProvider>);view.unmount();
 expect(auth.unsubscribe).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0);
});
