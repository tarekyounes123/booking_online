// Utility functions for generating structured data for SEO

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Booking System",
    "description": "Professional appointment booking system for managing services and appointments",
    "url": "https://your-booking-site.com",
    "logo": "https://your-booking-site.com/logo512.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-XXX-XXX-XXXX",
      "contactType": "customer service",
      "areaServed": "US",
      "availableLanguage": "en"
    },
    "sameAs": [
      "https://www.facebook.com/yourbookingpage",
      "https://www.twitter.com/yourbookingpage",
      "https://www.instagram.com/yourbookingpage"
    ]
  };
};

export const generateServiceSchema = (service) => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": service.name,
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "Organization",
      "name": "Booking System"
    },
    "areaServed": {
      "@type": "Place",
      "name": "Service Area"
    },
    "offers": {
      "@type": "Offer",
      "price": service.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": service.averageRating || 0,
      "reviewCount": service.numOfReviews || 0
    }
  };
};

export const generateBreadcrumbSchema = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.url
    }))
  };
};

export const generateLocalBusinessSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Booking System",
    "description": "Professional appointment booking service",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Business Street",
      "addressLocality": "City",
      "addressRegion": "State",
      "postalCode": "12345",
      "addressCountry": "US"
    },
    "telephone": "+1-XXX-XXX-XXXX",
    "openingHours": "Mo,Tu,We,Th,Fr 09:00-17:00",
    "priceRange": "$$"
  };
};