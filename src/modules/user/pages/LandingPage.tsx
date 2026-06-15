import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  AnimatePresence 
} from "framer-motion";
import { 
  Waves, MapPin, CheckCircle2, 
  ShieldAlert, Star, X, Menu, Play, Info,
  Calendar as CalendarIcon, Users, CreditCard, ChevronRight, Check
} from "lucide-react";
import { 
  ESTATE_CONTACT, ESTATE_COORDINATES, 
  POOL_HYGIENE_LOGS 
} from "@/config/constants";
import useBookingStore, { type Booking } from "@/app/bookingStore";
import { toast } from "sonner";
import fcmService from "@/services/fcmService";

// Clear local images mapping matching /public/images/ directory
const LOCAL_IMAGES = {
  hero: "/images/hero.jpg",
  poolPortal: "/images/pool_portal.jpg",
  villaFacade: "/images/villa_facade.jpg",
  lawn: "/images/lawn.jpg",
  lounge: "/images/lounge.jpg",
  swimmingNight: "/images/swimming_night.jpg"
};

// Simple, human-toned slides for our Spaces Tour
const SPACES_TOUR = [
  {
    title: "Sanctuary Pool",
    desc: "A completely private deep pool with warm underwater lighting, perfect for evening swimming.",
    img: LOCAL_IMAGES.swimmingNight,
    tag: "01 / WATER"
  },
  {
    title: "The Oasis Lounge",
    desc: "An open-air wooden deck patio next to the pool, built for family meals and relaxation.",
    img: LOCAL_IMAGES.lounge,
    tag: "02 / LOUNGE"
  },
  {
    title: "Manicured Lawns",
    desc: "Spacious green lawns surrounded by tall walls to keep your family gathering completely private.",
    img: LOCAL_IMAGES.lawn,
    tag: "03 / GARDEN"
  }
];

// Mock Video Highlights with local MP4 fallback
const SOCIAL_VIDEOS = [
  {
    id: "v1",
    title: "Farmhouse Tour Video",
    source: "YouTube",
    thumbnail: LOCAL_IMAGES.swimmingNight,
    videoUrl: "/videos/v1.mp4",
    embedUrl: "",
    duration: "1:45"
  },
  {
    id: "v2",
    title: "Sunset Pool Vibes Reel",
    source: "Instagram",
    thumbnail: LOCAL_IMAGES.hero,
    videoUrl: "/videos/v2.mp4",
    embedUrl: "",
    duration: "0:30"
  },
  {
    id: "v3",
    title: "Family Celebration Highlights",
    source: "YouTube",
    thumbnail: LOCAL_IMAGES.lawn,
    videoUrl: "/videos/v3.mp4",
    embedUrl: "",
    duration: "2:15"
  }
];

// Stagger child elements utility
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Scroll trigger fadeInUp spring transitions
const fadeInUpVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 18,
    },
  },
};

// Title splitting animation controls for Hero
const titleContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const titleWordVariants = {
  hidden: { y: 35, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1] as any,
    },
  },
};

// Slider animation variants for Tour Carousel
const sliderVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring" as const, stiffness: 280, damping: 28 },
      opacity: { duration: 0.4 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    transition: {
      x: { type: "spring" as const, stiffness: 280, damping: 28 },
      opacity: { duration: 0.4 },
    },
  }),
};

// 1. 3D Tilt Card Component for Luxury Hover Effects
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    const rX = -(mouseY / height) * 8; // tilt max 8 degrees
    const rY = (mouseX / width) * 8;
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      style={{ transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 2. Magnetic Play Cursor Video Card Component
interface MagneticVideoCardProps {
  video: { id: string; title: string; source: string; thumbnail: string; duration: string; videoUrl: string; embedUrl: string };
  onClick: () => void;
}

const MagneticVideoCard: React.FC<MagneticVideoCardProps> = ({ video, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="luxury-card rounded-xl overflow-hidden relative h-72 group cursor-pointer border border-white/10 hover:border-gold/40 hover:scale-[1.01] transition-all duration-300"
    >
      {/* Background static thumbnail */}
      <img
        src={video.thumbnail}
        alt={video.title}
        className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-100 group-hover:scale-105 transition-transform duration-700"
      />

      {/* HTML5 Video Looper on Hover */}
      <video
        src={video.videoUrl}
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 filter brightness-100 ${
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        ref={(el) => {
          if (el) {
            if (isHovered) {
              el.play().catch(() => {});
            } else {
              el.pause();
              el.currentTime = 0;
            }
          }
        }}
      />

      {/* Luxury shadow overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/30 to-transparent z-10" />

      {/* Floating play cursor tracking coordinates */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute w-12 h-12 bg-gold/20 border border-gold/40 rounded-full flex items-center justify-center z-20"
          style={{ x: mousePos.x - 24, y: mousePos.y - 24 }}
          layoutId={`play-cursor-${video.id}`}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          <Play className="w-4 h-4 text-gold fill-gold ml-0.5 animate-pulse" />
        </motion.div>
      )}

      {/* Card Details */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-5">
        <span className="text-[9px] uppercase tracking-widest text-gold bg-midnight/90 px-2.5 py-1 rounded border border-gold/20 w-max font-sans font-semibold">
          {video.source}
        </span>

        {!isHovered && (
          <div className="self-center w-12 h-12 bg-gold/25 rounded-full border border-gold/40 flex items-center justify-center backdrop-blur-sm shadow-lg">
            <Play className="w-4 h-4 text-gold fill-gold ml-0.5" />
          </div>
        )}

        <div className="text-left space-y-1">
          <h4 className="font-serif text-lg text-chalk group-hover:text-gold transition-colors duration-300 font-light">
            {video.title}
          </h4>
          <div className="flex justify-between items-center text-[9px] text-platinum/50 uppercase tracking-widest font-sans">
            <span>Duration: {video.duration}</span>
            <span className="text-gold">Watch Reel</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Self-drawing custom animated SVG icons
const AnimatedShieldIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <motion.path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
  </svg>
);

const AnimatedCompassIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="12" cy="12" r="10" />
    <motion.polygon
      points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      className="origin-center"
    />
  </svg>
);

const AnimatedWavesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <motion.path
      d="M2 10c3-3 6-3 9 0s6 3 9 0"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    />
    <motion.path
      d="M2 15c3-3 6-3 9 0s6 3 9 0"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
    />
  </svg>
);

export const LandingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTourSlide, setActiveTourSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);

  // Zustand State selectors
  const { slots, bookings, addBooking, updateBookingStatus } = useBookingStore();
  
  // Booking Lookup State
  const [showBookingLookup, setShowBookingLookup] = useState(false);
  const [lookupPhone, setLookupPhone] = useState("");
  const [hasLookedUp, setHasLookedUp] = useState(false);
  const [lookupResults, setLookupResults] = useState<Booking[]>([]);

  const handleBookingLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim()) {
      toast.warning("Empty Input", {
        description: "Please enter your registered mobile number.",
      });
      return;
    }
    
    const results = bookings.filter(
      (b) => b.customerPhone.trim() === lookupPhone.trim()
    );
    
    setLookupResults(results);
    setHasLookedUp(true);
    
    if (results.length === 0) {
      toast.error("No Reservation Found", {
        description: "No booking registers found for this number.",
      });
    } else {
      toast.success("Reservation Records Found", {
        description: `Retrieved ${results.length} stay records for your number.`,
      });
    }
  };
  
  // Interactive Booking Form States
  const [bookingDate, setBookingDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0] // default to tomorrow
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [membersCount, setMembersCount] = useState<number | string>(10);
  
  // Guest Identity Forms (If not logged in)
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [showIdentityForm, setShowIdentityForm] = useState(false);

  // Simulated Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Receipt State
  const [lastCreatedBooking, setLastCreatedBooking] = useState<Booking | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Customer Cancellation State
  const [showCustCancelModal, setShowCustCancelModal] = useState(false);
  const [custCancelTargetId, setCustCancelTargetId] = useState<string | null>(null);
  const [custCancelReason, setCustCancelReason] = useState("");

  const handleCustCancelClick = (id: string) => {
    setCustCancelTargetId(id);
    setCustCancelReason("");
    setShowCustCancelModal(true);
  };

  const handleCustExecuteCancellation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custCancelReason.trim()) {
      toast.error("Reason Required", {
        description: "Please specify why your reservation is being cancelled.",
      });
      return;
    }
    if (custCancelTargetId) {
      updateBookingStatus(custCancelTargetId, "cancelled", undefined, custCancelReason);
      toast.error("Booking Revoked", {
        description: "Your reservation has been cancelled. Deposit is non-refundable.",
      });
      setLookupResults(prev => prev.map(p => p.id === custCancelTargetId ? { 
        ...p, 
        bookingStatus: "cancelled",
        cancellationReason: custCancelReason
      } : p));
      setShowCustCancelModal(false);
      setCustCancelTargetId(null);
      setCustCancelReason("");
    }
  };
  
  // State for active video lightbox player
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoIsLocal, setActiveVideoIsLocal] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  // Scroll parallax mapping
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 45, damping: 15 });

  const heroTextY = useTransform(smoothProgress, [0, 0.25], [0, 150]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const bgScale = useTransform(smoothProgress, [0, 0.3], [1, 1.1]);
  const bgOpacity = useTransform(smoothProgress, [0, 0.3], [0.6, 0.15]);

  // Portal clip-path reveal
  const { scrollYProgress: portalScrollProgress } = useScroll({
    target: portalRef,
    offset: ["start end", "center center"]
  });
  const portalClipWidth = useTransform(portalScrollProgress, [0, 1], ["65%", "100%"]);
  const portalScale = useTransform(portalScrollProgress, [0, 1], [1.08, 1]);

  // Entrance loader timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scrolling for Farmhouse Tour images (Every 5 seconds)
  useEffect(() => {
    const tourInterval = setInterval(() => {
      setSlideDirection(1);
      setActiveTourSlide((prev) => (prev + 1) % SPACES_TOUR.length);
    }, 5000);
    return () => clearInterval(tourInterval);
  }, [activeTourSlide]);

  // Format WhatsApp link with emoji-rich template inquiry
  const handleWhatsAppRedirect = () => {
    const emojiHouse = "\u{1F3E1}";
    const emojiPin = "\u{1F4CD}";
    const emojiKey = "\u{1F511}";
    const emojiFold = "\u{1F64F}";
    const emojiSparkle = "\u{2728}";

    const formattedMessage = 
      `${emojiHouse} *Boss Farm House Sanctuary* ${emojiHouse}\n\n` +
      `Hello! I am visiting your website and want to check details & availability for the private pool farmhouse in Dhule.\n\n` +
      `${emojiSparkle} *Details:*\n` +
      `• Location: Zikra Park, Choufully, Dhule ${emojiPin}\n` +
      `• Booking Type: 100% Private Exclusive Use ${emojiKey}\n\n` +
      `Please connect back with me. Thank you! ${emojiFold}`;

    window.open(`https://wa.me/${ESTATE_CONTACT.whatsapp}?text=${encodeURIComponent(formattedMessage)}`, "_blank");
  };

  const copyAddress = () => {
    const addressText = `${ESTATE_COORDINATES.addressLine1}, ${ESTATE_COORDINATES.addressLine2}, ${ESTATE_COORDINATES.city}, ${ESTATE_COORDINATES.state}`;
    navigator.clipboard.writeText(addressText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const selectTourSlide = (index: number) => {
    setSlideDirection(index > activeTourSlide ? 1 : -1);
    setActiveTourSlide(index);
  };

  const triggerVideoLightbox = (video: typeof SOCIAL_VIDEOS[0]) => {
    if (video.embedUrl) {
      setActiveVideoIsLocal(false);
      setActiveVideoUrl(video.embedUrl);
    } else {
      setActiveVideoIsLocal(true);
      setActiveVideoUrl(video.videoUrl);
    }
  };

  // Check slot availability for selected date
  const getSlotAvailability = (slotId: string) => {
    const matched = bookings.find(
      (b) => b.date === bookingDate && b.slotId === slotId && b.bookingStatus !== "cancelled"
    );
    if (matched) {
      return { status: "booked" as const, booking: matched };
    }
    return { status: "available" as const };
  };

  // Pricing calculations based on selections
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  
  const calculatePricing = () => {
    if (!selectedSlot) return { base: 0, extra: 0, total: 0, advance: 0 };
    const base = selectedSlot.basePrice;
    const limit = selectedSlot.baseCapacity;
    const extraCharge = selectedSlot.extraMemberCharge;
    const advance = selectedSlot.advanceAmount;

    let extra = 0;
    if (Number(membersCount) > limit) {
      extra = (Number(membersCount) - limit) * extraCharge;
    }
    const total = base + extra;
    return { base, extra, total, advance };
  };

  const pricing = calculatePricing();

  // Booking button click handler
  const handleInitiateBooking = () => {
    if (!selectedSlotId) {
      toast.warning("Select Slot", {
        description: "Please select an available session slot to proceed.",
      });
      return;
    }

    if (Number(membersCount) < 1) {
      toast.warning("Invalid Guests", {
        description: "Group capacity must be at least 1 member.",
      });
      return;
    }

    // Request guest identity credentials
    setShowIdentityForm(true);
  };

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      toast.error("Required Fields", {
        description: "Guest Name and Mobile Number are mandatory to register booking.",
      });
      return;
    }
    setShowIdentityForm(false);
    setShowPaymentModal(true);
  };

  // Finalize simulated payments
  const handleProcessPayment = () => {
    setIsProcessingPayment(true);
    
    // Simulate transaction delay
    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
 
      // Save reservation to persistent Zustand store
      const bookingData = {
        date: bookingDate,
        slotId: selectedSlotId!,
        customerName: guestName,
        customerPhone: guestPhone,
        membersCount: Number(membersCount),
        totalAmount: pricing.total,
        advanceAmount: pricing.advance,
        remainingAmount: pricing.total - pricing.advance,
        paymentStatus: "advance_paid" as const,
        bookingStatus: "confirmed" as const,
      };

      const newBooking = addBooking(bookingData);
      setLastCreatedBooking(newBooking);
      setShowReceiptModal(true);

      // Trigger mock FCM push notification
      fcmService.simulateIncomingNotification(
        "New Booking Request",
        `Guest ${bookingData.customerName} has reserved a slot on ${bookingData.date}.`
      );

      // Reset states
      setSelectedSlotId(null);
      setGuestName("");
      setGuestPhone("");

      toast.success("Booking Secured", {
        description: `Ref ID #${newBooking.id.replace("book-", "").toUpperCase()} has been reserved successfully!`,
      });
    }, 1500);
  };

  return (
    <div ref={containerRef} className="relative bg-midnight text-chalk min-h-screen overflow-x-hidden selection:bg-gold/30 selection:text-gold bg-grain-texture">
      
      {/* Subtle Gold Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-[0.55]" />

      {/* Slowly Drifting Luxury Glowing Blobs in Background */}
      <div className="absolute top-[8%] left-[5%] w-80 h-80 rounded-full bg-gold/[0.04] blur-[100px] pointer-events-none z-0 animate-glow-slow" />
      <div className="absolute top-[35%] right-[10%] w-96 h-96 rounded-full bg-azure/[0.04] blur-[130px] pointer-events-none z-0 animate-glow-mid" />
      <div className="absolute top-[70%] left-[15%] w-80 h-80 rounded-full bg-gold/[0.04] blur-[100px] pointer-events-none z-0 animate-glow-slow" />

      {/* 1. Cinematic Entrance Loading Splash */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="fixed inset-0 z-[100] bg-midnight flex flex-col items-center justify-center"
            exit={{ 
              opacity: 0, 
              y: "-100%",
              transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
            }}
          >
            <motion.div
              initial={{ opacity: 0, letterSpacing: "0.4em" }}
              animate={{ opacity: 1, letterSpacing: "1em" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-2xl md:text-4xl text-gold uppercase tracking-widest flex items-center gap-3"
            >
              <Waves className="w-6 h-6 text-gold animate-bounce" />
              BOSS
            </motion.div>
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.7, ease: "easeInOut" }}
              className="h-[1px] w-36 bg-gold/30 mt-5 origin-center"
            />
            <span className="text-[8px] uppercase tracking-widest text-platinum/40 font-sans mt-3">
              Preparing Sanctuary Visuals
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Minimalist Transparent Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 md:px-12 mix-blend-difference"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <a href="#" className="flex items-center space-x-2 text-chalk hover:text-gold transition-colors duration-300">
          <img src="/images/logo.svg" alt="Boss Logo" className="w-7 h-7 object-contain" />
          <span className="font-serif text-xs tracking-[0.3em] uppercase font-light">BOSS</span>
        </a>

        {/* Minimal menu toggle */}
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="group flex items-center space-x-2 text-chalk hover:text-gold transition-colors font-sans text-[9px] uppercase tracking-[0.2em] focus:outline-none"
        >
          <span>Explore</span>
          <Menu className="w-3.5 h-3.5 text-gold group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </motion.header>

      {/* Full-Screen Immersive Menu Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="fixed inset-0 z-50 bg-obsidian flex flex-col justify-between p-6 md:p-12"
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex justify-between items-center">
              <span className="font-serif text-gold text-base tracking-[0.3em] uppercase">BOSS</span>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 text-platinum/70 hover:text-gold uppercase text-[9px] tracking-[0.2em] font-sans"
              >
                <span>Close</span>
                <X className="w-3.5 h-3.5 text-gold" />
              </button>
            </div>

            {/* Menu Links pointing to our page anchors */}
            <div className="flex flex-col space-y-4 my-auto text-left">
              {[
                { name: "The Sanctuary Pool", href: "#watercourt" },
                { name: "Water Quality Log", href: "#hygiene" },
                { name: "Sanctuary Tour", href: "#tour" },
                { name: "Social Moments", href: "#moments" },
                { name: "Find Us", href: "#coordinates" },
                { name: "Booking Portal", href: "#booking-portal" }
              ].map((link, idx) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-serif text-2xl sm:text-4xl md:text-5xl text-platinum hover:text-gold transition-all duration-300 hover:translate-x-3 inline-block tracking-tight font-light"
                >
                  <span className="text-gold italic font-sans text-xs tracking-normal mr-3">0{idx + 1} /</span>
                  {link.name}
                </a>
              ))}

              {/* Tracking Button */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowBookingLookup(true);
                }}
                className="font-serif text-2xl text-gold hover:text-white transition-colors pt-4 border-t border-white/5 mt-4 flex items-center gap-2 cursor-pointer w-max focus:outline-none"
              >
                <CalendarIcon className="w-5 h-5 text-gold" />
                Track My Reservation
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[9px] text-platinum/40 uppercase tracking-widest font-sans border-t border-white/5 pt-5 gap-3">
              <span>Behind Hotel 5555, Choufully, Dhule</span>
              <div className="flex items-center gap-4">
                <Link
                  to="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-platinum/30 hover:text-gold transition-colors font-sans cursor-pointer"
                >
                  Admin Entrance
                </Link>
                <button
                  onClick={handleWhatsAppRedirect}
                  className="text-gold hover:text-white transition-colors cursor-pointer"
                >
                  Connect Directly: {ESTATE_CONTACT.phoneDisplay}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Full-Screen Cinematic Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center bg-midnight overflow-hidden">
        {/* Parallax background */}
        <motion.div 
          style={{ scale: bgScale, opacity: bgOpacity }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <img 
            src={LOCAL_IMAGES.hero} 
            alt="Boss Farm House private pool night view" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(13,13,13,0.85)_100%)]" />
        </motion.div>

        {/* Hero title container */}
        <motion.div 
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-10 text-center space-y-4 px-6"
          variants={titleContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-center space-x-1.5 text-gold">
            <Star className="w-3.5 h-3.5 fill-gold" />
            <span className="text-[9px] uppercase tracking-[0.35em] font-sans font-medium">
              Private Farmhouse
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif text-chalk uppercase tracking-[0.18em] leading-none">
            <motion.span variants={titleWordVariants} className="block">BOSS</motion.span>
            <motion.span variants={titleWordVariants} className="block text-gold font-light italic tracking-[0.08em] text-2xl sm:text-4xl md:text-6xl mt-3">
              Farm House
            </motion.span>
          </h1>

          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-platinum/60 font-sans max-w-xl mx-auto leading-relaxed pt-2">
            Dhule's first completely private pool sanctuary
          </p>
        </motion.div>

        {/* Scroll Descent Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-1.5 z-10 pointer-events-none">
          <span className="text-[7px] uppercase tracking-[0.25em] text-gold/60 font-sans">
            Scroll Down
          </span>
          <div className="w-[1px] h-8 bg-gold/20 relative overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 right-0 h-3 bg-gold rounded-full"
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          </div>
        </div>
      </section>

      {/* 4. Cinematic Portal Image Reveal Section */}
      <section id="watercourt" ref={portalRef} className="relative py-8 md:py-12 bg-obsidian">
        <div className="container mx-auto px-6 text-center space-y-8">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeInUpVariants}
            className="max-w-2xl mx-auto space-y-2"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-sans font-semibold">
              The Sanctuary Pool
            </span>
            <h2 className="text-2xl md:text-4xl font-serif text-chalk tracking-tight leading-tight">
              An oasis pool, <br />
              <span className="text-platinum/40 italic">built just for you and your family.</span>
            </h2>
          </motion.div>

          {/* Aperture Reveal Box */}
          <motion.div 
            style={{ 
              clipPath: useTransform(portalClipWidth, w => `polygon(calc(50% - ${w}/2) 0%, calc(50% + ${w}/2) 0%, calc(50% + ${w}/2) 100%, calc(50% - ${w}/2) 100%)`)
            }}
            className="w-full h-[280px] md:h-[450px] rounded-xl overflow-hidden relative border border-white/10 mt-6 shadow-2xl"
          >
            <motion.img 
              style={{ scale: portalScale }}
              src={LOCAL_IMAGES.poolPortal} 
              alt="Villa courtyard pool" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-5 left-6 text-left space-y-0.5 z-10">
              <span className="font-serif text-gold text-lg tracking-wider uppercase">01 / The Main Pool</span>
              <span className="block text-[8px] text-platinum/40 uppercase tracking-widest font-sans">
                Located behind Hotel 5555, Dhule
              </span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 5. Parallax Brand Story Layout */}
      <section className="py-8 md:py-12 bg-midnight relative">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Block - 3D Tilt Card architecture photo */}
          <TiltCard className="lg:col-span-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInUpVariants}
              className="relative h-[320px] md:h-[400px] rounded-xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <img src={LOCAL_IMAGES.villaFacade} alt="Obsidian style villa facade" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 to-transparent"></div>
              <div className="absolute bottom-5 left-5 z-10 text-left">
                <span className="font-serif text-gold text-base">02 / Farmhouse Design</span>
                <span className="block text-[8px] text-platinum/40 uppercase tracking-widest font-sans">
                  Built for comfort and isolation
                </span>
              </div>
            </motion.div>
          </TiltCard>

          {/* Right Block - Conversational Brand copy */}
          <motion.div 
            className="lg:col-span-6 space-y-5 text-left"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUpVariants} className="text-[10px] uppercase tracking-[0.25em] text-azure font-sans font-semibold flex items-center gap-1.5">
              <AnimatedShieldIcon className="w-3.5 h-3.5 text-azure" /> Absolute Privacy
            </motion.span>
            <motion.h3 variants={fadeInUpVariants} className="text-xl md:text-3xl font-serif text-chalk tracking-tight leading-tight">
              Enjoy complete freedom without any outside disturbance.
            </motion.h3>
            <motion.p variants={fadeInUpVariants} className="text-xs text-platinum/60 leading-relaxed font-sans font-light">
              Unlike public hotels and crowded resorts, Boss Farm House is designed as a secure private estate. 
              The entire farmhouse, private pool, lounge, and lawns are locked for your group only. There are no other guests around, allowing you to relax in absolute peace.
            </motion.p>
            
            <motion.hr variants={fadeInUpVariants} className="border-white/10" />

            <motion.div variants={fadeInUpVariants} className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <span className="font-serif text-xl text-gold">100%</span>
                <span className="block text-[8px] uppercase tracking-widest text-platinum/40 font-sans font-semibold">Exclusive</span>
                <p className="text-[10px] text-platinum/50 leading-relaxed">
                  Only one booking is accepted at a time. The entire property is yours.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-serif text-xl text-gold">24/7</span>
                <span className="block text-[8px] uppercase tracking-widest text-platinum/40 font-sans font-semibold">Support</span>
                <p className="text-[10px] text-platinum/50 leading-relaxed">
                  Our local team is always available to help coordinate your stay.
                </p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* 6. Water Quality Log Section */}
      <section id="hygiene" className="py-8 md:py-12 bg-obsidian border-t border-white/5 relative">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Chemistry Console with animated Wave overlays */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeInUpVariants}
            className="lg:col-span-5 luxury-card p-5 md:p-6 rounded-xl bg-midnight/85 border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-azure/5 rounded-full filter blur-xl"></div>
            
            <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none overflow-hidden opacity-[0.08] z-0">
              <svg viewBox="0 0 120 28" className="absolute bottom-0 left-0 w-[200%] h-10 fill-azure animate-wave-slow">
                <path d="M0 15 Q 30 0, 60 15 T 120 15 L 120 28 L 0 28 Z" />
              </svg>
              <svg viewBox="0 0 120 28" className="absolute bottom-0 left-0 w-[200%] h-6 fill-gold animate-wave-fast">
                <path d="M0 15 Q 30 5, 60 15 T 120 15 L 120 28 L 0 28 Z" />
              </svg>
            </div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center space-x-1.5">
                <AnimatedWavesIcon className="w-4 h-4 text-gold" />
                <span className="font-serif text-[10px] text-chalk tracking-widest uppercase">Hygiene Log</span>
              </div>
              <div className="bg-azure/15 border border-azure/20 px-2.5 py-0.5 rounded-full text-[7px] uppercase tracking-widest text-azure flex items-center gap-1 font-sans font-semibold">
                <span className="h-1 w-1 bg-azure rounded-full animate-ping"></span>
                Daily Check
              </div>
            </div>

            <motion.div 
              className="space-y-4 relative z-10"
              variants={staggerContainer}
            >
              {POOL_HYGIENE_LOGS.map((log) => (
                <motion.div 
                  key={log.name} 
                  className="border-b border-white/5 pb-3 last:border-b-0 last:pb-0 text-left"
                  variants={fadeInUpVariants}
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] uppercase tracking-widest text-platinum/80 font-sans font-medium">
                      {log.name}
                    </span>
                    <span className="text-[10px] text-gold font-sans font-semibold">
                      {log.value}
                    </span>
                  </div>
                  <p className="text-[9px] text-platinum/40 leading-relaxed font-sans">
                    {log.description}
                  </p>
                  <div className="mt-1 flex justify-between items-center text-[7px] uppercase tracking-widest text-platinum/30 font-sans">
                    <span>{log.lastTested}</span>
                    <span className="text-azure flex items-center gap-0.5 font-semibold">
                      <CheckCircle2 className="w-2 h-2" /> Perfect Range
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Descriptive Copy */}
          <motion.div 
            className="lg:col-span-7 space-y-5 text-left"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUpVariants} className="text-[10px] uppercase tracking-[0.25em] text-gold font-sans font-semibold">
              Daily Water Quality Check
            </motion.span>
            <motion.h3 variants={fadeInUpVariants} className="text-xl md:text-3xl font-serif text-chalk tracking-tight leading-tight">
              Pristine Water. <br />
              <span className="text-platinum/40 italic">Cleaned and filtered daily.</span>
            </motion.h3>
            <motion.p variants={fadeInUpVariants} className="text-xs text-platinum/60 leading-relaxed font-sans font-light">
              We monitor the pool chemical balance and pH levels every day to ensure completely safe and comfortable swimming conditions. 
              The pool water goes through high-grade silica sand filters regularly to clear impurities and keep it crystal clear.
            </motion.p>

            <motion.div 
              variants={fadeInUpVariants}
              className="bg-azure/[0.03] border border-azure/20 p-4 rounded-lg text-[11px] text-platinum/70 flex gap-2.5 font-sans leading-relaxed"
            >
              <ShieldAlert className="w-4.5 h-4.5 text-azure shrink-0 mt-0.5" />
              <span>
                We schedule a deep-cleaning and water filtration cycle after every guest check-out, so you always arrive to a fresh, sterile pool.
              </span>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* 7. Spaces Tour Panoramic Section */}
      <section id="tour" className="py-8 md:py-12 bg-midnight relative border-t border-white/5">
        <div className="container mx-auto px-6">
          
          <motion.div 
            className="max-w-2xl space-y-2 mb-8 mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-sans font-medium">
              Spaces to Explore
            </span>
            <h2 className="text-2xl md:text-4xl font-serif text-chalk tracking-tight">
              Tour the Farmhouse
            </h2>
            <div className="w-8 h-0.5 bg-gold mx-auto mt-1.5"></div>
          </motion.div>

          <div className="relative h-[320px] md:h-[450px] w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
              <motion.div
                key={activeTourSlide}
                custom={slideDirection}
                variants={sliderVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full"
              >
                <img 
                  src={SPACES_TOUR[activeTourSlide].img} 
                  alt={SPACES_TOUR[activeTourSlide].title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/35 to-transparent"></div>
                
                <div className="absolute bottom-8 left-5 md:left-10 max-w-lg space-y-2 z-10 text-left">
                  <span className="text-[9px] uppercase tracking-widest text-gold font-sans font-semibold">
                    {SPACES_TOUR[activeTourSlide].tag}
                  </span>
                  <h3 className="font-serif text-2xl md:text-4xl text-chalk tracking-wide leading-none font-light">
                    {SPACES_TOUR[activeTourSlide].title}
                  </h3>
                  <p className="text-[11px] md:text-xs text-platinum/70 leading-relaxed font-sans font-light">
                    {SPACES_TOUR[activeTourSlide].desc}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
              <motion.div 
                key={activeTourSlide}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-full bg-gold"
              />
            </div>

            <div className="absolute bottom-8 right-5 md:right-10 z-20 flex items-center space-x-2">
              {SPACES_TOUR.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => selectTourSlide(idx)}
                  className={`w-8 h-8 font-serif text-[10px] rounded-full border transition-all duration-300 ${
                    activeTourSlide === idx
                      ? "bg-gold text-midnight border-gold font-bold scale-105"
                      : "bg-midnight/70 text-gold border-gold/20 hover:border-gold"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 8. Immersive Social Moments Video Section */}
      <section id="moments" className="py-8 md:py-12 bg-obsidian border-t border-white/5 relative">
        <div className="container mx-auto px-6 text-center space-y-8">
          
          <motion.div 
            className="max-w-2xl mx-auto space-y-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-sans font-medium">
              Social Highlights
            </span>
            <h2 className="text-2xl md:text-4xl font-serif text-chalk tracking-tight">
              Sanctuary Moments
            </h2>
            <p className="text-[11px] md:text-xs text-platinum/60 font-sans max-w-xl mx-auto font-light">
              Hover to preview clips or click to play the full guest reels.
            </p>
            <div className="w-8 h-0.5 bg-gold mx-auto mt-1.5"></div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
          >
            {SOCIAL_VIDEOS.map((video) => (
              <motion.div key={video.id} variants={fadeInUpVariants}>
                <MagneticVideoCard
                  video={video}
                  onClick={() => triggerVideoLightbox(video)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <AnimatePresence>
          {activeVideoUrl && (
            <motion.div 
              className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideoUrl(null)}
            >
              <div 
                className="relative w-full max-w-3xl bg-midnight border border-white/10 rounded-xl overflow-hidden shadow-2xl cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setActiveVideoUrl(null)}
                  className="absolute top-4 right-4 z-20 bg-midnight/80 border border-white/10 p-1.5 rounded-full text-platinum hover:text-gold transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="aspect-video w-full flex items-center justify-center bg-black">
                  {activeVideoIsLocal ? (
                    <video
                      src={activeVideoUrl}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={activeVideoUrl}
                      title="Sanctuary Video Player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 9. Directions & Location Segment */}
      <section id="coordinates" className="py-8 md:py-12 bg-midnight relative border-t border-white/5">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <motion.div 
            className="lg:col-span-5 space-y-5 text-left"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUpVariants} className="flex items-center space-x-1.5 text-gold">
              <AnimatedCompassIcon className="w-4 h-4 text-gold" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold">
                Where to find us
              </span>
            </motion.div>
            
            <motion.h3 variants={fadeInUpVariants} className="text-xl md:text-3xl font-serif text-chalk tracking-tight leading-tight">
              Located behind Hotel 5555, Dhule.
            </motion.h3>
            <motion.p variants={fadeInUpVariants} className="text-xs text-platinum/60 leading-relaxed font-sans font-light">
              We are situated inside the private, quiet Zikra Park behind the landmark Hotel 5555. It is right off the Dhule-Chalisgaon Road, making it easy to find while keeping it secluded and quiet.
            </motion.p>

            <motion.div variants={fadeInUpVariants} className="space-y-2 pt-2 border-t border-white/5 text-xs font-sans font-light leading-relaxed text-platinum">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[8px] uppercase tracking-widest text-platinum/40 mb-0.5">Our Address</span>
                  <span className="text-xs font-light text-platinum/80">{ESTATE_COORDINATES.addressLine1}, {ESTATE_COORDINATES.addressLine2}, {ESTATE_COORDINATES.city}, {ESTATE_COORDINATES.state}</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUpVariants} className="flex gap-3 pt-2">
              <button
                onClick={copyAddress}
                className="btn-gold-outline px-4 py-2.5 rounded text-[10px] uppercase tracking-widest font-sans"
              >
                {isCopied ? "Address Copied" : "Copy Address"}
              </button>
              <a
                href={ESTATE_COORDINATES.googleMapsLink}
                target="_blank"
                rel="noreferrer"
                className="btn-gold px-4 py-2.5 rounded text-[10px] uppercase tracking-widest font-sans text-center"
              >
                Open Google Maps
              </a>
            </motion.div>
          </motion.div>

          <TiltCard className="lg:col-span-7 h-[320px] md:h-[400px] bg-obsidian rounded-xl border border-white/10 relative overflow-hidden group shadow-2xl">
            <iframe
              src="https://maps.google.com/maps?q=20.86741668214945,74.79521450793962&z=17&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full grayscale-[30%] opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
            />
          </TiltCard>

        </div>
      </section>

      {/* 10. Interactive Booking Portal - Coded Strictly to Mock Specifications */}
      <section id="booking-portal" className="py-8 md:py-12 bg-midnight relative border-t border-white/5">
        <div className="container mx-auto px-6 space-y-8 relative z-10 text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-1"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-sans font-semibold">
              Sanctuary Availability
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-chalk uppercase leading-none tracking-tight">
              SECURE YOUR <br />
              <span className="text-gold italic font-light font-serif">SESSION</span>
            </h2>
            <div className="w-8 h-0.5 bg-gold mx-auto mt-2"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left max-w-5xl mx-auto">
            
            {/* Left Column: Calendar & Slots Availability Grid */}
            <div className="lg:col-span-7 space-y-4">
              <div className="luxury-card p-5 rounded-xl bg-obsidian/60 border border-white/5 space-y-4">
                
                {/* Date Input */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4.5 h-4.5 text-gold" />
                    <span className="font-serif text-sm text-chalk">Select Date</span>
                  </div>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingDate}
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      setSelectedSlotId(null); // Reset selected slot
                    }}
                    className="bg-midnight border border-white/10 rounded px-3 py-1.5 text-xs text-gold focus:outline-none focus:border-gold transition-colors font-sans"
                  />
                </div>

                {/* Slots Selector List */}
                <div className="space-y-3 font-sans text-xs">
                  {slots.map((slot) => {
                    const avail = getSlotAvailability(slot.id);
                    const isBooked = avail.status === "booked";
                    const isSelected = selectedSlotId === slot.id;

                    return (
                      <button
                        key={slot.id}
                        disabled={isBooked}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`w-full text-left p-4 rounded-lg border transition-all duration-300 flex justify-between items-center ${
                          isBooked 
                            ? "bg-red-500/[0.02] border-red-500/10 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "bg-gold/10 border-gold shadow-lg scale-[1.01]"
                            : "bg-midnight/40 border-white/5 hover:border-gold/30"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-chalk text-xs">{slot.name}</span>
                            <span className={`text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded font-semibold ${
                              isBooked 
                                ? "bg-red-500/10 text-red-400" 
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}>
                              {isBooked ? "Booked" : "Available"}
                            </span>
                          </div>
                          <span className="block text-[10px] text-platinum/40 uppercase tracking-wider font-semibold">
                            Time: {slot.timeRange}
                          </span>
                          <span className="block text-[9px] text-platinum/50 font-light">
                            Rate: ₹{slot.basePrice} for {slot.baseCapacity} guests (₹{slot.extraMemberCharge} per extra guest)
                          </span>
                        </div>

                        {!isBooked && (
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected 
                              ? "bg-gold border-gold text-midnight" 
                              : "border-white/20 text-transparent"
                          }`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Invoice Summary & Action */}
            <div className="lg:col-span-5 space-y-4">
              <div className="luxury-card p-5 rounded-xl bg-obsidian/60 border border-white/5 space-y-4">
                <h4 className="font-serif text-gold text-base tracking-wide uppercase font-light border-b border-white/5 pb-2">
                  Booking Quotation
                </h4>

                {selectedSlot ? (
                  <div className="space-y-4 text-xs font-sans">
                    {/* Selected Info */}
                    <div className="bg-midnight/40 p-3 rounded border border-white/5 space-y-1">
                      <div className="flex justify-between text-[10px] text-platinum/40 uppercase font-semibold">
                        <span>Session Date</span>
                        <span>Session Mode</span>
                      </div>
                      <div className="flex justify-between font-serif text-sm text-chalk">
                        <span>{bookingDate}</span>
                        <span className="text-gold italic font-sans font-light text-xs">{selectedSlot.name}</span>
                      </div>
                    </div>

                    {/* Member Count Input */}
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1.5 font-semibold">
                        Number of Members / Guests
                      </label>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gold shrink-0" />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={membersCount}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, "");
                            const finalVal = clean.startsWith("0") && clean.length > 1 ? clean.replace(/^0+/, "") : clean;
                            setMembersCount(finalVal === "" ? "" : Number(finalVal));
                          }}
                          className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
                        />
                      </div>
                      <p className="text-[9px] text-platinum/40 mt-1">
                        Base pricing covers up to {selectedSlot.baseCapacity} members. Surcharge is applied for extra guests.
                      </p>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="space-y-2 border-t border-white/5 pt-3">
                      <div className="flex justify-between text-platinum/70">
                        <span>Base Session Charge</span>
                        <span className="font-serif">₹{pricing.base}</span>
                      </div>
                      
                      {pricing.extra > 0 && (
                        <div className="flex justify-between text-platinum/70">
                          <span>Extra Guests Charge ({Number(membersCount) - selectedSlot.baseCapacity} x ₹{selectedSlot.extraMemberCharge})</span>
                          <span className="font-serif text-gold">+ ₹{pricing.extra}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-chalk font-semibold border-t border-white/5 pt-2 text-sm">
                        <span>Total Booking Estimate</span>
                        <span className="font-serif text-gold">₹{pricing.total}</span>
                      </div>

                      <div className="flex justify-between text-azure font-semibold bg-azure/5 border border-azure/20 p-2.5 rounded mt-2">
                        <span className="uppercase tracking-widest text-[9px]">Required Advance Deposit</span>
                        <span className="font-serif">₹{pricing.advance}</span>
                      </div>
                    </div>

                    {/* Trigger Booking */}
                    <button
                      onClick={handleInitiateBooking}
                      className="btn-gold w-full py-3.5 rounded text-xs uppercase tracking-widest font-sans flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Reserve Session
                    </button>
                  </div>
                ) : (
                  <div className="py-12 text-center text-platinum/40 italic font-sans font-light">
                    Select an available session slot from the calendar to calculate invoice pricing.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Guest Details Registration Drawer (If not logged in) */}
      <AnimatePresence>
        {showIdentityForm && (
          <motion.div 
            className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-obsidian border border-white/10 p-6 rounded-xl w-full max-w-md shadow-2xl relative">
              <button 
                onClick={() => setShowIdentityForm(false)}
                className="absolute top-4 right-4 text-platinum/40 hover:text-gold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 text-gold mb-4">
                <Users className="w-5 h-5 text-gold" />
                <span className="font-serif text-lg uppercase tracking-wider">Guest Details</span>
              </div>

              <form onSubmit={handleIdentitySubmit} className="space-y-4 font-sans text-xs text-left">
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-platinum/45 mb-1">
                    Customer / Guest Name
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Parvez Khan"
                    className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-platinum/45 mb-1">
                    Mobile Number (Mandatory)
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="e.g. 9371113786"
                    className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-gold transition-colors"
                  />
                  <p className="text-[8px] text-platinum/40 mt-1">
                    Your mobile number acts as your login credential for viewing booking status later.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full btn-gold py-3 rounded text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5"
                >
                  Confirm Details <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated Payment Modal (UPI scanner / Card detail layout) */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            className="fixed inset-0 z-[120] bg-black/85 flex items-center justify-center p-4 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaymentModal(false)}
          >
            <div 
              className="bg-obsidian border border-white/10 p-6 rounded-xl w-full max-w-lg shadow-2xl relative text-left font-sans cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-platinum/40 hover:text-gold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 text-azure mb-4 border-b border-white/5 pb-3">
                <CreditCard className="w-5 h-5 text-azure" />
                <span className="font-serif text-lg uppercase tracking-wider text-chalk">Secure Advance Payment</span>
              </div>

              {isProcessingPayment ? (
                /* Spinner during checkout */
                <div className="py-16 flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-gold animate-spin"></div>
                    <div className="absolute inset-1.5 rounded-full border-b-2 border-l-2 border-azure animate-spin duration-1000"></div>
                  </div>
                  <p className="text-xs uppercase tracking-widest text-platinum/50 animate-pulse">
                    Processing transaction details securely...
                  </p>
                </div>
              ) : (
                /* Payment layouts */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-xs">
                  {/* Left Column: Simulated UPI QR Scanner */}
                  <div className="flex flex-col items-center justify-center p-4 bg-midnight/80 rounded border border-white/5 space-y-3">
                    <span className="block text-[8px] uppercase tracking-widest text-platinum/40 font-semibold text-center">
                      Option A: UPI Scan QR code
                    </span>
                    {/* Simulated visual QR box */}
                    <div className="w-32 h-32 bg-white p-2 rounded flex items-center justify-center relative">
                      <div className="w-full h-full bg-grid-pattern opacity-95 flex flex-col items-center justify-center border-2 border-dashed border-midnight">
                        <Waves className="w-8 h-8 text-gold" />
                        <span className="text-[6px] text-midnight font-bold tracking-tighter uppercase mt-1">UPI Pay Portal</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gold/5 to-transparent pointer-events-none" />
                    </div>
                    <span className="text-[9px] text-gold text-center font-medium">
                      Scan with Google Pay, PhonePe, or Paytm
                    </span>
                  </div>

                  {/* Right Column: Card form inputs */}
                  <div className="space-y-4">
                    <span className="block text-[8px] uppercase tracking-widest text-platinum/40 font-semibold">
                      Option B: Card Checkout
                    </span>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-platinum/45 mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="4111 2222 3333 4444"
                          disabled
                          className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-platinum/50 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[8px] uppercase tracking-widest text-platinum/45 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM / YY"
                            disabled
                            className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-platinum/50 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] uppercase tracking-widest text-platinum/45 mb-1">CVV Code</label>
                          <input
                            type="password"
                            placeholder="•••"
                            disabled
                            className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-platinum/50 text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-azure/5 border border-azure/20 p-2.5 rounded text-[10px] text-platinum/80 text-center">
                      Advance Amount: <strong className="text-chalk text-sm">₹{pricing.advance}</strong>
                    </div>

                    <button
                      onClick={handleProcessPayment}
                      className="w-full btn-gold py-3 rounded text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5"
                    >
                      Authorize Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Digital Booking Receipt Modal */}
      <AnimatePresence>
        {showReceiptModal && lastCreatedBooking && (
          <motion.div 
            className="fixed inset-0 z-[120] bg-black/85 flex items-center justify-center p-4 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReceiptModal(false)}
          >
            <div 
              className="bg-obsidian border border-gold/30 p-6 rounded-xl w-full max-w-md shadow-2xl relative text-left font-sans cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="absolute top-4 right-4 text-platinum/40 hover:text-gold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center justify-center space-y-2 text-center mb-6 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-chalk font-light">Sanctuary Reserved</h4>
                <span className="block text-[8px] uppercase tracking-widest text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  Advance Payment Success
                </span>
              </div>

              {/* Receipt Body */}
              <div className="space-y-4 text-xs font-sans">
                <div className="bg-midnight/60 p-4 rounded border border-white/5 space-y-2.5">
                  <div className="flex justify-between border-b border-white/5 pb-2 text-[10px] text-platinum/40 uppercase font-semibold">
                    <span>Reference ID</span>
                    <span className="text-gold text-right">#{lastCreatedBooking.id.replace("book-", "").toUpperCase()}</span>
                  </div>
                  
                  <div className="flex justify-between text-platinum/85">
                    <span>Selected Date</span>
                    <span className="font-serif font-medium">{lastCreatedBooking.date}</span>
                  </div>
                  
                  <div className="flex justify-between text-platinum/85">
                    <span>Session Slot</span>
                    <span>{slots.find((s) => s.id === lastCreatedBooking.slotId)?.name}</span>
                  </div>

                  <div className="flex justify-between text-platinum/85">
                    <span>Group Capacity</span>
                    <span>{lastCreatedBooking.membersCount} members</span>
                  </div>

                  <div className="flex justify-between text-platinum/85 border-t border-white/5 pt-2">
                    <span>Total Amount due</span>
                    <span className="font-serif font-medium text-chalk">₹{lastCreatedBooking.totalAmount}</span>
                  </div>

                  <div className="flex justify-between text-azure font-semibold">
                    <span>Advance paid</span>
                    <span className="font-serif">₹{lastCreatedBooking.advanceAmount}</span>
                  </div>

                  <div className="flex justify-between text-red-400 font-semibold">
                    <span>Remaining balance (Due on arrival)</span>
                    <span className="font-serif">₹{lastCreatedBooking.remainingAmount}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[8.5px] text-platinum/40 leading-relaxed bg-white/[0.02] p-3 rounded border border-white/5">
                  <Info className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                  <span>
                    Keep your phone number <strong className="text-gold">{lastCreatedBooking.customerPhone}</strong> ready. You can log in using this number to verify status updates of this session.
                  </span>
                </div>

                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="w-full btn-gold py-3 rounded text-[10px] uppercase tracking-widest font-sans"
                >
                  Acknowledge &amp; Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 11. Directions & Location Segment with live Google Maps Frame */}
      {/* (Unmodified coordinates layout for page completeness) */}

      {/* 12. Footer - Restructured, high-contrast, fully readable */}
      <footer className="bg-obsidian py-10 px-6 md:px-12 border-t border-white/10 text-platinum/80 z-10 relative">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start text-left">
          
          {/* Column 1: Brand details */}
          <motion.div 
            className="space-y-2.5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariants}
          >
            <div className="flex items-center space-x-2">
              <img src="/images/logo.svg" alt="Boss Logo" className="w-7 h-7 object-contain" />
              <span className="font-serif text-gold text-base tracking-[0.25em] uppercase font-light">BOSS</span>
            </div>
            <p className="text-xs text-platinum/60 leading-relaxed font-sans font-light">
              Dhule's first completely private pool sanctuary, crafted for exclusive group events and peaceful family retreats.
            </p>
          </motion.div>

          {/* Column 2: Navigation Links */}
          <motion.div 
            className="space-y-2.5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariants}
          >
            <h4 className="font-serif text-gold text-xs tracking-wider uppercase font-semibold">Quick Navigation</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs font-sans font-light">
              <a href="#watercourt" className="hover:text-gold text-platinum/75 transition-colors">The Pool</a>
              <a href="#hygiene" className="hover:text-gold text-platinum/75 transition-colors">Hygiene Logs</a>
              <a href="#tour" className="hover:text-gold text-platinum/75 transition-colors">Estate Tour</a>
              <a href="#moments" className="hover:text-gold text-platinum/75 transition-colors">Social Clips</a>
              <a href="#coordinates" className="hover:text-gold text-platinum/75 transition-colors">Find Location</a>
            </div>
          </motion.div>

          {/* Column 3: Contact & Location details */}
          <motion.div 
            className="space-y-2.5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariants}
          >
            <h4 className="font-serif text-gold text-xs tracking-wider uppercase font-semibold">Direct Contacts</h4>
            <div className="text-xs text-platinum/80 leading-relaxed font-sans font-light space-y-1">
              <span className="block"><strong>Phone:</strong> {ESTATE_CONTACT.phoneDisplay}</span>
              <span className="block"><strong>Email:</strong> {ESTATE_CONTACT.email}</span>
              <span className="block mt-1 bg-midnight/50 p-2 rounded border border-white/5">
                <strong>Address:</strong> Zikra Park, Behind Hotel 5555, Near Dhule - Chalisgaon Road, Pimpri, Choufully, Dhule, MH 424001
              </span>
            </div>
          </motion.div>

        </div>

        <div className="container mx-auto border-t border-white/5 mt-8 pt-5 flex flex-col sm:flex-row justify-between items-center text-[9px] text-platinum/40 uppercase tracking-widest font-sans gap-3">
          <span>&copy; {new Date().getFullYear()} Boss Farm House. All rights reserved.</span>
          <span className="text-gold italic font-medium">Designed with Premium Detail</span>
        </div>
      </footer>

      {/* Booking Lookup Pop-over Modal */}
      <AnimatePresence>
        {showBookingLookup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-obsidian border border-white/10 p-6 md:p-8 rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowBookingLookup(false);
                  setLookupPhone("");
                  setHasLookedUp(false);
                  setLookupResults([]);
                }}
                className="absolute top-4 right-4 text-platinum/50 hover:text-red-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-gold font-sans font-semibold">
                    Reservation Portal
                  </span>
                  <h3 className="font-serif text-2xl text-chalk uppercase">
                    Track Your Sanctuary Stay
                  </h3>
                  <p className="text-xs text-platinum/50 font-sans font-light">
                    Enter your registered mobile number to retrieve pricing details, session statuses, and stay coordinates.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleBookingLookup} className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1.5 font-semibold">
                      Registered Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        required
                        value={lookupPhone}
                        onChange={(e) => setLookupPhone(e.target.value)}
                        placeholder="e.g. 9371113786"
                        className="flex-1 bg-midnight border border-white/10 rounded-sm px-4 py-3 text-sm text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
                      />
                      <button
                        type="submit"
                        className="btn-gold px-6 rounded-sm uppercase tracking-widest text-[10px] font-semibold cursor-pointer"
                      >
                        Retrieve
                      </button>
                    </div>
                  </div>
                </form>

                {/* Results List */}
                {hasLookedUp && (
                  <div className="space-y-4 pt-4 border-t border-white/5 max-h-[50vh] overflow-y-auto pr-1">
                    {lookupResults.length === 0 ? (
                      <div className="text-center py-6 space-y-3 font-sans">
                        <p className="text-platinum/40 italic">
                          No reservations found matching this mobile number.
                        </p>
                        <button
                          onClick={() => {
                            setShowBookingLookup(false);
                            setLookupPhone("");
                            setHasLookedUp(false);
                            setLookupResults([]);
                            const el = document.getElementById("booking-portal");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="text-gold hover:text-white transition-colors uppercase tracking-widest text-[9px] font-semibold cursor-pointer"
                        >
                          → Reserve a Session Now
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <span className="block text-[9px] uppercase tracking-widest text-platinum/40 font-semibold mb-2">
                          Active & Past Stays ({lookupResults.length})
                        </span>
                        
                        {lookupResults.map((booking) => {
                          const slotDetail = slots.find((s) => s.id === booking.slotId);
                          
                          const message = 
                            `Hi Boss Farmhouse, I have a booked session:\n` +
                            `• Ref ID: #${booking.id.replace("book-", "").toUpperCase()}\n` +
                            `• Date: ${booking.date}\n` +
                            `• Slot: ${slotDetail?.name || "Sunrise Session"}\n` +
                            `• Guest Name: ${booking.customerName}\n` +
                            `Please connect regarding check-in coordinates. Thanks!`;
                          
                          const waUrl = `https://wa.me/${ESTATE_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;

                          return (
                            <div
                              key={booking.id}
                              className="bg-midnight/60 border border-white/5 rounded p-4 space-y-3 font-sans text-left"
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] text-platinum/40">
                                    REF: #{booking.id.replace("book-", "").toUpperCase()}
                                  </span>
                                  <h4 className="font-serif text-chalk text-base font-light">
                                    {slotDetail?.name || "Session Details"}
                                  </h4>
                                  <span className="block text-[9px] text-gold uppercase tracking-wider font-semibold">
                                    {slotDetail?.timeRange}
                                  </span>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                  <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-semibold ${
                                    booking.bookingStatus === "completed" ? "bg-white/10 text-white" :
                                    booking.bookingStatus === "cancelled" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                    "bg-gold/15 text-gold border border-gold/25"
                                  }`}>
                                    {booking.bookingStatus}
                                  </span>
                                  <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-semibold ${
                                    booking.paymentStatus === "fully_paid"
                                      ? "bg-azure/10 border border-azure/20 text-azure"
                                      : "bg-gold/10 border border-gold/20 text-gold"
                                  }`}>
                                    {booking.paymentStatus === "fully_paid" ? "Fully Paid" : "Deposit Paid"}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 border-t border-b border-white/5 py-2.5 text-[10px] text-platinum/60">
                                <div>
                                  <span className="block text-[8px] uppercase tracking-widest text-platinum/40 mb-0.5">Session Date</span>
                                  <strong className="text-chalk">{booking.date}</strong>
                                </div>
                                <div>
                                  <span className="block text-[8px] uppercase tracking-widest text-platinum/40 mb-0.5">Group Size</span>
                                  <strong className="text-chalk">{booking.membersCount} Members</strong>
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-1">
                                <div className="text-[10px]">
                                  <span className="text-platinum/40 block">Outstanding Balance</span>
                                  <span className="font-serif text-sm text-chalk font-semibold">
                                    ₹{booking.remainingAmount} <span className="text-[9px] text-platinum/40 font-sans font-light">(Total: ₹{booking.totalAmount})</span>
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  {booking.bookingStatus === "confirmed" && (
                                    <button
                                      onClick={() => handleCustCancelClick(booking.id)}
                                      className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-[9px] uppercase tracking-widest rounded transition-colors font-semibold cursor-pointer"
                                    >
                                      Cancel Stay
                                    </button>
                                  )}
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-azure/10 border border-azure/20 hover:bg-azure/25 text-azure text-[9px] uppercase tracking-widest rounded transition-colors font-semibold flex items-center gap-1 cursor-pointer"
                                  >
                                    Contact Host
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Cancellation Confirmation & Reason Modal */}
      <AnimatePresence>
        {showCustCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-obsidian border border-white/10 p-6 rounded-xl shadow-2xl relative text-left"
            >
              <button
                onClick={() => {
                  setShowCustCancelModal(false);
                  setCustCancelTargetId(null);
                  setCustCancelReason("");
                }}
                className="absolute top-4 right-4 text-platinum/50 hover:text-red-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleCustExecuteCancellation} className="space-y-5 font-sans text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-red-500 font-semibold font-sans">
                    Sanctuary Policy
                  </span>
                  <h3 className="font-serif text-xl text-chalk uppercase tracking-wide">
                    Confirm Cancel Stay
                  </h3>
                  <p className="text-[11px] text-platinum/50 leading-relaxed font-light">
                    Are you sure you want to cancel your stay? This session slot will be freed for other guests. Please note that advance deposits are 100% non-refundable.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[8px] uppercase tracking-widest text-platinum/40 font-semibold">
                    Reason for Cancellation (Required)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={custCancelReason}
                    onChange={(e) => setCustCancelReason(e.target.value)}
                    placeholder="e.g. Schedule conflict / personal emergency..."
                    className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-red-500 transition-colors font-sans text-xs resize-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustCancelModal(false);
                      setCustCancelTargetId(null);
                      setCustCancelReason("");
                    }}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-platinum text-[10px] uppercase tracking-widest rounded transition-colors cursor-pointer font-sans"
                  >
                    No, Keep Reservation
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-red-500/15 border border-red-500/20 hover:bg-red-500/25 text-red-400 text-[10px] uppercase tracking-widest rounded font-semibold transition-colors cursor-pointer font-sans"
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

export default LandingPage;
