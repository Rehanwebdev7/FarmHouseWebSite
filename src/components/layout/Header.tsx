import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Menu, X, ShieldCheck } from "lucide-react";
import { ESTATE_CONTACT } from "@/config/constants";

export const Header: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header if scrolling up, hide if scrolling down
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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

  const menuItems = [
    { name: "The Sanctuary", href: "#sanctuary" },
    { name: "Hygiene Standard", href: "#hygiene" },
    { name: "Amenities", href: "#amenities" },
    { name: "Coordinates", href: "#coordinates" },
  ];

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 h-20 glass-header flex items-center justify-between px-6 md:px-12"
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -80 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Brand Logo */}
        <a href="#" className="flex items-center space-x-3 group">
          <img src="/images/logo.svg" alt="Boss Logo" className="w-8 h-8 object-contain group-hover:scale-105 transition-transform duration-300" />
          <span className="font-serif text-sm md:text-base tracking-widest text-chalk uppercase font-light">
            Boss <span className="text-gold italic font-normal">Farm House</span>
          </span>
        </a>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-xs tracking-widest uppercase text-platinum/70 hover:text-gold transition-colors duration-300 font-sans"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Desktop Right Panel */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Active Pool Hygiene Status */}
          <div className="flex items-center space-x-2 bg-midnight/80 px-3 py-1.5 rounded-full border border-gold/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-azure opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-azure"></span>
            </span>
            <span className="text-[10px] uppercase tracking-widest font-sans text-platinum/80 flex items-center gap-1">
              Pool Status: <strong className="text-gold">pH 7.4 • Pure</strong>
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-azure" />
          </div>

          {/* Book CTA */}
          <button
            onClick={handleWhatsAppRedirect}
            className="btn-gold px-5 py-2 text-xs uppercase tracking-widest rounded-sm flex items-center gap-2"
          >
            <Phone className="w-3.5 h-3.5" />
            Book Sanctuary
          </button>
        </div>

        {/* Mobile Menu Icon */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-platinum hover:text-gold transition-colors"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </motion.header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-midnight/95 backdrop-blur-md flex flex-col justify-center px-8 space-y-8 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col space-y-6">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-serif text-3xl text-platinum hover:text-gold transition-colors tracking-wide"
                >
                  {item.name}
                </a>
              ))}
            </div>

            <hr className="border-border" />

            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2 bg-obsidian p-4 rounded border border-border">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-azure opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-azure"></span>
                </span>
                <span className="text-xs uppercase tracking-widest text-platinum/90">
                  Pool Status: <strong className="text-gold">pH 7.4 • Balanced & Sterile</strong>
                </span>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleWhatsAppRedirect();
                }}
                className="btn-gold w-full py-4 text-xs uppercase tracking-widest rounded flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Book Sanctuary
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
