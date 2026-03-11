# Post-Deploy SEO Checklist

Run after every production deploy to https://incentedge.com

## Automated Checks
```bash
npm run seo:verify:prod
```

## Manual Steps (One-Time)

### Google Search Console
1. Go to https://search.google.com/search-console/
2. Add property: https://incentedge.com (URL prefix)
3. Verify via HTML file OR DNS TXT record
4. Submit sitemap: https://incentedge.com/sitemap.xml
5. Request indexing for homepage

### Bing Webmaster Tools
1. Go to https://www.bing.com/webmasters/
2. Add site: https://incentedge.com
3. Submit sitemap: https://incentedge.com/sitemap.xml
4. IndexNow auto-submits new URLs via /api/indexnow

### Google Analytics
Verify GA4 is receiving events by checking Realtime report

## IndexNow (Automated)
After deploy, ping all new URLs:
```bash
curl -X POST https://incentedge.com/api/indexnow \
  -H "Authorization: Bearer $INDEXNOW_SECRET"
```
