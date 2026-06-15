import React, { useState } from "react";
import { Settings, Check, Edit3, X, Info } from "lucide-react";
import useBookingStore, { type Slot } from "@/app/bookingStore";
import { toast } from "sonner";

export const Slots: React.FC = () => {
  const { slots, updateSlot } = useBookingStore();
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  
  // Local edit states
  const [name, setName] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [basePrice, setBasePrice] = useState<number | string>(0);
  const [baseCapacity, setBaseCapacity] = useState<number | string>(0);
  const [extraMemberCharge, setExtraMemberCharge] = useState<number | string>(0);
  const [advanceAmount, setAdvanceAmount] = useState<number | string>(0);

  const startEditing = (slot: Slot) => {
    setEditingSlotId(slot.id);
    setName(slot.name);
    setTimeRange(slot.timeRange);
    setBasePrice(slot.basePrice);
    setBaseCapacity(slot.baseCapacity);
    setExtraMemberCharge(slot.extraMemberCharge);
    setAdvanceAmount(slot.advanceAmount);
  };

  const cancelEditing = () => {
    setEditingSlotId(null);
  };

  const handleSave = (id: string) => {
    if (!name.trim() || !timeRange.trim()) {
      toast.error("Invalid Input", {
        description: "Slot name and time duration range are mandatory.",
      });
      return;
    }

    updateSlot(id, {
      name,
      timeRange,
      basePrice: Number(basePrice) || 0,
      baseCapacity: Number(baseCapacity) || 0,
      extraMemberCharge: Number(extraMemberCharge) || 0,
      advanceAmount: Number(advanceAmount) || 0,
    });

    setEditingSlotId(null);
    toast.success("Configuration Updated", {
      description: `Slot settings for "${name}" have been successfully locked in.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 bg-obsidian border border-gold/15 px-3 py-1.5 rounded w-max">
            <Settings className="w-4 h-4 text-gold animate-spin" />
            <span className="text-[10px] uppercase tracking-widest text-gold font-sans font-semibold">
              Configuration Module
            </span>
          </div>
          <h1 className="text-3xl font-serif text-chalk tracking-tight uppercase">
            Slots &amp; Pricing Manager
          </h1>
        </div>
      </div>

      <p className="hidden md:block text-xs text-platinum/60 max-w-xl font-light font-sans leading-relaxed">
        Establish pricing parameters, timing limits, capacity parameters, and advance deposit guidelines for the 4 slots. Modifications are applied instantly to bookings search queries.
      </p>

      {/* Slots grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {slots.map((slot) => {
          const isEditing = editingSlotId === slot.id;

          return (
            <div 
              key={slot.id} 
              className={`luxury-card p-6 rounded-xl bg-obsidian/60 border ${
                isEditing ? "border-gold/50" : "border-white/5"
              } transition-all duration-300 relative overflow-hidden`}
            >
              {isEditing ? (
                /* Editing layout form */
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-xs uppercase tracking-widest text-gold font-sans font-semibold">
                      Modify Session Configurations
                    </span>
                    <button 
                      onClick={cancelEditing}
                      className="text-platinum/40 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 font-sans text-xs">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1.5">
                        Session Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1.5">
                        Time Duration Range
                      </label>
                      <input
                        type="text"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1.5">
                          Base Price (₹)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={basePrice}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, "");
                            const finalVal = clean.startsWith("0") && clean.length > 1 ? clean.replace(/^0+/, "") : clean;
                            setBasePrice(finalVal === "" ? "" : Number(finalVal));
                          }}
                          className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1.5">
                          Base Group Capacity Limit
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={baseCapacity}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, "");
                            const finalVal = clean.startsWith("0") && clean.length > 1 ? clean.replace(/^0+/, "") : clean;
                            setBaseCapacity(finalVal === "" ? "" : Number(finalVal));
                          }}
                          className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1.5">
                          Surcharge Per Extra Guest (₹)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={extraMemberCharge}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, "");
                            const finalVal = clean.startsWith("0") && clean.length > 1 ? clean.replace(/^0+/, "") : clean;
                            setExtraMemberCharge(finalVal === "" ? "" : Number(finalVal));
                          }}
                          className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1.5">
                          Required Deposit Advance (₹)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={advanceAmount}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, "");
                            const finalVal = clean.startsWith("0") && clean.length > 1 ? clean.replace(/^0+/, "") : clean;
                            setAdvanceAmount(finalVal === "" ? "" : Number(finalVal));
                          }}
                          className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-white/5 justify-end">
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-platinum text-[10px] uppercase tracking-widest rounded transition-colors cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      onClick={() => handleSave(slot.id)}
                      className="btn-gold px-4 py-2 text-[10px] uppercase tracking-widest rounded flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Lock Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Static Slot Card */
                <div className="space-y-5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="block text-[9px] text-gold uppercase tracking-widest font-sans font-semibold">
                        {slot.timeRange}
                      </span>
                      <h3 className="font-serif text-lg text-chalk font-light">
                        {slot.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => startEditing(slot)}
                      className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                      title="Edit Configurations"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-4 font-sans text-xs">
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest text-platinum/45 mb-0.5">Base Rate</span>
                      <span className="font-serif text-lg text-chalk">₹{slot.basePrice}</span>
                      <span className="text-[10px] text-platinum/40 block">for {slot.baseCapacity} guests</span>
                    </div>

                    <div>
                      <span className="block text-[8px] uppercase tracking-widest text-platinum/45 mb-0.5">Extra Guest fee</span>
                      <span className="font-serif text-lg text-chalk">₹{slot.extraMemberCharge}</span>
                      <span className="text-[10px] text-platinum/40 block">per above capacity</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center font-sans text-xs">
                    <div className="flex items-center gap-1 bg-azure/10 border border-azure/20 px-3 py-1.5 rounded">
                      <Info className="w-3.5 h-3.5 text-azure" />
                      <span className="text-[9px] uppercase tracking-widest text-azure font-semibold">
                        Required Deposit: ₹{slot.advanceAmount}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Slots;
