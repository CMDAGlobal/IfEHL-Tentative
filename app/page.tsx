"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import { fetchPublishedCampaigns } from "./campaigns/actions"
import type { Campaign } from "./campaigns/actions"

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setIsLoading(true)
      const data = await fetchPublishedCampaigns()
      setCampaigns(data)
    } catch (error) {
      console.error("Error loading campaigns:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/ifehl-logo-new.png" 
                alt="IFEHL" 
                className="h-12 sm:h-16 w-auto object-contain" 
              />
              <div className="text-purple-800 font-bold text-sm sm:text-base leading-tight">
                <div>INSTITUTE FOR EXCELLENCE IN</div>
                <div>HEALTHCARE AND LEADERSHIP</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-800 via-purple-700 to-green-700 text-white py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">Event Registration Portal</h2>
          <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
            Register For IFEHL Campaigns
          </p>
        </div>
      </section>

      {/* Campaigns Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Active Events</h3>
          <p className="text-gray-600">Select an event to register</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-lg mx-auto">
            <div className="text-gray-300 mb-6">
              <Calendar className="h-20 w-20 mx-auto" />
            </div>
            <h4 className="text-xl font-semibold text-gray-700 mb-2">No Active Events</h4>
            <p className="text-gray-500">
              There are no events with open registration at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.slug}`}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Campaign Banner */}
                <div className="h-48 relative overflow-hidden">
                  {campaign.banner_image_url ? (
                    <img 
                      src={campaign.banner_image_url} 
                      alt={campaign.title}
                      className="w-full h-full object-contain bg-gradient-to-r from-purple-600 to-green-600"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-600 to-green-600"></div>
                  )}
                  {campaign.logo_image_url && (
                    <img 
                      src={campaign.logo_image_url} 
                      alt={campaign.title}
                      className="absolute bottom-4 left-4 h-12 w-auto bg-white rounded-lg p-1 shadow"
                    />
                  )}
                  {!campaign.is_registration_open && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Registration Closed
                    </div>
                  )}
                  {campaign.is_registration_open && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Open
                    </div>
                  )}
                </div>

                {/* Campaign Info */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                    {campaign.title}
                  </h4>
                  {campaign.subtitle && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.subtitle}</p>
                  )}

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span>
                        {new Date(campaign.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' - '}
                        {new Date(campaign.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span className="truncate">{campaign.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="text-purple-700 font-bold">
                      ₦{Number(campaign.registration_fee).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-purple-600 font-medium group-hover:gap-2 transition-all">
                      Register <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} IfEHL. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
