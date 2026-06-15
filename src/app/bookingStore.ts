import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Slot {
  id: string;
  name: string;
  timeRange: string;
  basePrice: number;
  baseCapacity: number;
  extraMemberCharge: number;
  advanceAmount: number;
}

export interface Booking {
  id: string;
  date: string; // YYYY-MM-DD
  slotId: string;
  customerName: string;
  customerPhone: string;
  membersCount: number;
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  paymentStatus: "advance_paid" | "fully_paid";
  bookingStatus: "confirmed" | "completed" | "cancelled";
  createdAt: string;
  cancellationReason?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: "new_booking" | "cancellation" | "general";
}

export interface Customer {
  name: string;
  phone: string;
}

interface BookingState {
  slots: Slot[];
  bookings: Booking[];
  customers: Customer[];
  notifications: AppNotification[];
  
  // Slot management
  updateSlot: (id: string, updated: Partial<Slot>) => void;
  
  // Booking management
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) => Booking;
  updateBookingStatus: (
    id: string, 
    bookingStatus: Booking["bookingStatus"], 
    paymentStatus?: Booking["paymentStatus"],
    cancellationReason?: string
  ) => void;
  
  // Customer management
  addCustomer: (name: string, phone: string) => void;

  // Notification management
  addNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
}

// Default 4 slots (6 hours each) configuration
const DEFAULT_SLOTS: Slot[] = [
  {
    id: "slot-1",
    name: "Morning Sunrise Session",
    timeRange: "06:00 AM - 12:00 PM",
    basePrice: 3000,
    baseCapacity: 10,
    extraMemberCharge: 300,
    advanceAmount: 1000,
  },
  {
    id: "slot-2",
    name: "Afternoon Pool Session",
    timeRange: "12:00 PM - 06:00 PM",
    basePrice: 3000,
    baseCapacity: 10,
    extraMemberCharge: 300,
    advanceAmount: 1000,
  },
  {
    id: "slot-3",
    name: "Sunset Oasis Lounge Session",
    timeRange: "06:00 PM - 12:00 AM",
    basePrice: 4000,
    baseCapacity: 10,
    extraMemberCharge: 400,
    advanceAmount: 1500,
  },
  {
    id: "slot-4",
    name: "Obsidian Night Swim Session",
    timeRange: "12:00 AM - 06:00 AM",
    basePrice: 4500,
    baseCapacity: 10,
    extraMemberCharge: 450,
    advanceAmount: 2000,
  },
];

// Seed some initial mock customer records
const DEFAULT_CUSTOMERS: Customer[] = [
  { name: "Parvez Khan", phone: "9371113786" },
  { name: "Amit Sharma", phone: "9876543210" },
  { name: "Rahul Deshmukh", phone: "8888888888" },
];

// Helper to get formatted dates relative to today
const getRelativeDate = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
};

// Seed initial mock bookings spanning yesterday, today, and tomorrow
const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: "book-1",
    date: getRelativeDate(-1), // Yesterday
    slotId: "slot-2",
    customerName: "Rahul Deshmukh",
    customerPhone: "8888888888",
    membersCount: 12,
    totalAmount: 3600, // 3000 + 2 * 300
    advanceAmount: 1000,
    remainingAmount: 2600,
    paymentStatus: "fully_paid",
    bookingStatus: "completed",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "book-2",
    date: getRelativeDate(0), // Today
    slotId: "slot-3",
    customerName: "Parvez Khan",
    customerPhone: "9371113786",
    membersCount: 10,
    totalAmount: 4000,
    advanceAmount: 1500,
    remainingAmount: 2500,
    paymentStatus: "advance_paid",
    bookingStatus: "confirmed",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "book-3",
    date: getRelativeDate(1), // Tomorrow
    slotId: "slot-2",
    customerName: "Amit Sharma",
    customerPhone: "9876543210",
    membersCount: 15,
    totalAmount: 4500, // 3000 + 5 * 300
    advanceAmount: 1000,
    remainingAmount: 3500,
    paymentStatus: "advance_paid",
    bookingStatus: "confirmed",
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "Sanctuary Console Online",
    body: "Boss Panel and Firebase Cloud Messaging stub initialized successfully.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    type: "general",
  },
  {
    id: "notif-2",
    title: "System Seeding Complete",
    body: "Persistent client store initialized with simulated bookings and slots.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: true,
    type: "general",
  }
];

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      slots: DEFAULT_SLOTS,
      bookings: DEFAULT_BOOKINGS,
      customers: DEFAULT_CUSTOMERS,
      notifications: DEFAULT_NOTIFICATIONS,

      updateSlot: (id, updated) => {
        set((state) => ({
          slots: state.slots.map((s) => (s.id === id ? { ...s, ...updated } : s)),
        }));
      },

      addBooking: (newBooking) => {
        const id = "book-" + Math.random().toString(36).substring(7);
        const booking: Booking = {
          ...newBooking,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const customerExists = state.customers.some(
            (c) => c.phone === newBooking.customerPhone
          );
          const updatedCustomers = customerExists
            ? state.customers
            : [
                ...state.customers,
                { name: newBooking.customerName, phone: newBooking.customerPhone },
              ];

          const slot = state.slots.find(s => s.id === newBooking.slotId);
          const notification: AppNotification = {
            id: "notif-" + Math.random().toString(36).substring(7),
            title: "New Booking Request",
            body: `${newBooking.customerName} reserved ${slot?.name || "Session"} on ${newBooking.date}`,
            timestamp: new Date().toISOString(),
            read: false,
            type: "new_booking",
          };

          return {
            bookings: [booking, ...state.bookings],
            customers: updatedCustomers,
            notifications: [notification, ...state.notifications],
          };
        });

        return booking;
      },

      updateBookingStatus: (id, bookingStatus, paymentStatus, cancellationReason) => {
        set((state) => {
          const targetBooking = state.bookings.find(b => b.id === id);
          const notifications = [...state.notifications];
          
          if (bookingStatus === "cancelled" && targetBooking && targetBooking.bookingStatus !== "cancelled") {
            const notif: AppNotification = {
              id: "notif-" + Math.random().toString(36).substring(7),
              title: "Booking Cancelled",
              body: `Stay for ${targetBooking.customerName} on ${targetBooking.date} was cancelled.`,
              timestamp: new Date().toISOString(),
              read: false,
              type: "cancellation",
            };
            notifications.unshift(notif);
          }

          const updatedBookings = state.bookings.map((b) => {
            if (b.id !== id) return b;
            
            const updatedPaymentStatus = paymentStatus || b.paymentStatus;
            let updatedRemaining = b.remainingAmount;
            
            if (updatedPaymentStatus === "fully_paid") {
              updatedRemaining = 0;
            } else if (updatedPaymentStatus === "advance_paid") {
              updatedRemaining = b.totalAmount - b.advanceAmount;
            }

            return {
              ...b,
              bookingStatus,
              paymentStatus: updatedPaymentStatus,
              remainingAmount: updatedRemaining,
              cancellationReason: cancellationReason || b.cancellationReason,
            };
          });

          return {
            bookings: updatedBookings,
            notifications,
          };
        });
      },

      addCustomer: (name, phone) => {
        set((state) => {
          const exists = state.customers.some((c) => c.phone === phone);
          if (exists) return {};
          return {
            customers: [...state.customers, { name, phone }],
          };
        });
      },

      addNotification: (notif) => {
        set((state) => ({
          notifications: [
            {
              ...notif,
              id: "notif-" + Math.random().toString(36).substring(7),
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ],
        }));
      },

      markNotificationsAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: "boss_farmhouse_bookings_db", // Key in localStorage for persistent client database
    }
  )
);

export default useBookingStore;
