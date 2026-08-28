#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const cities = [
  {
    name: "Columbus", slug: "hvac-services-columbus-oh", county: "Franklin", pop: "905,748",
    zip: "43215", lat: "39.9612", lng: "-82.9988",
    neighborhoods: "Short North, German Village, Clintonville, Westerville, Dublin, Upper Arlington, Hilliard, Grove City, Reynoldsburg, and Gahanna",
    landmarks: "Ohio State University campus, the Scioto Mile along the riverfront, COSI science center, and the bustling Arena District",
    weather: "Columbus sits in central Ohio where summers push into the low 90s with high humidity, and winters regularly drop below 20 degrees with significant snowfall. The city averages 28 inches of snow annually and sees temperature swings of over 100 degrees between seasons.",
    extra: "As Ohio's capital and largest city, Columbus has a booming housing market with over 370,000 residential properties. Older homes in German Village and Victorian Village often have aging boiler systems and original ductwork that require specialized attention. Newer developments in Polaris, New Albany, and Westerville typically feature high-efficiency heat pump systems suited to the region's variable climate. The city's position along the Scioto River corridor creates microclimates that affect heating and cooling loads, particularly in flood-prone areas near Franklinton and along Alum Creek. Columbus homeowners served by Columbia Gas and AEP Ohio benefit from utility rebate programs for high-efficiency HVAC upgrades, making it an ideal time to replace outdated systems.",
    services: "Our Columbus HVAC contractor network handles furnace repair and replacement, central air conditioning installation, heat pump systems, ductless mini-split installations, air duct cleaning, thermostat upgrades, and 24/7 emergency HVAC repair. Whether you own a century home in Bexley or a new build in Powell, our licensed technicians understand the specific heating and cooling demands of Franklin County properties."
  },
  {
    name: "Cleveland", slug: "hvac-services-cleveland-oh", county: "Cuyahoga", pop: "367,991",
    zip: "44114", lat: "41.4993", lng: "-81.6944",
    neighborhoods: "Tremont, Ohio City, Lakewood, Parma, Strongsville, Westlake, Rocky River, Shaker Heights, and University Heights",
    landmarks: "the Rock and Roll Hall of Fame on the Lake Erie waterfront, Progressive Field, the West Side Market, and the Cleveland Metroparks",
    weather: "Cleveland's position on the southern shore of Lake Erie creates a unique lake-effect climate. Winters are harsh, with average January lows around 20 degrees and annual snowfall exceeding 60 inches in some years. Summers bring humid conditions with temperatures regularly reaching the mid-80s. The lake-effect weather pattern means Cleveland's east side often receives significantly more snow than the west side.",
    extra: "Cleveland's housing stock is among the oldest in Ohio, with many homes in Tremont, Ohio City, and the Heights communities dating to the early 1900s. These older properties often rely on steam radiator systems, aging boilers, and outdated forced-air furnaces that demand experienced technicians. The lake-effect snow belt puts extraordinary demands on heating systems from November through March. Homes along the lakefront in Lakewood, Rocky River, and Bay Village face additional challenges from moisture and wind exposure that affect HVAC efficiency. Dominion Energy and FirstEnergy provide service to most Cleveland residences, and both utilities offer rebate programs for upgrading to ENERGY STAR certified equipment.",
    services: "Cleveland HVAC contractors in our network specialize in boiler repair and replacement, furnace installation, central AC systems, heat pump conversions, ductwork repair, indoor air quality solutions, and emergency heating repair. The lake-effect climate demands robust, reliable heating systems, and our technicians are experienced with the unique challenges Cuyahoga County homes face."
  },
  {
    name: "Cincinnati", slug: "hvac-services-cincinnati-oh", county: "Hamilton", pop: "309,317",
    zip: "45202", lat: "39.1031", lng: "-84.5120",
    neighborhoods: "Over-the-Rhine, Mount Adams, Hyde Park, Clifton, Oakley, Anderson Township, West Chester, Mason, and Blue Ash",
    landmarks: "Fountain Square in the city center, the Cincinnati Museum Center at Union Terminal, Great American Ball Park along the Ohio River, and the historic Findlay Market",
    weather: "Cincinnati occupies the southwestern corner of Ohio along the Ohio River, creating a slightly warmer microclimate than the rest of the state. Summer temperatures frequently exceed 90 degrees with oppressive humidity, while winters average highs in the mid-30s with occasional ice storms. The Ohio River valley traps humid air, making effective air conditioning and dehumidification essential for home comfort.",
    extra: "Cincinnati's hillside topography and river valley location create distinct HVAC challenges. Homes perched on the hills of Mount Adams, Price Hill, and Clifton face different wind exposure than valley properties in Norwood or the Mill Creek corridor. The city's diverse housing stock ranges from 19th-century row houses in Over-the-Rhine to modern subdivisions in Mason and Liberty Township. Many older Cincinnati homes use radiator heating systems that homeowners are converting to forced-air or heat pump configurations. Duke Energy serves most Hamilton County residences and offers efficiency rebate programs for qualifying HVAC installations. The Cincinnati metropolitan area crosses into Kentucky, and our contractor network covers the entire Greater Cincinnati region.",
    services: "Our Cincinnati HVAC professionals provide air conditioning installation and repair, furnace service, heat pump systems, boiler maintenance, ductless mini-split installation, whole-home dehumidification, and around-the-clock emergency service. From historic buildings in Over-the-Rhine to suburban homes in Anderson Township, our licensed contractors deliver solutions matched to your property."
  },
  {
    name: "Dayton", slug: "hvac-services-dayton-oh", county: "Montgomery", pop: "137,644",
    zip: "45402", lat: "39.7589", lng: "-84.1916",
    neighborhoods: "Kettering, Beavercreek, Centerville, Oakwood, Huber Heights, Miamisburg, Vandalia, Trotwood, and Englewood",
    landmarks: "the National Museum of the United States Air Force at Wright-Patterson AFB, the Dayton Aviation Heritage National Historical Park, Carillon Historical Park, and the vibrant Oregon District",
    weather: "Dayton experiences a true four-season climate with hot, humid summers averaging highs in the upper 80s and cold winters with lows frequently dipping into the teens. The city averages about 25 inches of snow annually. Severe weather, including tornadoes, is a concern in Montgomery County, as demonstrated by the 2019 Memorial Day tornado outbreak that caused widespread property damage across the region.",
    extra: "Dayton has a strong manufacturing heritage, and many of its residential neighborhoods feature mid-century homes with original HVAC systems approaching the end of their service life. The presence of Wright-Patterson Air Force Base brings a steady population of military families who need reliable HVAC service on tight timelines. Surrounding communities like Kettering, Centerville, and Beavercreek have seen significant residential growth, driving demand for new HVAC installations. The Great Miami River valley influences local weather patterns, and homes near the river corridors in West Dayton and Moraine may face additional humidity challenges. DP&L and Vectren Energy provide utility service to Dayton-area homes, with seasonal rebate programs available for high-efficiency equipment upgrades.",
    services: "Dayton-area HVAC contractors in our network offer furnace repair and installation, air conditioning service, heat pump systems, duct cleaning and repair, thermostat installation, indoor air quality testing, and 24/7 emergency HVAC calls. Whether your home is near the Oregon District or out in Beavercreek, our licensed professionals deliver fast, reliable service across Montgomery County."
  },
  {
    name: "Akron", slug: "hvac-services-akron-oh", county: "Summit", pop: "190,469",
    zip: "44308", lat: "41.0814", lng: "-81.5190",
    neighborhoods: "Highland Square, Merriman Valley, Fairlawn, Cuyahoga Falls, Stow, Hudson, Green, Tallmadge, and Barberton",
    landmarks: "the Akron Art Museum, Stan Hwyet Hall and Gardens, Lock 3 Park in downtown, the Cuyahoga Valley National Park nearby, and the historic Ohio and Erie Canal towpath",
    weather: "Akron sits at a higher elevation than much of northeastern Ohio, which contributes to cooler temperatures and heavier snowfall. The city averages over 40 inches of snow per year, with January lows around 18 degrees. Summers are warm and humid with highs in the mid-80s. Proximity to the Cuyahoga Valley creates foggy conditions and temperature inversions that affect local microclimates.",
    extra: "Akron's rubber industry heritage left behind a housing stock built primarily between 1910 and 1960, with many homes featuring outdated gravity furnaces, aging boilers, and single-pane windows that strain heating systems. The surrounding Summit County suburbs of Fairlawn, Hudson, and Stow have newer housing that benefits from modern HVAC technology. The Cuyahoga Valley National Park borders Akron to the north, and homes along the valley experience cooler nighttime temperatures that increase heating demand. FirstEnergy and Dominion Energy serve Akron-area homes, and both offer programs to offset the cost of upgrading to energy-efficient HVAC equipment. The city's ongoing revitalization of downtown and neighborhoods like Highland Square has increased demand for HVAC work in renovated properties.",
    services: "Our Akron HVAC network provides furnace repair and replacement, central air conditioning installation, heat pump service, boiler repair, ductwork inspection and cleaning, smart thermostat installation, and emergency heating and cooling repair. From older homes in West Akron to newer builds in Green and Hudson, our licensed contractors handle every type of HVAC system in Summit County."
  },
  {
    name: "Toledo", slug: "hvac-services-toledo-oh", county: "Lucas", pop: "270,871",
    zip: "43604", lat: "41.6528", lng: "-83.5379",
    neighborhoods: "the Old West End, Ottawa Hills, Sylvania, Perrysburg, Maumee, Oregon, Holland, and Waterville",
    landmarks: "the Toledo Museum of Art, the National Museum of the Great Lakes, Huntington Center arena, Toledo Zoo, and the historic Old West End neighborhood with its Victorian architecture",
    weather: "Toledo sits at the western end of Lake Erie, making it susceptible to lake-effect weather patterns. Winters are bitter, with average January lows around 17 degrees and annual snowfall exceeding 35 inches. The flat terrain of northwest Ohio amplifies wind chill, making effective home insulation and heating critical. Summers bring warm temperatures in the mid-80s with humidity off the lake.",
    extra: "Toledo's glass-making heritage earned it the nickname 'The Glass City,' and many of its residential neighborhoods feature homes from the early-to-mid 20th century with original heating systems. The Old West End contains one of the largest collections of Victorian and Edwardian homes in the country, many requiring specialized HVAC solutions that preserve historic character. Suburban communities like Sylvania, Perrysburg, and Maumee feature a mix of housing ages and HVAC needs. The Maumee River valley and proximity to Lake Erie create persistent humidity issues that make proper ventilation and dehumidification important. Toledo Edison and Columbia Gas of Ohio serve local residences, with rebate programs available for qualifying HVAC upgrades.",
    services: "Toledo HVAC contractors in our network handle furnace installation and repair, air conditioning systems, heat pump conversions, boiler service, duct sealing and insulation, humidity control solutions, and 24/7 emergency repair. From historic homes in the Old West End to modern builds in Perrysburg, our licensed professionals serve all of Lucas County and the surrounding area."
  },
  {
    name: "Canton", slug: "hvac-services-canton-oh", county: "Stark", pop: "70,447",
    zip: "44702", lat: "40.7989", lng: "-81.3784",
    neighborhoods: "North Canton, Jackson Township, Lake Township, Perry Township, Louisville, Massillon, Plain Township, and Hartville",
    landmarks: "the Pro Football Hall of Fame, the McKinley Presidential Library and Museum, the MAPS Air Museum, Gervasi Vineyard, and the First Ladies National Historic Site",
    weather: "Canton's position in the Tuscarawas River valley creates a climate with cold, snowy winters averaging 35 inches of annual snowfall and warm, humid summers with highs in the mid-80s. January temperatures regularly dip into the teens, and the rolling terrain of Stark County can create localized weather variations across different neighborhoods.",
    extra: "Canton and Stark County offer a mix of housing types, from older brick homes built during the city's steel industry boom to newer suburban developments in Jackson Township and North Canton. Many homes in the city proper still rely on aging forced-air furnaces and window AC units that homeowners are upgrading to modern central systems. The surrounding townships have seen steady residential growth, particularly in Lake Township and Plain Township, driving demand for new HVAC installations. AEP Ohio and Dominion Energy provide utility service to Stark County homes. Canton's position between Akron and the Tuscarawas Valley means weather can vary significantly across the county, making proper HVAC system sizing essential.",
    services: "Our Canton HVAC contractor network provides furnace repair and installation, central air conditioning, heat pump systems, ductwork repair and cleaning, indoor air quality solutions, thermostat upgrades, and emergency HVAC service. Whether you live near the Pro Football Hall of Fame or in the suburbs of Jackson Township, our licensed technicians deliver reliable service throughout Stark County."
  },
  {
    name: "Youngstown", slug: "hvac-services-youngstown-oh", county: "Mahoning", pop: "60,068",
    zip: "44503", lat: "41.0998", lng: "-80.6495",
    neighborhoods: "Boardman, Austintown, Canfield, Poland, Niles, Girard, Hubbard, Liberty Township, and Warren (nearby in Trumbull County)",
    landmarks: "the Butler Institute of American Art, Youngstown State University, Mill Creek MetroParks, Lanterman's Mill, and the historic downtown Youngstown business district",
    weather: "Youngstown sits in the Mahoning Valley near the Pennsylvania border, where lake-effect moisture from Lake Erie collides with Appalachian terrain. The result is heavy snowfall averaging over 45 inches annually, with some winters exceeding 60 inches. January lows average around 17 degrees, and the region's industrial past has left many homes reliant on aging, inefficient heating systems.",
    extra: "Youngstown's steel industry decline left behind a housing stock that is among the most affordable in Ohio but often requires significant HVAC upgrades. Many homes in the city and surrounding Mahoning Valley were built between 1920 and 1960 and still use original forced-air furnaces or boiler systems. The suburban townships of Boardman, Canfield, and Poland have newer housing with more modern HVAC infrastructure. The Mahoning Valley's heavy snowfall and cold temperatures make reliable heating a necessity, not a luxury. FirstEnergy and Dominion Energy serve the area, with weatherization assistance programs available for qualifying homeowners. The recent shale gas development in the region has brought renewed economic activity and increased demand for HVAC services in both residential and commercial properties.",
    services: "Youngstown-area HVAC contractors in our network specialize in furnace replacement, boiler repair, central air conditioning installation, heat pump conversions, emergency heating repair, duct sealing, and indoor air quality improvements. From the Mahoning Valley floor to the hillside neighborhoods of Canfield and Poland, our licensed contractors understand the heavy-duty heating demands of this region."
  },
  {
    name: "Springfield", slug: "hvac-services-springfield-oh", county: "Clark", pop: "58,662",
    zip: "45502", lat: "39.9242", lng: "-83.8088",
    neighborhoods: "South Vienna, Enon, New Carlisle, Northridge, Urbana (nearby), Mechanicsburg, and Moorefield Township",
    landmarks: "the Heritage Center of Clark County, Buck Creek State Park, Westcott House designed by Frank Lloyd Wright, the Springfield Museum of Art, and the Clark County Fairgrounds",
    weather: "Springfield sits between Dayton and Columbus in west-central Ohio, where the terrain flattens into agricultural plains. Summers are hot and humid with temperatures reaching the low 90s, while winters bring average lows in the high teens with about 22 inches of annual snowfall. The open landscape means wind is a constant factor, driving up heating costs for homes with poor insulation.",
    extra: "Springfield experienced significant industrial growth in the 19th and early 20th centuries, and much of the city's housing stock reflects that era. Older homes along major corridors like Limestone Street and in historic neighborhoods near Wittenberg University often have original coal-converted furnaces and outdated ductwork. The city has seen renewed investment in recent years, with homeowners upgrading properties and modernizing HVAC systems. Clark County's agricultural surroundings mean many rural properties rely on propane or oil heat rather than natural gas, creating demand for alternative heating solutions including heat pumps. AEP Ohio provides electric service while Columbia Gas handles natural gas distribution, and both offer efficiency programs for residential customers.",
    services: "Our Springfield HVAC network covers furnace repair and installation, air conditioning service, heat pump systems, propane and oil furnace service, duct cleaning and repair, whole-home air filtration, and 24/7 emergency HVAC repair. From the historic neighborhoods near downtown to rural properties in Clark County, our licensed contractors provide solutions for every home type and heating fuel."
  },
  {
    name: "Mansfield", slug: "hvac-services-mansfield-oh", county: "Richland", pop: "46,454",
    zip: "44902", lat: "40.7588", lng: "-82.5154",
    neighborhoods: "Ontario, Shelby, Lexington, Madison Township, Bellville, Lucas, Shiloh, and Plymouth",
    landmarks: "the Ohio State Reformatory (filming location for The Shawshank Redemption), Kingwood Center Gardens, the Richland Carrousel Park, Snow Trails ski resort, and Malabar Farm State Park",
    weather: "Mansfield's north-central Ohio location places it in a transitional climate zone where Great Lakes moisture meets Appalachian foothills. The city averages over 35 inches of snow annually, with some seasons bringing significantly more due to lake-effect bands that reach inland. Winter lows regularly hit the teens, while summers are warm and humid with highs in the mid-80s.",
    extra: "Mansfield and Richland County offer an affordable housing market with many homes dating to the early-to-mid 1900s when the city was a manufacturing hub. These older homes frequently have aging furnaces, inadequate insulation, and ductwork that needs replacement or sealing. The surrounding communities of Ontario, Lexington, and Shelby have a mix of older village homes and newer residential construction. Rural properties throughout Richland County often depend on propane or fuel oil heating systems. Ohio Edison and Columbia Gas serve the Mansfield area, and the city participates in the Home Weatherization Assistance Program for income-qualifying residents. The proximity to Snow Trails and the rolling terrain of the region means some areas experience more severe winter weather than downtown Mansfield.",
    services: "Mansfield HVAC contractors in our network provide furnace repair and replacement, air conditioning installation, heat pump service, propane and oil furnace maintenance, ductwork repair, indoor air quality solutions, and emergency heating and cooling repair. Whether your property is in downtown Mansfield or a rural homestead in Richland County, our licensed technicians have the experience to keep your home comfortable year-round."
  }
];

const blogLinks = [
  { url: "/blog/how-much-does-hvac-replacement-cost-in-ohio/", text: "HVAC Replacement Cost in Ohio" },
  { url: "/blog/heat-pump-vs-furnace-ohio-climate/", text: "Heat Pump vs. Furnace for Ohio Homes" },
  { url: "/blog/hvac-maintenance-checklist-ohio-homeowners/", text: "HVAC Maintenance Checklist" },
  { url: "/blog/furnace-repair-cost-ohio/", text: "Furnace Repair Cost in Ohio" },
  { url: "/blog/ac-tune-up-cost-ohio/", text: "AC Tune-Up Cost in Ohio" },
  { url: "/blog/when-to-replace-hvac-system-ohio/", text: "When to Replace Your HVAC System" },
  { url: "/blog/best-hvac-companies-in-ohio/", text: "Best HVAC Companies in Ohio" },
  { url: "/blog/central-air-conditioning-installation-cost-ohio/", text: "Central AC Installation Cost" },
  { url: "/blog/ductless-mini-split-installation-cost-ohio/", text: "Ductless Mini-Split Cost" },
  { url: "/blog/air-duct-cleaning-cost-ohio/", text: "Air Duct Cleaning Cost in Ohio" }
];

function getBlogLinks(cityIndex) {
  const start = (cityIndex * 3) % blogLinks.length;
  const links = [];
  for (let i = 0; i < 4; i++) {
    links.push(blogLinks[(start + i) % blogLinks.length]);
  }
  return links;
}

function generatePage(city, index) {
  const blogs = getBlogLinks(index);
  const otherCities = cities.filter((_, i) => i !== index).slice(0, 5);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width,initial-scale=1" name="viewport"/>
<title>HVAC Services ${city.name} OH | Ohio HVAC Pros</title>
<meta content="Licensed HVAC contractors in ${city.name}, Ohio. Furnace repair, AC installation, heat pump service, and emergency HVAC repair in ${city.name} and ${city.county} County. Free quotes from vetted professionals." name="description"/>
<link href="https://ohiohvacpros.com/${city.slug}/" rel="canonical"/>
<link href="https://fonts.googleapis.com?display=swap" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&amp;family=DM+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Ohio HVAC Pros - ${city.name}",
  "url": "https://ohiohvacpros.com/${city.slug}/",
  "telephone": "+16143444851",
  "description": "Licensed HVAC contractors serving ${city.name}, Ohio and ${city.county} County. Furnace repair, AC installation, heat pump service, and emergency HVAC repair.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "${city.name}",
    "addressRegion": "OH",
    "postalCode": "${city.zip}",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "${city.lat}",
    "longitude": "${city.lng}"
  },
  "areaServed": {
    "@type": "City",
    "name": "${city.name}"
  },
  "serviceType": ["HVAC Installation", "Furnace Repair", "AC Installation", "Heat Pump Installation", "Emergency HVAC"],
  "priceRange": "$$",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "1247"
  }
}
</script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --navy:#1a3a52;
  --navy-dark:#0f2336;
  --navy-light:#1e4060;
  --orange:#ea6c0a;
  --orange-hover:#d4600a;
  --offwhite:#f8f9fa;
  --charcoal:#1a1a2e;
  --white:#ffffff;
  --text-mid:#4b5563;
  --grey:#e5e7eb;
  --font:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  --heading:'Barlow Condensed','Impact',sans-serif;
  --r-btn:6px;
  --r-card:10px;
  --t:.2s ease;
  --max:1280px;
}
html{scroll-behavior:smooth}
body{font-family:var(--font);color:var(--charcoal);line-height:1.6;font-size:16px}
a{text-decoration:none;color:inherit}
img{max-width:100%;display:block}
section{padding:80px 24px}
.inner{max-width:var(--max);margin:0 auto}
.label{font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--orange);margin-bottom:10px;display:block}
.section-title{font-family:var(--heading);font-size:clamp(36px,5vw,56px);font-weight:800;text-transform:uppercase;letter-spacing:.5px;line-height:1.05;margin-bottom:16px}
.section-sub{font-size:17px;color:var(--text-mid);line-height:1.75;max-width:640px}

/* ANNOUNCEMENT BAR */
.announce{background:var(--orange);text-align:center;padding:10px 20px;font-size:14px;font-weight:600;color:#fff;letter-spacing:.2px}

/* HEADER */
header{background:var(--navy);position:sticky;top:0;z-index:1000;border-bottom:1px solid rgba(255,255,255,.08);box-shadow:0 2px 20px rgba(0,0,0,.3)}
.hdr{max-width:var(--max);margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:72px;gap:20px}
.logo{font-family:var(--heading);font-size:24px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase;white-space:nowrap}
.logo span{color:var(--orange)}
nav{display:flex;align-items:center;gap:28px}
nav a{color:rgba(255,255,255,.85);font-size:15px;font-weight:500;transition:color var(--t)}
nav a:hover{color:#fff}
.btn-nav{background:var(--orange);color:#fff !important;padding:10px 22px;border-radius:var(--r-btn);font-weight:700;font-size:14px;white-space:nowrap;transition:background var(--t)}
.btn-nav:hover{background:var(--orange-hover)}
.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px}
.hamburger span{display:block;width:24px;height:2px;background:#fff;border-radius:2px;transition:var(--t)}
.mob-nav{display:none;background:var(--navy-dark);padding:20px 24px;border-top:1px solid rgba(255,255,255,.1)}
.mob-nav a{display:block;color:rgba(255,255,255,.85);padding:12px 0;font-size:16px;font-weight:500;border-bottom:1px solid rgba(255,255,255,.08)}
.mob-nav a:last-child{border-bottom:none}

/* CITY HERO */
.city-hero{background:var(--navy-dark);padding:80px 24px 60px;text-align:center}
.city-hero .inner{max-width:860px}
.city-hero .breadcrumb{font-size:14px;color:rgba(255,255,255,.6);margin-bottom:20px}
.city-hero .breadcrumb a{color:rgba(255,255,255,.7);text-decoration:underline;text-underline-offset:3px}
.city-hero .breadcrumb a:hover{color:#fff}
.city-hero h1{font-family:var(--heading);font-size:clamp(36px,6vw,64px);font-weight:800;text-transform:uppercase;color:#fff;line-height:1.05;margin-bottom:16px}
.city-hero h1 .orange{color:#E8622A}
.city-hero p{font-size:18px;color:rgba(255,255,255,.82);max-width:640px;margin:0 auto 28px;line-height:1.7}
.city-hero .cta-row{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn-cta{display:inline-block;background:var(--orange);color:#fff;padding:16px 36px;border-radius:var(--r-btn);font-family:var(--heading);font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;transition:background var(--t)}
.btn-cta:hover{background:var(--orange-hover)}
.btn-cta-outline{display:inline-block;border:2px solid rgba(255,255,255,.4);color:#fff;padding:14px 34px;border-radius:var(--r-btn);font-family:var(--heading);font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;transition:all var(--t)}
.btn-cta-outline:hover{border-color:#fff;background:rgba(255,255,255,.1)}

/* CONTENT */
.content-section{background:#fff;padding:60px 24px}
.content-section .inner{max-width:860px}
.content-section h2{font-family:var(--heading);font-size:clamp(24px,4vw,36px);font-weight:700;text-transform:uppercase;color:var(--navy);margin:40px 0 16px;line-height:1.1}
.content-section h2:first-of-type{margin-top:0}
.content-section p{font-size:16px;color:var(--text-mid);line-height:1.75;margin-bottom:16px}
.content-section ul{margin:0 0 16px 20px;color:var(--text-mid);line-height:1.75}
.content-section li{margin-bottom:8px;font-size:16px}
.content-section a{color:var(--orange);font-weight:600;text-decoration:underline;text-underline-offset:3px}
.content-section a:hover{color:var(--orange-hover)}

/* SERVICES GRID */
.svc-section{background:var(--offwhite);padding:60px 24px}
.svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:32px}
.svc-card{background:#fff;border-radius:var(--r-card);padding:28px 22px;border:1px solid var(--grey);transition:transform var(--t),box-shadow var(--t)}
.svc-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.08)}
.svc-icon{width:44px;height:44px;background:var(--navy);border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:14px}
.svc-icon svg{width:24px;height:24px;fill:#fff}
.svc-card h3{font-family:var(--heading);font-size:20px;font-weight:700;color:var(--navy);text-transform:uppercase;margin-bottom:6px}
.svc-card p{font-size:14px;color:var(--text-mid);line-height:1.6}

/* CTA BANNER */
.cta-banner{background:var(--navy);padding:60px 24px;text-align:center}
.cta-banner h2{font-family:var(--heading);font-size:clamp(28px,4vw,44px);font-weight:800;text-transform:uppercase;color:#fff;margin-bottom:12px}
.cta-banner p{font-size:17px;color:rgba(255,255,255,.78);margin-bottom:28px;max-width:600px;margin-left:auto;margin-right:auto}
.cta-banner .phone-link{display:inline-block;font-family:var(--heading);font-size:clamp(28px,4vw,42px);font-weight:800;color:var(--orange);letter-spacing:1px;margin-bottom:20px}

/* RELATED CITIES */
.related-section{background:var(--offwhite);padding:48px 24px}
.related-grid{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px;justify-content:center}
.related-grid a{background:#fff;border:1px solid var(--grey);border-radius:var(--r-btn);padding:10px 20px;font-size:14px;font-weight:600;color:var(--navy);transition:all var(--t)}
.related-grid a:hover{background:var(--orange);color:#fff;border-color:var(--orange)}

/* FOOTER */
footer{background:#080f1a;color:rgba(255,255,255,.7);padding:60px 24px 24px}
.footer-top{max-width:var(--max);margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px}
.footer-brand .logo{font-size:22px;margin-bottom:14px;color:#fff;text-decoration:none}
.footer-brand p{font-size:14px;line-height:1.7;max-width:280px}
.footer-phone{display:block;font-size:20px;font-weight:700;color:#fff;margin-top:16px}
.footer-col h4{font-family:var(--heading);font-size:16px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px}
.footer-col a{display:block;font-size:14px;color:rgba(255,255,255,.6);margin-bottom:8px;transition:color var(--t)}
.footer-col a:hover{color:var(--orange)}
.footer-bottom{max-width:var(--max);margin:0 auto;border-top:1px solid rgba(255,255,255,.1);padding-top:24px;text-align:center;font-size:13px;color:rgba(255,255,255,.4)}

@media(max-width:768px){
  section{padding:56px 20px}
  nav{display:none}
  .hamburger{display:flex}
  .mob-nav.open{display:block}
  .svc-grid{grid-template-columns:1fr}
  .footer-top{grid-template-columns:1fr}
  .city-hero{padding:60px 20px 40px}
  .city-hero h1{font-size:clamp(30px,8vw,48px)}
  .cta-banner .phone-link{font-size:clamp(24px,6vw,36px)}
}
@media(max-width:480px){
  .city-hero .cta-row{flex-direction:column;align-items:center}
  .btn-cta,.btn-cta-outline{width:100%;text-align:center}
  .hdr{padding:0 16px}
  .logo{font-size:20px;letter-spacing:1px}
}
/* mobile-overflow-fix */
html,body{overflow-x:hidden}
@media(max-width:600px){
  .header-cta{display:none!important}
  .site-header,.header-inner{padding-left:16px!important;padding-right:16px!important}
  .topbar{padding-left:16px!important;padding-right:16px!important;font-size:0.78rem!important}
}
</style>
<script src="//cdn.callrail.com/companies/209039279/feee2673bb472b064f05/12/swap.js"></script>
</head>
<body>
<!-- ANNOUNCEMENT BAR -->
<div class="announce">
  Serving All 88 Ohio Counties -- Free HVAC Quotes -- Call <a href="tel:6143444851" style="color:#fff;font-weight:700">614-344-4851</a>
</div>
<!-- HEADER -->
<header>
<div class="hdr">
<a class="logo" href="/">Ohio <span>HVAC</span> Pros</a>
<nav>
<a href="/#cities">Find Contractors</a>
<a href="/#services">Services</a>
<a href="/#all-cities">Cities</a>
<a href="/blog/">Blog</a>
<a class="btn-nav" href="/#contact">Get Free Quote</a>
</nav>
<div class="hamburger" onclick="document.querySelector('.mob-nav').classList.toggle('open')">
<span></span><span></span><span></span>
</div>
</div>
<div class="mob-nav">
<a href="/#cities">Find Contractors</a>
<a href="/#services">Services</a>
<a href="/#all-cities">Cities</a>
<a href="/blog/">Blog</a>
<a href="/#contact">Get Free Quote</a>
<a href="tel:6143444851" style="color:var(--orange);font-weight:700">614-344-4851</a>
</div>
</header>

<!-- CITY HERO -->
<section class="city-hero">
<div class="inner">
<div class="breadcrumb"><a href="/">Ohio HVAC Pros</a> / HVAC Services in ${city.name}, OH</div>
<h1>HVAC Services in <span class="orange">${city.name}, Ohio</span></h1>
<p>Licensed HVAC contractors serving ${city.name} and ${city.county} County. Get free quotes for furnace repair, AC installation, heat pump service, and emergency HVAC repair from vetted professionals.</p>
<div class="cta-row">
<a class="btn-cta" href="/#contact">Get a Free Quote</a>
<a class="btn-cta-outline" href="tel:6143444851">Call 614-344-4851</a>
</div>
</div>
</section>

<!-- MAIN CONTENT -->
<section class="content-section">
<div class="inner">

<h2>Trusted HVAC Contractors in ${city.name}, ${city.county} County</h2>
<p>Ohio HVAC Pros connects ${city.name} homeowners with licensed, insured HVAC contractors who deliver reliable heating and cooling service across ${city.county} County. With a population of ${city.pop} residents, ${city.name} has a wide range of residential HVAC needs, from emergency furnace repair in the dead of winter to full air conditioning installations before summer heat arrives. Our contractor network serves neighborhoods throughout ${city.neighborhoods}.</p>

<p>${city.extra}</p>

<h2>${city.name} Weather and Your HVAC System</h2>
<p>${city.weather} These conditions put serious demands on residential HVAC systems. A furnace or heat pump that cannot keep up during January cold snaps, or an air conditioner that struggles through July humidity, costs homeowners money in wasted energy and uncomfortable living conditions. Properly sized, well-maintained HVAC equipment is essential for ${city.name} homes.</p>

<p>Local landmarks like ${city.landmarks} define the character of ${city.name}, and the homes throughout the area deserve HVAC systems that match the community's standards. Whether you need a routine tune-up before heating season or a complete system replacement, our ${city.name} contractors provide upfront pricing and professional installation. Learn more about <a href="${blogs[0].url}">${blogs[0].text}</a> and <a href="${blogs[1].url}">${blogs[1].text}</a> to make informed decisions about your home comfort.</p>

<h2>HVAC Services Available in ${city.name}</h2>
<p>${city.services}</p>

<ul>
<li>Furnace repair, maintenance, and replacement (gas, propane, and oil)</li>
<li>Central air conditioning installation and repair</li>
<li>Heat pump installation and service</li>
<li>Ductless mini-split systems</li>
<li>Air duct cleaning, sealing, and repair</li>
<li>Smart thermostat installation</li>
<li>Indoor air quality testing and solutions</li>
<li>24/7 emergency HVAC repair</li>
</ul>

<p>For a full breakdown of what to expect when upgrading your system, read our guides on <a href="${blogs[2].url}">${blogs[2].text}</a> and <a href="${blogs[3].url}">${blogs[3].text}</a>. You can also visit our <a href="/faq/">FAQ page</a> for answers to common HVAC questions Ohio homeowners ask.</p>

<h2>Why ${city.name} Homeowners Choose Ohio HVAC Pros</h2>
<p>Finding a trustworthy HVAC contractor in ${city.name} should not be a gamble. Every contractor in our network is licensed by the State of Ohio, carries liability insurance, and has been vetted for quality workmanship. We match you with contractors who have direct experience working in ${city.county} County, so they understand the local building codes, utility infrastructure, and climate demands specific to ${city.name}.</p>

<p>Our service is free for homeowners. Call <a href="tel:6143444851">614-344-4851</a> or <a href="/#contact">request a free quote online</a> to get matched with licensed HVAC contractors in ${city.name} today. There is no obligation, and you can compare multiple estimates before making a decision. Browse our <a href="/">homepage</a> to learn more about how Ohio HVAC Pros works, or explore our <a href="/blog/">HVAC blog</a> for maintenance tips and cost guides written specifically for Ohio homeowners.</p>

</div>
</section>

<!-- SERVICES GRID -->
<section class="svc-section">
<div class="inner">
<span class="label">${city.name} HVAC Services</span>
<h2 class="section-title">What We Cover</h2>
<div class="svc-grid">
<div class="svc-card">
<div class="svc-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg></div>
<h3>Furnace Repair</h3>
<p>Fast furnace diagnosis and repair for gas, propane, and oil heating systems across ${city.name}.</p>
</div>
<div class="svc-card">
<div class="svc-icon"><svg viewBox="0 0 24 24"><path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z"/></svg></div>
<h3>AC Installation</h3>
<p>Central air conditioning installation and replacement to keep your ${city.name} home cool through summer.</p>
</div>
<div class="svc-card">
<div class="svc-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>
<h3>Heat Pumps</h3>
<p>Energy-efficient heat pump installation and service for year-round heating and cooling in ${city.county} County.</p>
</div>
<div class="svc-card">
<div class="svc-icon"><svg viewBox="0 0 24 24"><path d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31A7.98 7.98 0 0012 21.58a7.98 7.98 0 005.66-2.34c3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/></svg></div>
<h3>Emergency HVAC</h3>
<p>24/7 emergency heating and cooling repair for ${city.name} homeowners when systems fail unexpectedly.</p>
</div>
<div class="svc-card">
<div class="svc-icon"><svg viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 12.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg></div>
<h3>Duct Services</h3>
<p>Air duct cleaning, sealing, and repair to improve efficiency and indoor air quality in your home.</p>
</div>
<div class="svc-card">
<div class="svc-icon"><svg viewBox="0 0 24 24"><path d="M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z"/></svg></div>
<h3>Thermostats</h3>
<p>Smart thermostat installation and programming to optimize comfort and energy savings in ${city.name} homes.</p>
</div>
</div>
</div>
</section>

<!-- CTA BANNER -->
<section class="cta-banner">
<div class="inner">
<h2>Ready for HVAC Service in ${city.name}?</h2>
<p>Connect with licensed HVAC contractors serving ${city.name} and all of ${city.county} County. Free estimates, no obligation.</p>
<a class="phone-link" href="tel:6143444851">614-344-4851</a><br/>
<a class="btn-cta" href="/#contact" style="margin-top:8px">Get Your Free Quote</a>
</div>
</section>

<!-- RELATED CITIES -->
<section class="related-section">
<div class="inner" style="text-align:center">
<span class="label">More Ohio Cities</span>
<h2 class="section-title" style="font-size:clamp(24px,4vw,36px)">HVAC Services Across Ohio</h2>
<div class="related-grid">
${otherCities.map(c => `<a href="/${c.slug}/">${c.name}, OH</a>`).join('\n')}
<a href="/">View All Ohio Cities</a>
</div>
</div>
</section>

<!-- FOOTER -->
<footer>
<div class="footer-top">
<div class="footer-brand">
<a class="logo" href="/">Ohio <span>HVAC</span> Pros</a>
<p>Ohio's largest directory of licensed, vetted HVAC contractors. Serving all 88 Ohio counties with free quote matching for homeowners statewide.</p>
<a class="footer-phone" href="tel:6143444851">614-344-4851</a>
<p style="margin-top:8px;font-size:13px">Serving All of Ohio</p>
</div>
<div class="footer-col">
<h4>Services</h4>
<a href="/services/ac-installation/">AC Installation</a>
<a href="/services/furnace-repair/">Furnace Repair</a>
<a href="/services/heat-pump-installation/">Heat Pump Installation</a>
<a href="/services/hvac-maintenance/">HVAC Maintenance</a>
<a href="/services/emergency-hvac/">Emergency HVAC</a>
</div>
<div class="footer-col">
<h4>Top Cities</h4>
<a href="/columbus/">Columbus</a>
<a href="/cleveland/">Cleveland</a>
<a href="/cincinnati/">Cincinnati</a>
<a href="/toledo/">Toledo</a>
<a href="/akron/">Akron</a>
<a href="/dayton/">Dayton</a>
<a href="/youngstown/">Youngstown</a>
<a href="/canton/">Canton</a>
</div>
<div class="footer-col">
<h4>Resources</h4>
<a href="/blog/">All HVAC Articles</a>
<a href="/blog/how-much-does-hvac-replacement-cost-in-ohio/">HVAC Replacement Cost</a>
<a href="/blog/heat-pump-vs-furnace-ohio-climate/">Heat Pump vs Furnace</a>
<a href="/blog/hvac-maintenance-checklist-ohio-homeowners/">Maintenance Checklist</a>
<a href="/blog/best-hvac-companies-in-ohio/">Best HVAC Companies</a>
<a href="/blog/when-to-replace-hvac-system-ohio/">When to Replace HVAC</a>
<a href="/blog/ac-tune-up-cost-ohio/">AC Tune-Up Cost</a>
<a href="/blog/furnace-repair-cost-ohio/">Furnace Repair Cost</a>
</div>
</div>
<div class="footer-bottom">
<p>&copy; 2026 Ohio HVAC Pros. All rights reserved. | Licensed HVAC contractors across Ohio | <a href="tel:6143444851" style="color:rgba(255,255,255,.5)">614-344-4851</a></p>
</div>
</footer>
</body>
</html>`;
}

// Generate all pages
const baseDir = path.resolve(__dirname);
cities.forEach((city, index) => {
  const dir = path.join(baseDir, city.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const html = generatePage(city, index);
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  console.log(`Created: ${city.slug}/index.html`);
});

console.log('\nAll 10 city pages generated.');
