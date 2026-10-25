"""Validate search metadata and local resources without contacting external services."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

root=Path(__file__).resolve().parent.parent
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.meta={}; self.canon=[]; self.json=[]; self.in_json=False; self.buffer=''; self.ids=[]; self.assets=[]; self.titles=0
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='title': self.titles+=1
        if 'id' in attrs: self.ids.append(attrs['id'])
        if tag=='meta':
            key=attrs.get('name',attrs.get('property')); self.meta.setdefault(key,[]).append(attrs.get('content'))
        if tag=='link' and attrs.get('rel')=='canonical': self.canon.append(attrs['href'])
        if tag=='script' and attrs.get('type')=='application/ld+json': self.in_json=True; self.buffer=''
        if tag in ('img','script') and attrs.get('src'):self.assets.append(attrs['src'])
    def handle_data(self,data):
        if self.in_json:self.buffer+=data
    def handle_endtag(self,tag):
        if tag=='script' and self.in_json:self.json.append(json.loads(self.buffer));self.in_json=False

namespace={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
locations=[n.text for n in ET.parse(root/'sitemap.xml').findall('s:url/s:loc',namespace)]
assert len(locations)==6 and len(set(locations))==6
for url in locations:
    assert url.startswith('https://antaraproperties.in/')
    filename=urlsplit(url).path.lstrip('/') or 'index.html'
    p=Page();p.feed((root/filename).read_text(encoding='utf-8'))
    assert p.titles==1 and p.canon==[url],filename
    assert len(p.meta['description'])==1 and p.meta['og:url']==[url]
    assert 'keywords' not in p.meta
    assert len(p.ids)==len(set(p.ids)),filename
    assert len(p.json)==1
    business=next(n for n in p.json[0]['@graph'] if n['@type']=='RealEstateAgent')
    assert business['telephone']=='+918329788386' and business['address']['addressLocality']=='Amravati'
    assert 'aggregateRating' not in business
    for src in p.assets:
        if not urlsplit(src).scheme:assert (root/src).exists(),src
admin=Page();admin.feed((root/'admin.html').read_text(encoding='utf-8'))
assert 'noindex' in admin.meta['robots'][0]
assert 'admin.html' not in ''.join(locations)
assert 'https://antaraproperties.in/sitemap.xml' in (root/'robots.txt').read_text()
print('PASS: six page canonicals, unique metadata, JSON-LD, assets, sitemap, robots and admin exclusion')
