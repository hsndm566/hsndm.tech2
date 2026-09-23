import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../dist/public/',import.meta.url);const html=await readFile(new URL('index.html',root),'utf8');
for(const prefix of ['', 'ar'])for(const route of ['','sign-in','sign-up','forgot-password','reset-password','auth/callback','dashboard','dashboard/settings','onboarding','applications','settings','privacy','terms']){
const path=[prefix,route].filter(Boolean).join('/');if(!path)continue;
await mkdir(new URL(path+'/',root),{recursive:true});await writeFile(new URL(path+'/index.html',root),prefix?html.replace('lang="en" dir="ltr"','lang="ar" dir="rtl"'):html);
}
await writeFile(new URL('404.html',root),html);
await writeFile(new URL('robots.txt',root),'User-agent: *\nDisallow: /\n');
