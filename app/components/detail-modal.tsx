"use client"

import { Dialog } from "@/components/ui/dialog"
import { X } from "lucide-react"

type DetailModalProps = {
  registration: any
  isOpen: boolean
  onClose: () => void
  onUpdatePayment: (status: string, reference?: string) => void
}

export default function DetailModal({ registration, isOpen, onClose, onUpdatePayment }: DetailModalProps) {
  if (!registration) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-xl font-semibold">Registration Details</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Personal Information</h4>              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">
                    {registration.first_name} 
                    {registration.middle_name ? `${registration.middle_name} ` : ''}
                    {registration.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{registration.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{registration.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Alternative Phone</p>
                  <p className="font-medium">{registration.alt_phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium">{registration.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium">{new Date(registration.dob).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Marital Status</p>
                  <p className="font-medium">{registration.marital_status || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Professional Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Institute</p>
                  <p className="font-medium">{registration.institute || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Professional Status</p>
                  <p className="font-medium">{registration.professional_status || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Workplace</p>
                  <p className="font-medium">{registration.workplace || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Registration Status */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Registration Status</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-medium ${
                    registration.status === "approved" ? "text-green-600" : "text-yellow-600"
                  }`}>
                    {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <p className={`font-medium ${
                    registration.payment_status === "paid" ? "text-green-600" : "text-red-600"
                  }`}>
                    {registration.payment_status.charAt(0).toUpperCase() + registration.payment_status.slice(1)}
                  </p>
                </div>
                {registration.payment_reference && (
                  <div>
                    <p className="text-sm text-gray-600">Payment Reference</p>
                    <p className="font-medium">{registration.payment_reference}</p>
                  </div>
                )}
                {registration.payment_date && (
                  <div>
                    <p className="text-sm text-gray-600">Payment Date</p>
                    <p className="font-medium">{new Date(registration.payment_date).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Actions */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Payment Actions</h4>
              <div className="flex gap-4">
                <button
                  onClick={() => onUpdatePayment("paid")}
                  disabled={registration.payment_status === "paid"}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Mark as Paid
                </button>
                <button
                  onClick={() => onUpdatePayment("unpaid")}
                  disabled={registration.payment_status === "unpaid"}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Mark as Unpaid
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
