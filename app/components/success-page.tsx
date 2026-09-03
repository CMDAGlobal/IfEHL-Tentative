"use client"

import Link from "next/link"
import { Check, ArrowLeft, MessageCircle } from "lucide-react"

type SuccessPageProps = {
  registrationId: number
  participantName: string
  email: string
  onClose: () => void
}

export default function SuccessPage({ registrationId, participantName, email, onClose }: SuccessPageProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white max-w-2xl w-full rounded-lg shadow-xl p-2 sm:p-4 md:p-8 my-4 flex flex-col">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <Check className="h-16 w-16 text-green-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 max-w-md text-sm sm:text-base">
            Thank you for registering for IFEHL 2025. Your registration has been received.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 w-full overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Registration Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Personal Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration ID:</span>
                  <span className="font-semibold">{registrationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">{participantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-right">{email}</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Event Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event Date:</span>
                  <span className="font-semibold">7-14th June, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Venue:</span>
                  <span className="font-semibold">Calabar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration Fee:</span>
                  <span className="font-semibold">₦50,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 w-full">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong className="font-medium">Important:</strong> Please complete your registration by making a payment 
                of ₦50,000 to validate your submission.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                <strong className="font-medium">Account Details:</strong><br />
                Account Name: Christian Medical and Dental Association of Nigeria<br />
                Account Number: 1018339742<br />
                Bank: UBA
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://chat.whatsapp.com/DA2iIYHr332EMknkfoWyIr?mode=gi_t"
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            <MessageCircle size={16} />
            Join WhatsApp Group
          </a>
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Return to Registration
          </button>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-700">
            <strong>After payment, kindly send your payment receipt to <span className="text-purple-700">08091533339</span> on WhatsApp for confirmation.</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
