"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, ArrowRight, Users, Clock } from "lucide-react"
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

  const activeCampaign = campaigns.find(c => c.is_registration_open)
  const campaign = activeCampaign || campaigns[0]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/ifehl-logo-new.png" 
                alt="IfEHL" 
                className="h-10 sm:h-12 w-auto object-contain" 
              />
              <div className="text-purple-800 font-bold text-xs sm:text-sm leading-tight hidden sm:block">
                <div>INSTITUTE FOR EXCELLENCE IN</div>
                <div>HEALTHCARE AND LEADERSHIP</div>
              </div>
            </div>
            <Link
              href="/admin"
              className="text-sm text-gray-500 hover:text-purple-700 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-green-800"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
        <div className="relative container mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-white/90 text-sm font-medium">Registration Open</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4 tracking-tight">
            IfEHL <span className="text-green-300">2025</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto">
            Building the next generation of Christian healthcare leaders
          </p>
        </div>
      </section>

      {/* Campaign Section */}
      <main className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Register for the Next Cohort</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent"></div>
          </div>
        ) : !campaign ? (
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Cohorts</h3>
            <p className="text-gray-500">
              Registration for the next cohort opens soon. Check back later.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Link
              href={`/campaigns/${campaign.slug}`}
              className="group block bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Banner */}
              <div className="relative h-56 sm:h-72 overflow-hidden">
                {campaign.banner_image_url ? (
                  <img 
                    src={campaign.banner_image_url} 
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-purple-700 to-green-600"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  {campaign.logo_image_url && (
                    <img 
                      src={campaign.logo_image_url} 
                      alt={campaign.title}
                      className="h-14 w-auto bg-white rounded-xl p-1.5 shadow-lg" 
                    />
                  )}
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    campaign.is_registration_open 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {campaign.is_registration_open ? 'Registration Open' : 'Closed'}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                  {campaign.title}
                </h3>
                {campaign.subtitle && (
                  <p className="text-gray-500 mb-6">{campaign.subtitle}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Date</p>
                      <p className="text-sm font-medium">
                        {new Date(campaign.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' - '}
                        {new Date(campaign.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Venue</p>
                      <p className="text-sm font-medium truncate">{campaign.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Fee</p>
                      <p className="text-sm font-medium text-purple-700">
                        ₦{Number(campaign.registration_fee).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <p className="text-gray-400 text-sm">Click anywhere to register</p>
                  <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                    Register Now <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/ifehl-logo-new.png" 
                alt="IfEHL" 
                className="h-8 w-auto object-contain" 
              />
              <span className="text-gray-400 text-sm">
                © {new Date().getFullYear()} IfEHL. All rights reserved.
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Institute for Excellence In Healthcare and Leadership
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
