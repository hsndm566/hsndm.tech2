// @vitest-environment jsdom
import {describe,it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {Router} from 'wouter';
import {memoryLocation} from 'wouter/memory-location';
import {LocaleProvider} from './locale';
const mocks=vi.hoisted(()=>({data:{} as any}));
vi.mock('./data',()=>({useWorkspaceData:()=>mocks.data,saudiWeekStart:()=>new Date('2026-09-19T21:00:00Z')}));
vi.mock('./auth',()=>({useSession:()=>({session:{user:{id:'test-user'}}}),supabase:{auth:{signOut:vi.fn().mockResolvedValue({error:null})}}}));
import {Workspace} from './Workspace';
function mount(path='/dashboard'){const memory=memoryLocation({path});render(<Router hook={memory.hook}><LocaleProvider><Workspace/></LocaleProvider></Router>);return memory;}
beforeEach(()=>{mocks.data={profile:{data:{fullName:'Test Candidate',targetCity:'Jeddah'},isSuccess:true},apps:{data:[],refetch:vi.fn()},create:{mutate:vi.fn()},update:{mutate:vi.fn()},saveProfile:{mutateAsync:vi.fn().mockResolvedValue(undefined)},clear:vi.fn()};});
afterEach(cleanup);
describe('V2 workspace behavior',()=>{
 it('takes a new account to onboarding',async()=>{mocks.data.profile.data=null;mount();expect(await screen.findByRole('heading',{name:'A few details. A clearer search.'})).toBeTruthy();});
 it('renders the real empty state without illustrative account records',()=>{mount();expect(screen.getByRole('heading',{name:'Your next opportunity starts here.'})).toBeTruthy();expect(screen.queryByText('Example company')).toBeNull();});
 it('shows a recoverable service error',()=>{mocks.data.profile.isError=true;mount();expect(screen.getByRole('button',{name:'Retry'})).toBeTruthy();expect(screen.queryByRole('button',{name:'Track a job'})).toBeNull();});
 it('submits only the entered job to the tracker adapter',()=>{mount();fireEvent.click(screen.getByRole('button',{name:'Track a job'}));fireEvent.change(screen.getByLabelText('Company'),{target:{value:'Test Company'}});fireEvent.change(screen.getByLabelText('Role'),{target:{value:'Engineer'}});fireEvent.click(screen.getByRole('button',{name:'Save job'}));expect(mocks.data.create.mutate).toHaveBeenCalledWith({companyName:'Test Company',roleTitle:'Engineer',city:'Riyadh'},expect.any(Object));});
 it('keeps form entries when profile saving fails',async()=>{mocks.data.saveProfile.mutateAsync.mockRejectedValue(Error('offline'));mount('/settings');fireEvent.change(screen.getByLabelText('Target role or field'),{target:{value:'Engineer'}});fireEvent.click(screen.getByRole('button',{name:'Save and open dashboard'}));await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain('Could not save'));expect((screen.getByLabelText('Target role or field') as HTMLInputElement).value).toBe('Engineer');});
 it('distinguishes failure from an empty application list',()=>{mocks.data.apps.isError=true;mount();expect(screen.getByRole('alert').textContent).toContain('Applications could not be loaded');expect(screen.queryByText('Your next opportunity starts here.')).toBeNull();});
});
