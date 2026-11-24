import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import {
  Phone, Mail, MapPin, Send, Facebook, Instagram,
  MessageCircle, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, Loader2, Calendar, Users, DollarSign, Map
} from 'lucide-react';
import { openWhatsAppChat } from '../utils/whatsappConfig';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    venue: '',
    eventType: '',
    guestCount: '',
    budget: '',
    message: ''
  });

  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  // EmailJS configuration
  const EMAILJS_SERVICE_ID = 'service_9aspror';
  const EMAILJS_TEMPLATE_ID = 'template_s207awp';
  const EMAILJS_AUTO_REPLY_TEMPLATE_ID = 'template_ak02mxm';
  const EMAILJS_PUBLIC_KEY = 'Zczjags9REiNlv8J7';

  useEffect(() => {
    if (submitStatus === 'success' || submitStatus === 'error') {
      const timer = setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      eventDate: '',
      venue: '',
      eventType: '',
      guestCount: '',
      budget: '',
      message: ''
    });
    setSubmitStatus('idle');
    setSubmitMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Initialize EmailJS
      emailjs.init(EMAILJS_PUBLIC_KEY);

      // Prepare template parameters for the main contact email
      const contactTemplateParams = {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        event_date: formData.eventDate,
        venue: formData.venue,
        event_type: formData.eventType,
        guest_count: formData.guestCount,
        budget: formData.budget,
        message: formData.message,
        to_email: 'jpevents@gmail.com'
      };

      // Task 1: Send main contact email to your business
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        contactTemplateParams
      );

      // Prepare template parameters for auto-reply to customer
      const autoReplyTemplateParams = {
        to_name: formData.name,
        to_email: formData.email,
        event_type: formData.eventType,
        event_date: formData.eventDate,
        from_name: 'JP Events',
        from_email: 'jpevents@gmail.com'
      };

      // Send auto-reply email to customer (in background)
      emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_AUTO_REPLY_TEMPLATE_ID,
        autoReplyTemplateParams
      ).catch(error => console.error('Auto-reply error:', error));

      // Task 2 & 3: Open WhatsApp with pre-filled message
      openWhatsAppChat(formData);

      // Task 4: Reset form immediately
      setSubmitStatus('success');
      setSubmitMessage('Your inquiry has been sent! We\'ve also opened WhatsApp for you to connect directly.');
      
      // Reset form fields
      resetForm();

    } catch (error) {
      console.error('EmailJS Error:', error);
      setSubmitStatus('error');
      setSubmitMessage('Sorry, there was an error sending your message. Please try again or contact us directly at jpevents@gmail.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "What services does JP Events offer?",
      answer: "We specialize in complete wedding decor, including mandap designs, floral arrangements, lighting, and venue transformations. We also handle engagements, receptions, naming ceremonies, baby showers, and corporate events."
    },
    {
      question: "How far in advance should we book your services?",
      answer: "We recommend booking at least 6-9 months in advance for weddings, especially during peak season (October-February). For other events, 3-6 months is ideal."
    },
    {
      question: "Do you work with specific venues in Hyderabad?",
      answer: "Yes. We work with venues across Hyderabad and can also create a bespoke setup for unconventional spaces."
    },
    {
      question: "What makes JP Events different from other decorators?",
      answer: "Our signature lies in transforming ordinary spaces into extraordinary experiences using locally-sourced flowers, sustainable materials, and innovative designs that reflect your personality while honoring tradition."
    },
    {
      question: "Can we see samples of your previous work?",
      answer: "Absolutely! Visit our Instagram @jp_events__official to explore our portfolio, or contact us for a curated lookbook of our designs."
    }
  ];

  return (
    <div className="bg-gradient-to-b from-white to-blush-50 min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative bg-cover bg-center py-14 sm:py-20 md:py-28" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blush-900/40 to-blush-700/40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block relative">
            <h1 className="mb-3 font-serif text-[clamp(2.35rem,10vw,4rem)] font-semibold leading-[1.02] text-white sm:mb-5">
              Create Golden<br className="md:hidden" /> Moments
            </h1>
          </div>
          
          <div className="mx-auto mb-4 h-px w-16 bg-[#f1c6d2] sm:mb-6 sm:w-24"></div>
          
          <p className="mx-auto max-w-xl px-4 text-sm leading-6 text-white/90 sm:px-0 sm:text-base sm:leading-7">
            Tell us about your celebration and the moments that matter most. We’ll be in touch to start planning.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section id="contact" className="py-5 sm:py-8 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Contact Form */}
            <div className="order-1">
              <div className="rounded-xl border border-blush-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 lg:p-10 lg:shadow-xl">
                <div className="flex items-center mb-6 md:mb-8">
                  <div className="bg-blush-100 p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <Send className="h-5 w-5 md:h-6 md:w-6 text-blush-600" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800">
                    Send Your Inquiry
                  </h2>
                </div>

                {/* Success/Error Messages */}
                {submitStatus === 'success' && (
                  <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-lg flex items-start space-x-3 bg-green-50 border border-green-200">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs md:text-sm text-green-800">
                      {submitMessage}
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-lg flex items-start space-x-3 bg-red-50 border border-red-200">
                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs md:text-sm text-red-800">
                      {submitMessage}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-3 md:px-8 py-2.5 md:py-3 text-base border border-blush-200 rounded-lg focus:ring-2 focus:ring-blush-500 focus:border-blush-500 transition-colors bg-blush-50/50 disabled:bg-blush-100/50 disabled:cursor-not-allowed placeholder-blush-600/60 text-gray-900"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 text-base border border-blush-200 rounded-lg focus:ring-2 focus:ring-blush-500 focus:border-blush-500 transition-colors bg-blush-50/50 disabled:bg-blush-100/50 disabled:cursor-not-allowed placeholder-blush-600/60 text-gray-900"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-3 md:px-8 py-2.5 md:py-3 text-base border border-blush-200 rounded-lg focus:ring-2 focus:ring-blush-500 focus:border-blush-500 transition-colors bg-blush-50/50 disabled:bg-blush-100/50 disabled:cursor-not-allowed placeholder-blush-600/60 text-gray-900"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blush-500" />
                        <input
                          type="date"
                          name="eventDate"
                          required
                          value={formData.eventDate}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full pl-10 pr-3 md:px-8 py-2.5 md:py-3 text-base border border-blush-200 rounded-lg focus:ring-2 focus:ring-blush-500 focus:border-blush-500 transition-colors bg-blush-50/50 disabled:bg-blush-100/50 disabled:cursor-not-allowed text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type *
                    </label>
                    <div className="relative">
                      <select
                        name="eventType"
                        required
                        value={formData.eventType}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 text-base border border-blush-200 rounded-lg focus:ring-2 focus:ring-blush-500 focus:border-blush-500 transition-colors bg-blush-50/50 disabled:bg-blush-100/50 disabled:cursor-not-allowed text-gray-900 appearance-none cursor-pointer"
                      >
                        <option value="" className="text-gray-500">Select event type</option>
                        <option value="Wedding" className="text-gray-900">Wedding</option>
                        <option value="Engagement" className="text-gray-900">Engagement</option>
                        <option value="Reception" className="text-gray-900">Reception</option>
                        <option value="Naming Ceremony" className="text-gray-900">Naming Ceremony</option>
                        <option value="Baby Shower" className="text-gray-900">Baby Shower</option>
                        <option value="Corporate Event" className="text-gray-900">Corporate Event</option>
                        <option value="Other" className="text-gray-900">Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blush-600">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Venue (if known)
                      </label>
                      <div className="relative">
                        <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blush-500" />
                        <input
                          type="text"
                          name="venue"
                          value={formData.venue}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full pl-10 pr-3 md:px-8 py-2.5 md:py-3 text-base border border-blush-200 rounded-lg focus:ring-2 focus:ring-blush-500 focus:border-blush-500 transition-colors bg-blush-50/50 disabled:bg-blush-100/50 disabled:cursor-not-allowed placeholder-blush-600/60 text-gray-900"
                          placeholder="Event venue location"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guest Count
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blush-500" />
                        <select
                          name="guestCount"
                          value={formData.guestCount}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full pl-10 pr-8 md:px-8 py-2.5 md:py-3 text-base border border-blush-200 rounded-lg focus:ring-2 focus:ring-blush-500 focus:border-blush-500 transition-colors bg-blush-50/50 disabled:bg-blush-100/50 disabled:cursor-not-allowed text-gray-900 appearance-none cursor-pointer"
                        >
                          <option value="" className="text-gray-500">Select guest count</option>
                          <option value="50-100" className="text-gray-900">50-100 guests</option>
                          <option value="100-200" className="text-gray-900">100-200 guests</option>
                          <option value="200-300" className="text-gray-900">200-300 guests</option>
                          <option value="300+" className="text-gray-900">300+ guests</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blush-600">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blush-500" />
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full pl-10 pr-8 md:px-8 py-2.5 md:py-3 text-base border border-blush-200 rounded-lg focus:ring-2 focus:ring-blush-500 focus:border-blush-500 transition-colors bg-blush-50/50 disabled:bg-blush-100/50 disabled:cursor-not-allowed text-gray-900 appearance-none cursor-pointer"
                      >
                        <option value="" className="text-gray-500">Select budget range</option>
                        <option value="1-2L" className="text-gray-900">₹1-2 Lakhs</option>
                        <option value="2-5L" className="text-gray-900">₹2-5 Lakhs</option>
                        <option value="5-10L" className="text-gray-900">₹5-10 Lakhs</option>
                        <option value="10L+" className="text-gray-900">₹10 Lakhs+</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blush-600">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tell Us About Your Vision
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-base border border-blush-200 rounded-lg focus:ring-2 focus:ring-blush-500 focus:border-blush-500 transition-colors bg-blush-50/50 disabled:bg-blush-100/50 disabled:cursor-not-allowed resize-none placeholder-blush-600/60 text-gray-900"
                      placeholder="Describe your dream event, color preferences, theme ideas, or any special requirements..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blush-500 to-blush-600 hover:from-blush-600 hover:to-blush-700 text-white py-3 md:py-4 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center shadow-blush-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 md:h-5 md:w-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                        Send Inquiry
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information & FAQ */}
            <div className="order-2 space-y-5 sm:space-y-7">
              {/* Contact Details */}
              <div className="rounded-xl border border-blush-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 lg:p-10 lg:shadow-xl">
                <div className="flex items-center mb-6 md:mb-8">
                  <div className="bg-blush-100 p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-blush-600" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800">
                    Contact Details
                  </h2>
                </div>
                
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="bg-blush-100 rounded-full p-2 md:p-3 flex-shrink-0">
                      <Phone className="h-4 w-4 md:h-6 md:w-6 text-blush-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">Phone</h4>
                      <div className="flex flex-wrap gap-2">
                        <a href="tel:+919533950636" className="inline-flex min-h-11 items-center text-sm font-medium text-[#81314f] underline underline-offset-4">95339 50636</a>
                        <a href="https://wa.me/919533950636" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-[#168447] underline underline-offset-4">WhatsApp</a>
                      </div>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">Mon-Sun 9AM-8PM</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="bg-blush-100 rounded-full p-2 md:p-3 flex-shrink-0">
                      <Mail className="h-4 w-4 md:h-6 md:w-6 text-blush-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">Email</h4>
                      <a href="mailto:jpevents@gmail.com" className="break-all text-sm text-[#81314f] underline underline-offset-4 sm:text-base">jpevents@gmail.com</a>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">Response within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="bg-blush-100 rounded-full p-2 md:p-3 flex-shrink-0">
                      <MapPin className="h-4 w-4 md:h-6 md:w-6 text-blush-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">Our Locations</h4>
                      <p className="text-gray-600 text-sm md:text-base">
                        Hyderabad, Telangana, India
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 mt-2">By appointment only</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="rounded-xl border border-blush-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 lg:p-10 lg:shadow-xl">
                <div className="flex items-center mb-6 md:mb-8">
                  <div className="bg-blush-100 p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <Instagram className="h-5 w-5 md:h-6 md:w-6 text-blush-600" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800">
                    Follow Our Work
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <a 
                    href="https://www.instagram.com/jp_events__official/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 bg-blush-50 hover:bg-blush-100 p-3 md:p-4 rounded-lg transition-colors border border-blush-100"
                  >
                    <Instagram className="h-4 w-4 md:h-6 md:w-6 text-blush-600" />
                    <span className="font-medium text-blush-600 text-sm md:text-base">Instagram</span>
                  </a>
                  <a 
                    href="https://www.facebook.com/jpeventsorganizers/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center justify-center space-x-2 rounded-lg border border-blush-100 bg-blush-50 p-3 transition-colors hover:bg-blush-100 md:p-4"
                  >
                    <Facebook className="h-4 w-4 md:h-6 md:w-6 text-blush-600" />
                    <span className="font-medium text-blush-600 text-sm md:text-base">Facebook</span>
                  </a>
                  <a 
                    href="https://wa.me/919533950636" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 bg-blush-50 hover:bg-blush-100 p-3 md:p-4 rounded-lg transition-colors border border-blush-100"
                  >
                    <MessageCircle className="h-4 w-4 md:h-6 md:w-6 text-blush-600" />
                    <span className="font-medium text-blush-600 text-sm md:text-base">WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="rounded-xl border border-blush-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 lg:p-10 lg:shadow-xl">
                <div className="flex items-center mb-6 md:mb-8">
                  <div className="bg-blush-100 p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <svg className="h-5 w-5 md:h-6 md:w-6 text-blush-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800">
                    Frequently Asked Questions
                  </h2>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-blush-100 pb-3 md:pb-4 last:border-0">
                      <button
                        onClick={() => toggleFAQ(index)}
                        className="flex justify-between items-center w-full text-left font-medium text-gray-800 hover:text-blush-600 focus:outline-none text-sm md:text-base"
                      >
                        <span className="text-left pr-4">{faq.question}</span>
                        {activeFAQ === index ? (
                          <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-blush-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-blush-400 flex-shrink-0" />
                        )}
                      </button>
                      {activeFAQ === index && (
                        <div className="mt-2 text-gray-600 text-sm md:text-base leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;
