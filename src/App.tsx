/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Trophy,
  GraduationCap,
  SquarePen,
  HelpCircle,
  BookOpen,
  Calendar,
  Search,
  Bell,
  Home as HomeIcon,
  Bookmark,
  User as UserIcon,
  CheckCircle2,
  Send,
  Bot,
  ChevronRight,
  X,
  LogOut,
  LogIn
} from "lucide-react";
import { auth, db, googleProvider, signInWithPopup, signOut, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// --- Class 10 Data Types & Initial Content ---

interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  progress: number;
  lessonsCount: number;
  instructor: string;
  description: string;
  modules: string[];
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface NoteItem {
  id: string;
  title: string;
  subject: string;
  readTime: string;
  content: string;
  bookmarked: boolean;
}

const INITIAL_COURSES: Course[] = [
  {
    id: "c1",
    title: "Class 10 Mathematics: Algebra, Geometry & Trigonometry",
    category: "Mathematics",
    duration: "10 weeks",
    progress: 75,
    lessonsCount: 36,
    instructor: "Prof. R. K. Sharma",
    description: "Comprehensive mastery of Quadratic Equations, Arithmetic Progressions, Triangles, Coordinate Geometry, and Heights & Distances.",
    modules: [
      "Real Numbers & Polynomials",
      "Pair of Linear Equations in Two Variables",
      "Quadratic Equations & Arithmetic Progressions",
      "Triangles & Circles Geometry",
      "Introduction to Trigonometry & Applications",
      "Surface Areas, Volumes, Statistics & Probability"
    ]
  },
  {
    id: "c2",
    title: "Class 10 Science: Physics, Chemistry & Biology",
    category: "Science",
    duration: "12 weeks",
    progress: 64,
    lessonsCount: 42,
    instructor: "Dr. Sunita Verma",
    description: "Detailed NCERT-aligned modules on Chemical Reactions, Acids & Bases, Life Processes, Control & Coordination, Light Reflection & Refraction, and Electricity.",
    modules: [
      "Chemical Reactions & Equations",
      "Acids, Bases, Salts & Metals",
      "Carbon and its Compounds",
      "Life Processes & Control in Living Organisms",
      "Light: Reflection and Refraction",
      "Human Eye, Electricity & Magnetic Effects"
    ]
  },
  {
    id: "c3",
    title: "Class 10 Social Science: History, Civics, Geography & Economics",
    category: "Social Science",
    duration: "8 weeks",
    progress: 50,
    lessonsCount: 28,
    instructor: "Anjali Gupta",
    description: "Master Nationalism in India, Power Sharing, Federalism, Resources & Development, Sectors of the Indian Economy, and Globalisation.",
    modules: [
      "Rise of Nationalism in Europe & India",
      "Power Sharing & Federalism",
      "Water, Forest & Mineral Resources",
      "Development & Sectors of Indian Economy",
      "Money, Credit & Globalisation"
    ]
  },
  {
    id: "c4",
    title: "Class 10 English: First Flight, Footprints & Grammar",
    category: "English",
    duration: "6 weeks",
    progress: 40,
    lessonsCount: 20,
    instructor: "Vandana Iyer",
    description: "Detailed prose and poetry analysis from First Flight and Footprints Without Feet, plus board exam grammar and writing skills.",
    modules: [
      "A Letter to God & Nelson Mandela: Long Walk to Freedom",
      "Two Stories about Flying & From the Diary of Anne Frank",
      "Poetry: Dust of Snow, Fire and Ice, A Tiger in the Zoo",
      "Grammar: Determiners, Tenses, Modals & Reported Speech",
      "Formal Letter Writing & Analytical Paragraphs"
    ]
  }
];

const INITIAL_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the discriminant (D) of a quadratic equation ax² + bx + c = 0?",
    options: ["b² - 4ac", "b² + 4ac", "4ac - b²", "b - 4ac"],
    correct: 0,
    explanation: "The discriminant is given by D = b² - 4ac, which determines the nature of roots for a quadratic equation."
  },
  {
    id: 2,
    question: "Which gas is evolved when dilute hydrochloric acid reacts with active metals like zinc?",
    options: ["Oxygen gas (O₂)", "Hydrogen gas (H₂)", "Carbon dioxide (CO₂)", "Nitrogen gas (N₂)"],
    correct: 1,
    explanation: "Acids react with active metals to produce metal salts and hydrogen gas (H₂), which burns with a pop sound."
  },
  {
    id: 3,
    question: "Where does the aerobic breakdown of pyruvate to give CO₂, water and energy take place?",
    options: ["Cytoplasm", "Nucleus", "Mitochondria", "Chloroplast"],
    correct: 2,
    explanation: "Aerobic respiration and the breakdown of pyruvate into CO₂, H₂O, and energy takes place inside the mitochondria."
  },
  {
    id: 4,
    question: "In which year did the Non-Cooperation-Khilafat Movement begin in India?",
    options: ["January 1915", "February 1922", "January 1921", "August 1942"],
    correct: 2,
    explanation: "The Non-Cooperation-Khilafat movement began in January 1921 with diverse social participation."
  }
];

const INITIAL_NOTES: NoteItem[] = [
  {
    id: "n1",
    title: "Class 10 Mathematics Formula Sheet (Quadratic, AP & Trigonometry)",
    subject: "Mathematics",
    readTime: "6 min read",
    content: "Quadratic Formula: x = (-b ± √(b² - 4ac)) / 2a. Arithmetic Progression nth term: an = a + (n-1)d. Sum of n terms: Sn = n/2 [2a + (n-1)d]. Trig Identity: sin²θ + cos²θ = 1.",
    bookmarked: true
  },
  {
    id: "n2",
    title: "Class 10 Science: Light Reflection & Refraction Laws",
    subject: "Science",
    readTime: "8 min read",
    content: "Mirror Formula: 1/f = 1/v + 1/u. Lens Formula: 1/f = 1/v - 1/u. Power of Lens: P = 1/f (in meters), unit is Dioptre (D). Snell's Law: sin i / sin r = constant (n).",
    bookmarked: true
  },
  {
    id: "n3",
    title: "Class 10 Social Science: Nationalism in India Key Dates",
    subject: "Social Science",
    readTime: "7 min read",
    content: "1915: Gandhiji returns to India. 1919: Rowlatt Act & Jallianwala Bagh. 1921: Non-Cooperation Movement. 1930: Dandi Salt March & Civil Disobedience. 1942: Quit India Movement.",
    bookmarked: false
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "explore" | "saved" | "profile">("home");
  const [currentView, setCurrentView] = useState<
    "dashboard" | "quiz" | "courses" | "notes" | "important-q" | "ncert" | "pyq" | "course-detail"
  >("dashboard");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // AI Chat Bot Modal
  const [isAiBotOpen, setIsAiBotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "model",
      content: "Hi Class 10 Learner! I'm your EduTrendX AI Bot. Ask me any question from Maths, Science, Social Science, or English!"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Search & Notifications Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Notes & Roadmap Progress
  const [notesList, setNotesList] = useState<NoteItem[]>(INITIAL_NOTES);
  const [roadmapProgress, setRoadmapProgress] = useState<number>(64);

  // Sync progress to Firestore when user is logged in
  useEffect(() => {
    if (user) {
      const saveProgress = async () => {
        try {
          const docRef = doc(db, "users", user.uid, "progress", "stats");
          await setDoc(
            docRef,
            {
              userId: user.uid,
              quizScore: score,
              streakDays: 15,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/progress/stats`);
        }
      };
      saveProgress();
    }
  }, [user, score]);

  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: chatMessages })
      });
      const data = await res.json();
      if (data.reply) {
        setChatMessages((prev) => [...prev, { role: "model", content: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "model", content: "Sorry, I encountered an error connecting to EduTrend AI." }
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "model", content: "Network error. Please check your connection." }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0D1120] text-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Mandatory Google Account Authentication Gate
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0D1120] text-slate-100 font-sans flex items-center justify-center p-4 select-none">
        <div className="w-full max-w-md bg-[#13182B] border border-purple-500/40 rounded-3xl p-8 shadow-[0_0_50px_rgba(139,92,246,0.2)] text-center space-y-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-600/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center">
              EduTrend
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-fuchsia-500 to-indigo-500 text-4xl font-black ml-0.5 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">
                X
              </span>
            </h1>
            <p className="text-[11px] tracking-[0.22em] uppercase text-slate-300 font-semibold">
              Elevate Learning · Class 10
            </p>
          </div>

          <div className="bg-[#0D1120] border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed">
            Google account authentication is required to enter the EduTrend Lite X Class 10 Learning App.
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all cursor-pointer flex items-center justify-center gap-3 text-sm"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign In with Google</span>
          </button>
        </div>
      </div>
    );
  }

  const firstName = user.displayName ? user.displayName.split(" ")[0] : "Alex";

  return (
    <div className="min-h-screen bg-[#0D1120] text-slate-100 font-sans flex flex-col items-center pb-28 select-none">
      {/* Main App Interface Container (No Phone Bezel/Frame) */}
      <div className="w-full max-w-2xl flex flex-col min-h-screen bg-[#0F1424] shadow-2xl border-x border-slate-800/60">
        
        {/* Top App Bar matching Mockup */}
        <header className="px-5 py-4 flex items-center justify-between border-b border-slate-800/80 bg-[#0F1424] sticky top-0 z-30">
          {/* Left: User Avatar with Purple Ring */}
          <button
            onClick={() => {
              setActiveTab("profile");
              setCurrentView("dashboard");
            }}
            className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-purple-600 to-fuchsia-500 shadow-[0_0_12px_rgba(168,85,247,0.5)] cursor-pointer shrink-0"
            title="Profile"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={firstName}
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover bg-[#182039]"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#182039] flex items-center justify-center text-white font-bold text-sm">
                {firstName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </button>

          {/* Center: EduTrendX Brand Wordmark */}
          <div
            onClick={() => {
              setActiveTab("home");
              setCurrentView("dashboard");
            }}
            className="flex items-center cursor-pointer"
          >
            <span className="text-2xl font-extrabold tracking-tight text-white">
              EduTrend
            </span>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-500 ml-0.5 drop-shadow-[0_0_10px_rgba(168,85,247,0.75)]">
              X
            </span>
          </div>

          {/* Right: Bell & Search Icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-purple-500"></span>
            </button>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Optional Search Bar Drawer */}
        {isSearchOpen && (
          <div className="px-5 py-3 bg-[#151B30] border-b border-purple-500/30 flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Class 10 notes, chapters, or PYQs..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setCurrentView("notes");
                }}
                className="text-xs text-purple-400 font-semibold px-2 py-1 bg-purple-950/60 rounded"
              >
                Go
              </button>
            )}
            <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Optional Notifications Popover */}
        {isNotifOpen && (
          <div className="mx-5 mt-3 p-4 bg-[#171E36] border border-purple-500/40 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-white">
              <span>Class 10 Updates</span>
              <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-300">• CBSE Class 10 Science & Maths PYQ 2025 Solved Set added.</p>
            <p className="text-slate-300">• Daily Live Quiz Arena is active! Complete 4 questions to boost your score.</p>
          </div>
        )}

        {/* Back Navigation Button when inside a sub-module */}
        {currentView !== "dashboard" && (
          <div className="px-5 pt-4">
            <button
              onClick={() => {
                setCurrentView("dashboard");
                setQuizStarted(false);
                setQuizCompleted(false);
              }}
              className="flex items-center gap-2 text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/60 border border-purple-500/40 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              ← Back to My Dashboard
            </button>
          </div>
        )}

        {/* MAIN DASHBOARD VIEW */}
        {currentView === "dashboard" && activeTab === "home" && (
          <div className="flex flex-col">
            {/* Greeting Box */}
            <div className="px-5 pt-4 pb-4">
              <div className="border border-purple-500/50 bg-[#151B30]/90 rounded-2xl px-4 py-3.5 shadow-[0_0_20px_rgba(139,92,246,0.12)]">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Hi, {firstName} (Learner)
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-1.5">
                  <span>Learning Trend: Class 10 Board & STEM score is up +42%</span>
                  <span>📈</span>
                </p>
              </div>
            </div>

            {/* Full-Width Purple Banner: My Dashboard - Main Options */}
            <div className="w-full bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#6D28D9] py-2.5 px-4 text-center shadow-md">
              <h3 className="text-sm font-bold text-white tracking-wide">
                My Dashboard - Main Options
              </h3>
            </div>

            {/* 6 Main Options Grid (3x2 matching the screenshot) */}
            <div className="p-5 grid grid-cols-3 gap-3.5">
              {/* 1. QUIZ */}
              <button
                onClick={() => {
                  setCurrentView("quiz");
                  setQuizStarted(false);
                  setQuizCompleted(false);
                  setCurrentQuizIndex(0);
                  setScore(0);
                }}
                className="bg-[#182039] hover:bg-[#1E2946] border border-slate-700/80 hover:border-purple-400/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-md group min-h-[130px]"
              >
                <Trophy className="w-8 h-8 text-[#A78BFA] mb-2.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                  QUIZ
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Live Arena
                </span>
              </button>

              {/* 2. COURSES (Highlighted with glowing purple border like screenshot) */}
              <button
                onClick={() => setCurrentView("courses")}
                className="bg-gradient-to-b from-[#2E1C59] to-[#1D163B] hover:from-[#372269] hover:to-[#241B4B] border-2 border-[#A855F7] rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-[0_0_25px_rgba(168,85,247,0.45)] group min-h-[130px]"
              >
                <GraduationCap className="w-8 h-8 text-[#C4B5FD] mb-2.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                  COURSES
                </span>
                <span className="text-[11px] text-purple-200 mt-1">
                  Curated Paths
                </span>
              </button>

              {/* 3. NOTES */}
              <button
                onClick={() => setCurrentView("notes")}
                className="bg-[#182039] hover:bg-[#1E2946] border border-slate-700/80 hover:border-purple-400/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-md group min-h-[130px]"
              >
                <SquarePen className="w-8 h-8 text-[#A78BFA] mb-2.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                  NOTES
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Smart Docs
                </span>
              </button>

              {/* 4. IMPORTANT QUESTIONS */}
              <button
                onClick={() => setCurrentView("important-q")}
                className="bg-[#182039] hover:bg-[#1E2946] border border-slate-700/80 hover:border-purple-400/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-md group min-h-[130px]"
              >
                <HelpCircle className="w-8 h-8 text-[#A78BFA] mb-2.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide leading-tight">
                  IMPORTANT QUESTIONS
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Exam Ready
                </span>
              </button>

              {/* 5. NCERT BOOKS */}
              <button
                onClick={() => setCurrentView("ncert")}
                className="bg-[#182039] hover:bg-[#1E2946] border border-slate-700/80 hover:border-purple-400/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-md group min-h-[130px]"
              >
                <BookOpen className="w-8 h-8 text-[#A78BFA] mb-2.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide leading-tight">
                  NCERT BOOKS
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Digital Library
                </span>
              </button>

              {/* 6. PREVIOUS PAPER (PYQ) */}
              <button
                onClick={() => setCurrentView("pyq")}
                className="bg-[#182039] hover:bg-[#1E2946] border border-slate-700/80 hover:border-purple-400/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-md group min-h-[130px]"
              >
                <Calendar className="w-8 h-8 text-[#A78BFA] mb-2.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide leading-tight">
                  PREVIOUS PAPER (PYQ)
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Solved Papers
                </span>
              </button>
            </div>

            {/* Dynamic Learning Roadmap Card (No Trending Topics above it) */}
            <div className="px-5 pt-1 pb-6">
              <div className="border border-purple-500/50 bg-[#141A2E] rounded-2xl p-5 shadow-[0_0_25px_rgba(139,92,246,0.12)]">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-base font-bold text-white">
                    Dynamic Learning Roadmap
                  </h3>
                  <span className="text-xs font-semibold text-teal-300 bg-teal-950/70 border border-teal-500/50 px-3 py-1 rounded-full">
                    92% Exam Match
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm sm:text-base font-medium text-white">Stage 1</div>
                    <div className="text-xs font-mono text-slate-400 tracking-wider mt-0.5">
                      [DONE]
                    </div>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-medium text-white">Stage 2</div>
                    <div className="text-xs font-mono text-emerald-400 font-semibold tracking-wider mt-0.5">
                      [ACTIVE]
                    </div>
                  </div>
                </div>

                {/* Progress Bar with Tick Marker at 64% */}
                <div className="relative pt-1 pb-5">
                  <div
                    onClick={() =>
                      setRoadmapProgress((prev) => (prev >= 95 ? 64 : prev + 8))
                    }
                    title="Click to advance Class 10 roadmap progress"
                    className="w-full h-2.5 bg-[#232B46] rounded-full overflow-hidden cursor-pointer"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${roadmapProgress}%` }}
                    ></div>
                  </div>
                  {/* Tick mark & percentage label positioned under the progress bar */}
                  <div
                    className="absolute top-3.5 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                    style={{ left: `${roadmapProgress}%` }}
                  >
                    <div className="w-0.5 h-2 bg-slate-300 mb-0.5"></div>
                    <span className="text-xs font-semibold text-white tabular-nums">
                      {roadmapProgress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: QUIZ ARENA */}
        {currentView === "quiz" && (
          <div className="p-5 space-y-4">
            <div className="bg-[#151B30] border border-purple-500/40 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Class 10 Board Quiz Arena</h3>
                </div>
                <span className="text-xs font-mono bg-purple-950 text-purple-300 border border-purple-800/50 px-3 py-1 rounded-full">
                  Live Arena
                </span>
              </div>

              {!quizStarted && !quizCompleted && (
                <div className="text-center py-10 space-y-5">
                  <p className="text-sm text-slate-300 max-w-md mx-auto">
                    Test your preparation for Class 10 Board Exams across Mathematics, Science, and Social Science.
                  </p>
                  <button
                    onClick={() => setQuizStarted(true)}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/40 transition-all cursor-pointer text-sm"
                  >
                    Start Live Quiz
                  </button>
                </div>
              )}

              {quizStarted && !quizCompleted && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>
                      Question {currentQuizIndex + 1} of {INITIAL_QUIZ.length}
                    </span>
                    <span>Score: {score}</span>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${((currentQuizIndex + 1) / INITIAL_QUIZ.length) * 100}%` }}
                    ></div>
                  </div>

                  <h4 className="text-base font-bold text-white mt-4">
                    {INITIAL_QUIZ[currentQuizIndex].question}
                  </h4>

                  <div className="space-y-3 pt-2">
                    {INITIAL_QUIZ[currentQuizIndex].options.map((option, idx) => {
                      const isSelected = selectedAnswer === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedAnswer(idx)}
                          className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-purple-950/80 border-purple-500 text-white shadow-md"
                              : "bg-[#0D1120] border-slate-800 text-slate-300 hover:bg-slate-800/60"
                          }`}
                        >
                          <span className="font-mono mr-2 text-purple-400">0{idx + 1}.</span>
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={selectedAnswer === null}
                    onClick={() => {
                      if (selectedAnswer === null) return;
                      const isCorrect = selectedAnswer === INITIAL_QUIZ[currentQuizIndex].correct;
                      if (isCorrect) setScore((prev) => prev + 10);

                      if (currentQuizIndex + 1 < INITIAL_QUIZ.length) {
                        setCurrentQuizIndex((prev) => prev + 1);
                        setSelectedAnswer(null);
                      } else {
                        setQuizCompleted(true);
                      }
                    }}
                    className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      selectedAnswer !== null
                        ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {currentQuizIndex + 1 < INITIAL_QUIZ.length ? "Next Question →" : "View Results"}
                  </button>
                </div>
              )}

              {quizCompleted && (
                <div className="text-center py-10 space-y-5">
                  <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/50 rounded-2xl mx-auto flex items-center justify-center text-emerald-400 shadow-lg">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Quiz Completed!</h4>
                  <p className="text-xs sm:text-sm text-slate-300">
                    You scored{" "}
                    <span className="text-purple-400 font-bold">
                      {score} / {INITIAL_QUIZ.length * 10}
                    </span>{" "}
                    points.
                  </p>
                  <button
                    onClick={() => {
                      setQuizStarted(false);
                      setQuizCompleted(false);
                      setCurrentQuizIndex(0);
                      setScore(0);
                      setSelectedAnswer(null);
                    }}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Retake Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: COURSES */}
        {currentView === "courses" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">Class 10 Curated Courses</h3>
              <span className="text-xs text-purple-400 font-semibold">
                {INITIAL_COURSES.length} Paths Available
              </span>
            </div>

            {INITIAL_COURSES.map((course) => (
              <div
                key={course.id}
                onClick={() => {
                  setSelectedCourse(course);
                  setCurrentView("course-detail");
                }}
                className="bg-[#182039] hover:bg-[#1E2946] border border-slate-700/80 hover:border-purple-500/60 p-5 rounded-2xl cursor-pointer transition-all shadow-sm group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider bg-purple-950/80 px-2.5 py-0.5 rounded border border-purple-700/50">
                      {course.category}
                    </span>
                    <h4 className="text-base font-bold text-white mt-2 group-hover:text-purple-300 transition-colors">
                      {course.title}
                    </h4>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-800/40 flex items-center justify-center shrink-0 text-purple-300">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 mb-4">{course.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700/60">
                  <span>Teacher: {course.instructor}</span>
                  <span className="text-purple-300 font-semibold">{course.duration}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 3B: COURSE DETAIL */}
        {currentView === "course-detail" && selectedCourse && (
          <div className="p-5 space-y-5">
            <div className="bg-[#182039] border border-purple-500/40 rounded-2xl p-6 space-y-4">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider bg-purple-950/80 px-2.5 py-0.5 rounded border border-purple-700/50">
                {selectedCourse.category}
              </span>
              <h3 className="text-lg font-bold text-white">{selectedCourse.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedCourse.description}
              </p>
              <div className="flex items-center gap-6 text-xs text-slate-400 pt-3 border-t border-slate-700/60">
                <span>
                  Teacher: <strong className="text-white">{selectedCourse.instructor}</strong>
                </span>
                <span>
                  Duration: <strong className="text-white">{selectedCourse.duration}</strong>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Chapters ({selectedCourse.modules.length})
              </div>
              {selectedCourse.modules.map((mod, i) => (
                <div
                  key={i}
                  className="bg-[#182039] border border-slate-700/80 p-4 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800/40 flex items-center justify-center text-xs font-bold text-purple-400 font-mono">
                      0{i + 1}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-200">{mod}</span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: NOTES */}
        {currentView === "notes" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">Smart Study Docs & Notes</h3>
              <span className="text-xs text-purple-400 font-semibold">
                {notesList.length} Smart Docs
              </span>
            </div>

            {notesList
              .filter(
                (n) =>
                  !searchQuery ||
                  n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  n.content.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((note) => (
                <div
                  key={note.id}
                  className="bg-[#182039] border border-slate-700/80 p-5 rounded-2xl space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider bg-purple-950/80 px-2.5 py-0.5 rounded border border-purple-700/50">
                      {note.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{note.readTime}</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">{note.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{note.content}</p>
                  <div className="flex justify-end pt-3 border-t border-slate-700/60">
                    <button
                      onClick={() => {
                        setNotesList((prev) =>
                          prev.map((n) =>
                            n.id === note.id ? { ...n, bookmarked: !n.bookmarked } : n
                          )
                        );
                      }}
                      className={`text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                        note.bookmarked ? "text-purple-400" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                      {note.bookmarked ? "Bookmarked" : "Bookmark"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* VIEW 5: IMPORTANT QUESTIONS */}
        {currentView === "important-q" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">Important Questions (Exam Ready)</h3>
              <span className="text-xs text-purple-400 font-semibold">Class 10 High Yield</span>
            </div>

            {[
              {
                q: "Prove that √3 is an irrational number.",
                a: "Assume √3 = a/b where a and b are co-prime integers. Squaring both sides gives 3b² = a², meaning 3 divides a. Let a = 3c, then 3b² = 9c² ⇒ b² = 3c², so 3 also divides b. This contradicts that a and b are co-prime."
              },
              {
                q: "State Ohm's Law and express its mathematical formula.",
                a: "At constant temperature, the electric current (I) flowing through a conductor is directly proportional to the potential difference (V) across its ends: V = I × R, where R is resistance."
              },
              {
                q: "Why did Mahatma Gandhi decide to withdraw the Non-Cooperation Movement in Feb 1922?",
                a: "Following the Chauri Chaura incident in Gorakhpur where a peaceful demonstration turned into a violent clash with police, Gandhiji felt Satyagrahis needed proper training before mass struggles."
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[#182039] border border-slate-700/80 p-5 rounded-2xl space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-purple-950 border border-purple-700/50 text-xs font-bold text-purple-300 flex items-center justify-center font-mono shrink-0">
                    Q{idx + 1}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white">{item.q}</h4>
                </div>
                <div className="bg-[#0F1424] p-4 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-300">
                  <strong className="text-purple-400 block mb-1">Solution:</strong>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 6: NCERT BOOKS */}
        {currentView === "ncert" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">NCERT Books (Digital Library)</h3>
              <span className="text-xs text-purple-400 font-semibold">Class 10 Edition</span>
            </div>

            {[
              {
                title: "NCERT Class 10 Mathematics",
                chapters: "14 Chapters · Complete Exercise Solutions",
                summary: "Includes Real Numbers, Polynomials, Quadratic Equations, Triangles, Trigonometry, Statistics, and Probability."
              },
              {
                title: "NCERT Class 10 Science",
                chapters: "13 Chapters · Activities & Diagrams",
                summary: "Covers Chemical Reactions, Acids & Bases, Metals, Carbon Compounds, Life Processes, Light, and Electricity."
              },
              {
                title: "NCERT Class 10 Social Science",
                chapters: "India & Contemporary World II, Democratic Politics II",
                summary: "Complete History, Civics, Geography (Contemporary India II), and Economics chapters."
              },
              {
                title: "NCERT Class 10 English",
                chapters: "First Flight & Footprints Without Feet",
                summary: "Full literature reader with chapter summaries, poetic devices, and character sketches."
              }
            ].map((book, idx) => (
              <div
                key={idx}
                className="bg-[#182039] border border-slate-700/80 p-5 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-700/50 flex items-center justify-center text-purple-300 shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{book.title}</h4>
                      <span className="text-xs text-purple-300">{book.chapters}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView("notes")}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    Read Notes
                  </button>
                </div>
                <p className="text-xs text-slate-300 pl-1">{book.summary}</p>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 7: PREVIOUS PAPER (PYQ) */}
        {currentView === "pyq" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">Previous Paper (PYQ) Solved</h3>
              <span className="text-xs text-purple-400 font-semibold">Board Exam Archive</span>
            </div>

            {[
              {
                title: "CBSE Class 10 Mathematics Standard Paper 2025",
                solved: "Solved with Step-by-Step Marking Scheme",
                sample: "Section A: 20 MCQs (1 mark each) · Section B: 5 Short Answer Questions · SectionD: Case Study Questions."
              },
              {
                title: "CBSE Class 10 Science Board Question Paper 2025",
                solved: "Solved with Ray Diagrams & Balanced Equations",
                sample: "Includes Physics numericals on Lens formula, Chemistry equations, and Biology labeled diagrams."
              },
              {
                title: "CBSE Class 10 Social Science Board Paper 2024",
                solved: "Solved with History & Geography Map Work",
                sample: "Full answers for 5-mark analytical questions on Nationalism in India and Federalism."
              }
            ].map((paper, idx) => (
              <div
                key={idx}
                className="bg-[#182039] border border-slate-700/80 p-5 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{paper.title}</h4>
                    <span className="text-xs text-emerald-400 font-semibold">{paper.solved}</span>
                  </div>
                  <button
                    onClick={() => setCurrentView("important-q")}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    View Solutions
                  </button>
                </div>
                <p className="text-xs text-slate-300">{paper.sample}</p>
              </div>
            ))}
          </div>
        )}

        {/* SAVED TAB VIEW */}
        {activeTab === "saved" && currentView === "dashboard" && (
          <div className="p-5 space-y-4">
            <h3 className="text-base font-bold text-white">Saved Notes & Bookmarks</h3>
            {notesList
              .filter((n) => n.bookmarked)
              .map((note) => (
                <div
                  key={note.id}
                  className="bg-[#182039] border border-slate-700/80 p-5 rounded-2xl space-y-2"
                >
                  <span className="text-[10px] font-bold text-purple-300 uppercase">
                    {note.subject}
                  </span>
                  <h4 className="text-sm font-bold text-white">{note.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{note.content}</p>
                </div>
              ))}
            {notesList.filter((n) => n.bookmarked).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-12">
                No saved notes yet. Bookmark any Smart Doc to access it quickly here!
              </p>
            )}
          </div>
        )}

        {/* PROFILE TAB VIEW */}
        {activeTab === "profile" && currentView === "dashboard" && (
          <div className="p-5 space-y-5">
            <div className="bg-[#182039] border border-purple-500/40 p-6 rounded-2xl text-center space-y-4 shadow-lg">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full border-2 border-purple-500 mx-auto object-cover shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 mx-auto flex items-center justify-center text-xl font-bold text-white border-2 border-purple-400 shadow-lg">
                  {firstName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-white">
                  {user.displayName || "Alex (Learner)"}
                </h3>
                <p className="text-xs text-purple-300">
                  {user.email || "Class 10 Board Exam Scholar"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/70 text-xs">
                <div className="bg-[#0F1424] p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Subjects</div>
                  <div className="font-bold text-white text-sm mt-0.5">4 Active</div>
                </div>
                <div className="bg-[#0F1424] p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Match</div>
                  <div className="font-bold text-emerald-400 text-sm mt-0.5">92%</div>
                </div>
                <div className="bg-[#0F1424] p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Stage 2</div>
                  <div className="font-bold text-purple-400 text-sm mt-0.5">{roadmapProgress}%</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Google Account</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Tutor Chat Modal */}
      {isAiBotOpen && (
        <div className="fixed inset-0 bg-[#070913]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#12172A] border border-purple-500/50 rounded-2xl shadow-2xl flex flex-col h-[540px] p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">EduTrendX AI Bot</h3>
                  <p className="text-[10px] text-purple-300">Class 10 Instant Doubt Solver</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiBotOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white rounded-br-sm shadow-md"
                        : "bg-[#182039] border border-slate-700/80 text-slate-200 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"></div>
                  <span>EduTrendX AI Bot is thinking...</span>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendAiMessage}
              className="pt-3 flex items-center gap-2 border-t border-slate-800"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask any Class 10 doubt (Maths, Science, SST)..."
                className="flex-1 bg-[#182039] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={isAiLoading || !chatInput.trim()}
                className="p-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar matching the Mockup */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D1222]/95 backdrop-blur-xl border-t border-slate-800">
        <div className="max-w-2xl mx-auto h-18 px-6 flex items-center justify-between relative">
          {/* HOME */}
          <button
            onClick={() => {
              setActiveTab("home");
              setCurrentView("dashboard");
            }}
            className={`relative flex flex-col items-center justify-center gap-1 py-2 px-3 transition-colors cursor-pointer ${
              activeTab === "home" && currentView === "dashboard"
                ? "text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {activeTab === "home" && currentView === "dashboard" && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></span>
            )}
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-wider uppercase">HOME</span>
          </button>

          {/* EXPLORE */}
          <button
            onClick={() => {
              setActiveTab("explore");
              setCurrentView("courses");
            }}
            className={`relative flex flex-col items-center justify-center gap-1 py-2 px-3 transition-colors cursor-pointer ${
              activeTab === "explore" || currentView === "courses"
                ? "text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {(activeTab === "explore" || currentView === "courses") && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></span>
            )}
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-wider uppercase">EXPLORE</span>
          </button>

          {/* CENTER FLOATING ASK AI BOT */}
          <div className="relative -top-5">
            <button
              onClick={() => setIsAiBotOpen(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-b from-blue-400 via-purple-500 to-purple-700 p-0.5 shadow-[0_0_25px_rgba(147,51,234,0.75)] hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
              title="Ask AI Bot"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#6366F1] via-[#7C3AED] to-[#6D28D9] flex flex-col items-center justify-center text-white leading-tight">
                <span className="text-xs font-extrabold tracking-wide">ASK</span>
                <span className="text-[9px] font-bold tracking-wider text-purple-100">AI BOT</span>
              </div>
            </button>
          </div>

          {/* SAVED */}
          <button
            onClick={() => {
              setActiveTab("saved");
              setCurrentView("dashboard");
            }}
            className={`relative flex flex-col items-center justify-center gap-1 py-2 px-3 transition-colors cursor-pointer ${
              activeTab === "saved" && currentView === "dashboard"
                ? "text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {activeTab === "saved" && currentView === "dashboard" && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></span>
            )}
            <Bookmark className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-wider uppercase">SAVED</span>
          </button>

          {/* PROFILE */}
          <button
            onClick={() => {
              setActiveTab("profile");
              setCurrentView("dashboard");
            }}
            className={`relative flex flex-col items-center justify-center gap-1 py-2 px-3 transition-colors cursor-pointer ${
              activeTab === "profile" && currentView === "dashboard"
                ? "text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {activeTab === "profile" && currentView === "dashboard" && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></span>
            )}
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-wider uppercase">PROFILE</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
