import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../dist/public/',import.meta.url);const html=await readFile(new URL('index.html',root),'utf8');
for(const prefix of ['', 'ar'])for(const route of ['','sign-in','sign-up','forgot-password','reset-password','auth/callback','dashboard','dashboard/settings','onboarding','applications','settings','privacy','terms']){
const path=[prefix,route].filter(Boolean).join('/');if(!path)continue;
await mkdir(new URL(path+'/',root),{recursive:true});await writeFile(new URL(path+'/index.html',root),prefix?html.replace('lang="en" dir="ltr"','lang="ar" dir="rtl"'):html);
}
await writeFile(new URL('404.html',root),html);
await writeFile(new URL('robots.txt',root),'User-agent: *\nAllow: /\nDisallow: /dashboard/\nDisallow: /applications/\nDisallow: /onboarding/\nDisallow: /settings/\nDisallow: /auth/\nSitemap: https://www.hsndm.tech/sitemap.xml\n');
await writeFile(new URL('sitemap.xml',root),`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.hsndm.tech/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://www.hsndm.tech/ar/</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://www.hsndm.tech/privacy/</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>https://www.hsndm.tech/terms/</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>https://www.hsndm.tech/ar/privacy/</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>https://www.hsndm.tech/ar/terms/</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
</urlset>
`);
