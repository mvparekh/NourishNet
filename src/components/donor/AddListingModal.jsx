import { useState } from "react";
import {
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Modal } from "../common/Modal";
import { useApp } from "../../context/AppContext";
const CATEGORIES = [
  { value: "GUJARATI_THALI", label: "Gujarati Thali & Kathiyawadi Meals", defaultUnit: "PLATES" },
  { value: "COOKED_MEAL", label: "Cooked Meals & Catering Surplus", defaultUnit: "PLATES" },
  { value: "ROTIS_BREADS", label: "Rotlis, Theplas & Bakery Breads", defaultUnit: "PACKS" },
  { value: "DAL_RICE", label: "Dal, Khichdi & Steamed Rice", defaultUnit: "PLATES" },
  { value: "BIRYANI_RICE", label: "Dum Biryani & Rice Bowls", defaultUnit: "PLATES" },
  { value: "BAKERY", label: "Fresh Bakery Pastries & Loaves", defaultUnit: "PACKS" },
  { value: "PRODUCE_VEG", label: "Fresh Farm Produce (APMC Surplus)", defaultUnit: "KG" },
  { value: "DAIRY_PACKAGED", label: "Packaged Dairy & Milk Products", defaultUnit: "PACKS" },
  { value: "SNACKS_FARSAN", label: "Fresh Farsan, Dhokla & Snacks", defaultUnit: "KG" },
  { value: "RAW_INGREDIENTS", label: "Dry Grains & Raw Ingredients", defaultUnit: "KG" }
];
const PRESET_PHOTOS = [
  { label: "Gujarati Thali", url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80" },
  { label: "Cooked Meal / Curry", url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80" },
  { label: "Rotis & Breads", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80" },
  { label: "Dum Biryani / Rice", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80" },
  { label: "Fresh Produce / Veg", url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80" }
];
const ALLERGEN_OPTIONS = ["Dairy", "Gluten", "Nuts", "Mustard", "Sesame", "Soy"];
const AddListingModal = ({ isOpen, onClose }) => {
  const { createListing, currentUser } = useApp();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("GUJARATI_THALI");
  const [quantity, setQuantity] = useState(30);
  const [unit, setUnit] = useState("PLATES");
  const [recoveryModel, setRecoveryModel] = useState("DONATION");
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(250);
  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS[0].url);
  const [selectedAllergens, setSelectedAllergens] = useState(["Dairy", "Gluten"]);
  const [foodSafetyDeclaration, setFoodSafetyDeclaration] = useState(true);
  const [dietaryType, setDietaryType] = useState("JAIN_VEG");
  const [storageCondition, setStorageCondition] = useState("HOT_INSULATED");
  const [packagingStatus, setPackagingStatus] = useState("FOOD_GRADE_CONTAINERS");
  const [hoursUntilExpiry, setHoursUntilExpiry] = useState(3);
  const [pickupAddress, setPickupAddress] = useState(currentUser?.address || "Loading Bay 1, Surat");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const matched = CATEGORIES.find((c) => c.value === cat);
    if (matched) setUnit(matched.defaultUnit);
    if (cat === "GUJARATI_THALI") setImageUrl(PRESET_PHOTOS[0].url);
    else if (cat === "COOKED_MEAL" || cat === "DAL_RICE") setImageUrl(PRESET_PHOTOS[1].url);
    else if (cat === "ROTIS_BREADS" || cat === "BAKERY") setImageUrl(PRESET_PHOTOS[2].url);
    else if (cat === "BIRYANI_RICE") setImageUrl(PRESET_PHOTOS[3].url);
    else if (cat === "PRODUCE_VEG") setImageUrl(PRESET_PHOTOS[4].url);
  };
  const toggleAllergen = (allergen) => {
    setSelectedAllergens(
      (prev) => prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!currentUser) {
      setErrorMessage("Must be signed in to create a listing.");
      return;
    }
    if (!foodSafetyDeclaration) {
      setErrorMessage("You must confirm the food safety declaration before publishing.");
      return;
    }
    const now = /* @__PURE__ */ new Date();
    const preparedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + hoursUntilExpiry * 60 * 60 * 1e3).toISOString();
    const pickupWindowStart = now.toISOString();
    const pickupWindowEnd = expiresAt;
    const finalPrice = recoveryModel === "DONATION" ? 0 : Math.max(0, Number(pricePerUnit));
    const res = await createListing({
      title,
      category,
      quantity: Number(quantity),
      unit,
      recoveryModel,
      pricePerUnit: finalPrice,
      originalCommercialPrice: Number(originalPrice) || 0,
      imageUrl,
      allergens: selectedAllergens,
      foodSafetyDeclaration: true,
      dietaryType,
      storageCondition,
      packagingStatus,
      preparedAt,
      expiresAt,
      pickupWindowStart,
      pickupWindowEnd,
      pickupAddress,
      donorLocality: currentUser.locality || "Vesu",
      latitude: currentUser.latitude || 21.17,
      longitude: currentUser.longitude || 72.8,
      notes: notes.trim() || void 0
    });
    if (res.success) {
      setTitle("");
      setNotes("");
      onClose();
    } else {
      setErrorMessage(res.error || "Failed to publish surplus listing.");
    }
  };
  return <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="List Fresh Surplus Food"
    subtitle="Publish surplus meals with clear recovery model & food safety declarations"
    maxWidth="2xl"
  >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {errorMessage && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>}

        {
    /* Title */
  }
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Surplus Description & Item Title *
          </label>
          <input
    id="listing-title-input"
    type="text"
    required
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. Kathiyawadi Thali (Undhiyu, Puri, Gujarati Dal & Steamed Rice)"
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 font-medium"
  />
        </div>

        {
    /* Recovery Model Selection */
  }
        <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
          <label className="block text-xs font-bold text-slate-900">
            Recovery Model *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
    type="button"
    onClick={() => {
      setRecoveryModel("DONATION");
      setPricePerUnit(0);
    }}
    className={`p-2.5 rounded-xl text-left border transition-all ${recoveryModel === "DONATION" ? "bg-white border-purple-600 shadow-xs ring-2 ring-purple-600/20" : "bg-white/60 border-slate-200 hover:bg-white"}`}
  >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Free Donation</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">₹0</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">100% free food rescue for charity shelters</p>
            </button>

            <button
    type="button"
    onClick={() => {
      setRecoveryModel("SOCIAL_PRICE");
      setPricePerUnit(20);
    }}
    className={`p-2.5 rounded-xl text-left border transition-all ${recoveryModel === "SOCIAL_PRICE" ? "bg-white border-purple-600 shadow-xs ring-2 ring-purple-600/20" : "bg-white/60 border-slate-200 hover:bg-white"}`}
  >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Social Price</span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">Subsidized</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Nominal cost recovery for kitchens (e.g. ₹15–₹30)</p>
            </button>

            <button
    type="button"
    onClick={() => {
      setRecoveryModel("RECOVERY_PRICE");
      setPricePerUnit(45);
    }}
    className={`p-2.5 rounded-xl text-left border transition-all ${recoveryModel === "RECOVERY_PRICE" ? "bg-white border-purple-600 shadow-xs ring-2 ring-purple-600/20" : "bg-white/60 border-slate-200 hover:bg-white"}`}
  >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Recovery Price</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Discounted</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Discounted surplus at 60–80% below retail</p>
            </button>
          </div>

          {
    /* Pricing fields if not free */
  }
          {recoveryModel !== "DONATION" && <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Recovery Price per Unit (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-semibold text-slate-400">₹</span>
                  <input
    type="number"
    min={1}
    max={500}
    value={pricePerUnit}
    onChange={(e) => setPricePerUnit(Number(e.target.value))}
    className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 font-bold text-purple-900"
  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Original Retail Value (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-semibold text-slate-400">₹</span>
                  <input
    type="number"
    min={1}
    value={originalPrice}
    onChange={(e) => setOriginalPrice(Number(e.target.value))}
    className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
  />
                </div>
              </div>
            </div>}
        </div>

        {
    /* Category & Quantity Grid */
  }
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Food Category *
            </label>
            <select
    value={category}
    onChange={(e) => handleCategoryChange(e.target.value)}
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
  >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>
                  {c.label}
                </option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity *
            </label>
            <input
    type="number"
    min={1}
    max={1e3}
    required
    value={quantity}
    onChange={(e) => setQuantity(Number(e.target.value))}
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
  />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unit *
            </label>
            <select
    value={unit}
    onChange={(e) => setUnit(e.target.value)}
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
  >
              <option value="PLATES">Plates (Meals)</option>
              <option value="KG">Kilograms (kg)</option>
              <option value="PACKS">Packs / Boxes</option>
              <option value="TRAYS">Catering Trays</option>
              <option value="LITRES">Litres</option>
            </select>
          </div>
        </div>

        {
    /* Dietary & Packaging Specifications */
  }
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dietary Type
            </label>
            <select
    value={dietaryType}
    onChange={(e) => setDietaryType(e.target.value)}
    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
  >
              <option value="JAIN_VEG">Jain Vegetarian (No Onion/Garlic)</option>
              <option value="VEG">Pure Vegetarian</option>
              <option value="VEGAN">Vegan</option>
              <option value="NON_VEG">Non-Vegetarian</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Storage Condition
            </label>
            <select
    value={storageCondition}
    onChange={(e) => setStorageCondition(e.target.value)}
    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
  >
              <option value="HOT_INSULATED">Hot Insulated (&gt;65°C)</option>
              <option value="ROOM_TEMP">Room Temperature</option>
              <option value="REFRIGERATED">Refrigerated (&lt;5°C)</option>
              <option value="FROZEN">Frozen Storage</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Packaging Container
            </label>
            <select
    value={packagingStatus}
    onChange={(e) => setPackagingStatus(e.target.value)}
    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
  >
              <option value="FOOD_GRADE_CONTAINERS">Food-Grade Insulated Boxes</option>
              <option value="FOIL_PACKS">Hygienic Foil Packs</option>
              <option value="BULK_TRAYS">Stainless/Bulk Trays</option>
              <option value="SEALED_BOXES">Sealed Cardboard Crates</option>
            </select>
          </div>
        </div>

        {
    /* Photo Selection */
  }
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Food Item Photo (Visual Verification Aid)
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {PRESET_PHOTOS.map((p) => <button
    key={p.label}
    type="button"
    onClick={() => setImageUrl(p.url)}
    className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${imageUrl === p.url ? "border-purple-600 ring-2 ring-purple-600/20" : "border-slate-200 opacity-70 hover:opacity-100"}`}
  >
                <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] truncate px-1 text-center font-medium">
                  {p.label}
                </span>
              </button>)}
          </div>
        </div>

        {
    /* Allergens Selection */
  }
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Contains Allergens (Check all that apply)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ALLERGEN_OPTIONS.map((alg) => <button
    key={alg}
    type="button"
    onClick={() => toggleAllergen(alg)}
    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${selectedAllergens.includes(alg) ? "bg-purple-100 text-purple-800 border-purple-300" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}
  >
                {alg}
              </button>)}
          </div>
        </div>

        {
    /* Expiry Window Slider */
  }
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700">
              Safe Expiry Window (from now)
            </span>
            <span className="text-xs font-bold text-purple-700 font-mono">
              {hoursUntilExpiry} hours remaining
            </span>
          </div>
          <input
    type="range"
    min={1}
    max={18}
    step={0.5}
    value={hoursUntilExpiry}
    onChange={(e) => setHoursUntilExpiry(Number(e.target.value))}
    className="w-full accent-purple-600 cursor-pointer"
  />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>1h (Urgent)</span>
            <span>4h (Standard cooked)</span>
            <span>12h (Bakery/Produce)</span>
            <span>18h</span>
          </div>
        </div>

        {
    /* Loading Bay Address */
  }
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Pickup Loading Bay / Kitchen Entrance (Surat) *
          </label>
          <input
    type="text"
    required
    value={pickupAddress}
    onChange={(e) => setPickupAddress(e.target.value)}
    placeholder="e.g. Service Gate 2, VIP Galleria, University Road, Vesu, Surat"
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
  />
        </div>

        {
    /* Special Notes */
  }
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Special Handling Instructions (Optional)
          </label>
          <textarea
    rows={2}
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    placeholder="e.g. Please bring thermal crates. Contact chef upon arrival at back entry."
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
  />
        </div>

        {
    /* Food Safety Declaration Checkbox */
  }
        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-start gap-2.5">
          <input
    type="checkbox"
    id="safety-declaration-chk"
    checked={foodSafetyDeclaration}
    onChange={(e) => setFoodSafetyDeclaration(e.target.checked)}
    className="mt-0.5 rounded accent-purple-600 cursor-pointer"
  />
          <label htmlFor="safety-declaration-chk" className="text-xs text-amber-900 leading-relaxed cursor-pointer">
            <span className="font-bold">FSSAI Food Safety Declaration:</span> I confirm that this surplus food has been hygienically prepared, temperature-controlled, stored in food-grade packaging, and remains fit for safe consumption within the indicated window.
          </label>
        </div>

        {
    /* Actions */
  }
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
  >
            Cancel
          </button>
          <button
    id="publish-listing-submit-btn"
    type="submit"
    className="px-5 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
  >
            <Sparkles className="w-4 h-4" />
            <span>Publish Surplus Listing</span>
          </button>
        </div>
      </form>
    </Modal>;
};
export {
  AddListingModal
};
