import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Sparkles, 
  Flame, 
  Leaf, 
  Printer, 
  X, 
  ChevronRight, 
  Info, 
  Grid, 
  List, 
  Coffee, 
  UtensilsCrossed, 
  Wine, 
  Award, 
  TrendingUp,
  SlidersHorizontal
} from "lucide-react";
import { detailedMenuData, MenuSection, DetailedMenuItem } from "../menuData";

export default function GourmetMenu() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isVegetarianOnly, setIsVegetarianOnly] = useState<boolean>(false);
  const [isSignaturesOnly, setIsSignaturesOnly] = useState<boolean>(false);
  const [isSpicyOnly, setIsSpicyOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "classic">("grid");
  const [isPrintMode, setIsPrintMode] = useState<boolean>(false);

  // Filter Categories
  const categories = useMemo(() => {
    return [
      { id: "all", title: "Full Menu", icon: UtensilsCrossed },
      ...detailedMenuData.map(sec => ({
        id: sec.id,
        title: sec.title.replace("Le Patio ", "").split(" (")[0],
        icon: sec.id === "beverages" ? Wine : sec.id === "kids" ? Coffee : UtensilsCrossed
      }))
    ];
  }, []);

  // Filter Menu Items based on all active filters
  const filteredSections = useMemo(() => {
    return detailedMenuData.map(section => {
      // If we filtered by a specific category, skip other sections
      if (selectedCategory !== "all" && section.id !== selectedCategory) {
        return null;
      }

      const filteredItems = section.items.filter(item => {
        // Search query match
        const matchesSearch = searchQuery === "" || 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Vegetarian filter
        const matchesVeg = !isVegetarianOnly || item.isVegetarian;

        // Signatures filter
        const matchesSignature = !isSignaturesOnly || item.isSignature;

        // Spicy filter
        const matchesSpicy = !isSpicyOnly || (item.spicyLevel && item.spicyLevel > 0);

        return matchesSearch && matchesVeg && matchesSignature && matchesSpicy;
      });

      if (filteredItems.length === 0) return null;

      return {
        ...section,
        items: filteredItems
      };
    }).filter(Boolean) as MenuSection[];
  }, [selectedCategory, searchQuery, isVegetarianOnly, isSignaturesOnly, isSpicyOnly]);

  // Count total matching items
  const totalItemsCount = useMemo(() => {
    return filteredSections.reduce((acc, sec) => acc + sec.items.length, 0);
  }, [filteredSections]);

  const handlePrint = () => {
    window.print();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setIsVegetarianOnly(false);
    setIsSignaturesOnly(false);
    setIsSpicyOnly(false);
    setSelectedCategory("all");
  };

  return (
    <div id="gourmet-menu-container" className={`w-full transition-colors duration-300 ${isPrintMode ? "bg-white text-black p-8 sm:p-12 md:p-16 max-w-4xl mx-auto rounded-lg shadow-2xl" : "text-white"}`}>
      
      {/* SECTION HEADER & CONTROL BAR */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b ${isPrintMode ? "border-black/20" : "border-white/5"} print:hidden`}>
        <div>
          <span className="text-gold text-xs font-semibold uppercase tracking-widest flex items-center gap-2">
            <Award className="w-3.5 h-3.5" /> Curated Dining Selection
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
            Artisanal Culinary Menu
          </h3>
          <p className="text-xs text-gray-400 font-light mt-1.5 max-w-xl">
            Transcribed directly from our real kitchen cards. Use the filters to browse our selections or prepare a high-contrast print layout.
          </p>
        </div>

        {/* Layout & Print controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setViewMode(prev => prev === "grid" ? "classic" : "grid")}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-sm border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
            title="Toggle Visual Grid / Minimalist Classic Menu layout"
          >
            {viewMode === "grid" ? (
              <>
                <List className="w-3.5 h-3.5 text-gold" /> Classic Layout
              </>
            ) : (
              <>
                <Grid className="w-3.5 h-3.5 text-gold" /> Visual Grid
              </>
            )}
          </button>

          <button
            onClick={() => setIsPrintMode(prev => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-sm border transition-all ${
              isPrintMode 
                ? "border-gold text-gold bg-gold/10 hover:bg-gold/20" 
                : "border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Printer className="w-3.5 h-3.5" /> {isPrintMode ? "Exit Print Mode" : "Print View"}
          </button>
          
          {isPrintMode && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-sm bg-gold text-charcoal hover:bg-opacity-90 shadow-lg shadow-gold/20 transition-all"
            >
              Confirm & Print
            </button>
          )}
        </div>
      </div>

      {isPrintMode && (
        <div className="mb-8 p-4 bg-gold/5 border border-gold/20 rounded-sm text-xs text-gold/80 flex items-start gap-2.5 print:hidden">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Print layout enabled!</p>
            <p className="font-light mt-0.5">We have designed a stunning, clean high-contrast black & white layout that matches real printed restaurant cards. All promotional elements, dark backgrounds, and headers are hidden during print.</p>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTERS PANEL */}
      <div className={`mt-6 space-y-4 print:hidden ${isPrintMode ? "hidden" : ""}`}>
        {/* Search Input & Interactive Tags */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for momos, pizza, wings, steak, cocktails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161616] pl-10 pr-10 py-3 rounded-sm border border-white/5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-gold/30 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-white text-gray-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Dietary Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsVegetarianOnly(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold tracking-wider rounded-sm border transition-all ${
                isVegetarianOnly 
                  ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" 
                  : "border-white/5 bg-[#161616] text-gray-400 hover:text-white"
              }`}
            >
              <Leaf className="w-3.5 h-3.5" /> Vegetarian
            </button>
            <button
              onClick={() => setIsSignaturesOnly(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold tracking-wider rounded-sm border transition-all ${
                isSignaturesOnly 
                  ? "border-gold/30 text-gold bg-gold/5" 
                  : "border-white/5 bg-[#161616] text-gray-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Chef's Specials
            </button>
            <button
              onClick={() => setIsSpicyOnly(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold tracking-wider rounded-sm border transition-all ${
                isSpicyOnly 
                  ? "border-rose-500/30 text-rose-400 bg-rose-500/5" 
                  : "border-white/5 bg-[#161616] text-gray-400 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Spicy
            </button>
            {(searchQuery || isVegetarianOnly || isSignaturesOnly || isSpicyOnly) && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-gold underline underline-offset-4 ml-1 transition-all"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Categories slider */}
        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold whitespace-nowrap rounded-sm border transition-all ${
                    selectedCategory === cat.id
                      ? "border-gold text-gold bg-gold/5"
                      : "border-white/5 bg-[#141414] text-gray-400 hover:text-white hover:border-white/15"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 shrink-0" />
                  {cat.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CORE MENU DISPLAY */}
      <div className={`mt-8 ${isPrintMode ? "font-serif bg-white text-black p-4" : ""}`}>
        
        {/* PRINT BANNER - ONLY VISIBLE WHEN PRINTING */}
        <div className="hidden print:block text-center border-b-2 border-black pb-8 mb-8">
          <h1 className="text-4xl font-serif font-black tracking-wide uppercase text-black">Le Patio</h1>
          <p className="text-xs font-light tracking-widest uppercase mt-1">Luxury Rooftop & Cozy Outdoor Dining</p>
          <div className="flex justify-center gap-6 mt-4 text-[10px] uppercase font-semibold">
            <span>Mandikhatar Road, Kathmandu</span>
            <span>•</span>
            <span>Tel: +977 9849488029</span>
            <span>•</span>
            <span>WhatsApp: +977 9849488029</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {filteredSections.length > 0 ? (
            <motion.div 
              key={`${selectedCategory}-${searchQuery}-${isVegetarianOnly}-${isSignaturesOnly}-${isSpicyOnly}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-12 sm:space-y-16"
            >
              {filteredSections.map((section) => (
                <div key={section.id} className="space-y-6 break-inside-avoid">
                  
                  {/* Section Title */}
                  <div className={`border-b ${isPrintMode ? "border-black pb-2" : "border-white/5 pb-3"} flex items-baseline justify-between`}>
                    <h4 className={`text-lg sm:text-xl font-serif font-bold ${isPrintMode ? "text-black" : "text-white"}`}>
                      {section.title}
                    </h4>
                    {section.subtitle && (
                      <span className={`text-[10px] sm:text-xs uppercase tracking-wider font-light ${isPrintMode ? "text-gray-600" : "text-gold/80"}`}>
                        {section.subtitle}
                      </span>
                    )}
                  </div>

                  {/* Layout selector logic: Grid vs Classic Dotted */}
                  {viewMode === "grid" && !isPrintMode ? (
                    /* VISUAL GRID LAYOUT (Modern Digital Showcase) */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.items.map((item, idx) => {
                        const hasImg = !!item.image;
                        return (
                          <div 
                            key={idx}
                            className={`group overflow-hidden rounded-sm border ${
                              isPrintMode 
                                ? "border-black/10 bg-white text-black p-4" 
                                : "border-white/5 bg-[#151515] hover:border-gold/20 text-white transition-all duration-300 flex flex-col justify-between"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row h-full">
                              {/* Left Side: Image (Only if present and not print) */}
                              {hasImg && (
                                <div className="sm:w-44 h-40 sm:h-auto overflow-hidden shrink-0 relative bg-neutral-900 flex items-center justify-center">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-contain sm:object-cover group-hover:scale-105 transition-all duration-500"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                  />
                                  {/* Overlay Badges */}
                                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                                    {item.isSignature && (
                                      <span className="bg-gold text-charcoal text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-lg">
                                        <Sparkles className="w-2 h-2 fill-charcoal" /> Chef's choice
                                      </span>
                                    )}
                                    {item.isPopular && (
                                      <span className="bg-rose-600 text-white text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-lg">
                                        <TrendingUp className="w-2 h-2" /> Top Seller
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Right Side / Content details */}
                              <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-start gap-4">
                                    <h5 className="text-sm font-serif font-bold text-white group-hover:text-gold transition-colors flex items-center gap-1.5 flex-wrap">
                                      {item.name}
                                      {item.isVegetarian && (
                                        <Leaf className="w-3.5 h-3.5 text-emerald-500 shrink-0" title="Vegetarian Item" />
                                      )}
                                      {item.spicyLevel && item.spicyLevel > 0 ? (
                                        <div className="flex items-center shrink-0">
                                          {Array.from({ length: item.spicyLevel }).map((_, i) => (
                                            <Flame key={i} className="w-3 h-3 text-rose-500" />
                                          ))}
                                        </div>
                                      ) : null}
                                    </h5>
                                    <span className="text-gold font-bold font-mono text-xs whitespace-nowrap bg-gold/5 px-2 py-1 rounded-sm border border-gold/15">
                                      {item.price}
                                    </span>
                                  </div>

                                  {item.description && (
                                    <p className="text-[11px] text-gray-400 font-light mt-2 leading-relaxed">
                                      {item.description}
                                    </p>
                                  )}
                                </div>

                                {/* Custom labels row if no image badges but labels are present */}
                                {!hasImg && (item.isSignature || item.isPopular) && (
                                  <div className="mt-4 flex flex-wrap gap-1.5">
                                    {item.isSignature && (
                                      <span className="text-[8px] tracking-wider uppercase font-extrabold border border-gold/20 text-gold bg-gold/5 px-2 py-0.5 rounded-sm flex items-center gap-0.5">
                                        <Sparkles className="w-2 h-2" /> Chef's Choice
                                      </span>
                                    )}
                                    {item.isPopular && (
                                      <span className="text-[8px] tracking-wider uppercase font-extrabold border border-rose-500/20 text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded-sm flex items-center gap-0.5">
                                        <TrendingUp className="w-2 h-2" /> Top Seller
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* CLASSIC MINIMALIST LAYOUT (Dotted Spacers - Ideal for both digital & crisp printing) */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      {section.items.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="flex flex-col justify-between pb-1.5 break-inside-avoid"
                        >
                          <div className="flex justify-between items-end gap-3">
                            <h5 className={`text-sm font-bold font-serif flex items-center gap-1.5 flex-wrap ${isPrintMode ? "text-black" : "text-white"}`}>
                              <span>{item.name}</span>
                              
                              {/* Icons */}
                              {item.isVegetarian && (
                                <span className="text-[8px] uppercase tracking-wider font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1 rounded-sm shrink-0 flex items-center gap-0.5 print:border-none print:bg-none print:text-emerald-700">
                                  <Leaf className="w-2 h-2" /> Veg
                                </span>
                              )}
                              {item.isSignature && (
                                <span className="text-[8px] uppercase tracking-wider font-extrabold bg-gold/10 text-gold border border-gold/20 px-1 rounded-sm shrink-0 flex items-center gap-0.5 print:border-none print:bg-none print:text-amber-800">
                                  ⭐ Spec
                                </span>
                              )}
                              {item.spicyLevel && item.spicyLevel > 0 ? (
                                <span className="flex items-center shrink-0">
                                  {Array.from({ length: item.spicyLevel }).map((_, i) => (
                                    <Flame key={i} className="w-2.5 h-2.5 text-rose-500" />
                                  ))}
                                </span>
                              ) : null}
                            </h5>

                            {/* Dotted spacer */}
                            <div className={`flex-1 border-b border-dotted mx-1 h-2 shrink ${isPrintMode ? "border-black/30" : "border-white/10"}`}></div>

                            <span className={`font-mono text-xs font-bold shrink-0 ${isPrintMode ? "text-black" : "text-gold"}`}>
                              {item.price}
                            </span>
                          </div>

                          {item.description && (
                            <p className={`text-[11px] font-light mt-1.5 leading-relaxed pr-8 ${isPrintMode ? "text-gray-700 italic" : "text-gray-400"}`}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </motion.div>
          ) : (
            /* EMPTY FILTERED STATE */
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 border border-white/5 bg-[#121212] rounded-sm max-w-lg mx-auto"
            >
              <Info className="w-8 h-8 text-gold mx-auto opacity-80" />
              <h4 className="text-base font-serif font-semibold text-white mt-4">No menu items found</h4>
              <p className="text-xs text-gray-400 font-light mt-2 max-w-sm mx-auto px-6">
                No items match your active filters (Search: "{searchQuery}" {isVegetarianOnly ? "+ Vegetarian" : ""} {isSignaturesOnly ? "+ Signature" : ""} {isSpicyOnly ? "+ Spicy" : ""}).
              </p>
              <button
                onClick={clearFilters}
                className="mt-5 px-4 py-2 text-xs font-semibold bg-gold text-charcoal rounded-sm hover:bg-opacity-90 transition-all"
              >
                Reset Menu Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRINT FOOTER - ONLY VISIBLE ON PRINTED MATERIAL */}
        <div className="hidden print:block text-center border-t border-black/30 pt-8 mt-12 text-[10px] text-gray-600 space-y-1">
          <p className="font-semibold">Thank you for dining with Le Patio!</p>
          <p className="font-light">Note: Complete wine selection, spirits bottle pricing, and vegetarian modifications are available upon table service.</p>
          <p className="font-light text-[8px] pt-3">Printed directly from our live digital layout: https://maps.app.goo.gl/P8n1mymcH8ZMTKAP8</p>
        </div>

      </div>

    </div>
  );
}
