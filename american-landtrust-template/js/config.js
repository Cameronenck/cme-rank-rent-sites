/*
 * Site Configuration
 * Edit these values to customize the site for a new client
 */
const SITE_CONFIG = {
  // Company Info
  companyName: "American Land Trust",
  companyTagline: "The Trusted Way to Sell Your Land",
  phone: "801-780-8393",
  phoneFormatted: "+1-801-780-8393",
  email: "hello@american-landtrust.com",
  address: "12605 East Fwy, #325, Houston, TX 77015",

  // Hero Section
  heroTitle: "American Land Trust: The Trusted Way to Sell Your Land",
  heroSubtitle: "Fair cash offers, stress-free closings, and American-sized integrity.",
  heroCTA: "Contact us →",

  // About Section
  aboutHeading: 'We believe in <strong>honest deals, fair offers, and treating landowners with the respect they deserve</strong>—because that\'s the American way. Selling your property doesn\'t have to be complicated, and we\'re here to make sure it\'s <strong>simple, straightforward, and stress-free</strong>.',
  aboutText: 'With deep roots in <strong>American land transactions</strong>, we understand the unique value of property in our great state. Whether it\'s family land passed down through generations, an investment you no longer need, or a property that no longer fits your plans, <strong>we\'re here to offer a fair, no-obligation cash deal—quickly and transparently</strong>.',
  aboutCTA: 'Call, text and email us today - <strong>we are here to help!</strong>',

  // Process Steps
  processSteps: [
    {
      title: "Assessment and Consulting",
      description: 'Tell Us About Your Land. Share the <strong>APN number, county, state,</strong> and <strong>property owner details</strong>—no paperwork is needed upfront. If you have any liens or details you\'d like us to know, we\'ll listen.',
      icon: "clipboard"
    },
    {
      title: "Smart Valuation & Honest Offers",
      description: '<strong>We evaluate & make a fair offer.</strong> We use market expertise, advanced data tools, and good old-fashioned common sense to assess your land. We consider location, zoning, size, and current market trends to ensure you receive a fair, no-obligation offer within 48 hours.',
      icon: "dollarSign"
    },
    {
      title: "Fast and Secure Closing",
      description: '<strong>Get Paid in 1 to 3 Weeks!</strong> Once you accept the offer, we work with trusted and vetted title companies to handle all the paperwork and legal details. Most sellers receive their payment within 1 to 3 weeks, ensuring a smooth and secure transaction.',
      icon: "home"
    }
  ],

  // Why Choose Us
  whyChooseUs: [
    { title: "Fair & Honest Offers", desc: "No lowballing. Just straight-up, market-driven cash offers." },
    { title: "Fast & Stress-Free Process", desc: "Get an offer in 48 hours and close quickly." },
    { title: "No Middlemen, No Extra Fees", desc: "You deal directly with us, not a third party." },
    { title: "American-Owned & Operated", desc: "We understand the land, the market, and the people." },
    { title: "Respect & Integrity", desc: "We do business with a handshake and our word." }
  ],

  // Testimonials
  testimonials: [
    {
      name: "Mokaya N.",
      time: "4 months ago",
      text: "Jenny and Reddy from ALT were amazing and really helpful in finding our new property. Jenny, in particular, gave us a lot of honest information and provided insightful recommendations. The process was smooth and easy and Reddy was able to progress things very quickly. Very quick to respond to any queries or information.",
      rating: 5
    },
    {
      name: "Brian H.",
      time: "4 months ago",
      text: "American Land Trust really know the market and are consummate professionals in the Houston residential rental and sales market. Particularly rate Jenny for prompt and efficient service. If I had to do it again, I would definitely work with them again.",
      rating: 5
    },
    {
      name: "Mo M.",
      time: "4 months ago",
      text: "Jenny is very helpful and always responds in time. A smooth and professional experience. I've recommended this company to my friends.",
      rating: 5
    },
    {
      name: "Mugo MD.",
      time: "4 months ago",
      text: "My property purchase became difficult until Jenny and Reddy stepped in to progress the sale. They acted as intermediaries between the two solicitors who were struggling to effect the exchange of contracts. I honestly don't think the exchange would have happened had it not been for their calm professionalism.",
      rating: 5
    },
    {
      name: "Mercy K.",
      time: "4 months ago",
      text: "Excellent speed of response and reactivity from Jenny from the company. Happy to highly recommend.",
      rating: 5
    },
    {
      name: "Carol K.",
      time: "4 months ago",
      text: "After meeting several estate agents and getting valuations from all them, we were immediately impressed by American Land Trust's professional and transparent approach. Highly recommended!",
      rating: 5
    }
  ],

  // Articles
  articles: [
    {
      title: "Unlock the True Value of Your Land: A Hassle-Free Way to Secure Your Legacy",
      category: "MARKET REPORT",
      link: "blog/unlock-true-value-of-your-land.html"
    },
    {
      title: "Why Now Is the Perfect Time to Sell Your Land",
      category: "RETIREMENT PLANNING",
      link: "blog/why-now-is-perfect-time-to-sell.html"
    },
    {
      title: "A Letter to Landowners: Honor Your Legacy, Embrace a New Chapter",
      category: "FARM LIFE",
      link: "blog/letter-to-landowners.html"
    },
    {
      title: "Why Holding Onto Unused Land Could Be Costing You More Than You Think",
      category: "INVESTMENT",
      link: "blog/unused-land-costing-you.html"
    }
  ],

  // Team Members (About page)
  team: [
    {
      name: "Demetri Suliman",
      role: "Managing Director",
      tagline: "A Man of Service, Integrity, and Trust",
      bio: "I'm <strong>Demetri Suliman</strong>, and I believe in hard work, integrity, and doing right by people. As an active-duty service member in the United States Air Force, I've dedicated my life to serving this great country, and that same commitment extends to the landowners I work with every day.",
      bio2: "I'm a proud Texan who understands the value of land, legacy, and the trust that comes with making big decisions. Whether it's protecting our nation or helping landowners navigate the selling process, I approach everything with respect, honesty, and a firm handshake."
    },
    {
      name: "Reddy Family",
      role: "Founder & CEO of American Land Trust",
      tagline: "A Landowner's Partner & A Straight Shooter",
      bio: 'We started American Land Trust with one promise — to do right by people. Selling land shouldn\'t be stressful or complicated. That\'s why we focus on making the process <strong>fair, clear, and dependable</strong> at every step.',
      bio2: 'Over time, we\'ve been fortunate to build lasting relationships with landowners across the country. One truth stands out above all: <strong>land is more than property.</strong> It carries memories, pride, and a legacy worth honoring.'
    },
    {
      name: "Jenny Mann",
      role: "Acquisition Manager",
      tagline: "",
      bio: "I was raised in a small town with true country values, where a handshake still means something. Helping people with their land isn't just business for me—it's personal. Whether it's easing the burden of taxes or helping a young family buy their first property, my goal is to make the process simple, honest, and stress-free."
    }
  ],

  // Contact Page
  contactHeading: "Let's Have a Chat",
  contactSubtitle: "Helping Landowners Secure the Best Deals with Ease and Integrity!",
  contactText: 'At <strong>American Land Trust</strong>, we understand that land is more than just property—it\'s heritage, investment, and legacy. Whether you\'re looking to sell your land, explore investment opportunities, or simply get advice, we\'re here to make the process simple, fair, and transparent.',

  // Footer
  footerLinks: [
    { text: "About the Process", href: "index.html#process" },
    { text: "About", href: "about.html" },
    { text: "Articles & Insights", href: "blog/" }
  ],

  // SEO
  metaDescription: "American Land Trust offers fair cash offers for your land. Stress-free closings, honest deals, and American-sized integrity. Get your cash offer today!",
  metaKeywords: "sell land, cash offer land, land trust, sell property fast, land buyer"
};

