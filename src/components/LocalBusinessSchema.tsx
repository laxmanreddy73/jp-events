import { Helmet } from "react-helmet-async"

const LocalBusinessSchema = () => {
  const generateLocalBusinessSchema = () => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://subadesignsanddecoration.com",
    name: "JP Events",
    image: "https://subadesignsanddecoration.com/jp-events-logo.png",
    description:
      "Wedding planning, event decoration, and celebration design in Hyderabad, shaped around each couple's story.",
    url: "https://subadesignsanddecoration.com",
    telephone: "+919533950636",
    email: "jpevents@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hyderabad",
      addressRegion: "Telangana",
      addressCountry: "IN",
    },
    areaServed: [
      {
        "@type": "City",
        name: "Hyderabad",
      },
      {
        "@type": "State",
        name: "Telangana",
      },
    ],
    businessType: ["Wedding Planner", "Event Decorator", "Wedding Decorator"],
    priceRange: "$$",
    sameAs: [
      "https://www.instagram.com/jp_events__official/",
      "https://www.facebook.com/jpeventsorganizers/",
      "https://www.wedmegood.com/subadesigns",
      "https://g.page/subadesigns",
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "20:00",
    },
    founder: {
      "@type": "Person",
      name: "Narasimhamurthy",
      jobTitle: "Founder & Creative Head",
    },
    knowsAbout: [
      "Wedding Planning",
      "Event Decoration",
      "Floral Design",
      "Theme Weddings",
      "Luxury Events",
      "Cultural Ceremonies",
    ],
    availableLanguage: ["en", "kn", "ml", "hi"],
  })

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(generateLocalBusinessSchema())}</script>
    </Helmet>
  )
}

export default LocalBusinessSchema
