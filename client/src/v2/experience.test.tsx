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
vi.hoisted(()=>{vi.stubEnv('VITE_SUPABASE_URL','');vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY','');vi.stubEnv('VITE_SUPABASE_ANON_KEY','');vi.stubEnv('VITE_DISABLE_SUPABASE_FALLBACK','true');});
function mount(node:React.ReactNode,path='/'){const {hook}=memoryLocation({path});return render(<Router hook={hook}><LocaleProvider>{node}</LocaleProvider></Router>)}
vi.stubGlobal('ResizeObserver',class {observe(){} unobserve(){} disconnect(){}});
afterEach(cleanup);
describe('V2 customer journey',()=>{
it('offers a new link when password recovery has no session',()=>{mount(<AuthProvider><AuthPage mode="reset"/></AuthProvider>);expect(screen.getByRole('link',{name:'Request a new reset link'}).getAttribute('href')).toBe('/forgot-password');expect((screen.getByRole('button',{name:'Update password'}) as HTMLButtonElement).disabled).toBe(true);});
it('keeps password recovery help in Arabic',()=>{mount(<AuthProvider><AuthPage mode="reset"/></AuthProvider>,'/ar/reset-password');expect(screen.getByRole('link',{name:'طلب رابط استعادة جديد'}).getAttribute('href')).toBe('/ar/forgot-password');});
it('changes the plan explanation with the accessible slider',()=>{mount(<Landing/>);const slider=screen.getByRole('slider');fireEvent.keyDown(slider,{key:'End'});expect(screen.getByText('Make the search a priority')).toBeTruthy();expect(screen.getByText('Set aside time each day to review opportunities and prepare each application.')).toBeTruthy();});
it('uses RTL and Arabic controls from the route',()=>{mount(<Landing/>,'/ar');expect(document.documentElement.dir).toBe('rtl');expect(screen.getByRole('slider',{name:'وتيرة البحث عن عمل'})).toBeTruthy();expect(screen.getByRole('heading',{name:'ابدأ بسيرتك الذاتية.'})).toBeTruthy();});
it('offers an explicit unavailable state instead of a blank protected route',()=>{mount(<AuthProvider><SessionGate><p>private</p></SessionGate></AuthProvider>);expect(screen.queryByText('private')).toBeNull();expect(screen.getByRole('heading',{name:'Account service is unavailable'})).toBeTruthy();});
it('disables signup when configuration is missing',()=>{mount(<AuthProvider><AuthPage mode="signup"/></AuthProvider>);expect((screen.getByRole('button',{name:'Create account'}) as HTMLButtonElement).disabled).toBe(true);});
it('pauses the continuous ticker on user request',()=>{mount(<Landing/>);fireEvent.click(screen.getByRole('button',{name:'Pause ticker'}));expect(screen.getByRole('button',{name:'Play ticker'})).toBeTruthy();});
it('labels the hero product demo without presenting it as account data',()=>{mount(<Landing/>);const demo=screen.getByLabelText('AutoApply product workflow demo') as HTMLVideoElement;expect(demo.autoplay).toBe(true);expect(demo.muted).toBe(true);expect(demo.loop).toBe(true);expect(demo.querySelector('source')?.getAttribute('src')).toBe('/manus-storage/autoapply-hero-gemini-clean.mp4');expect(screen.queryByText('Example company · Riyadh')).toBeNull();});
});
