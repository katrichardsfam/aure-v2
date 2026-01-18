"use client";

import { motion } from "framer-motion";
import { CreditCard, TrendingUp, Check, Sparkles } from "lucide-react";

// Subscription data
const SUBSCRIPTIONS = [
  {
    name: "Cursor",
    price: 60,
    billing: "monthly",
    category: "IDE",
    status: "active",
    color: "from-violet-400 to-purple-500",
  },
  {
    name: "Claude",
    price: 106.25,
    billing: "monthly",
    category: "AI",
    status: "active",
    color: "from-amber-400 to-orange-500",
  },
  {
    name: "Mobbin",
    price: 108,
    billing: "monthly",
    category: "Design",
    status: "active",
    color: "from-pink-400 to-rose-500",
  },
  {
    name: "Fragella API",
    price: 2,
    billing: "monthly",
    category: "API",
    status: "active",
    color: "from-emerald-400 to-teal-500",
    payAsYouGo: "$0.0005/req",
  },
  {
    name: "Convex",
    price: 0,
    billing: "free",
    category: "Backend",
    status: "active",
    color: "from-red-400 to-rose-500",
  },
  {
    name: "Clerk",
    price: 0,
    billing: "free",
    category: "Auth",
    status: "active",
    color: "from-blue-400 to-indigo-500",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function CostsPage() {
  const paidSubscriptions = SUBSCRIPTIONS.filter((s) => s.price > 0);
  const freeSubscriptions = SUBSCRIPTIONS.filter((s) => s.price === 0);
  const totalMonthly = paidSubscriptions.reduce((sum, s) => sum + s.price, 0);
  const totalYearly = totalMonthly * 12;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-violet-50/20 to-stone-100">
      {/* Atmospheric background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-violet-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-56 h-56 bg-amber-100/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
      </div>

      <motion.main
        className="relative z-10 px-6 pt-12 pb-32 max-w-lg mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full mb-6 border border-white/60">
            <CreditCard className="w-4 h-4 text-violet-500" />
            <span className="font-inter text-sm text-stone-600">Dev Tools</span>
          </div>
          <h1 className="font-cormorant font-light text-4xl text-stone-900 leading-tight">
            Subscription Costs
          </h1>
        </motion.div>

        {/* Monthly Total Card */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-6 mb-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-inter text-sm text-white/70">Monthly Total</p>
              <p className="font-cormorant text-4xl text-white font-light">
                ${totalMonthly.toFixed(2)}
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Sparkles className="w-4 h-4" />
            <span className="font-inter text-sm">
              ${totalYearly.toFixed(2)}/year
            </span>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/60">
            <p className="font-cormorant text-3xl text-stone-800">
              {SUBSCRIPTIONS.length}
            </p>
            <p className="font-inter text-xs text-stone-500 mt-1">tools</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/60">
            <p className="font-cormorant text-3xl text-stone-800">
              {paidSubscriptions.length}
            </p>
            <p className="font-inter text-xs text-stone-500 mt-1">paid</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/60">
            <p className="font-cormorant text-3xl text-stone-800">
              {freeSubscriptions.length}
            </p>
            <p className="font-inter text-xs text-stone-500 mt-1">free</p>
          </div>
        </motion.div>

        {/* Paid Subscriptions */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="font-inter text-xs text-stone-500 uppercase tracking-widest mb-4">
            Paid Subscriptions
          </h2>
          <div className="space-y-3">
            {paidSubscriptions.map((sub, index) => (
              <motion.div
                key={sub.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/60"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${sub.color} rounded-xl flex items-center justify-center shadow-sm`}
                  >
                    <span className="text-white font-inter font-semibold text-lg">
                      {sub.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-cormorant text-xl text-stone-800">
                      {sub.name}
                    </p>
                    <p className="font-inter text-xs text-stone-500">
                      {sub.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-cormorant text-2xl text-stone-800">
                      ${sub.price.toFixed(2)}
                    </p>
                    <p className="font-inter text-xs text-stone-400">
                      /mo{sub.payAsYouGo && ` + ${sub.payAsYouGo}`}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Free Tools */}
        <motion.div variants={itemVariants}>
          <h2 className="font-inter text-xs text-stone-500 uppercase tracking-widest mb-4">
            Free Tier
          </h2>
          <div className="space-y-3">
            {freeSubscriptions.map((sub, index) => (
              <motion.div
                key={sub.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${sub.color} rounded-xl flex items-center justify-center shadow-sm`}
                  >
                    <span className="text-white font-inter font-semibold text-lg">
                      {sub.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-cormorant text-xl text-stone-800">
                      {sub.name}
                    </p>
                    <p className="font-inter text-xs text-stone-500">
                      {sub.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="font-inter text-sm text-emerald-600">
                      Free
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}
