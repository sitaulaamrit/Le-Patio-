import React, { useState } from "react";
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  Music, 
  Wifi, 
  Tv, 
  Sparkles, 
  Accessibility, 
  Utensils, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Users, 
  CreditCard, 
  Car, 
  Baby, 
  ExternalLink, 
  Menu, 
  X,
  Share2,
  AlertCircle,
  Star,
  Check,
  Lock,
  Unlock,
  Trash2,
  Plus,
  Download,
  LogOut,
  FileText,
  Bell,
  Sun,
  Moon,
  Leaf,
  Copy,
  Volume2,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { lePatioData, reassurancePoints, faqItems, guestReviews } from "./data";
import GourmetMenu from "./components/GourmetMenu";
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  documentId,
  handleFirestoreError,
  OperationType
} from "./firebase";

// Direct paths to generated photorealistic images
import heroImg from "./assets/images/le_patio_hero_1782575806506.jpg";
import cocktailsImg from "./assets/images/le_patio_cocktails_1782575824834.jpg";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "menu" | "admin">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"amenities" | "children" | "accessibility">("amenities");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});

  // Admin and Reservation Database states
  const [reservations, setReservations] = useState<any[]>(() => {
    const stored = localStorage.getItem("le_patio_reservations");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // Fallback
      }
    }
    return [];
  });

  const [myBookedIds, setMyBookedIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("le_patio_my_booked_ids");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // Fallback
      }
    }
    return [];
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem("le_patio_admin_auth") === "true";
  });
  const [adminPin, setAdminPin] = useState("");
  const [pinError, setPinError] = useState("");

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [rulesCopied, setRulesCopied] = useState(false);
  const [showDiagnosticGuide, setShowDiagnosticGuide] = useState(true);

  const firestoreRulesText = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`;

  const copyRulesToClipboard = () => {
    navigator.clipboard.writeText(firestoreRulesText);
    setRulesCopied(true);
    setTimeout(() => setRulesCopied(false), 2000);
  };

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Ref to track if the initial load of reservations is complete
  const isInitialLoad = React.useRef(true);

  // Sync with Firestore
  React.useEffect(() => {
    let q;
    const isOwner = isAdminAuthenticated || (currentUser && currentUser.email === "amritsitaula2022@gmail.com");

    if (isOwner) {
      q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
    } else if (currentUser) {
      q = query(
        collection(db, "reservations"), 
        where("userId", "==", currentUser.uid), 
        orderBy("createdAt", "desc")
      );
    } else if (myBookedIds.length > 0) {
      q = query(
        collection(db, "reservations"), 
        where(documentId(), "in", myBookedIds.slice(0, 30))
      );
    } else {
      setReservations([]);
      return;
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      setFirestoreError(null);
      if (snapshot.empty) {
        setReservations([]);
        isInitialLoad.current = false;
      } else {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Real-time changes auditive alerts for owner's dashboard
        if (!isInitialLoad.current) {
          snapshot.docChanges().forEach((change) => {
            if (isAdminAuthenticatedRef.current) {
              if (change.type === "added") {
                playNotificationSound("added");
              } else if (change.type === "modified") {
                playNotificationSound("modified");
              } else if (change.type === "removed") {
                playNotificationSound("removed");
              }
            }
          });
        }

        setReservations(docs);
        localStorage.setItem("le_patio_reservations", JSON.stringify(docs));
        isInitialLoad.current = false;
      }
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
      if (error.message && error.message.toLowerCase().includes("permission")) {
        setFirestoreError("Permission Denied: Your Firestore Security Rules are restricting access.");
      } else {
        setFirestoreError(error.message || "Could not connect to Firestore database.");
      }
      handleFirestoreError(error, OperationType.GET, "reservations");
    });
    
    return () => unsubscribe();
  }, [isAdminAuthenticated, currentUser, myBookedIds]);

  // Admin auxiliary dashboard states
  const [adminSearch, setAdminSearch] = useState("");
  const [adminSeatingFilter, setAdminSeatingFilter] = useState("all");
  const [adminStatusFilter, setAdminStatusFilter] = useState("all");
  const [showManualForm, setShowManualForm] = useState(false);

  const renderDiagnosticPanel = () => {
    if (!firestoreError || !showDiagnosticGuide) return null;
    const activeProjectId = db.app.options.projectId || "elevated-keyword-s07pf";
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm p-5 sm:p-6 text-left max-w-4xl mx-auto mb-8 animate-fadeIn relative">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-sm shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-mono uppercase tracking-wider font-bold text-amber-400">
                Firestore Connectivity Alert (Rules Update Required)
              </h4>
              <button 
                onClick={() => setShowDiagnosticGuide(false)}
                className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest font-mono hover:underline cursor-pointer bg-transparent border-none"
              >
                Dismiss Notice
              </button>
            </div>
            <p className="text-xs text-gray-300 font-light leading-relaxed">
              We detected a connection issue with your custom Firebase project: <code className="bg-[#222] px-1.5 py-0.5 rounded text-amber-300 text-[11px] font-mono font-semibold">{activeProjectId}</code>.
              This typically happens because your <strong>Firestore Security Rules</strong> are configured to deny access by default.
            </p>
            <div className="bg-[#121212] border border-white/5 p-4 rounded-sm space-y-3">
              <p className="text-xs text-gray-400 font-medium">How to easily resolve this in 3 quick steps:</p>
              <ol className="list-decimal list-inside text-[11px] text-gray-400 space-y-1.5 font-light">
                <li>Go to the <a href={`https://console.firebase.google.com/project/${activeProjectId}/firestore/rules`} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-1">Firebase Console Rules Tab <ExternalLink className="w-3 h-3" /></a></li>
                <li>Copy the rules below and replace the existing contents of your rules file:</li>
              </ol>
              
              <div className="relative group">
                <pre className="bg-[#222] p-3 rounded-sm text-[10px] text-gray-300 font-mono overflow-x-auto border border-white/5 whitespace-pre leading-relaxed">
                  {firestoreRulesText}
                </pre>
                <button
                  onClick={copyRulesToClipboard}
                  className="absolute right-2 top-2 p-1.5 bg-gold hover:bg-gold-light text-charcoal rounded transition-all cursor-pointer flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold shadow-md"
                  title="Copy security rules to clipboard"
                >
                  {rulesCopied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Rules</span>
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-[11px] text-gray-400 font-light">
                3. Click <strong className="text-white">Publish</strong> in the Firebase Console. This will instantly enable your rooftop reservation data to sync across all browsers and devices.
              </p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-sm text-[10px] text-amber-300/80 font-light leading-relaxed">
              <strong>Seamless Offline Fallback Enabled:</strong> Don't worry! Le Patio has automatically activated a high-performance offline local state engine. All table bookings, member signs-ups, and status updates will still work perfectly in your browser today using secure <code>localStorage</code>!
            </div>
          </div>
        </div>
      </div>
    );
  };
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"noir" | "creme" | "vert">(() => {
    const stored = localStorage.getItem("le_patio_theme");
    return (stored as any) || "noir";
  });

  React.useEffect(() => {
    localStorage.setItem("le_patio_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const [notifiedReservationIds, setNotifiedReservationIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("le_patio_notified_ids");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // Fallback
      }
    }
    return [];
  });

  const [activeNotification, setActiveNotification] = useState<any>(null);

  // Persist my booked IDs
  React.useEffect(() => {
    localStorage.setItem("le_patio_my_booked_ids", JSON.stringify(myBookedIds));
  }, [myBookedIds]);

  // Persist notified IDs
  React.useEffect(() => {
    localStorage.setItem("le_patio_notified_ids", JSON.stringify(notifiedReservationIds));
  }, [notifiedReservationIds]);

  // Real-time notification scanner for customer side
  React.useEffect(() => {
    if (currentView === "admin") return;

    // Find any reservation that is in myBookedIds, has status "Confirmed" or "Cancelled", and is not in notifiedReservationIds
    const pendingNotification = reservations.find(r => 
      myBookedIds.includes(r.id) && 
      (r.status === "Confirmed" || r.status === "Cancelled") && 
      !notifiedReservationIds.includes(r.id)
    );

    if (pendingNotification) {
      setActiveNotification(pendingNotification);
    } else {
      setActiveNotification(null);
    }
  }, [reservations, myBookedIds, notifiedReservationIds, currentView]);

  // Handle storage updates in real-time if multiple tabs are open
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "le_patio_reservations") {
        try {
          const updatedReservations = JSON.parse(e.newValue || "[]");
          setReservations(updatedReservations);
        } catch (err) {
          // ignore
        }
      }
      if (e.key === "le_patio_my_booked_ids") {
        try {
          const updatedBooked = JSON.parse(e.newValue || "[]");
          setMyBookedIds(updatedBooked);
        } catch (err) {
          // ignore
        }
      }
      if (e.key === "le_patio_notified_ids") {
        try {
          const updatedNotified = JSON.parse(e.newValue || "[]");
          setNotifiedReservationIds(updatedNotified);
        } catch (err) {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const [manualForm, setManualForm] = useState({
    name: "",
    phone: "",
    guests: "2",
    date: new Date().toISOString().split("T")[0],
    time: "18:00",
    seatingPreference: "Rooftop Seating",
    requiresWheelchair: false,
    specialRequest: ""
  });

  // Persist reservations list changes
  React.useEffect(() => {
    localStorage.setItem("le_patio_reservations", JSON.stringify(reservations));
  }, [reservations]);

  const navigateToSection = (sectionId: string) => {
    setCurrentView("home");
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const showMenuPage = () => {
    setCurrentView("menu");
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showAdminPage = () => {
    setCurrentView("admin");
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatTimeWithAmPm = (timeStr: string) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    if (parts.length < 2) return timeStr;
    const hours24 = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (isNaN(hours24)) return timeStr;
    const ampm = hours24 >= 12 ? "PM" : "AM";
    let hours12 = hours24 % 12;
    hours12 = hours12 ? hours12 : 12;
    return `${hours12}:${minutes} ${ampm}`;
  };

  const playNotificationSound = (type: "added" | "modified" | "removed") => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      if (type === "added") {
        // Pleasant double-ding for a new booking
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(880, now); // A5
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.4);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1046.50, now + 0.12); // C6
        gain2.gain.setValueAtTime(0, now + 0.12);
        gain2.gain.linearRampToValueAtTime(0.12, now + 0.17);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.5);
      } else if (type === "modified") {
        // High pleasant swoop for modification
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.22); // G5
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.12, now + 0.04);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.45);
      } else {
        // Gentle descending minor/melancholy tone for cancellation
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(392.00, now + 0.28); // G4
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.12, now + 0.04);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.55);
      }
    } catch (error) {
      console.error("Audio playback failed:", error);
    }
  };

  const handleDismissNotification = (id: string) => {
    setNotifiedReservationIds(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    setActiveNotification(null);
  };

  React.useEffect(() => {
    if (activeNotification) {
      if (activeNotification.status === "Confirmed") {
        playNotificationSound("added");
      } else if (activeNotification.status === "Cancelled") {
        playNotificationSound("removed");
      }
    }
  }, [activeNotification]);

  const filteredReservations = reservations.filter(r => {
    const nameMatch = (r.name || "").toLowerCase().includes(adminSearch.toLowerCase());
    const phoneMatch = (r.phone || "").includes(adminSearch);
    const matchesSearch = nameMatch || phoneMatch;
    const matchesSeating = adminSeatingFilter === "all" || r.seatingPreference === adminSeatingFilter;
    const matchesStatus = adminStatusFilter === "all" || r.status === adminStatusFilter;
    return matchesSearch && matchesSeating && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ["ID", "Guest Name", "Phone", "Guests", "Date", "Time", "Seating Preference", "Wheelchair", "Special Request", "Status", "Created At"];
    const rows = reservations.map(r => [
      r.id,
      `"${(r.name || "").replace(/"/g, '""')}"`,
      r.phone || "",
      r.guests || "2",
      r.date || "",
      r.time || "",
      `"${r.seatingPreference || "Rooftop Seating"}"`,
      r.requiresWheelchair ? "Yes" : "No",
      `"${(r.specialRequest || "").replace(/"/g, '""')}"`,
      r.status || "Pending",
      r.createdAt || ""
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `le_patio_reservations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Firebase Database Actions
  const updateReservationStatus = async (id: string, status: "Confirmed" | "Cancelled" | "Pending") => {
    try {
      const docRef = doc(db, "reservations", id);
      await updateDoc(docRef, { status });
    } catch (err) {
      console.error("Error updating reservation status in Firestore:", err);
      setReservations(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      handleFirestoreError(err, OperationType.UPDATE, `reservations/${id}`);
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      const docRef = doc(db, "reservations", id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Error deleting reservation from Firestore:", err);
      setReservations(prev => prev.filter(p => p.id !== id));
      handleFirestoreError(err, OperationType.DELETE, `reservations/${id}`);
    }
  };

  const handleManualBookingSubmit = async (resData: any) => {
    try {
      await addDoc(collection(db, "reservations"), resData);
    } catch (err) {
      console.error("Error creating manual booking in Firestore:", err);
      setReservations(prev => [{ id: "res-manual-" + Date.now(), ...resData }, ...prev]);
      handleFirestoreError(err, OperationType.CREATE, "reservations");
    }
  };

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    guests: "2",
    date: "",
    time: "18:00",
    seatingPreference: "Rooftop Seating",
    requiresWheelchair: false,
    requiresHighChair: false,
    specialRequest: ""
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // User reservation editing and action states
  const [editingReservationId, setEditingReservationId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [isUpdatingRes, setIsUpdatingRes] = useState(false);

  // Ref for checking if admin is authenticated to prevent stale closure inside onSnapshot
  const isAdminAuthenticatedRef = React.useRef(isAdminAuthenticated);
  React.useEffect(() => {
    isAdminAuthenticatedRef.current = isAdminAuthenticated;
  }, [isAdminAuthenticated]);

  // Authentication UI and state
  const [authTab, setAuthTab] = useState<"signup" | "login">("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      const fetchUserProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setBookingForm(prev => ({
              ...prev,
              name: userData.name || currentUser.displayName || prev.name,
              phone: userData.phone || prev.phone
            }));
          } else {
            setBookingForm(prev => ({
              ...prev,
              name: currentUser.displayName || prev.name
            }));
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      };
      fetchUserProfile();
    }
  }, [currentUser]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      const user = userCredential.user;

      await updateProfile(user, { displayName: authName });

      await setDoc(doc(db, "users", user.uid), {
        name: authName,
        phone: authPhone,
        email: authEmail,
        createdAt: new Date().toISOString()
      });

      setBookingForm(prev => ({
        ...prev,
        name: authName,
        phone: authPhone
      }));

      // Clear fields
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      setAuthPhone("");
      setAuthSubmitting(false);
    } catch (err: any) {
      console.error("SignUp error:", err);
      if (err && (err.code === "auth/operation-not-allowed" || (err.message && err.message.includes("operation-not-allowed")))) {
        setAuthError("auth-operation-not-allowed");
      } else {
        setAuthError(err.message || "An error occurred during sign up.");
      }
      setAuthSubmitting(false);
    }
  };

  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      let phone = "";
      if (userDoc.exists()) {
        const userData = userDoc.data();
        phone = userData.phone || "";
      }

      setBookingForm(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        phone: phone || prev.phone
      }));

      // Clear fields
      setAuthEmail("");
      setAuthPassword("");
      setAuthSubmitting(false);
    } catch (err: any) {
      console.error("LogIn error:", err);
      if (err && (err.code === "auth/operation-not-allowed" || (err.message && err.message.includes("operation-not-allowed")))) {
        setAuthError("auth-operation-not-allowed");
      } else {
        setAuthError("Invalid email or password. Please try again.");
      }
      setAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setBookingForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setBookingForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone || !bookingForm.date) {
      alert("Please fill in your name, phone number, and reservation date.");
      return;
    }

    const resData = {
      name: bookingForm.name,
      phone: bookingForm.phone,
      guests: bookingForm.guests,
      date: bookingForm.date,
      time: bookingForm.time,
      seatingPreference: bookingForm.seatingPreference,
      requiresWheelchair: bookingForm.requiresWheelchair,
      requiresHighChair: bookingForm.requiresHighChair,
      specialRequest: bookingForm.specialRequest,
      status: "Pending",
      createdAt: new Date().toISOString(),
      userId: currentUser ? currentUser.uid : "anonymous"
    };

    try {
      const docRef = await addDoc(collection(db, "reservations"), resData);
      setMyBookedIds(prev => [...prev, docRef.id]);
      setBookingSuccess(true);
    } catch (err) {
      console.error("Error saving reservation to Firestore:", err);
      // Fallback
      const fallbackId = "res-" + Date.now();
      const fallbackRes = { id: fallbackId, ...resData };
      setReservations(prev => [fallbackRes, ...prev]);
      setMyBookedIds(prev => [...prev, fallbackId]);
      setBookingSuccess(true);
      handleFirestoreError(err, OperationType.CREATE, "reservations");
    }
  };

  const triggerWhatsAppBooking = () => {
    // Format dynamic message for Le Patio's real WhatsApp number
    const accessibilityNote = bookingForm.requiresWheelchair ? " *[Requires Wheelchair Space]*" : "";
    const specialReq = bookingForm.specialRequest ? `\n• Special Request: "${bookingForm.specialRequest}"` : "";
    
    const text = `Hello Le Patio! I would like to request a table reservation:
• Name: ${bookingForm.name}
• Phone: ${bookingForm.phone}
• Guests: ${bookingForm.guests} Person(s)
• Date: ${bookingForm.date}
• Time: ${bookingForm.time}
• Seating: ${bookingForm.seatingPreference}${accessibilityNote}${specialReq}

Please confirm availability. Thank you!`;

    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/9779849488029?text=${encodedText}`;
    window.open(url, "_blank");
  };

  const handleModifyReservation = async (id: string) => {
    if (!editDate || !editTime) {
      alert("Please select a valid date and time.");
      return;
    }
    setIsUpdatingRes(true);
    try {
      const docRef = doc(db, "reservations", id);
      await updateDoc(docRef, {
        date: editDate,
        time: editTime,
        status: "Pending" // Reset status to Pending for owner re-approval
      });
      setEditingReservationId(null);
    } catch (err: any) {
      console.error("Error modifying reservation:", err);
      alert("Failed to modify reservation. Please try again.");
    } finally {
      setIsUpdatingRes(false);
    }
  };

  const handleCancelReservation = async (id: string) => {
    try {
      const docRef = doc(db, "reservations", id);
      await updateDoc(docRef, {
        status: "Cancelled"
      });
    } catch (err: any) {
      console.error("Error cancelling reservation:", err);
    }
  };



  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F5F5] font-sans antialiased selection:bg-gold selection:text-charcoal overflow-x-hidden">
      
      {/* 1. HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-charcoal/80 border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center gap-2 group shrink-0">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse"></span>
            <span className="text-xl xl:text-2xl font-serif font-semibold tracking-widest text-gold group-hover:text-gold-light transition-colors whitespace-nowrap">
              LE PATIO
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-10 text-xs uppercase tracking-[0.2em] font-semibold flex-1 justify-center">
            <button 
              onClick={() => navigateToSection("about")} 
              className="relative py-1 text-gray-400 hover:text-gold uppercase tracking-[0.18em] font-semibold text-[10px] xl:text-[12px] cursor-pointer group transition-colors duration-300 whitespace-nowrap"
            >
              About
              <span className="absolute bottom-0 left-0 h-[1.5px] bg-gold w-0 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button 
              onClick={showMenuPage} 
              className={`relative py-1 uppercase tracking-[0.18em] font-semibold text-[10px] xl:text-[12px] cursor-pointer group transition-colors duration-300 whitespace-nowrap ${currentView === "menu" ? "text-gold" : "text-gray-400 hover:text-gold"}`}
            >
              Menu
              <span className={`absolute bottom-0 left-0 h-[1.5px] bg-gold transition-all duration-300 ${currentView === "menu" ? "w-full" : "w-0 group-hover:w-full"}`}></span>
            </button>
            {!isAdminAuthenticated && (
              <button 
                onClick={() => navigateToSection("my-reservations")} 
                className="relative py-1 text-gray-400 hover:text-gold uppercase tracking-[0.18em] font-semibold text-[10px] xl:text-[12px] cursor-pointer group transition-colors duration-300 whitespace-nowrap"
              >
                My Reservations
                <span className="absolute bottom-0 left-0 h-[1.5px] bg-gold w-0 group-hover:w-full transition-all duration-300"></span>
              </button>
            )}
            <button 
              onClick={() => navigateToSection("promise")} 
              className="relative py-1 text-gray-400 hover:text-gold uppercase tracking-[0.18em] font-semibold text-[10px] xl:text-[12px] cursor-pointer group transition-colors duration-300 whitespace-nowrap"
            >
              Our Promise
              <span className="absolute bottom-0 left-0 h-[1.5px] bg-gold w-0 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button 
              onClick={() => navigateToSection("reviews")} 
              className="relative py-1 text-gray-400 hover:text-gold uppercase tracking-[0.18em] font-semibold text-[10px] xl:text-[12px] cursor-pointer group transition-colors duration-300 whitespace-nowrap hidden xl:block"
            >
              Reviews
              <span className="absolute bottom-0 left-0 h-[1.5px] bg-gold w-0 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button 
              onClick={() => navigateToSection("location")} 
              className="relative py-1 text-gray-400 hover:text-gold uppercase tracking-[0.18em] font-semibold text-[10px] xl:text-[12px] cursor-pointer group transition-colors duration-300 whitespace-nowrap hidden xl:block"
            >
              Location
              <span className="absolute bottom-0 left-0 h-[1.5px] bg-gold w-0 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button 
              onClick={() => navigateToSection("faq")} 
              className="relative py-1 text-gray-400 hover:text-gold uppercase tracking-[0.18em] font-semibold text-[10px] xl:text-[12px] cursor-pointer group transition-colors duration-300 whitespace-nowrap hidden xl:block"
            >
              FAQ
              <span className="absolute bottom-0 left-0 h-[1.5px] bg-gold w-0 group-hover:w-full transition-all duration-300"></span>
            </button>
          </nav>

          {/* Theme Selector (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 border border-white/10 rounded-full p-1 bg-black/10 shrink-0">
              <button
                onClick={() => setTheme("noir")}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${theme === "noir" ? "bg-gold text-charcoal shadow-sm" : "text-gray-400 hover:text-white"}`}
                title="La Nuit (Midnight Noir)"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("creme")}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${theme === "creme" ? "bg-gold text-charcoal shadow-sm" : "text-gray-400 hover:text-white"}`}
                title="Le Jour (Warm Cream)"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("vert")}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${theme === "vert" ? "bg-gold text-charcoal shadow-sm" : "text-gray-400 hover:text-white"}`}
                title="Le Jardin (Jade Forest)"
              >
                <Leaf className="w-3.5 h-3.5" />
              </button>
            </div>

          {/* Mobile Theme Selector + Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="flex items-center gap-1 border border-white/10 rounded-full p-1 bg-black/10">
              <button
                onClick={() => setTheme("noir")}
                className={`p-1 rounded-full transition-all cursor-pointer ${theme === "noir" ? "bg-gold text-charcoal shadow-sm" : "text-gray-400"}`}
                title="Classic Midnight"
              >
                <Moon className="w-3 h-3" />
              </button>
              <button
                onClick={() => setTheme("creme")}
                className={`p-1 rounded-full transition-all cursor-pointer ${theme === "creme" ? "bg-gold text-charcoal shadow-sm" : "text-gray-400"}`}
                title="Elegant Cream"
              >
                <Sun className="w-3 h-3" />
              </button>
              <button
                onClick={() => setTheme("vert")}
                className={`p-1 rounded-full transition-all cursor-pointer ${theme === "vert" ? "bg-gold text-charcoal shadow-sm" : "text-gray-400"}`}
                title="Jade Courtyard"
              >
                <Leaf className="w-3 h-3" />
              </button>
            </div>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-gray-300 hover:text-gold p-2 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-[#141414] border-b border-white/5 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col uppercase tracking-widest text-xs font-semibold">
                <button 
                  onClick={() => navigateToSection("about")} 
                  className="text-left py-2 text-gray-300 hover:text-gold transition-colors border-b border-white/5 uppercase tracking-widest text-xs font-semibold cursor-pointer"
                >
                  About
                </button>
                <button 
                  onClick={showMenuPage} 
                  className={`text-left py-2 transition-colors border-b border-white/5 uppercase tracking-widest text-xs font-semibold cursor-pointer ${currentView === "menu" ? "text-gold" : "text-gray-300 hover:text-gold"}`}
                >
                  Menu
                </button>
                {!isAdminAuthenticated && (
                  <button 
                    onClick={() => navigateToSection("my-reservations")} 
                    className="text-left py-2 text-gray-300 hover:text-gold transition-colors border-b border-white/5 uppercase tracking-widest text-xs font-semibold cursor-pointer"
                  >
                    My Reservations
                  </button>
                )}
                <button 
                  onClick={() => navigateToSection("promise")} 
                  className="text-left py-2 text-gray-300 hover:text-gold transition-colors border-b border-white/5 uppercase tracking-widest text-xs font-semibold cursor-pointer"
                >
                  Our Promise
                </button>
                <button 
                  onClick={() => navigateToSection("reviews")} 
                  className="text-left py-2 text-gray-300 hover:text-gold transition-colors border-b border-white/5 uppercase tracking-widest text-xs font-semibold cursor-pointer"
                >
                  Reviews
                </button>
                <button 
                  onClick={() => navigateToSection("location")} 
                  className="text-left py-2 text-gray-300 hover:text-gold transition-colors border-b border-white/5 uppercase tracking-widest text-xs font-semibold cursor-pointer"
                >
                  Location
                </button>
                <button 
                  onClick={() => navigateToSection("faq")} 
                  className="text-left py-2 text-gray-300 hover:text-gold transition-colors border-b border-white/5 uppercase tracking-widest text-xs font-semibold cursor-pointer"
                >
                  FAQ
                </button>

                {/* Mobile Theme Selector */}
                <div className="py-3 border-b border-white/5">
                  <p className="text-[9px] text-gray-500 tracking-wider uppercase mb-2 font-mono">Select Theme Vibe</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setTheme("noir")}
                      className={`flex flex-col items-center gap-1 py-2 rounded-sm border transition-all cursor-pointer ${theme === "noir" ? "border-gold bg-gold/10 text-gold" : "border-white/5 bg-white/[0.01] text-gray-400"}`}
                    >
                      <Moon className="w-4 h-4" />
                      <span className="text-[9px] font-mono tracking-wider">NOIR</span>
                    </button>
                    <button
                      onClick={() => setTheme("creme")}
                      className={`flex flex-col items-center gap-1 py-2 rounded-sm border transition-all cursor-pointer ${theme === "creme" ? "border-gold bg-gold/10 text-gold" : "border-white/5 bg-white/[0.01] text-gray-400"}`}
                    >
                      <Sun className="w-4 h-4" />
                      <span className="text-[9px] font-mono tracking-wider">CREME</span>
                    </button>
                    <button
                      onClick={() => setTheme("vert")}
                      className={`flex flex-col items-center gap-1 py-2 rounded-sm border transition-all cursor-pointer ${theme === "vert" ? "border-gold bg-gold/10 text-gold" : "border-white/5 bg-white/[0.01] text-gray-400"}`}
                    >
                      <Leaf className="w-4 h-4" />
                      <span className="text-[9px] font-mono tracking-wider">JARDIN</span>
                    </button>
                  </div>
                </div>

                {/* Mobile CTAs */}
                <div className="pt-2 grid grid-cols-2 gap-3">
                  <a 
                    href="tel:+9779849488029" 
                    className="flex items-center justify-center gap-2 border border-white/10 py-3 rounded-sm text-center text-gray-300 hover:text-gold text-[10px]"
                  >
                    <Phone className="w-3.5 h-3.5 text-gold" />
                    <span>Call Now</span>
                  </a>
                  <a 
                    href="https://wa.me/9779849488029" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center gap-2 border border-green-500/30 bg-green-950/20 py-3 rounded-sm text-center text-green-400 text-[10px]"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-green-400" />
                    <span>WhatsApp</span>
                  </a>
                </div>
                <button 
                  onClick={() => navigateToSection("book")} 
                  className="bg-gold hover:bg-gold-light text-charcoal font-bold text-center py-3.5 rounded-sm transition-colors text-[11px] uppercase tracking-widest cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence mode="wait">
        {currentView === "home" && (
          <motion.div
            key="home-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* 2. HERO SECTION */}
            <section className="relative min-h-[90vh] flex items-center justify-center pt-10 pb-20 overflow-hidden">
        {/* Background Overlay & Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImg} 
            alt="Le Patio Kathmandu Cozy Rooftop and Outdoor Dining Scene" 
            className="w-full h-full object-cover object-center opacity-45 scale-105"
            referrerPolicy="no-referrer"
          />
          {/* Gradients to ensure exceptional text contrast and premium feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-charcoal/30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <div className="space-y-8 flex flex-col items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 pl-3.5 pr-2 py-1.5 rounded-full text-gold text-xs font-semibold tracking-widest uppercase relative pointer-events-auto"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Rooftop Oasis • Mandikhatar</span>
              <a href="https://wa.me/9779849488029" target="_blank" rel="noopener noreferrer" className="ml-1 w-6 h-6 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:bg-[#128C7E] transition-all duration-300 shadow-[0_0_10px_rgba(37,211,102,0.4)] hover:shadow-[0_0_15px_rgba(37,211,102,0.8)] hover:scale-110 cursor-pointer relative group" title="Chat with us on WhatsApp">
                <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40 group-hover:animate-none duration-1000"></span>
                <svg className="w-3.5 h-3.5 relative z-10" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-tight"
            >
              An Elegant Escape in Kathmandu:<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold">
                Luxury Rooftop & Cozy Outdoor Dining
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-gray-300 text-base sm:text-lg max-w-2xl font-light leading-relaxed mx-auto"
            >
              Experience Le Patio—where warm twilight ambiance, crafted cocktails, live music, and fully inclusive accessibility unite on Mandikhatar Road.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-2 justify-center"
            >
              <button 
                onClick={() => navigateToSection("book")}
                className="bg-gold hover:bg-gold-light text-charcoal font-bold text-center px-8 py-4 rounded-sm uppercase tracking-widest text-xs transition-all duration-300 hover:shadow-[0_4px_25px_rgba(212,175,55,0.3)] cursor-pointer"
              >
                Book Now
              </button>
              <button 
                onClick={showMenuPage}
                className="border border-gold/40 hover:border-gold hover:bg-gold/5 text-gold font-semibold text-center px-8 py-4 rounded-sm uppercase tracking-widest text-xs transition-all duration-300 cursor-pointer"
              >
                View Gourmet Menu
              </button>
            </motion.div>

            {/* Local trust signal */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-6 flex flex-wrap items-center justify-center gap-y-3 gap-x-6 text-xs text-gray-400 border-t border-white/5 w-full max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-gold" />
                <span>Accepts Reservations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Accessibility className="w-4 h-4 text-gold" />
                <span>Fully Wheelchair Accessible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Car className="w-4 h-4 text-gold" />
                <span>Plenty of Parking Lot Space</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICES SHOWCASE */}
      <section className="bg-charcoal py-24 border-y border-white/5 relative">
        <div className="absolute inset-0 bg-radial-gradient from-gold/[0.02] to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-gold text-xs font-semibold uppercase tracking-[0.25em] block mb-2">A Sincere Welcome</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-white font-bold mt-2">
              Exceptional Dining & Impeccable Offerings
            </h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-8 h-[1px] bg-gold/40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
              <div className="w-8 h-[1px] bg-gold/40"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Service 1: Rooftop Seating */}
            <div className="bg-panel/20 backdrop-blur-sm p-8 rounded-sm border border-white/5 hover:border-gold/30 hover:bg-panel/40 transition-all duration-500 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-gold/5 rounded-sm border border-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-charcoal transition-all duration-500 text-gold">
                  <Utensils className="w-5 h-5 transition-colors" />
                </div>
                <h3 className="text-lg font-serif font-bold text-white mb-3 group-hover:text-gold transition-colors">Outdoor & Rooftop</h3>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Soak in the fresh mountain air with our lush outdoor tables and sweeping rooftop views of Kathmandu.
                </p>
              </div>
            </div>

            {/* Service 2: Wheelchair Accessible */}
            <div className="bg-panel/20 backdrop-blur-sm p-8 rounded-sm border border-white/5 hover:border-gold/30 hover:bg-panel/40 transition-all duration-500 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-gold/5 rounded-sm border border-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-charcoal transition-all duration-500 text-gold">
                  <Accessibility className="w-5 h-5 transition-colors" />
                </div>
                <h3 className="text-lg font-serif font-bold text-white mb-3 group-hover:text-gold transition-colors">Full Accessibility</h3>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Thoughtfully engineered with wheelchair accessible entrances, clear table spaces, and an accessible toilet.
                </p>
              </div>
            </div>

            {/* Service 3: Beverage Curation */}
            <div className="bg-panel/20 backdrop-blur-sm p-8 rounded-sm border border-white/5 hover:border-gold/30 hover:bg-panel/40 transition-all duration-500 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-gold/5 rounded-sm border border-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-charcoal transition-all duration-500 text-gold">
                  <Music className="w-5 h-5 transition-colors" />
                </div>
                <h3 className="text-lg font-serif font-bold text-white mb-3 group-hover:text-gold transition-colors">Live Music & Vibe</h3>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Delight in regular acoustic music evenings, live sporting broadcasts, and a warm, highly romantic vibe.
                </p>
              </div>
            </div>

            {/* Service 4: Catering & Options */}
            <div className="bg-panel/20 backdrop-blur-sm p-8 rounded-sm border border-white/5 hover:border-gold/30 hover:bg-panel/40 transition-all duration-500 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-gold/5 rounded-sm border border-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-charcoal transition-all duration-500 text-gold">
                  <Clock className="w-5 h-5 transition-colors" />
                </div>
                <h3 className="text-lg font-serif font-bold text-white mb-3 group-hover:text-gold transition-colors">Flexible Dining</h3>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Enjoy dine-in, takeaway, and rapid home delivery. Serving breakfast, brunch, lunch, and deep evening dinners.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. ABOUT SECTION */}
      <section id="about" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Visual Overlapping Frames */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gold/5 -m-4 rounded-lg transform -rotate-1"></div>
            <div className="relative border border-gold/20 p-2 bg-[#121212] rounded-sm shadow-xl">
              <img 
                src={cocktailsImg} 
                alt="Le Patio Fine Cocktails and Small Plates close-up" 
                className="w-full h-auto object-cover rounded-sm"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -right-6 bg-gold text-charcoal p-4 rounded-sm shadow-lg text-center hidden sm:block">
                <p className="font-serif text-3xl font-bold tracking-tight">Daily</p>
                <p className="text-[10px] uppercase font-bold tracking-widest">11:00 AM - 10:30 PM</p>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-gold text-xs font-bold uppercase tracking-widest block">About Le Patio</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
              A Quiet Sanctuary of Inclusivity & Taste on Mandikhatar Road
            </h2>
            <p className="text-gray-300 font-light text-sm sm:text-base leading-relaxed">
              {lePatioData.description}
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div>
                <h4 className="font-serif text-white font-semibold text-sm">Main Popularity</h4>
                <ul className="mt-2 space-y-1.5 text-xs text-gray-400 font-light">
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 bg-gold rounded-full"></span>
                    <span>Delightful Lunches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 bg-gold rounded-full"></span>
                    <span>Intimate, Cozy Dinners</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 bg-gold rounded-full"></span>
                    <span>Atmospheric Solo Dining</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-serif text-white font-semibold text-sm">Amenities</h4>
                <ul className="mt-2 space-y-1.5 text-xs text-gray-400 font-light">
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 bg-gold rounded-full"></span>
                    <span>Full On-site Bar with Spirits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 bg-gold rounded-full"></span>
                    <span>High-Speed Free Wi-Fi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 bg-gold rounded-full"></span>
                    <span>Kid-friendly High Chairs & Menu</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quote Block */}
            <div className="bg-[#161616] p-4 rounded-sm border-l-2 border-gold text-xs text-gray-400 italic">
              "We took our grandmother who uses a wheelchair, and the team at Le Patio went above and beyond. Truly accessible, warm hospitality, and the rooftop evening under the stars is magnificent."
              <span className="block mt-2 font-semibold text-gold not-italic">— Local Kathmandu Resident</span>
            </div>
          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE RESERVATION SECTION (BOOK TABLE) */}
      <section id="book" className="bg-[#121212] py-24 border-y border-white/5 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {renderDiagnosticPanel()}
          
          <div className="bg-[#1A1A1A] border border-gold/20 p-6 sm:p-12 rounded-sm shadow-2xl relative overflow-hidden">
            
            {/* Booking Success View */}
            <AnimatePresence mode="wait">
              {bookingSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-12 space-y-6"
                >
                  <div className="flex justify-center mx-auto">
                    <motion.svg
                      width="72"
                      height="72"
                      viewBox="0 0 80 80"
                      className="text-gold"
                      initial="hidden"
                      animate="visible"
                    >
                      {/* Animating the circle border */}
                      <motion.circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        fill="rgba(212, 175, 55, 0.05)"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                      
                      {/* Animating the check-mark path */}
                      <motion.path
                        d="M26 40 L36 50 L56 30"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5, ease: "easeInOut" }}
                      />
                    </motion.svg>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">Reservation Pre-filled!</h3>
                  
                  <div className="max-w-md mx-auto bg-[#1F1F1F] p-6 rounded-sm border border-white/5 space-y-3 text-left text-xs text-gray-300">
                    <p className="text-center font-semibold text-gold mb-2 uppercase tracking-widest text-[10px]">Booking Summary</p>
                    <p><span className="text-gray-400">Name:</span> {bookingForm.name}</p>
                    <p><span className="text-gray-400">Date:</span> {bookingForm.date} at {bookingForm.time}</p>
                    <p><span className="text-gray-400">Guests:</span> {bookingForm.guests} Person(s)</p>
                    <p><span className="text-gray-400">Seating:</span> {bookingForm.seatingPreference}</p>
                    {bookingForm.requiresWheelchair && (
                      <p>
                        <span className="text-gray-400">Special Needs:</span>{" "}
                        <span>Wheelchair Space</span>
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 max-w-md mx-auto font-light leading-relaxed">
                    Click below to open WhatsApp and instantly dispatch your pre-formatted booking details directly to Le Patio.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button 
                      onClick={triggerWhatsAppBooking}
                      className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Instant WhatsApp Dispatch</span>
                    </button>
                    <button 
                      onClick={() => {
                        setBookingSuccess(false);
                        setBookingForm({
                          name: "",
                          phone: "",
                          guests: "2",
                          date: "",
                          time: "18:00",
                          seatingPreference: "Rooftop Seating",
                          requiresWheelchair: false,
                          requiresHighChair: false,
                          specialRequest: ""
                        });
                      }}
                      className="border border-white/10 hover:border-white/25 text-gray-400 hover:text-white font-semibold text-xs uppercase tracking-widest px-6 py-4 rounded-sm transition-all"
                    >
                      Submit Another
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8 animate-fadeIn"
                >
                  <div className="text-center">
                    <span className="text-gold text-xs font-semibold uppercase tracking-widest">Reserve Your Experience</span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-white font-bold mt-1">Book Your Table</h2>
                    <p className="text-xs text-gray-400 font-light mt-2 max-w-md mx-auto">
                      Let us prepare the perfect spot for your dinner, lunch, or family celebration.
                    </p>
                    <div className="w-12 h-0.5 bg-gold mx-auto mt-4"></div>
                  </div>

                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Your Full Name *</label>
                        <input 
                          type="text" 
                          name="name"
                          required
                          value={bookingForm.name}
                          onChange={handleBookingChange}
                          placeholder="e.g. Binod Shrestha" 
                          className="w-full bg-[#222] border border-white/5 rounded-sm px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Phone / WhatsApp Number *</label>
                        <input 
                          type="tel" 
                          name="phone"
                          required
                          value={bookingForm.phone}
                          onChange={handleBookingChange}
                          placeholder="9849488029" 
                          className="w-full bg-[#222] border border-white/5 rounded-sm px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Number of Guests</label>
                        <select 
                          name="guests"
                          value={bookingForm.guests}
                          onChange={handleBookingChange}
                          className="w-full bg-[#222] border border-white/5 rounded-sm px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                        >
                          <option value="1">1 Person (Solo Dining)</option>
                          <option value="2">2 People</option>
                          <option value="3">3 People</option>
                          <option value="4">4 People</option>
                          <option value="6">6 People</option>
                          <option value="10">Large Group (10+)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Date *</label>
                        <input 
                          type="date" 
                          name="date"
                          required
                          value={bookingForm.date}
                          onChange={handleBookingChange}
                          className="w-full bg-[#222] border border-white/5 rounded-sm px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Arrival Time</label>
                        <input 
                          type="time" 
                          name="time"
                          value={bookingForm.time}
                          onChange={handleBookingChange}
                          className="w-full bg-[#222] border border-white/5 rounded-sm px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Seating Preference</label>
                        <select 
                          name="seatingPreference"
                          value={bookingForm.seatingPreference}
                          onChange={handleBookingChange}
                          className="w-full bg-[#222] border border-white/5 rounded-sm px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                        >
                          <option value="Rooftop Seating">Rooftop Seating (Scenic Views)</option>
                          <option value="Cosy Outdoor Patio">Cosy Outdoor Patio (Garden Side)</option>
                          <option value="Private Dining Room">Private Dining Room (Events)</option>
                          <option value="Indoor Bar Area">Indoor Bar Area</option>
                        </select>
                      </div>

                      <div className="flex gap-6 pt-4 sm:pt-0">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-gray-300">
                          <input 
                            type="checkbox" 
                            name="requiresWheelchair"
                            checked={bookingForm.requiresWheelchair}
                            onChange={handleBookingChange}
                            className="accent-gold h-4.5 w-4.5 rounded" 
                          />
                          <span>Requires Wheelchair Space</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Special Requests or Occasion</label>
                      <textarea 
                        name="specialRequest"
                        value={bookingForm.specialRequest}
                        onChange={handleBookingChange}
                        placeholder="e.g. Birthday dinner, food allergy requests, wheelchair accessibility assistance needed..." 
                        rows={3}
                        className="w-full bg-[#222] border border-white/5 rounded-sm px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gold transition-colors resize-none"
                      ></textarea>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit" 
                        className="w-full bg-gold hover:bg-gold-light text-charcoal font-bold text-xs uppercase tracking-widest py-4 rounded-sm transition-all duration-300 hover:shadow-[0_4px_25px_rgba(212,175,55,0.25)]"
                      >
                        Submit Reservation Request
                      </button>
                    </div>

                    <p className="text-[10px] text-gray-500 text-center">
                      * Pre-fills a customized message so you can coordinate with us on WhatsApp for 1-click booking confirmation.
                    </p>
                  </form>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </section>

      {/* 6. TRUST / WHY CHOOSE US (OUR PROMISE - NO FAKE REVIEWS) */}
      <section id="promise" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold text-xs font-semibold uppercase tracking-[0.25em] block mb-2">Our Foundation</span>
          <h2 className="text-3xl sm:text-4xl font-serif text-white font-bold mt-2">
            Why Discerning Diners Choose Le Patio
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-3 font-light">
            An unwavering commitment to quality ingredients, physical accessibility, and sincere hospitality.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-8 h-[1px] bg-gold/40"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
            <div className="w-8 h-[1px] bg-gold/40"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reassurancePoints.map((point, index) => (
            <div 
              key={index} 
              className="bg-panel/10 p-8 rounded-sm border border-white/5 hover:border-gold/30 hover:bg-panel/30 transition-all duration-500 flex flex-col justify-between group"
            >
              <div>
                <span className="text-xs font-mono text-gold/60 font-semibold uppercase block mb-4 group-hover:text-gold transition-colors">0{index + 1} / Promise</span>
                <h4 className="text-base font-serif font-bold text-white mb-3">{point.title}</h4>
                <p className="text-xs text-gray-400 font-light leading-relaxed">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6.5. GUEST EXPERIENCES & REAL REVIEWS */}
      <section id="reviews" className="py-24 bg-[#0B0B0B] border-t border-white/5 relative overflow-hidden">
        {/* Decorative backdrop elements */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-gold/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-gold text-xs font-semibold uppercase tracking-[0.25em] block mb-2">Guest Voices</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-white font-bold mt-2">
              Real Guest Experiences
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-3 font-light leading-relaxed">
              True, unedited reviews from real patrons detailing their memorable moments at Kathmandu’s rooftop sanctuary.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-8 h-[1px] bg-gold/40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
              <div className="w-8 h-[1px] bg-gold/40"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {guestReviews.map((review, rIdx) => {
              const isExpanded = !!expandedReviews[rIdx];
              
              return (
                <div 
                  key={rIdx} 
                  className="bg-panel/10 backdrop-blur-sm border border-white/5 hover:border-gold/20 rounded-sm p-6 sm:p-8 transition-all duration-500 flex flex-col justify-between shadow-xl relative overflow-hidden group"
                >
                  {/* Elegant decorative backdrop quote marks */}
                  <span className="absolute top-4 right-6 text-gold/[0.04] font-serif text-8xl select-none pointer-events-none leading-none">“</span>
                  
                  <div className="relative z-10">
                    {/* Header: stars, date, badge */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-1.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-gold fill-gold" />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase tracking-wider font-bold bg-gold/10 text-gold px-2.5 py-0.5 rounded-full border border-gold/20">
                          Verified Visit
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono">{review.date}</span>
                      </div>
                    </div>

                    {/* Highly stylized highlight block */}
                    <div className="bg-panel/40 border-l-2 border-gold p-4 rounded-r-sm mb-6">
                      <p className="text-sm italic text-gray-200 font-serif leading-relaxed">
                        "{review.highlight}"
                      </p>
                    </div>

                    {/* Title if present */}
                    {review.title && (
                      <h4 className="text-lg font-serif font-bold text-white mb-3">
                        {review.title}
                      </h4>
                    )}

                    {/* Review content with read more toggler */}
                    <div className="relative">
                      <p className={`text-xs sm:text-sm text-gray-400 font-light leading-relaxed whitespace-pre-line transition-all duration-300 ${
                        !isExpanded && review.content.length > 350 ? "max-h-[160px] overflow-hidden" : ""
                      }`}>
                        {review.content}
                      </p>
                      
                      {!isExpanded && review.content.length > 350 && (
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#141414] to-transparent pointer-events-none"></div>
                      )}
                    </div>
                  </div>

                  {/* Read More Button & Author profile */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar initial */}
                      <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-bold text-gold text-sm">
                        {review.author.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-white">{review.author}</h5>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Local Guide • Kathmandu</p>
                      </div>
                    </div>

                    {review.content.length > 350 && (
                      <button 
                        onClick={() => setExpandedReviews(prev => ({ ...prev, [rIdx]: !prev[rIdx] }))}
                        className="text-xs uppercase tracking-widest font-bold text-gold hover:text-gold-light transition-colors underline underline-offset-4 cursor-pointer bg-transparent border-none"
                      >
                        {isExpanded ? "Collapse Review" : "Read Full Story"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social reassurance footnote */}
          <div className="text-center mt-12">
            <p className="text-[11px] text-gray-500 font-light">
              Our patrons' opinions are 100% genuine and sourced directly from their public guestbooks.
            </p>
          </div>

        </div>
      </section>



      {/* 8. LOCATION / SERVICE AREA */}
      <section id="location" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Coordinates & Information */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-gold text-xs font-bold uppercase tracking-widest block">Find Us</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
              Visit Le Patio in Mandikhatar
            </h2>
            <p className="text-gray-300 font-light text-xs sm:text-sm leading-relaxed">
              Le Patio is perfectly situated on Mandikhatar Road, Kathmandu 44600. It offers a secure, easily accessible, and peaceful getaway from central Kathmandu’s heavy dust and traffic.
            </p>

            <div className="space-y-4 border-t border-white/5 pt-6 text-xs text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Full Address</h4>
                  <p className="font-light mt-0.5">Mandikhatar Road, Kathmandu 44600</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Car className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Parking Options</h4>
                  <p className="font-light mt-0.5">Free on-site dedicated parking lot, hassle-free street parking, and secure paid parking lots nearby.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Direct Line</h4>
                  <p className="font-light mt-0.5">+977 9849488029 (Phone & WhatsApp)</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <a 
                href="https://maps.app.goo.gl/P8n1mymcH8ZMTKAP8" 
                target="_blank" 
                rel="noreferrer"
                className="bg-gold hover:bg-gold-light text-charcoal font-bold text-[10px] uppercase tracking-widest px-5 py-3 rounded-sm inline-flex items-center gap-2 transition-all"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Open Google Maps</span>
              </a>
              <a 
                href="tel:+9779849488029"
                className="border border-white/10 hover:border-gold/40 text-gray-300 hover:text-gold font-semibold text-[10px] uppercase tracking-widest px-5 py-3 rounded-sm inline-flex items-center gap-2 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call for Directions</span>
              </a>
            </div>
          </div>

          {/* Right Column: Dynamic Map Card Placeholder with realistic representation */}
          <div className="lg:col-span-7">
            <div className="bg-[#161616] border border-white/5 p-4 rounded-sm shadow-xl">
              <div className="relative h-96 bg-[#1f1f1f] rounded-sm flex flex-col justify-between overflow-hidden">
                
                {/* Visual Map Grid Design */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                {/* Visual representation of the Mandikhatar road map */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                  <div className="w-12 h-12 bg-gold/15 rounded-full flex items-center justify-center mb-3 animate-bounce">
                    <MapPin className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="text-white font-serif font-bold text-lg">Le Patio Kathmandu</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm font-light">
                    Mandikhatar Road, Kathmandu 44600
                  </p>
                  
                  {/* Surrounding Landmark Labels for extreme local authenticity */}
                  <div className="mt-6 p-4 bg-charcoal/90 border border-white/5 rounded-sm text-left max-w-sm space-y-1">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gold">Local Directions</p>
                    <p className="text-[11px] text-gray-300 font-light">
                      • Located prominently along the main Mandikhatar Road.
                    </p>
                    <p className="text-[11px] text-gray-300 font-light">
                      • Easily accessible with step-free entry from the main road.
                    </p>
                  </div>
                </div>

                {/* Bottom Bar redirect */}
                <a 
                  href="https://maps.app.goo.gl/P8n1mymcH8ZMTKAP8" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-[#1A1A1A] hover:bg-[#222] border-t border-white/5 py-3.5 px-4 flex items-center justify-between text-xs text-gold z-10 transition-colors group"
                >
                  <span className="font-semibold tracking-wider uppercase text-[10px]">Open in Google Maps App</span>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 9. OPTIONAL FAQ SECTION */}
      <section id="faq" className="bg-[#121212] py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-16">
            <span className="text-gold text-xs font-semibold uppercase tracking-widest">Inquiries Answered</span>
            <h2 className="text-3xl font-serif text-white font-bold mt-2">Frequently Asked Questions</h2>
            <div className="w-12 h-0.5 bg-gold mx-auto mt-4"></div>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-[#1A1A1A] border border-white/5 rounded-sm overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    className="w-full text-left p-6 flex justify-between items-center gap-4 hover:bg-[#202020] transition-colors"
                  >
                    <span className="font-serif font-semibold text-sm sm:text-base text-white">
                      {item.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gold shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-gray-400 font-light leading-relaxed border-t border-white/5">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 9.5. MY RESERVATIONS / GUEST LEDGER SECTION */}
      {(() => {
        const userBookings = reservations.filter(r => (currentUser && r.userId === currentUser.uid) || myBookedIds.includes(r.id));
        if (userBookings.length === 0) return null;

        return (
          <section id="my-reservations" className="bg-[#0B0B0B] py-24 border-t border-white/5 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <div className="text-center space-y-2 mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] uppercase tracking-widest font-mono">
                  <Sparkles className="w-3 h-3" />
                  Guest Ledger
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">My Reservations</h3>
                <p className="text-xs sm:text-sm text-gray-400 font-light max-w-md mx-auto leading-relaxed">
                  View, update, or cancel your upcoming rooftop and patio reservations below. Changes are synchronized live.
                </p>
                <div className="w-12 h-0.5 bg-gold mx-auto mt-4"></div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {userBookings.map((b) => {
                  const isEditing = editingReservationId === b.id;

                  return (
                    <div 
                      key={b.id} 
                      className="bg-[#141414] border border-white/5 hover:border-gold/20 rounded-sm p-6 sm:p-8 space-y-6 transition-all duration-300 shadow-2xl text-left"
                    >
                      {/* Reservation Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs uppercase font-mono tracking-widest text-gold font-semibold">
                              Confirmed Booking
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-mono border font-bold ${
                              b.status === "Confirmed" 
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : b.status === "Cancelled"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                b.status === "Confirmed" 
                                  ? "bg-green-400"
                                  : b.status === "Cancelled"
                                  ? "bg-red-400"
                                  : "bg-amber-400 animate-pulse"
                              }`}></span>
                              {b.status || "Pending"}
                            </span>
                          </div>
                          
                          {/* Date & Time Display or Form */}
                          {isEditing ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                              <div className="w-full sm:w-auto">
                                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-mono">New Date</label>
                                <input 
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="bg-[#222] border border-white/10 rounded-sm px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold"
                                />
                              </div>
                              <div className="w-full sm:w-auto">
                                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-mono">New Time</label>
                                <input 
                                  type="time"
                                  value={editTime}
                                  onChange={(e) => setEditTime(e.target.value)}
                                  className="bg-[#222] border border-white/10 rounded-sm px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold"
                                />
                              </div>
                            </div>
                          ) : (
                            <h4 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2 mt-1">
                              <Calendar className="w-4 h-4 text-gold shrink-0" />
                              <span>{b.date}</span>
                              <span className="text-gray-600">•</span>
                              <Clock className="w-4 h-4 text-gold shrink-0" />
                              <span>{formatTimeWithAmPm(b.time)}</span>
                            </h4>
                          )}
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-2">
                          {b.status !== "Cancelled" && (
                            <>
                              {isEditing ? (
                                <>
                                  <button
                                    disabled={isUpdatingRes}
                                    onClick={() => handleModifyReservation(b.id)}
                                    className="bg-gold hover:bg-gold-light disabled:bg-gold/50 text-charcoal font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-sm transition-all duration-300 animate-pulse"
                                  >
                                    {isUpdatingRes ? "Saving..." : "Save"}
                                  </button>
                                  <button
                                    disabled={isUpdatingRes}
                                    onClick={() => setEditingReservationId(null)}
                                    className="border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-[10px] uppercase tracking-widest px-4 py-2 rounded-sm transition-all duration-300"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingReservationId(b.id);
                                      setEditDate(b.date || "");
                                      setEditTime(b.time || "");
                                    }}
                                    className="border border-gold/25 hover:border-gold/50 text-gold hover:text-gold-light text-[10px] uppercase tracking-widest px-4 py-2 rounded-sm transition-all duration-300 cursor-pointer"
                                  >
                                    Modify
                                  </button>
                                  <button
                                    onClick={() => handleCancelReservation(b.id)}
                                    className="border border-red-500/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 text-[10px] uppercase tracking-widest px-4 py-2 rounded-sm transition-all duration-300 cursor-pointer"
                                  >
                                    Cancel Booking
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Visual Progress Timeline */}
                      {(() => {
                        const status = b.status || "Pending";
                        
                        let step1 = { label: "Request Sent", sub: "Details registered" };
                        let step2 = { active: false, completed: false, label: "Under Review", sub: "Allocating seating" };
                        let step3 = { active: false, completed: false, label: "Confirmed", sub: "Ready for arrival", isError: false };

                        if (status === "Pending") {
                          step2.active = true;
                          step2.sub = "Awaiting verification";
                          step3.sub = "Pending approval";
                        } else if (status === "Confirmed") {
                          step2.completed = true;
                          step3.completed = true;
                          step3.active = true;
                        } else if (status === "Cancelled") {
                          step2.sub = "No longer active";
                          step3.label = "Cancelled";
                          step3.sub = "Reservation ended";
                          step3.isError = true;
                          step3.completed = true;
                        }

                        return (
                          <div className="bg-[#1c1c1c] border border-white/5 rounded-sm p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] uppercase tracking-widest text-gold font-mono font-bold">Booking Status Journey</p>
                              <span className="text-[10px] text-gray-500 font-mono">
                                {status === "Pending" && "Estimated review: ~15 mins"}
                                {status === "Confirmed" && "Table is secured"}
                                {status === "Cancelled" && "Ended"}
                              </span>
                            </div>
                            
                            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 pt-2">
                              {/* Connecting Line Background */}
                              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 md:left-4 md:right-4 md:top-[15px] md:bottom-auto md:w-auto md:h-0.5 bg-white/5 -z-0" />
                              
                              {/* Step 1: Sent */}
                              <div className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center md:flex-1 z-10">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/10 border border-green-500/40 text-green-400 font-mono text-xs shrink-0 font-bold shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                                  <Check className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5 md:text-center">
                                  <p className="text-xs font-semibold text-white">{step1.label}</p>
                                  <p className="text-[10px] text-gray-400 font-light">{step1.sub}</p>
                                </div>
                              </div>

                              {/* Step 2: Under Review */}
                              <div className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center md:flex-1 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs shrink-0 font-bold transition-all duration-300 ${
                                  step2.completed
                                    ? "bg-green-500/10 border border-green-500/40 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                                    : step2.active
                                    ? "bg-amber-500/10 border border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse"
                                    : "bg-white/5 border border-white/10 text-gray-500"
                                }`}>
                                  {step2.completed ? (
                                    <Check className="w-4 h-4" />
                                  ) : step2.active ? (
                                    <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: "3s" }} />
                                  ) : (
                                    "2"
                                  )}
                                </div>
                                <div className="space-y-0.5 md:text-center">
                                  <p className={`text-xs font-semibold ${step2.active ? "text-amber-400" : step2.completed ? "text-white" : "text-gray-500"}`}>
                                    {step2.label}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-light">{step2.sub}</p>
                                </div>
                              </div>

                              {/* Step 3: Final Outcome */}
                              <div className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center md:flex-1 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs shrink-0 font-bold transition-all duration-300 ${
                                  step3.isError
                                    ? "bg-red-500/10 border border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                    : step3.completed
                                    ? "bg-gold/10 border border-gold text-gold shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                                    : "bg-white/5 border border-white/10 text-gray-500"
                                }`}>
                                  {step3.isError ? (
                                    <XCircle className="w-4 h-4" />
                                  ) : step3.completed ? (
                                    <Sparkles className="w-4 h-4" />
                                  ) : (
                                    "3"
                                  )}
                                </div>
                                <div className="space-y-0.5 md:text-center">
                                  <p className={`text-xs font-semibold ${
                                    step3.isError 
                                      ? "text-red-400" 
                                      : step3.completed 
                                      ? "text-gold" 
                                      : "text-gray-500"
                                  }`}>
                                    {step3.label}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-light">{step3.sub}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Detailed information row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-300 font-light">
                        <div className="space-y-1">
                          <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-mono">Contact Guest</span>
                          <p className="font-semibold text-white">{b.name}</p>
                          <p className="text-gray-400">{b.phone}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-mono">Seating & Party Size</span>
                          <p className="font-semibold text-white">{b.guests} Person(s)</p>
                          <p className="text-gray-400">{b.seatingPreference}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-mono">Special Requirements</span>
                          <div className="space-y-1">
                            {b.requiresWheelchair ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-gold font-mono uppercase bg-gold/5 px-2 py-0.5 rounded border border-gold/15">
                                ♿ Wheelchair Access
                              </span>
                            ) : (
                              <span className="text-gray-500 italic">None specified</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Special request text block */}
                      {b.specialRequest && (
                        <div className="bg-[#1d1d1d] border border-white/5 rounded-sm p-4 text-xs font-light">
                          <span className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1.5 font-mono">Special request notes</span>
                          <p className="text-gray-300 italic font-serif">"{b.specialRequest}"</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}
          </motion.div>
        )}

        {currentView === "menu" && (
          <motion.div 
            key="menu-page"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="pt-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[70vh]"
          >
            {/* Elegant Back Navigation */}
            <div className="mb-10 flex justify-between items-center border-b border-white/5 pb-6">
              <button 
                onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="group inline-flex items-center gap-2.5 text-xs uppercase tracking-widest text-gold hover:text-gold-light transition-colors font-bold cursor-pointer"
              >
                <span className="group-hover:-translate-x-1 transition-transform font-mono">←</span> Back to Home
              </button>
              
              <div className="text-right text-xs text-gray-400 font-light hidden sm:block">
                Mandikhatar Road, Kathmandu • Fully Accessible
              </div>
            </div>

            {/* Premium Header */}
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="text-gold text-[10px] sm:text-xs font-bold uppercase tracking-widest">Gastronomic Perfection</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white font-bold mt-2.5 tracking-tight">
                The Curated Gourmet Menu
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-3 font-light leading-relaxed max-w-md mx-auto">
                Indulge in our premium rooftop and garden selections. Filter, search, or print our handcrafted entrees, mains, and fine spirits.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-8 h-[1px] bg-gold/40"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
                <div className="w-8 h-[1px] bg-gold/40"></div>
              </div>
            </div>

            <GourmetMenu />
          </motion.div>
        )}

        {currentView === "admin" && (
          <motion.div 
            key="admin-page"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="pt-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[75vh]"
          >
            {renderDiagnosticPanel()}

            {/* PORTAL ACCESS LOCK IF NOT AUTHENTICATED */}
            {!isAdminAuthenticated ? (
              <div className="py-12 max-w-md mx-auto">
                <div className="bg-[#161616] border border-gold/20 p-8 rounded-sm shadow-2xl space-y-6 text-center">
                  <div className="w-16 h-16 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto text-gold">
                    <Lock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-white uppercase tracking-[0.15em]">Owner Portal Access</h2>
                    <p className="text-xs text-gray-400 mt-2 font-light leading-relaxed">
                      Enter your security credentials to unlock the live reservation book.
                    </p>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (adminPin === "1234") {
                      setIsAdminAuthenticated(true);
                      sessionStorage.setItem("le_patio_admin_auth", "true");
                      setPinError("");
                      setAdminPin("");
                    } else {
                      setPinError("Invalid security PIN. Please try again.");
                      setAdminPin("");
                    }
                  }} className="space-y-4 text-left">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Security PIN *</label>
                      <input
                        type="password"
                        required
                        value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value)}
                        placeholder="••••"
                        maxLength={4}
                        className="w-full text-center tracking-[1em] font-mono bg-[#222] border border-white/5 rounded-sm px-4 py-3 text-lg text-white focus:outline-none focus:border-gold transition-colors"
                      />
                      {pinError && <p className="text-xs text-red-400 mt-2 font-mono">{pinError}</p>}
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gold hover:bg-gold-light text-charcoal font-bold text-xs uppercase tracking-widest py-4 rounded-sm transition-all duration-300 cursor-pointer"
                    >
                      Unlock Reservation Book
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView("home")}
                      className="w-full border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-xs uppercase tracking-widest py-3 rounded-sm transition-all duration-300 cursor-pointer"
                    >
                      Back to Home
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              // FULL RESTAURANT OWNER DASHBOARD SUITE
              <div className="space-y-8">
                {/* Dashboard Nav Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-serif font-bold text-white tracking-tight">Le Patio Admin Suite</h1>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-mono bg-green-500/10 text-green-400 border border-green-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        Live Session
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-light mt-1">Manage guest records, allocate rooftop tables, and monitor seating capacities.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setIsAdminAuthenticated(false);
                        sessionStorage.removeItem("le_patio_admin_auth");
                      }}
                      className="inline-flex items-center gap-2 bg-[#222] border border-white/5 hover:bg-red-950/20 hover:border-red-500/30 text-gray-400 hover:text-red-400 text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm transition-all duration-300 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Dashboard Row */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Metric 1: Total Bookings */}
                  <div className="bg-[#161616] border border-white/5 p-5 rounded-sm">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Total Bookings</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl sm:text-3xl font-serif font-bold text-white">{reservations.length}</span>
                      <span className="text-xs text-gold font-light font-mono">records</span>
                    </div>
                  </div>
                  {/* Metric 2: Today's Covers */}
                  <div className="bg-[#161616] border border-white/5 p-5 rounded-sm">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Confirmed Guests</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl sm:text-3xl font-serif font-bold text-white">
                        {reservations
                          .filter(r => r.status === "Confirmed")
                          .reduce((sum, r) => sum + parseInt(r.guests || "0"), 0)}
                      </span>
                      <span className="text-xs text-gold font-light font-mono">covers confirmed</span>
                    </div>
                  </div>
                  {/* Metric 3: Wheelchair Requests */}
                  <div className="bg-[#161616] border border-white/5 p-5 rounded-sm">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Inclusion Alerts</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl sm:text-3xl font-serif font-bold text-white">
                        {reservations.filter(r => r.requiresWheelchair).length}
                      </span>
                      <span className="text-xs text-gold font-light font-mono">wheelchairs logged</span>
                    </div>
                  </div>
                </div>

                {/* Search, Filter & Quick Action Bar */}
                <div className="bg-[#161616] border border-white/5 p-5 rounded-sm space-y-4">
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                      {/* Search */}
                      <div className="relative flex-1 min-w-[200px]">
                        <input
                          type="text"
                          placeholder="Search guest name or phone..."
                          value={adminSearch}
                          onChange={(e) => setAdminSearch(e.target.value)}
                          className="w-full bg-[#222] border border-white/5 rounded-sm pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold transition-colors"
                        />
                        <span className="absolute left-3.5 top-3.5 text-gray-500">🔍</span>
                      </div>
                      
                      {/* Seating Preference Filter */}
                      <select
                        value={adminSeatingFilter}
                        onChange={(e) => setAdminSeatingFilter(e.target.value)}
                        className="bg-[#222] border border-white/5 rounded-sm px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-gold"
                      >
                        <option value="all">All Seating Zones</option>
                        <option value="Rooftop Seating">Rooftop Seating</option>
                        <option value="Cosy Outdoor Patio">Cosy Outdoor Patio</option>
                        <option value="Private Dining Room">Private Dining Room</option>
                        <option value="Indoor Bar Area">Indoor Bar Area</option>
                      </select>

                      {/* Status Filter */}
                      <select
                        value={adminStatusFilter}
                        onChange={(e) => setAdminStatusFilter(e.target.value)}
                        className="bg-[#222] border border-white/5 rounded-sm px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-gold"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 bg-[#222] hover:bg-[#333] border border-white/5 hover:border-gold/30 text-gray-300 hover:text-gold text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm transition-all duration-300 cursor-pointer"
                        title="Download reservations ledger as a CSV file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        onClick={() => setShowManualForm(!showManualForm)}
                        className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-charcoal font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-sm transition-all duration-300 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{showManualForm ? "Close Form" : "Walk-in Booking"}</span>
                      </button>
                    </div>
                  </div>

                  {/* INLINE WALK-IN BOOKING FORM CONTAINER */}
                  <AnimatePresence>
                    {showManualForm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 pt-5 overflow-hidden"
                      >
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (!manualForm.name || !manualForm.phone || !manualForm.date) {
                            alert("Name, Phone and Date are required.");
                            return;
                          }
                          const newRes = {
                            name: manualForm.name,
                            phone: manualForm.phone,
                            guests: manualForm.guests,
                            date: manualForm.date,
                            time: manualForm.time,
                            seatingPreference: manualForm.seatingPreference,
                            requiresWheelchair: manualForm.requiresWheelchair,
                            specialRequest: manualForm.specialRequest,
                            status: "Confirmed", // Manual is pre-confirmed
                            createdAt: new Date().toISOString(),
                            userId: "admin"
                          };
                          handleManualBookingSubmit(newRes);
                          setShowManualForm(false);
                          setManualForm({
                            name: "",
                            phone: "",
                            guests: "2",
                            date: new Date().toISOString().split("T")[0],
                            time: "18:00",
                            seatingPreference: "Rooftop Seating",
                            requiresWheelchair: false,
                            specialRequest: ""
                          });
                        }} className="space-y-4 bg-[#1e1e1e] p-6 rounded-sm border border-white/5">
                          <h4 className="text-xs uppercase tracking-widest font-semibold text-gold border-b border-white/5 pb-2">Log Manual Walk-in / Phone Reservation</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase text-gray-400 font-semibold mb-1">Guest Full Name *</label>
                              <input
                                type="text"
                                required
                                value={manualForm.name}
                                onChange={(e) => setManualForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Binod Karki"
                                className="w-full bg-[#2a2a2a] border border-white/5 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase text-gray-400 font-semibold mb-1">Phone Number *</label>
                              <input
                                type="text"
                                required
                                value={manualForm.phone}
                                onChange={(e) => setManualForm(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="9849488029"
                                className="w-full bg-[#2a2a2a] border border-white/5 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase text-gray-400 font-semibold mb-1">Guests</label>
                              <select
                                value={manualForm.guests}
                                onChange={(e) => setManualForm(prev => ({ ...prev, guests: e.target.value }))}
                                className="w-full bg-[#2a2a2a] border border-white/5 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                              >
                                <option value="1">1 Person</option>
                                <option value="2">2 People</option>
                                <option value="3">3 People</option>
                                <option value="4">4 People</option>
                                <option value="6">6 People</option>
                                <option value="8">8 People</option>
                                <option value="10">10+ Group</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase text-gray-400 font-semibold mb-1">Date *</label>
                              <input
                                type="date"
                                required
                                value={manualForm.date}
                                onChange={(e) => setManualForm(prev => ({ ...prev, date: e.target.value }))}
                                className="w-full bg-[#2a2a2a] border border-white/5 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase text-gray-400 font-semibold mb-1">Arrival Time</label>
                              <input
                                type="time"
                                value={manualForm.time}
                                onChange={(e) => setManualForm(prev => ({ ...prev, time: e.target.value }))}
                                className="w-full bg-[#2a2a2a] border border-white/5 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase text-gray-400 font-semibold mb-1">Seating Zone</label>
                              <select
                                value={manualForm.seatingPreference}
                                onChange={(e) => setManualForm(prev => ({ ...prev, seatingPreference: e.target.value }))}
                                className="w-full bg-[#2a2a2a] border border-white/5 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                              >
                                <option value="Rooftop Seating">Rooftop Seating</option>
                                <option value="Cosy Outdoor Patio">Cosy Outdoor Patio</option>
                                <option value="Private Dining Room">Private Dining Room</option>
                                <option value="Indoor Bar Area">Indoor Bar Area</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] uppercase text-gray-400 font-semibold">Special Requests / Staff Notes</label>
                            <input
                              type="text"
                              value={manualForm.specialRequest}
                              onChange={(e) => setManualForm(prev => ({ ...prev, specialRequest: e.target.value }))}
                              placeholder="e.g. VIP seating / Gluten free requirements / High chair needed"
                              className="w-full bg-[#2a2a2a] border border-white/5 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                            />
                          </div>

                          <div className="flex items-center gap-3 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                              <input
                                type="checkbox"
                                checked={manualForm.requiresWheelchair}
                                onChange={(e) => setManualForm(prev => ({ ...prev, requiresWheelchair: e.target.checked }))}
                                className="rounded-sm bg-[#2a2a2a] border-white/5 text-gold focus:ring-gold focus:ring-offset-charcoal"
                              />
                              <span>Requires Wheelchair Space Accommodation</span>
                            </label>
                          </div>

                          <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                            <button
                              type="button"
                              onClick={() => setShowManualForm(false)}
                              className="bg-transparent border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-sm cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-gold hover:bg-gold-light text-charcoal font-bold text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-sm cursor-pointer"
                            >
                              Save Reservation
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* RESERVATION DATABASE LEDGER */}
                <div className="bg-[#161616] border border-white/5 rounded-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-widest font-mono text-gold font-bold">Reservation Ledger</h3>
                    <span className="text-[10px] font-mono text-gray-500">{filteredReservations.length} records matching</span>
                  </div>

                  {filteredReservations.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 text-xs font-light space-y-2">
                      <p>🔍 No reservation records found matching active filters.</p>
                      <button onClick={() => { setAdminSearch(""); setAdminSeatingFilter("all"); setAdminStatusFilter("all"); }} className="text-gold underline font-semibold">Reset Search Filters</button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      {/* Desktop Grid Table */}
                      <table className="w-full text-left border-collapse text-xs hidden md:table">
                        <thead>
                          <tr className="border-b border-white/5 text-gray-500 uppercase font-mono tracking-widest text-[9px] bg-white/[0.01]">
                            <th className="py-4 px-6">Schedule</th>
                            <th className="py-4 px-6">Guest Details</th>
                            <th className="py-4 px-6">Party Size</th>
                            <th className="py-4 px-6">Seating Zone</th>
                            <th className="py-4 px-6">Inclusion Note</th>
                            <th className="py-4 px-6">Special requests / Notes</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {filteredReservations.map((res) => (
                            <tr key={res.id} className="hover:bg-white/[0.01] transition-colors">
                              <td className="py-4 px-6">
                                <p className="font-semibold text-white">{res.date}</p>
                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{formatTimeWithAmPm(res.time)}</p>
                              </td>
                              <td className="py-4 px-6">
                                <p className="font-bold text-white text-sm">{res.name}</p>
                                <a href={`tel:${res.phone}`} className="text-gold hover:underline text-[10px] font-mono block mt-0.5">{res.phone}</a>
                              </td>
                              <td className="py-4 px-6 font-semibold text-white text-sm">
                                {res.guests} Person(s)
                              </td>
                              <td className="py-4 px-6 text-gray-300 font-light">
                                {res.seatingPreference}
                              </td>
                              <td className="py-4 px-6">
                                {res.requiresWheelchair ? (
                                  <span className="inline-flex items-center gap-1 bg-gold/10 text-gold px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-gold/20">
                                    Wheelchair Space
                                  </span>
                                ) : (
                                  <span className="text-gray-600 font-light">—</span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-gray-400 font-light max-w-xs break-words italic leading-normal">
                                {res.specialRequest ? `"${res.specialRequest}"` : <span className="text-gray-600">None</span>}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-block px-2.5 py-1 rounded-sm text-[9px] uppercase tracking-widest font-bold border ${
                                  res.status === "Confirmed" 
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : res.status === "Cancelled"
                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }`}>
                                  {res.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {res.status !== "Confirmed" && (
                                    <button
                                      onClick={() => {
                                        updateReservationStatus(res.id, "Confirmed");
                                      }}
                                      className="p-1.5 bg-green-500/10 hover:bg-green-500 hover:text-charcoal border border-green-500/20 text-green-400 rounded-sm transition-all cursor-pointer"
                                      title="Confirm Booking"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  
                                  {/* WhatsApp dispatch confirmation */}
                                  <button
                                    onClick={() => {
                                      const text = `Hi ${res.name}! This is Le Patio Mandikhatar. We are happy to confirm your table reservation for ${res.guests} person(s) on ${res.date} at ${formatTimeWithAmPm(res.time)} (${res.seatingPreference}). See you soon!`;
                                      window.open(`https://wa.me/${res.phone.startsWith("9") ? "977" + res.phone : res.phone}?text=${encodeURIComponent(text)}`, "_blank");
                                    }}
                                    className="p-1.5 bg-[#128C7E]/10 hover:bg-[#128C7E] hover:text-white border border-[#128C7E]/20 text-green-400 rounded-sm transition-all cursor-pointer"
                                    title="Send WhatsApp Confirmation Note"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                  </button>
 
                                  {res.status !== "Cancelled" && (
                                    <button
                                      onClick={() => {
                                        updateReservationStatus(res.id, "Cancelled");
                                      }}
                                      className="p-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-charcoal border border-amber-500/20 text-amber-400 rounded-sm transition-all cursor-pointer"
                                      title="Cancel Booking"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      setDeleteConfirmationId(res.id);
                                    }}
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 rounded-sm transition-all cursor-pointer"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Responsive Card-Based List on Mobile Screens */}
                      <div className="block md:hidden divide-y divide-white/5">
                        {filteredReservations.map((res) => (
                          <div key={res.id} className="p-5 space-y-4 hover:bg-white/[0.01]">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-bold text-white text-base leading-tight">{res.name}</h4>
                                <a href={`tel:${res.phone}`} className="text-gold hover:underline text-[11px] font-mono block mt-1">{res.phone}</a>
                              </div>
                              <span className={`inline-block px-2 py-0.5 rounded-sm text-[8px] uppercase tracking-widest font-bold border ${
                                res.status === "Confirmed" 
                                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                                  : res.status === "Cancelled"
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}>
                                {res.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-light text-gray-300">
                              <div>
                                <span className="text-gray-500 uppercase tracking-widest text-[9px] block">Schedule</span>
                                <span className="font-semibold text-white">{res.date} • {formatTimeWithAmPm(res.time)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 uppercase tracking-widest text-[9px] block">Covers</span>
                                <span className="font-semibold text-white">{res.guests} Person(s)</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-500 uppercase tracking-widest text-[9px] block">Seating Preference</span>
                                <span className="text-white">{res.seatingPreference}</span>
                              </div>
                              {res.requiresWheelchair && (
                                <div className="col-span-2 pt-1">
                                  <span className="inline-flex items-center gap-1 bg-gold/10 text-gold px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border border-gold/20">
                                    Wheelchair Accommodated
                                  </span>
                                </div>
                              )}
                            </div>

                            {res.specialRequest && (
                              <div className="bg-panel/40 p-3 rounded-sm border border-white/5">
                                <span className="text-gray-500 uppercase tracking-widest text-[8px] block mb-1">Staff / Guest Note</span>
                                <p className="text-[11px] text-gray-400 italic font-light leading-normal">"{res.specialRequest}"</p>
                              </div>
                            )}

                            {/* Mobile action bar */}
                            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/5">
                              {res.status !== "Confirmed" && (
                                <button
                                  onClick={() => {
                                    updateReservationStatus(res.id, "Confirmed");
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500 hover:text-charcoal border border-green-500/20 text-green-400 text-[10px] uppercase font-bold rounded-sm transition-all"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Confirm</span>
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  const text = `Hi ${res.name}! This is Le Patio Mandikhatar. We are happy to confirm your table reservation for ${res.guests} person(s) on ${res.date} at ${formatTimeWithAmPm(res.time)} (${res.seatingPreference}). See you soon!`;
                                  window.open(`https://wa.me/${res.phone.startsWith("9") ? "977" + res.phone : res.phone}?text=${encodeURIComponent(text)}`, "_blank");
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#128C7E]/10 hover:bg-[#128C7E] hover:text-white border border-[#128C7E]/20 text-green-400 text-[10px] uppercase font-bold rounded-sm transition-all"
                              >
                                <MessageCircle className="w-3 h-3 fill-current" />
                                <span>Notify</span>
                              </button>

                              {res.status !== "Cancelled" && (
                                <button
                                  onClick={() => {
                                    updateReservationStatus(res.id, "Cancelled");
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500 hover:text-charcoal border border-amber-500/20 text-amber-400 text-[10px] uppercase font-bold rounded-sm transition-all"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Cancel</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setDeleteConfirmationId(res.id);
                                }}
                                className="p-2 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 rounded-sm transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CUSTOM DELETION CONFIRMATION MODAL */}
            <AnimatePresence>
              {deleteConfirmationId && (() => {
                const resToDelete = reservations.find(r => r.id === deleteConfirmationId);
                if (!resToDelete) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                  >
                    <motion.div
                      initial={{ scale: 0.95, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95, y: 10 }}
                      className="bg-[#161616] border border-red-500/30 max-w-md w-full p-6 rounded-sm shadow-2xl space-y-6 text-left"
                    >
                      <div className="flex items-center gap-3 text-red-400 border-b border-white/5 pb-4">
                        <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm uppercase tracking-widest font-serif font-bold text-white">Delete Reservation?</h4>
                          <p className="text-[10px] text-gray-500 font-mono">ID: {resToDelete.id}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                          Are you sure you want to permanently remove the reservation record for:
                        </p>
                        <div className="bg-[#222] p-4 rounded-sm border border-white/5 space-y-1">
                          <p className="text-sm font-bold text-white font-serif">{resToDelete.name}</p>
                          <p className="text-xs text-gold font-mono">{resToDelete.phone}</p>
                          <p className="text-xs text-gray-400 font-light mt-1">
                            {resToDelete.date} • {formatTimeWithAmPm(resToDelete.time)} ({resToDelete.guests} Guests)
                          </p>
                        </div>
                        <p className="text-[10px] text-red-400/80 italic font-light">
                          * This action is irreversible and will permanently delete the record.
                        </p>
                      </div>

                      <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmationId(null)}
                          className="px-4 py-2 bg-transparent border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-xs uppercase tracking-widest rounded-sm cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (deleteConfirmationId) {
                              deleteReservation(deleteConfirmationId);
                            }
                            setDeleteConfirmationId(null);
                          }}
                          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-sm cursor-pointer transition-colors"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 10. FOOTER */}
      <footer className="bg-[#090909] border-t border-white/5 pt-16 pb-8 text-xs text-gray-500 font-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/5">
          
          {/* Column 1: Brand */}
          <div className="md:col-span-5 space-y-4">
            <span className="text-xl font-serif font-bold text-gold tracking-widest uppercase block">LE PATIO</span>
            <p className="max-w-sm text-gray-400 leading-relaxed font-light">
              Kathmandu's premier luxury rooftop and outdoor dining destination on Mandikhatar Road. Fully inclusive wheelchair accessibility and curated gastronomic perfection.
            </p>
            <div className="flex gap-4 pt-1">
              <a href="tel:+9779849488029" className="text-gray-400 hover:text-gold transition-colors">
                <Phone className="w-4 h-4" />
              </a>
              <a href="https://maps.app.goo.gl/P8n1mymcH8ZMTKAP8" className="text-gray-400 hover:text-gold transition-colors">
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-white">Menu & Hours</h4>
            <p className="text-gray-400 font-light leading-relaxed">
              Open Daily<br />
              11:00 AM — 10:30 PM<br />
              <span className="text-gold">Reservations Accepted</span>
            </p>
          </div>

          {/* Column 3: Location / Address */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-white">Address</h4>
            <p className="text-gray-400 leading-relaxed font-light">
              Mandikhatar Road,<br />
              Kathmandu 44600,<br />
              Nepal
            </p>
            <p className="text-xs font-semibold text-gold">
              Call us: +977 9849488029
            </p>
          </div>

        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Le Patio Restaurant. All rights reserved.</p>
          <div className="flex gap-6 text-[11px] text-gray-400">
            <span>Kathmandu, Nepal</span>
            <span>•</span>
            <button 
              onClick={() => {
                if (currentView === "admin") {
                  setCurrentView("home");
                } else {
                  setCurrentView("admin");
                }
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} 
              className="hover:text-gold transition-colors cursor-pointer bg-transparent border-none text-[11px] p-0 font-light"
            >
              {currentView === "admin" ? "Customer View" : "Owner Portal"}
            </button>
            <span>•</span>
            <button 
              onClick={() => {
                setCurrentView("home");
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} 
              className="hover:text-gold transition-colors cursor-pointer bg-transparent border-none text-[11px] p-0 font-light"
            >
              Top of Page
            </button>
          </div>
        </div>
      </footer>

      {/* REAL-TIME NOTIFICATION POPUP ON CUSTOMER SIDE */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#161616]/95 backdrop-blur-md border border-gold/30 p-5 rounded-sm shadow-2xl shadow-black/80 space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center text-gold shrink-0 animate-bounce">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gold font-mono uppercase tracking-widest font-bold">
                    Notification
                  </span>
                  <button
                    onClick={() => handleDismissNotification(activeNotification.id)}
                    className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-serif font-bold text-white mt-1 leading-snug">
                  {activeNotification.status === "Confirmed" 
                    ? "Reservation Approved!" 
                    : "Reservation Update"}
                </h4>
                <p className="text-xs text-gray-400 font-light mt-1.5 leading-relaxed">
                  Dear <span className="font-semibold text-white">{activeNotification.name}</span>, your reservation for <span className="font-semibold text-white">{activeNotification.guests} guests</span> on <span className="font-semibold text-white">{activeNotification.date}</span> at <span className="font-semibold text-gold">{formatTimeWithAmPm(activeNotification.time)}</span> has been <span className={`font-semibold ${activeNotification.status === "Confirmed" ? "text-green-400" : "text-red-400"}`}>{activeNotification.status.toLowerCase()}</span>.
                </p>
                <div className="mt-3 bg-black/30 px-3 py-2 rounded-sm border border-white/5 flex items-center justify-between gap-2 text-[10px] text-gray-500">
                  <span className="font-mono">Preference: {activeNotification.seatingPreference}</span>
                  {activeNotification.requiresWheelchair && (
                    <span className="text-gold font-semibold uppercase tracking-widest flex items-center gap-1 text-[8px]">
                      ♿ Accessible
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1 gap-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => handleDismissNotification(activeNotification.id)}
                className="px-4 py-1.5 bg-gold hover:bg-gold/80 text-charcoal font-bold text-[10px] uppercase tracking-widest rounded-sm cursor-pointer transition-colors"
              >
                Acknowledge
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
