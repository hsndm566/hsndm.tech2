import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../dist/public/',import.meta.url);const html=await readFile(new URL('index.html',root),'utf8');
const site='https://www.hsndm.tech';
const meta={
en:{title:'AutoApply SA | Organise your Saudi job search',description:'Organise your Saudi job search. Upload your CV, set target roles and cities, then track your next steps in Arabic and English.',path:'/'},
ar:{title:'أوتوأبلاي السعودية | نظّم بحثك عن عمل في السعودية',description:'نظّم بحثك عن عمل في السعودية. ارفع سيرتك، حدّد أدوارك ومدنك المستهدفة، وتابع خطواتك بالعربية والإنجليزية.',path:'/ar/'}
};
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function pageHtml(prefix){
const m=prefix?meta.ar:meta.en;const url=`${site}${m.path}`;
return html
.replace('lang="en" dir="ltr"',prefix?'lang="ar" dir="rtl"':'lang="en" dir="ltr"')
.replace(/<title>[^<]*<\/title>/,`<title>${esc(m.title)}</title>`)
.replace(/<meta name="description" content="[^"]*"\/>/,`<meta name="description" content="${esc(m.description)}"/>`)
.replace(/<meta property="og:title" content="[^"]*"\/>/,`<meta property="og:title" content="${esc(m.title)}"/>`)
.replace(/<meta property="og:description" content="[^"]*"\/>/,`<meta property="og:description" content="${esc(m.description)}"/>`)
.replace(/<meta property="og:url" content="[^"]*"\/>/,`<meta property="og:url" content="${url}"/>`)
.replace(/<meta property="og:locale" content="[^"]*"\/>/,`<meta property="og:locale" content="${prefix?'ar_SA':'en_SA'}"/>`)
.replace(/<meta name="twitter:title" content="[^"]*"\/>/,`<meta name="twitter:title" content="${esc(m.title)}"/>`)
.replace(/<meta name="twitter:description" content="[^"]*"\/>/,`<meta name="twitter:description" content="${esc(m.description)}"/>`)
.replace(/<link rel="canonical" href="[^"]*"\/>/,`<link rel="canonical" href="${url}"/>`)
.replace(/<h1 style="([^"]*)">[^<]*<\/h1>/,`<h1 style="$1">${prefix?'نظّم بحثك عن عمل في السعودية':'Organise your Saudi job search'}</h1>`)
.replace(/<p style="max-width:36rem;color:#64716d;line-height:1.7">[^<]*<\/p>/,`<p style="max-width:36rem;color:#64716d;line-height:1.7">${esc(m.description)}</p>`);
}
for(const prefix of ['', 'ar'])for(const route of ['','sign-in','sign-up','forgot-password','reset-password','auth/callback','dashboard','dashboard/settings','onboarding','applications','settings','privacy','terms']){
const path=[prefix,route].filter(Boolean).join('/');if(!path)continue;
await mkdir(new URL(path+'/',root),{recursive:true});await writeFile(new URL(path+'/index.html',root),pageHtml(prefix));
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
