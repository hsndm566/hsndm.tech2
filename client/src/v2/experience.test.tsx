// @vitest-environment jsdom
import {afterEach,describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {Router} from 'wouter';
import {memoryLocation} from 'wouter/memory-location';
import {LocaleProvider} from './locale';
import {Landing} from './Landing';
import {AuthProvider} from './auth';
import {SessionGate} from './Workspace';
import {AuthPage} from './AuthPage';
vi.hoisted(()=>{vi.stubEnv('VITE_SUPABASE_URL','');vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY','');vi.stubEnv('VITE_SUPABASE_ANON_KEY','');});
function mount(node:React.ReactNode,path='/'){const {hook}=memoryLocation({path});return render(<Router hook={hook}><LocaleProvider>{node}</LocaleProvider></Router>)}
vi.stubGlobal('ResizeObserver',class {observe(){} unobserve(){} disconnect(){}});
afterEach(cleanup);
describe('V2 customer journey',()=>{
it('changes the plan explanation with the accessible slider',()=>{mount(<Landing/>);const slider=screen.getByRole('slider');fireEvent.keyDown(slider,{key:'End'});expect(screen.getByText('Make the search a priority')).toBeTruthy();expect(screen.getByText('Set aside time each day to review opportunities and prepare each application.')).toBeTruthy();});
it('uses RTL and Arabic controls from the route',()=>{mount(<Landing/>,'/ar');expect(document.documentElement.dir).toBe('rtl');expect(screen.getByRole('slider',{name:'وتيرة البحث عن عمل'})).toBeTruthy();expect(screen.getByRole('heading',{name:'ابدأ بسيرتك الذاتية.'})).toBeTruthy();});
it('offers an explicit unavailable state instead of a blank protected route',()=>{mount(<AuthProvider><SessionGate><p>private</p></SessionGate></AuthProvider>);expect(screen.queryByText('private')).toBeNull();expect(screen.getByRole('heading',{name:'Account service is unavailable'})).toBeTruthy();});
it('disables signup when configuration is missing',()=>{mount(<AuthProvider><AuthPage mode="signup"/></AuthProvider>);expect((screen.getByRole('button',{name:'Create account'}) as HTMLButtonElement).disabled).toBe(true);});
it('pauses the continuous ticker on user request',()=>{mount(<Landing/>);fireEvent.click(screen.getByRole('button',{name:'Pause ticker'}));expect(screen.getByRole('button',{name:'Play ticker'})).toBeTruthy();});
it('does not present illustrative jobs as account records',()=>{mount(<Landing/>);expect(screen.getAllByText('Illustration').length).toBeGreaterThan(0);expect(screen.getByText('Example company · Riyadh')).toBeTruthy();});
});
