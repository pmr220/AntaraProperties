"""Regenerate static search metadata after a domain or page-copy change."""
import argparse
import json
import re
from html import escape
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree.ElementTree import Element, SubElement, ElementTree

parser=argparse.ArgumentParser()
parser.add_argument('--origin',default='https://antaraproperties.in')
args=parser.parse_args()
origin=args.origin.rstrip('/')
parts=urlsplit(origin)
if parts.scheme!='https' or not parts.netloc or parts.path or parts.query or parts.fragment:
    raise SystemExit('Use an HTTPS origin with no path, query or fragment.')
root=Path(__file__).resolve().parent.parent
pages={
 'index.html':('Antara Properties | Property Broker in Amravati','Explore plots, flats, row houses and farms in Amravati with Antara Properties. Discover Rangoli Heights or contact our team to buy or sell property.'),
 'properties.html':('Properties in Amravati | Plots, Flats & Farms | Antara','Browse published properties in Amravati, including plots, flats, row houses and farms. Contact Antara Properties for current prices, details and site visits.'),
 'builder-project.html':('Rangoli Heights Amravati | 2 BHK Flats | Antara Properties','Explore Rangoli Heights at Shyam Nagar, Kathora Road, Amravati. View 2 BHK floor plans, amenities and the location map, then request a callback.'),
 'sell-property.html':('Sell Your Property in Amravati | Antara Properties','Want to sell a flat, plot, house or commercial property in Amravati? Share your name and phone with Antara Properties to discuss your property. No photos needed.'),
 'about.html':('About Antara Properties | Real Estate in Amravati','Meet Antara Properties in Amravati: over 15 years of trust, local knowledge and personal attention. Connect with Atul Kaje about buying or selling property.'),
 'contact.html':('Contact Antara Properties | Amravati Property Enquiries','Contact Antara Properties in Amravati for buying, selling and Rangoli Heights enquiries. Find our office, phone number and answers to common property questions.'),
}
business={'@type':'RealEstateAgent','@id':origin+'/#business','name':'Antara Properties',
 'url':origin+'/','telephone':'+918329788386','email':'antaraproperties1@gmail.com',
 'image':origin+'/assets/atul-kaje.png',
 'address':{'@type':'PostalAddress','streetAddress':'1st floor, opposite to RTO, Irvin Square',
 'addressLocality':'Amravati','addressRegion':'Maharashtra','addressCountry':'IN'},
 'areaServed':{'@type':'City','name':'Amravati'}}
for filename,(title,description) in pages.items():
    path=root/filename
    source=path.read_text(encoding='utf-8')
    source=re.sub(r'<!-- SEO START -->.*?<!-- SEO END -->','',source,flags=re.S)
    source=re.sub(r'<title>.*?</title>','',source,flags=re.S)
    source=re.sub(r'<meta\s+name="description"[^>]*>','',source,flags=re.I)
    url=origin+('/' if filename=='index.html' else '/'+filename)
    graph=[business,{'@type':'WebSite','@id':origin+'/#website','url':origin+'/',
      'name':'Antara Properties','publisher':{'@id':origin+'/#business'},'inLanguage':'en-IN'},
      {'@type':'WebPage','@id':url+'#webpage','url':url,'name':title,'description':description,
       'isPartOf':{'@id':origin+'/#website'},'about':{'@id':origin+'/#business'},'inLanguage':'en-IN'}]
    if filename!='index.html':
        graph.append({'@type':'BreadcrumbList','itemListElement':[
          {'@type':'ListItem','position':1,'name':'Home','item':origin+'/'},
          {'@type':'ListItem','position':2,'name':title.split(' | ')[0],'item':url}]})
    image=origin+('/assets/rangoli/elevation.jpg' if filename=='builder-project.html' else '/assets/atul-kaje.png')
    metadata='<!-- SEO START -->\n<title>'+escape(title)+'</title>\n'
    metadata+='<meta name="description" content="'+escape(description,quote=True)+'">\n'
    metadata+='<link rel="canonical" href="'+url+'">\n'
    for prop,value in {'og:type':'website','og:site_name':'Antara Properties','og:locale':'en_IN',
      'og:title':title,'og:description':description,'og:url':url,'og:image':image,
      'og:image:alt':'Rangoli Heights proposed elevation' if filename=='builder-project.html' else 'Atul Kaje at Antara Properties'}.items():
        metadata+='<meta property="'+prop+'" content="'+escape(value,quote=True)+'">\n'
    metadata+='<meta name="twitter:card" content="summary_large_image">\n'
    metadata+='<script type="application/ld+json">'+json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('<','\\u003c')+'</script>\n<!-- SEO END -->'
    source=source.replace('</head>',metadata+'</head>')
    path.write_text(source,encoding='utf-8')
urls=Element('urlset',xmlns='http://www.sitemaps.org/schemas/sitemap/0.9')
for filename in pages:
    entry=SubElement(urls,'url')
    SubElement(entry,'loc').text=origin+('/' if filename=='index.html' else '/'+filename)
ElementTree(urls).write(root/'sitemap.xml',encoding='utf-8',xml_declaration=True)
(root/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+origin+'/sitemap.xml\n',encoding='utf-8')
print('Updated six public pages, sitemap.xml and robots.txt for '+origin)
