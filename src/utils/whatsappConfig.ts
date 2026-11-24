// WhatsApp Configuration
export const WHATSAPP_CONFIG = {
  OWNER_PHONE: "919533950636", // Owner's WhatsApp number (with country code, no +)
}

// Generate WhatsApp message from form data
export const generateWhatsAppMessage = (formData: {
  name: string
  email: string
  phone: string
  eventDate: string
  venue: string
  eventType: string
  guestCount: string
  budget: string
  message: string
}) => {
  const encodedMessage = encodeURIComponent(
    `Hello JP Events,\n\nI'm interested in your services for my upcoming event.\n\n` +
      `*Event Details:*\n` +
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Phone: ${formData.phone}\n` +
      `Event Type: ${formData.eventType}\n` +
      `Event Date: ${formData.eventDate}\n` +
      `Venue: ${formData.venue || "To be decided"}\n` +
      `Guest Count: ${formData.guestCount || "To be decided"}\n` +
      `Budget: ${formData.budget || "To be discussed"}\n\n` +
      `*Message:*\n${formData.message}\n\n` +
      `Looking forward to hearing from you!`,
  )
  return encodedMessage
}

// Generate WhatsApp message for venue booking
export const generateVenueBookingMessage = (venueName: string, guestCount?: number) => {
  const encodedMessage = encodeURIComponent(
    `Hi JP Events,\n\n` +
      `I'm interested in booking *${venueName}* for my wedding.\n\n` +
      `${guestCount ? `Expected Guests: ${guestCount}\n` : ""}` +
      `I'd love to discuss availability, pricing, and customization options.\n\n` +
      `Please let me know the next steps!\n\n` +
      `Thank you!`,
  )
  return encodedMessage
}

// Open WhatsApp Web with pre-filled message
export const openWhatsAppChat = (formData: {
  name: string
  email: string
  phone: string
  eventDate: string
  venue: string
  eventType: string
  guestCount: string
  budget: string
  message: string
}) => {
  const message = generateWhatsAppMessage(formData)
  const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.OWNER_PHONE}?text=${message}`
  window.open(whatsappUrl, "_blank", "width=800,height=600")
}

// Open WhatsApp Web for venue booking with pre-filled message
export const openVenueBookingWhatsApp = (venueName: string, guestCount?: number) => {
  const message = generateVenueBookingMessage(venueName, guestCount)
  const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.OWNER_PHONE}?text=${message}`
  window.open(whatsappUrl, "_blank", "width=800,height=600")
}
