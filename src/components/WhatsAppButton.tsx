import { MessageCircle } from "lucide-react"
import { openVenueBookingWhatsApp } from "../utils/whatsappConfig"

interface WhatsAppButtonProps {
  venueName: string
  guestCount?: number
  variant?: "primary" | "secondary" | "icon"
  className?: string
  onBooking?: () => void
}

export const WhatsAppButton = ({
  venueName,
  guestCount,
  variant = "primary",
  className = "",
  onBooking,
}: WhatsAppButtonProps) => {
  const handleClick = () => {
    onBooking?.()
    openVenueBookingWhatsApp(venueName, guestCount)
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center justify-center p-2 rounded-full text-white transition-all duration-300 hover:scale-110 ${className}`}
        style={{
          background: "#25D366",
        }}
        title={`Book ${venueName} on WhatsApp`}
      >
        <MessageCircle className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`${
        variant === "secondary"
          ? "border-2 border-green-500 text-green-600 hover:bg-green-50"
          : "bg-gradient-to-r from-green-400 to-green-600 text-white hover:shadow-lg"
      } py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${className}`}
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-1.557.893-2.862 2.354-3.54 3.994-1.378 3.244.341 7.801 3.585 9.179 1.487.627 3.077.818 4.573.535 1.495-.283 2.848-1.243 3.716-2.323 1.378-1.628 2.123-3.808 2.123-6.01 0-.704-.057-1.42-.173-2.1-.331-1.872-1.423-3.51-2.868-4.656-1.445-.975-3.244-1.466-5.195-1.466z" />
      </svg>
      <span>Book on WhatsApp</span>
    </button>
  )
}
