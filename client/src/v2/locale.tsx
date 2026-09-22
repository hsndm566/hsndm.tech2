import {createContext,useContext,useLayoutEffect,type ReactNode} from 'react';
import {useLocation} from 'wouter';
const Context=createContext({ar:false,t:(en:string,ar:string)=>en,path:(p:string)=>p});
export function LocaleProvider({children}:{children:ReactNode}){const [location]=useLocation();const ar=location==='/ar'||location.startsWith('/ar/');useLayoutEffect(()=>{document.documentElement.lang=ar?'ar':'en';document.documentElement.dir=ar?'rtl':'ltr';},[ar]);return <Context.Provider value={{ar,t:(en,arabic)=>ar?arabic:en,path:p=>ar?'/ar'+(p==='/'?'':p):p}}>{children}</Context.Provider>}
export const useLocale=()=>useContext(Context);
export const cities=[['Riyadh','الرياض'],['Jeddah','جدة'],['Dammam','الدمام'],['Khobar','الخبر'],['Makkah','مكة'],['Madinah','المدينة'],['Remote','عن بُعد']];
