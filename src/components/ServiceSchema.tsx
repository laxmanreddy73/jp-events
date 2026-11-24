import { Helmet } from "react-helmet-async"

const ServiceSchema = ({ services = [] }) => {
  // Default services if none provided
  const defaultServices = [
    {
      name: "Wedding Decoration & Theming",
      description: "Complete venue transformation with custom themes, floral arrangements, and lighting design",
      image: "https://subadesignsanddecoration.com/services/decoration.jpg",
      areaServed: ["Hyderabad", "Telangana", "India"],
    },
    {
      name: "Full Wedding Planning",
      description:
        "Comprehensive 12-month planning including venue selection, vendor coordination, and day-of management",
      image: "https://subadesignsanddecoration.com/services/planning.jpg",
      areaServed: ["Hyderabad", "Telangana", "India"],
    },
    {
      name: "Photography & Videography",
      description: "Professional photography and cinematic videography with drone and drone footage",
      image: "https://subadesignsanddecoration.com/services/photography.jpg",
      areaServed: ["Hyderabad", "Telangana", "India"],
    },
    {
      name: "Pre-Wedding Events",
      description: "Haldi, Mehendi, Sangeet planning and execution with complete decor and entertainment",
      image: "https://subadesignsanddecoration.com/services/prewedding.jpg",
      areaServed: ["Hyderabad", "Telangana", "India"],
    },
  ]

  const serviceList = services.length > 0 ? services : defaultServices

  const generateServiceSchemas = () => {
    return serviceList.map((service) => ({
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.name,
      description: service.description,
      image: service.image,
      provider: {
        "@type": "LocalBusiness",
        name: "JP Events",
        telephone: "+919533950636",
        email: "jpevents@gmail.com",
      },
      areaServed: service.areaServed.map((area) => ({
        "@type": "City",
        name: area,
      })),
      serviceType: "Wedding Planning & Decoration",
      availableLanguage: ["en", "kn", "ml"],
    }))
  }

  return (
    <Helmet>
      {generateServiceSchemas().map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}

export default ServiceSchema
