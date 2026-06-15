import React from "react";
import { 
  LayoutDashboard, Users, 
  IndianRupee, CalendarDays
} from "lucide-react";
import useBookingStore from "@/app/bookingStore";

export const AdminDashboard: React.FC = () => {
  const { bookings, slots } = useBookingStore();
  const todayStr = new Date().toISOString().split("T")[0];

  // Revenue calculations
  const totalRevenue = bookings.reduce((sum, b) => {
    if (b.bookingStatus === "cancelled") {
      return sum + b.advanceAmount; // Forfeited deposit is revenue
    }
    return sum + b.totalAmount;
  }, 0);

  const receivedRevenue = bookings.reduce((sum, b) => {
    if (b.bookingStatus === "cancelled") {
      return sum + b.advanceAmount; // Kept forfeited deposit
    }
    const paid = b.advanceAmount + (b.paymentStatus === "fully_paid" ? b.remainingAmount : 0);
    return sum + paid;
  }, 0);

  const pendingRevenue = totalRevenue - receivedRevenue;
  
  const activeToday = bookings.filter(
    (b) => b.date === todayStr && b.bookingStatus !== "cancelled"
  );
  const activeTodayCount = activeToday.length;

  const totalBookingsCount = bookings.length;

  return (
    <div className="space-y-6">
      {/* Upper Status Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 bg-obsidian border border-gold/15 px-3 py-1.5 rounded w-max">
            <LayoutDashboard className="w-4 h-4 text-gold" />
            <span className="text-[10px] uppercase tracking-widest text-gold font-sans font-semibold">
              Live Console
            </span>
          </div>
          <h1 className="text-3xl font-serif text-chalk tracking-tight uppercase">
            Booking Analytics
          </h1>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* KPI: Total Revenue */}
        <div className="luxury-card p-5 rounded-xl bg-obsidian/40 border border-white/5 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-gold/25"><IndianRupee className="w-8 h-8" /></div>
          <span className="block text-[8px] uppercase tracking-widest text-platinum/40 font-sans font-semibold">Expected Revenue</span>
          <span className="block font-serif text-2xl text-gold mt-2">₹{totalRevenue.toLocaleString()}</span>
          <p className="text-[9px] text-platinum/40 mt-1 font-sans">
            Received: <strong className="text-azure">₹{receivedRevenue.toLocaleString()}</strong>
          </p>
        </div>

        {/* KPI: Balance Pending */}
        <div className="luxury-card p-5 rounded-xl bg-obsidian/40 border border-white/5 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-red-500/25"><IndianRupee className="w-8 h-8" /></div>
          <span className="block text-[8px] uppercase tracking-widest text-platinum/40 font-sans font-semibold">Outstanding Balance</span>
          <span className="block font-serif text-2xl text-red-400 mt-2">₹{pendingRevenue.toLocaleString()}</span>
          <p className="text-[9px] text-platinum/40 mt-1 font-sans">
            Collectable on guest arrivals.
          </p>
        </div>

        {/* KPI: Active Today */}
        <div className="luxury-card p-5 rounded-xl bg-obsidian/40 border border-white/5 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-azure/25"><CalendarDays className="w-8 h-8" /></div>
          <span className="block text-[8px] uppercase tracking-widest text-platinum/40 font-sans font-semibold">Active Sessions Today</span>
          <span className="block font-serif text-2xl text-azure mt-2">{activeTodayCount}</span>
          <p className="text-[9px] text-platinum/40 mt-1 font-sans">
            Date: {todayStr}
          </p>
        </div>

        {/* KPI: Total Bookings */}
        <div className="luxury-card p-5 rounded-xl bg-obsidian/40 border border-white/5 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-gold/25"><Users className="w-8 h-8" /></div>
          <span className="block text-[8px] uppercase tracking-widest text-platinum/40 font-sans font-semibold">Total Registrations</span>
          <span className="block font-serif text-2xl text-chalk mt-2">{totalBookingsCount}</span>
          <p className="text-[9px] text-platinum/40 mt-1 font-sans">
            Active and archived stays.
          </p>
        </div>
      </div>

      {/* Today's Schedule Quick View */}
      <div className="md:luxury-card md:rounded-xl md:bg-obsidian/60 md:border md:border-white/5 md:p-6 p-0 space-y-4 bg-transparent border-none">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
          <CalendarDays className="w-4.5 h-4.5 text-gold" />
          <h3 className="font-serif text-chalk uppercase text-sm tracking-wider">
            Today's Sanctuary Schedule ({todayStr})
          </h3>
        </div>

        {activeToday.length === 0 ? (
          <div className="py-8 text-center text-platinum/40 italic font-sans text-xs">
            No active sessions scheduled for today.
          </div>
        ) : (
          <div className="space-y-4">
            {activeToday.map((booking) => {
              const slotDetail = slots.find((s) => s.id === booking.slotId);
              return (
                <div 
                  key={booking.id} 
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded bg-midnight/50 border border-white/5 gap-3"
                >
                  <div className="space-y-1 font-sans text-xs">
                    <span className="text-[10px] text-platinum/40 block">REF: #{booking.id.replace("book-", "").toUpperCase()}</span>
                    <strong className="text-chalk text-sm font-medium">{booking.customerName}</strong>
                    <span className="text-platinum/60 block">{booking.customerPhone}</span>
                  </div>

                  <div className="space-y-1 text-left sm:text-right font-sans text-xs">
                    <span className="block text-[11px] text-gold font-semibold uppercase tracking-wider">{slotDetail?.name}</span>
                    <span className="block text-[9px] text-platinum/50 uppercase tracking-widest">{slotDetail?.timeRange}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-[10px] text-left sm:text-right font-sans">
                      <span className="text-platinum/45 block">Group: {booking.membersCount} Guests</span>
                      <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-semibold inline-block ${
                        booking.paymentStatus === "fully_paid"
                          ? "bg-azure/15 text-azure"
                          : "bg-gold/15 text-gold"
                      }`}>
                        {booking.paymentStatus === "fully_paid" ? "Fully Paid" : "Deposit Paid"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
