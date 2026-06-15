import React, { useState, useEffect } from "react";
import { 
  CalendarDays, Search, RefreshCw, Check, X,
  Plus, Calendar as CalendarIcon, CreditCard,
  CheckCircle2, IndianRupee, Phone, User, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useBookingStore, { type Booking } from "@/app/bookingStore";
import { toast } from "sonner";

export const Bookings: React.FC = () => {
  const { bookings, slots, addBooking, updateBookingStatus } = useBookingStore();
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Manual Booking Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualSlotId, setManualSlotId] = useState("");
  const [manualGuests, setManualGuests] = useState<number | string>(10);
  const [manualPaymentStatus, setManualPaymentStatus] = useState<"advance_paid" | "fully_paid">("advance_paid");

  // Mobile Details Drawer State
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);

  // Mobile Filter Drawer/Collapsible state
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // FAB animation state
  const [isFabExpanded, setIsFabExpanded] = useState(true);

  // Cancellation Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelReasonText, setCancelReasonText] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFabExpanded(prev => !prev);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Status handlers
  const handleMarkPaid = (id: string) => {
    updateBookingStatus(id, "confirmed", "fully_paid");
    toast.success("Payment Finalized", {
      description: "Remaining booking balance registered as fully paid.",
    });
    // Update active details drawer if open
    if (selectedBookingDetails && selectedBookingDetails.id === id) {
      setSelectedBookingDetails(prev => prev ? { ...prev, bookingStatus: "confirmed", paymentStatus: "fully_paid", remainingAmount: 0 } : null);
    }
  };

  const handleCompleteStay = (id: string) => {
    updateBookingStatus(id, "completed", "fully_paid");
    toast.success("Sanctuary Session Completed", {
      description: "Guest check-out finalized. Session marked as completed.",
    });
    if (selectedBookingDetails && selectedBookingDetails.id === id) {
      setSelectedBookingDetails(prev => prev ? { ...prev, bookingStatus: "completed", paymentStatus: "fully_paid", remainingAmount: 0 } : null);
    }
  };

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
      if (selectedBookingDetails && selectedBookingDetails.id === cancelTargetId) {
        setSelectedBookingDetails(prev => prev ? { 
          ...prev, 
          bookingStatus: "cancelled", 
          cancellationReason: cancelReasonText 
        } : null);
      }
      setShowCancelModal(false);
      setCancelTargetId(null);
      setCancelReasonText("");
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = 
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerPhone.includes(searchTerm);
      
    const matchesDate = selectedDate ? b.date === selectedDate : true;
    
    const matchesStatus = 
      statusFilter === "all" ? true :
      statusFilter === "pending" ? b.bookingStatus === "confirmed" && b.paymentStatus === "advance_paid" :
      statusFilter === "confirmed" ? b.bookingStatus === "confirmed" && b.paymentStatus === "fully_paid" :
      b.bookingStatus === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Calculate availability for manual booking picker
  const getSlotAvailabilityForDate = (slotId: string, date: string) => {
    const isBooked = bookings.some(
      (b) => b.date === date && b.slotId === slotId && b.bookingStatus !== "cancelled"
    );
    return isBooked ? "booked" : "available";
  };

  // Calculate pricing for manual modal
  const selectedSlot = slots.find((s) => s.id === manualSlotId);
  const calculateManualPricing = () => {
    if (!selectedSlot) return { base: 0, extra: 0, total: 0, advance: 0 };
    const base = selectedSlot.basePrice;
    const limit = selectedSlot.baseCapacity;
    const extraCharge = selectedSlot.extraMemberCharge;
    const advance = selectedSlot.advanceAmount;

    let extra = 0;
    const guestsNum = Number(manualGuests) || 0;
    if (guestsNum > limit) {
      extra = (guestsNum - limit) * extraCharge;
    }
    const total = base + extra;
    return { base, extra, total, advance };
  };

  const pricing = calculateManualPricing();

  const handleManualBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) {
      toast.error("Incomplete Fields", {
        description: "Please enter guest name and mobile phone number.",
      });
      return;
    }
    if (!manualSlotId) {
      toast.error("Select Session Slot", {
        description: "Please select an available session slot.",
      });
      return;
    }
    if (!manualGuests || Number(manualGuests) < 1) {
      toast.error("Invalid Guests", {
        description: "Group capacity must be at least 1 guest.",
      });
      return;
    }

    // Double check availability
    if (getSlotAvailabilityForDate(manualSlotId, manualDate) === "booked") {
      toast.error("Slot Unavailable", {
        description: "This slot is already booked for the selected date.",
      });
      return;
    }

    const bookingData = {
      date: manualDate,
      slotId: manualSlotId,
      customerName: manualName,
      customerPhone: manualPhone,
      membersCount: Number(manualGuests),
      totalAmount: pricing.total,
      advanceAmount: pricing.advance,
      remainingAmount: manualPaymentStatus === "fully_paid" ? 0 : pricing.total - pricing.advance,
      paymentStatus: manualPaymentStatus,
      bookingStatus: "confirmed" as const,
    };

    addBooking(bookingData);
    
    // Reset manual form states
    setManualName("");
    setManualPhone("");
    setManualSlotId("");
    setManualGuests(10);
    setManualPaymentStatus("advance_paid");
    setShowManualModal(false);

    toast.success("Manual Stay Booked", {
      description: `Stay for "${bookingData.customerName}" successfully logged.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Upper Status Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 bg-obsidian border border-gold/15 px-3 py-1.5 rounded w-max">
            <CalendarDays className="w-4 h-4 text-gold" />
            <span className="text-[10px] uppercase tracking-widest text-gold font-sans font-semibold">
              Control Panel
            </span>
          </div>
          <h1 className="text-3xl font-serif text-chalk tracking-tight uppercase">
            Bookings Manager
          </h1>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="hidden md:flex btn-gold px-5 py-3 rounded-sm uppercase text-xs tracking-widest items-center gap-2 cursor-pointer font-sans"
        >
          <Plus className="w-4 h-4" />
          Book Slot Manually
        </button>
      </div>

      <p className="hidden md:block text-xs text-platinum/60 max-w-xl font-light font-sans leading-relaxed">
        Browse, filter, and track all guest stays. Register manual phone bookings, collect pending balances, process checkouts, and execute cancellations.
      </p>

      {/* Bookings Data Grid Panel */}
      <div className="md:luxury-card md:rounded-xl md:bg-obsidian/60 md:border md:border-white/5 md:p-6 p-0 space-y-4 bg-transparent border-none">
        
        {/* Desktop Filters and search layout */}
        <div className="hidden md:flex flex-row gap-4 items-center justify-between font-sans text-xs">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-platinum/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search guest name or phone..."
              className="w-full bg-midnight border border-white/10 rounded-sm px-4 py-2 pl-9 text-xs text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
            />
          </div>

          {/* Selector filters */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
            {/* Date Picker */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-midnight border border-white/10 rounded-sm px-3 py-2 text-xs text-chalk focus:outline-none focus:border-gold transition-colors font-sans cursor-pointer"
              />
            </div>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-midnight border border-white/10 rounded-sm px-3 py-2 text-xs text-chalk focus:outline-none focus:border-gold transition-colors font-sans cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Balance (Deposit Paid)</option>
              <option value="confirmed">Confirmed (Fully Paid)</option>
              <option value="completed">Completed Stays</option>
              <option value="cancelled">Cancelled Bookings</option>
            </select>

            {/* Reset */}
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDate("");
                setStatusFilter("all");
              }}
              className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/5 transition-colors text-platinum/70 cursor-pointer"
              title="Reset Filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Filters and Search */}
        <div className="md:hidden flex gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-platinum/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search guest name or phone..."
              className="w-full bg-midnight border border-white/10 rounded px-3 py-2 pl-9 text-xs text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
            />
          </div>
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className={`p-2 rounded border transition-all cursor-pointer ${
              showFiltersMobile 
                ? "bg-gold/15 border-gold text-gold" 
                : "bg-midnight border-white/10 text-platinum/60"
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Collapsible Mobile Filters */}
        <AnimatePresence>
          {showFiltersMobile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden space-y-3 pt-2"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-[8px] uppercase tracking-widest text-platinum/40 font-semibold">Select Date</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-xs text-chalk focus:outline-none focus:border-gold transition-colors font-sans cursor-pointer animate-none"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-[8px] uppercase tracking-widest text-platinum/40 font-semibold">Select Status</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-xs text-chalk focus:outline-none focus:border-gold transition-colors font-sans cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending Balance (Deposit Paid)</option>
                    <option value="confirmed">Confirmed (Fully Paid)</option>
                    <option value="completed">Completed Stays</option>
                    <option value="cancelled">Cancelled Bookings</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDate("");
                    setStatusFilter("all");
                    setShowFiltersMobile(false);
                  }}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-[10px] uppercase tracking-widest font-semibold transition-colors text-platinum/70 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Data Table */}
        <div className="hidden md:block overflow-x-auto border border-white/5 rounded">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-midnight border-b border-white/5 text-[9px] uppercase tracking-widest text-platinum/40">
                <th className="p-4 text-center w-24">Actions</th>
                <th className="p-4">Guest Info</th>
                <th className="p-4">Schedule Date</th>
                <th className="p-4">Target Session Slot</th>
                <th className="p-4 text-center">Group Size</th>
                <th className="p-4 text-right">Invoice / Status</th>
                <th className="p-4 text-right">Outstanding Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-obsidian/20 text-platinum/90">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-platinum/40 italic font-light">
                    No matching bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const slotDetail = slots.find((s) => s.id === booking.slotId);

                  return (
                    <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                      
                      {/* Administrative triggers in Column 1 (Leftmost) */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2.5">
                          {booking.bookingStatus === "cancelled" ? (
                            <span className="text-[9px] text-red-500/50 uppercase font-semibold">Cancelled</span>
                          ) : booking.bookingStatus === "completed" ? (
                            <span className="text-[9px] text-azure/50 uppercase font-semibold">Completed</span>
                          ) : (
                            <>
                              {/* Record Balance Payment */}
                              {booking.paymentStatus === "advance_paid" && (
                                <button
                                  onClick={() => handleMarkPaid(booking.id)}
                                  className="p-2 bg-azure/10 border border-azure/20 hover:bg-azure/25 text-azure rounded transition-colors cursor-pointer"
                                  title="Record Full Payment"
                                >
                                  <IndianRupee className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Complete Stay / Checkout */}
                              <button
                                onClick={() => handleCompleteStay(booking.id)}
                                className="p-2 bg-gold/15 border border-gold/20 hover:bg-gold/25 text-gold rounded transition-colors cursor-pointer"
                                title="Check Out Guest"
                              >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Cancel Booking */}
                              <button
                                onClick={() => handleCancelBookingClick(booking.id)}
                                className="p-2 bg-red-500/15 border border-red-500/20 hover:bg-red-500/25 text-red-400 rounded transition-colors cursor-pointer"
                                title="Cancel Reservation (Forfeit Deposit)"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Guest Info */}
                      <td className="p-4">
                        <span className="block font-medium text-chalk text-sm">{booking.customerName}</span>
                        <span className="block text-[10px] text-platinum/40">{booking.customerPhone}</span>
                      </td>

                      {/* Date */}
                      <td className="p-4 whitespace-nowrap font-serif text-sm">
                        {booking.date}
                      </td>

                      {/* Session */}
                      <td className="p-4">
                        <span className="block text-[11px] text-platinum/90 font-medium">
                          {slotDetail?.name || "Unknown Session"}
                        </span>
                        <span className="block text-[9px] text-gold uppercase tracking-wider font-semibold">
                          {slotDetail?.timeRange}
                        </span>
                      </td>

                      {/* Group Size */}
                      <td className="p-4 text-center text-sm font-light">
                        {booking.membersCount}
                      </td>

                      {/* Pricing / Payments */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <span className="block text-sm font-serif text-chalk">
                          ₹{booking.totalAmount}
                        </span>
                        <div className="flex justify-end gap-1 mt-1">
                          <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-semibold ${
                            booking.paymentStatus === "fully_paid"
                              ? "bg-azure/10 border border-azure/20 text-azure"
                              : "bg-gold/10 border border-gold/20 text-gold"
                          }`}>
                            {booking.paymentStatus === "fully_paid" ? "Fully Paid" : "Deposit Paid"}
                          </span>
                        </div>
                      </td>

                      {/* Remaining Balance */}
                      <td className="p-4 text-right whitespace-nowrap">
                        {booking.bookingStatus === "cancelled" ? (
                          <span className="text-red-400/50 line-through">₹0</span>
                        ) : booking.remainingAmount === 0 ? (
                          <span className="text-azure flex items-center justify-end gap-1 font-semibold">
                            <Check className="w-3.5 h-3.5" /> ₹0
                          </span>
                        ) : (
                          <span className="text-red-400 font-semibold font-serif text-sm">
                            ₹{booking.remainingAmount}
                          </span>
                        )}
                        <span className="block text-[8px] text-platinum/40 uppercase mt-0.5">
                          Deposit: ₹{booking.advanceAmount}
                        </span>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards Layout */}
        <div className="block md:hidden space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="py-8 text-center text-platinum/40 italic font-sans text-xs">
              No matching bookings found.
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const slotDetail = slots.find((s) => s.id === booking.slotId);
              return (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBookingDetails(booking)}
                  className="luxury-card bg-obsidian/80 backdrop-blur-md border border-white/5 rounded-xl p-5 space-y-4 shadow-xl active:bg-white/[0.03] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-platinum/40 block">REF: #{booking.id.replace("book-", "").toUpperCase()}</span>
                      <h4 className="font-serif text-chalk text-base font-light">{booking.customerName}</h4>
                      <span className="block text-[10px] text-gold uppercase tracking-wider font-semibold">{slotDetail?.name}</span>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-semibold ${
                        booking.bookingStatus === "completed" ? "bg-white/10 text-white" :
                        booking.bookingStatus === "cancelled" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        "bg-gold/15 text-gold border border-gold/25"
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-b border-white/5 py-3 text-[10px] text-platinum/60">
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest text-platinum/40 mb-0.5">Date</span>
                      <strong className="text-chalk text-[11px]">{booking.date}</strong>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest text-platinum/40 mb-0.5">Guests</span>
                      <strong className="text-chalk text-[11px]">{booking.membersCount} Guests</strong>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest text-platinum/40 mb-0.5">Total Bill</span>
                      <strong className="text-gold text-[11px]">₹{booking.totalAmount}</strong>
                    </div>
                  </div>

                  {/* Actions inline for quick touch trigger */}
                  <div className="flex justify-between items-center pt-1" onClick={(e) => e.stopPropagation()}>
                    <div className="text-[10px]">
                      <span className="text-platinum/40 block uppercase text-[8px] tracking-wider mb-0.5">Outstanding</span>
                      {booking.bookingStatus === "cancelled" ? (
                        <span className="text-red-400/50 line-through text-xs font-semibold">₹0</span>
                      ) : booking.remainingAmount === 0 ? (
                        <span className="text-azure flex items-center gap-0.5 text-xs font-semibold">
                          <Check className="w-3.5 h-3.5" /> Paid
                        </span>
                      ) : (
                        <span className="text-red-400 font-semibold font-serif text-sm">
                          ₹{booking.remainingAmount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {booking.bookingStatus !== "cancelled" && booking.bookingStatus !== "completed" && (
                        <>
                          {booking.paymentStatus === "advance_paid" && (
                            <button
                              onClick={() => handleMarkPaid(booking.id)}
                              className="p-2 bg-azure/10 border border-azure/20 hover:bg-azure/25 text-azure rounded cursor-pointer"
                              title="Record Payment"
                            >
                              <IndianRupee className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleCompleteStay(booking.id)}
                            className="p-2 bg-gold/15 border border-gold/20 hover:bg-gold/25 text-gold rounded cursor-pointer"
                            title="Complete check out"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCancelBookingClick(booking.id)}
                            className="p-2 bg-red-500/15 border border-red-500/20 hover:bg-red-500/25 text-red-400 rounded cursor-pointer"
                            title="Cancel Stay"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Mobile details drawer overlay */}
      <AnimatePresence>
        {selectedBookingDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center lg:hidden"
            onClick={() => setSelectedBookingDetails(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full bg-obsidian border-t border-white/10 p-6 rounded-t-2xl shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-platinum/40 block">REF ID: #{selectedBookingDetails.id.replace("book-", "").toUpperCase()}</span>
                  <h3 className="font-serif text-2xl text-chalk uppercase tracking-wide">
                    Booking Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedBookingDetails(null)}
                  className="p-1 text-platinum/40 hover:text-white rounded-full bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid content */}
              <div className="space-y-4 font-sans text-xs">
                {/* Guest Card */}
                <div className="bg-midnight/50 p-4 rounded border border-white/5 space-y-2">
                  <div className="flex items-center space-x-2 text-gold">
                    <User className="w-4 h-4" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Guest Information</span>
                  </div>
                  <p className="text-sm text-chalk font-medium">{selectedBookingDetails.customerName}</p>
                  <p className="text-platinum/50 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-platinum/30" />
                    {selectedBookingDetails.customerPhone}
                  </p>
                </div>

                {/* Stay coordinates */}
                <div className="bg-midnight/50 p-4 rounded border border-white/5 space-y-2">
                  <div className="flex items-center space-x-2 text-gold">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Stay Schedule</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] text-platinum/40 uppercase block">Selected Date</span>
                      <strong className="text-chalk text-sm font-serif font-light">{selectedBookingDetails.date}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-platinum/40 uppercase block">Time Session</span>
                      <strong className="text-chalk block">{slots.find(s => s.id === selectedBookingDetails.slotId)?.name || "Session Details"}</strong>
                      <span className="text-[10px] text-gold font-semibold uppercase">{slots.find(s => s.id === selectedBookingDetails.slotId)?.timeRange}</span>
                    </div>
                  </div>
                </div>

                {/* Financial breakdown */}
                <div className="bg-midnight/50 p-4 rounded border border-white/5 space-y-3">
                  <div className="flex items-center space-x-2 text-gold">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Financial Summary</span>
                  </div>
                  <div className="space-y-1.5 border-b border-white/5 pb-2.5 text-platinum/60">
                    <div className="flex justify-between">
                      <span>Total Invoice</span>
                      <strong className="text-chalk">₹{selectedBookingDetails.totalAmount}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Advance Deposit Paid</span>
                      <strong className="text-chalk text-azure">₹{selectedBookingDetails.advanceAmount}</strong>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-chalk">Outstanding Balance</span>
                    <span className="font-serif text-red-400 text-lg">
                      {selectedBookingDetails.bookingStatus === "cancelled" ? "₹0" : `₹${selectedBookingDetails.remainingAmount}`}
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex gap-2">
                  <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded font-semibold ${
                    selectedBookingDetails.paymentStatus === "fully_paid"
                      ? "bg-azure/10 border border-azure/20 text-azure"
                      : "bg-gold/10 border border-gold/20 text-gold"
                  }`}>
                    {selectedBookingDetails.paymentStatus === "fully_paid" ? "Fully Paid" : "Deposit Paid"}
                  </span>
                  <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded font-semibold ${
                    selectedBookingDetails.bookingStatus === "completed" ? "bg-white/10 text-white" :
                    selectedBookingDetails.bookingStatus === "cancelled" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                    "bg-gold/15 text-gold border border-gold/25"
                  }`}>
                    {selectedBookingDetails.bookingStatus}
                  </span>
                </div>

                {/* Cancellation Reason if Cancelled */}
                {selectedBookingDetails.bookingStatus === "cancelled" && selectedBookingDetails.cancellationReason && (
                  <div className="bg-red-500/5 p-4 rounded border border-red-500/20 space-y-1 text-left">
                    <span className="block text-[8px] uppercase tracking-widest text-red-400 font-semibold">Cancellation Reason</span>
                    <p className="text-platinum/80 text-[11px] italic font-light">"{selectedBookingDetails.cancellationReason}"</p>
                  </div>
                )}

                {/* Drawers actions inside modal */}
                {selectedBookingDetails.bookingStatus !== "cancelled" && selectedBookingDetails.bookingStatus !== "completed" && (
                  <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
                    {selectedBookingDetails.paymentStatus === "advance_paid" && (
                      <button
                        onClick={() => handleMarkPaid(selectedBookingDetails.id)}
                        className="btn-gold w-full py-3 text-xs uppercase tracking-widest rounded flex items-center justify-center gap-2 cursor-pointer font-sans"
                      >
                        <IndianRupee className="w-4 h-4" />
                        Record Full Payment
                      </button>
                    )}
                    <button
                      onClick={() => handleCompleteStay(selectedBookingDetails.id)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-chalk text-xs uppercase tracking-widest border border-white/10 rounded flex items-center justify-center gap-2 cursor-pointer font-sans"
                    >
                      <CheckCircle2 className="w-4 h-4 text-gold" />
                      Checkout Guest (Complete Stay)
                    </button>
                    <button
                      onClick={() => handleCancelBookingClick(selectedBookingDetails.id)}
                      className="w-full py-3 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs uppercase tracking-widest border border-red-500/20 rounded flex items-center justify-center gap-2 cursor-pointer font-sans font-semibold"
                    >
                      <X className="w-4 h-4" />
                      Cancel Stay (Forfeit Deposit)
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Booking Wizard Modal */}
      <AnimatePresence>
        {showManualModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-obsidian border border-white/10 p-6 md:p-8 rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowManualModal(false);
                  setManualSlotId("");
                }}
                className="absolute top-4 right-4 text-platinum/50 hover:text-red-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleManualBookingSubmit} className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-gold font-sans font-semibold">
                    Staff Portal Wizard
                  </span>
                  <h3 className="font-serif text-2xl text-chalk uppercase">
                    Manual Session Booking
                  </h3>
                  <p className="text-xs text-platinum/50 font-sans font-light">
                    Register a farmhouse stay directly on behalf of a guest.
                  </p>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  {/* Guest Name */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1.5 font-semibold">
                      Customer/Guest Name
                    </label>
                    <input
                      type="text"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="e.g. Rahul Patil"
                      className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1.5 font-semibold">
                      Registered Mobile Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Date */}
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1.5 font-semibold">
                        Reservation Date
                      </label>
                      <input
                        type="date"
                        required
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-gold transition-colors font-sans cursor-pointer"
                      />
                    </div>

                    {/* Guest Count (sanitized type="text") */}
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1.5 font-semibold">
                        Guest Capacity Count
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={manualGuests}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/\D/g, "");
                          const finalVal = clean.startsWith("0") && clean.length > 1 ? clean.replace(/^0+/, "") : clean;
                          setManualGuests(finalVal === "" ? "" : Number(finalVal));
                        }}
                        className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
                      />
                    </div>
                  </div>

                  {/* Slot selector list */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1.5 font-semibold">
                      Select Target Session
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1">
                      {slots.map((slot) => {
                        const status = getSlotAvailabilityForDate(slot.id, manualDate);
                        const isBooked = status === "booked";
                        const isSelected = manualSlotId === slot.id;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setManualSlotId(slot.id)}
                            className={`w-full p-2.5 rounded border text-left flex justify-between items-center transition-colors cursor-pointer text-[10px] ${
                              isSelected
                                ? "bg-gold/15 border-gold text-gold font-medium"
                                : isBooked
                                ? "bg-black/20 border-white/5 text-platinum/20 cursor-not-allowed"
                                : "bg-midnight/40 border-white/5 text-platinum/70 hover:border-white/20"
                            }`}
                          >
                            <div>
                              <span className="block font-medium">{slot.name}</span>
                              <span className="text-[8px] text-platinum/40">{slot.timeRange}</span>
                            </div>
                            <span className="uppercase text-[8px] tracking-wider">
                              {isBooked ? "Booked" : "Available"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live calculations */}
                  {selectedSlot && (
                    <div className="bg-midnight/60 p-3.5 rounded border border-white/5 space-y-2">
                      <div className="flex justify-between text-[10px] text-platinum/50">
                        <span>Base Price ({selectedSlot.baseCapacity} guests)</span>
                        <span>₹{pricing.base}</span>
                      </div>
                      {pricing.extra > 0 && (
                        <div className="flex justify-between text-[10px] text-platinum/50">
                          <span>Extra Guests (+{Number(manualGuests) - selectedSlot.baseCapacity} x ₹{selectedSlot.extraMemberCharge})</span>
                          <span className="text-gold">+ ₹{pricing.extra}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs font-semibold border-t border-white/5 pt-2 text-chalk">
                        <span>Total Stay Bill</span>
                        <span className="text-gold">₹{pricing.total}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-azure font-medium pt-1">
                        <span>Required Deposit Advance</span>
                        <span>₹{pricing.advance}</span>
                      </div>
                    </div>
                  )}

                  {/* Recorded payment status */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1.5 font-semibold">
                      Payment Collection Status
                    </label>
                    <select
                      value={manualPaymentStatus}
                      onChange={(e) => setManualPaymentStatus(e.target.value as any)}
                      className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-gold transition-colors font-sans cursor-pointer"
                    >
                      <option value="advance_paid">Advance Deposit Paid (₹{pricing.advance})</option>
                      <option value="fully_paid">Fully Paid (₹{pricing.total})</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-white/5 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualModal(false);
                      setManualSlotId("");
                    }}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-platinum text-[10px] uppercase tracking-widest rounded transition-colors font-sans cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-gold px-5 py-2.5 text-[10px] uppercase tracking-widest rounded flex items-center gap-1.5 cursor-pointer font-sans"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Reserve Session
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Action Button (FAB) */}
      <motion.button
        layout
        onClick={() => setShowManualModal(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 btn-gold flex items-center justify-center shadow-2xl cursor-pointer overflow-hidden whitespace-nowrap rounded-full h-12"
        animate={{ width: isFabExpanded ? "120px" : "48px" }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex items-center justify-center">
          <Plus className="w-4.5 h-4.5 shrink-0" />
          <AnimatePresence>
            {isFabExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto", marginLeft: 6 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[9px] uppercase tracking-widest font-bold font-sans overflow-hidden"
              >
                Book
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

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

export default Bookings;
