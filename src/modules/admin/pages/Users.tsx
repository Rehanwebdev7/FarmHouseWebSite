import React, { useState } from "react";
import { Users, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useBookingStore, { type Customer } from "@/app/bookingStore";
import { toast } from "sonner";

export const AdminUsers: React.FC = () => {
  const { customers, bookings, slots, updateBookingStatus } = useBookingStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Customer dossier detail modal state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Cancellation Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelReasonText, setCancelReasonText] = useState("");

  // Filter customers by search term
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const handleCancelBookingClick = (id: string) => {
    setCancelTargetId(id);
    setCancelReasonText("");
    setShowCancelModal(true);
  };

  const handleExecuteCancellation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReasonText.trim()) {
      toast.error("Reason Required", {
        description: "Please specify why this booking is being cancelled.",
      });
      return;
    }
    if (cancelTargetId) {
      updateBookingStatus(cancelTargetId, "cancelled", undefined, cancelReasonText);
      toast.error("Booking Revoked", {
        description: `Reservation cancelled. Reason: "${cancelReasonText}"`,
      });
      setShowCancelModal(false);
      setCancelTargetId(null);
      setCancelReasonText("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2 bg-obsidian border border-gold/15 px-3 py-1.5 rounded w-max">
          <Users className="w-4 h-4 text-gold" />
          <span className="text-[10px] uppercase tracking-widest text-gold font-sans font-semibold">
            Directory Module
          </span>
        </div>
        <h1 className="text-3xl font-serif text-chalk tracking-tight uppercase">
          Customer Directory
        </h1>
      </div>

      <p className="hidden md:block text-xs text-platinum/60 max-w-xl font-light font-sans leading-relaxed">
        Verify registered customer profiles, mobile verification credentials, reservation counts, and overall lifetime transaction values. Click a customer to view and manage their stays history.
      </p>

      {/* Customer table card */}
      <div className="md:luxury-card md:rounded-xl md:bg-obsidian/60 md:border md:border-white/5 md:p-6 p-0 space-y-4 bg-transparent border-none">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-platinum/30" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer by name or phone..."
            className="w-full bg-midnight border border-white/10 rounded-sm px-4 py-2 pl-9 text-xs text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
          />
        </div>

        {/* Data Table */}
        <div className="hidden md:block overflow-x-auto border border-white/5 rounded">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-midnight border-b border-white/5 text-[9px] uppercase tracking-widest text-platinum/40">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Mobile Number</th>
                <th className="p-4 text-center">Lifetime Bookings</th>
                <th className="p-4 text-right">Total Expenditure</th>
                <th className="p-4 text-center">Guest Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-obsidian/20 text-platinum/90">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-platinum/40 italic font-light">
                    No customers found matching search parameters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  // Calculate statistics relative to this customer
                  const customerBookings = bookings.filter(
                    (b) => b.customerPhone === customer.phone
                  );
                  const nonCancelled = customerBookings.filter(
                    (b) => b.bookingStatus !== "cancelled"
                  );
                  const totalSpent = nonCancelled.reduce((sum, b) => sum + b.totalAmount, 0);
                  const bookingsCount = customerBookings.length;
                  
                  // Tiering
                  const tier = 
                    bookingsCount >= 5 ? "Obsidian VIP" :
                    bookingsCount >= 2 ? "Gold Elite" :
                    "Standard Guest";

                  return (
                    <tr 
                      key={customer.phone} 
                      onClick={() => setSelectedCustomer(customer)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-serif text-sm font-medium text-chalk">
                        {customer.name}
                      </td>
                      <td className="p-4 text-platinum/80">
                        {customer.phone}
                      </td>
                      <td className="p-4 text-center font-light text-sm">
                        {bookingsCount}
                      </td>
                      <td className="p-4 text-right font-serif text-sm text-gold">
                        ₹{totalSpent.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-semibold ${
                          tier === "Obsidian VIP" ? "bg-azure/10 border border-azure/20 text-azure" :
                          tier === "Gold Elite" ? "bg-gold/10 border border-gold/20 text-gold" :
                          "bg-white/5 text-platinum/50"
                        }`}>
                          {tier}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Customer Cards */}
        <div className="block md:hidden space-y-4">
          {filteredCustomers.length === 0 ? (
            <div className="py-8 text-center text-platinum/40 italic font-sans text-xs">
              No customers found matching search parameters.
            </div>
          ) : (
            filteredCustomers.map((customer) => {
              const customerBookings = bookings.filter(
                (b) => b.customerPhone === customer.phone
              );
              const nonCancelled = customerBookings.filter(
                (b) => b.bookingStatus !== "cancelled"
              );
              const totalSpent = nonCancelled.reduce((sum, b) => sum + b.totalAmount, 0);
              const bookingsCount = customerBookings.length;
              const tier = 
                bookingsCount >= 5 ? "Obsidian VIP" :
                bookingsCount >= 2 ? "Gold Elite" :
                "Standard Guest";

              return (
                <div
                  key={customer.phone}
                  onClick={() => setSelectedCustomer(customer)}
                  className="luxury-card bg-obsidian/85 backdrop-blur-md border border-white/5 rounded-xl p-5 space-y-4 shadow-xl active:bg-white/[0.03] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="font-serif text-chalk text-base font-light">{customer.name}</h4>
                      <span className="block text-xs text-platinum/50">{customer.phone}</span>
                    </div>
                    <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-semibold ${
                      tier === "Obsidian VIP" ? "bg-azure/10 border border-azure/20 text-azure" :
                      tier === "Gold Elite" ? "bg-gold/10 border border-gold/20 text-gold" :
                      "bg-white/5 text-platinum/50"
                    }`}>
                      {tier}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3 text-[10px] text-platinum/60">
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest text-platinum/40 mb-0.5 font-sans">Lifetime Stays</span>
                      <strong className="text-chalk text-xs font-semibold">{bookingsCount} Bookings</strong>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest text-platinum/40 mb-0.5 font-sans">Total Spent</span>
                      <strong className="text-gold text-xs font-semibold font-serif">₹{totalSpent.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Customer Bookings Details Overlay */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-obsidian border border-white/10 p-6 md:p-8 rounded-xl shadow-2xl relative max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCustomer(null)}
                className="absolute top-4 right-4 text-platinum/50 hover:text-red-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6 text-left">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-gold font-sans font-semibold">
                    Guest Dossier
                  </span>
                  <h3 className="font-serif text-2xl text-chalk uppercase">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-platinum/50 font-sans font-light">
                    Mobile: {selectedCustomer.phone}
                  </p>
                </div>

                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                  <h4 className="text-[10px] uppercase tracking-widest text-platinum/40 font-semibold border-b border-white/5 pb-2">
                    Stay History &amp; Bookings
                  </h4>
                  {bookings.filter(b => b.customerPhone === selectedCustomer.phone).length === 0 ? (
                    <p className="text-xs text-platinum/40 italic font-light">No bookings found for this customer.</p>
                  ) : (
                    bookings.filter(b => b.customerPhone === selectedCustomer.phone).map((booking) => {
                      const slot = slots.find(s => s.id === booking.slotId);
                      return (
                        <div key={booking.id} className="p-4 bg-midnight/65 border border-white/5 rounded-lg space-y-3 font-sans text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="block text-[8px] text-platinum/40 uppercase tracking-wide">Date / Session</span>
                              <strong className="text-chalk font-serif text-[13px] font-light">{booking.date}</strong>
                              <span className="block text-[10px] text-gold uppercase tracking-wider font-semibold mt-0.5">{slot?.name || "Session Details"}</span>
                            </div>
                            <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-semibold ${
                              booking.bookingStatus === "completed" ? "bg-white/10 text-white" :
                              booking.bookingStatus === "cancelled" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              "bg-gold/15 text-gold border border-gold/25"
                            }`}>
                              {booking.bookingStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 border-t border-b border-white/5 py-2.5 text-[10px] text-platinum/60">
                            <div>
                              <span className="block text-[8px] uppercase tracking-widest text-platinum/40 mb-0.5">Guests</span>
                              <strong className="text-chalk">{booking.membersCount} Members</strong>
                            </div>
                            <div>
                              <span className="block text-[8px] uppercase tracking-widest text-platinum/40 mb-0.5">Total Paid</span>
                              <strong className="text-gold">₹{booking.totalAmount}</strong>
                            </div>
                            <div>
                              <span className="block text-[8px] uppercase tracking-widest text-platinum/40 mb-0.5">Outstanding</span>
                              <strong className="text-red-400">₹{booking.bookingStatus === "cancelled" ? 0 : booking.remainingAmount}</strong>
                            </div>
                          </div>

                          {booking.bookingStatus === "confirmed" && (
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => handleCancelBookingClick(booking.id)}
                                className="px-3 py-1.5 bg-red-500/15 border border-red-500/20 hover:bg-red-500/25 text-red-400 text-[9px] uppercase tracking-widest rounded font-semibold transition-colors cursor-pointer"
                              >
                                Cancel Stay
                              </button>
                            </div>
                          )}
                          
                          {booking.bookingStatus === "cancelled" && booking.cancellationReason && (
                            <div className="pt-1.5 text-[10px] border-t border-white/5 mt-1 text-left">
                              <span className="text-red-400/60 block uppercase text-[8px] tracking-wide">Cancellation Reason:</span>
                              <p className="text-platinum/50 italic mt-0.5">"{booking.cancellationReason}"</p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancellation Confirmation & Reason Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-obsidian border border-white/10 p-6 rounded-xl shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelTargetId(null);
                  setCancelReasonText("");
                }}
                className="absolute top-4 right-4 text-platinum/50 hover:text-red-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleExecuteCancellation} className="space-y-4 text-left font-sans text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-red-400 font-semibold">
                    Warning Node
                  </span>
                  <h3 className="font-serif text-xl text-chalk uppercase">
                    Confirm Cancellation
                  </h3>
                  <p className="text-[11px] text-platinum/50 leading-relaxed font-light">
                    Are you sure you want to cancel this farmhouse booking? This session slot will be immediately freed for other guests. Advance payment is non-refundable.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[8px] uppercase tracking-widest text-platinum/40 font-semibold">
                    Reason for Cancellation (Required)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={cancelReasonText}
                    onChange={(e) => setCancelReasonText(e.target.value)}
                    placeholder="e.g., Guest requested cancellation / bad weather / staff adjustment..."
                    className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-red-500 transition-colors font-sans text-xs resize-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelTargetId(null);
                      setCancelReasonText("");
                    }}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-platinum text-[10px] uppercase tracking-widest rounded transition-colors cursor-pointer"
                  >
                    No, Keep Booking
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-red-500/15 border border-red-500/20 hover:bg-red-500/25 text-red-400 text-[10px] uppercase tracking-widest rounded font-semibold transition-colors cursor-pointer"
                  >
                    Yes, Cancel Stay
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
