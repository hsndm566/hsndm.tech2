import {it,expect} from 'vitest';
import {saudiWeekStart} from './data';
it('starts the Saudi week at Sunday midnight Riyadh time',()=>{expect(saudiWeekStart(new Date('2026-09-19T21:00:00Z')).toISOString()).toBe('2026-09-19T21:00:00.000Z');expect(saudiWeekStart(new Date('2026-09-19T20:59:59Z')).toISOString()).toBe('2026-09-12T21:00:00.000Z');});
