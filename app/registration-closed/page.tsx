"use client"

import Link from "next/link"
import { Mail, Calendar, Clock, Frown } from "lucide-react"
import { Button } from "../../components/ui/button"

export default function RegistrationClosedPage() {
  const handleContactClick = () => {
    const subject = encodeURIComponent("IFEHL 2025 Registration Inquiry")
    const body = encodeURIComponent(`Dear IFEHL Team,

I am writing to inquire about the IFEHL 2025 registration. I noticed that the registration period has closed, but I am very interested in participating in this event.

Could you please let me know if there are any possibilities for late registration or if I can be added to a waiting list?

Thank you for your time and consideration.

Best regards,
[Your Name]
[Your Email]
[Your Phone Number]`)
    
    window.location.href = `mailto:ifehl@cmdanigeria.org?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-center items-center">
        <div className="flex items-center gap-4">
          <img 
            src="/ifehl-logo-new.png" 
            alt="IfEHL Logo" 
            className="h-16 sm:h-20 md:h-24 w-auto object-contain" 
          />
          <div className="text-purple-800 font-bold text-sm sm:text-base leading-tight">
            <div>INSTITUTE FOR EXCELLENCE IN</div>
            <div>HEALTHCARE AND LEADERSHIP</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Oops Icon */}
          <div className="mb-8 animate-bounce">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-orange-100 rounded-full mb-4 border-4 border-orange-300">
              <Frown className="h-14 w-14 text-orange-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-2">Oops!</h1>
            <h2 className="text-3xl font-semibold text-orange-600">Registration is Closed</h2>
          </div>

          {/* Message */}
          <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border-t-4 border-orange-500">
            <div className="flex items-center justify-center mb-6">
              <Clock className="h-8 w-8 text-red-500 mr-3" />
              <span className="text-xl font-medium text-red-600">Registration Period Ended</span>
            </div>
            
            <p className="text-gray-700 text-xl mb-6 leading-relaxed">
              Unfortunately, the registration period for <strong>IFEHL 2025</strong> has ended. 
              We're sorry you missed the deadline, but don't worry - we might still be able to help!
            </p>

            {/* Event Details Reminder */}
            <div className="bg-gray-50 rounded-md p-6 mb-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Event Details</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span><strong>Date:</strong> 7-14th June, 2025</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 text-purple-600 flex items-center justify-center">
                    📍
                  </div>
                  <span><strong>Venue:</strong> RIMAD #5 Robert Institute Street (RIMAD), Satellite Town, Calabar, Nigeria</span>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-4">
              <p className="text-gray-600 text-lg mb-4">
                Still interested in attending? Contact our office - there might be limited spots available or you could be added to our waiting list for future events.
              </p>
              
              <Button 
                onClick={handleContactClick}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-medium rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                size="lg"
              >
                <Mail className="h-6 w-6 mr-2" />
                Contact Us via Email
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                This will open your email client with a message to <strong>ifehl@cmdanigeria.org</strong>
              </p>
            </div>
          </div>

          {/* Return to Home */}
          <div className="mt-8">
            <Link href="/" className="text-purple-600 hover:text-purple-800 underline font-medium">
              Return to Homepage
            </Link>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Stay Connected</h3>
            <p className="text-blue-700 mb-4">
              Don't miss out on future IfEHL events and programs. Follow us on social media and subscribe to our newsletter for updates.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="https://facebook.com" className="text-blue-600 hover:text-blue-800">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  f
                </div>
              </Link>
              <Link href="https://instagram.com" className="text-pink-600 hover:text-pink-800">
                <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white">
                  📷
                </div>
              </Link>
              <Link href="https://twitter.com" className="text-blue-400 hover:text-blue-600">
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white">
                  🐦
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} IfEHL. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            For inquiries: ifehl@cmdanigeria.org | Phone: 08091533339
          </p>
        </div>
      </footer>
    </div>
  )
}
