// src/app/collection/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CollectionPage() {
  // TODO: Fetch user's perfume collection from Convex
  const collection: Array<{
    _id: string;
    perfume?: {
      name: string;
      house: string;
      scentFamily: string;
    };
  }> = [];

  const isEmpty = collection.length === 0;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="px-6 pt-12 pb-8">
        <Link
          href="/"
          className="font-inter text-sm text-stone-500 mb-4 block hover:text-stone-700 transition-colors"
        >
          ← Home
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-cormorant font-light text-3xl text-stone-900"
        >
          Your Vault
        </motion.h1>
      </header>

      {/* Empty State */}
      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center py-24 px-6 text-center"
        >
          <p className="font-inter text-stone-500 mb-8">
            Your collection starts here.
          </p>
          <Link href="/collection/add">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="font-inter text-stone-800 border-2 border-stone-300 px-8 py-3 rounded-full hover:border-stone-800 transition-colors"
            >
              [ + Add a fragrance ]
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        /* Collection Grid */
        <div className="px-6 pb-32">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {collection.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Perfume image placeholder */}
                <div className="aspect-square bg-stone-100 rounded-xl mb-3" />
                
                {/* Name */}
                <h3 className="font-cormorant font-normal text-lg text-stone-800 leading-tight">
                  {item.perfume?.name}
                </h3>
                
                {/* House */}
                <p className="font-inter text-sm text-stone-500 mt-1">
                  {item.perfume?.house}
                </p>
                
                {/* Scent family badge */}
                <span className="inline-block mt-2 px-3 py-1 bg-stone-100 rounded-full font-inter text-xs text-stone-600">
                  {item.perfume?.scentFamily}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Fixed bottom CTA - only show when collection has items */}
      {!isEmpty && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent">
          <Link href="/collection/add">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-stone-800 text-white font-inter px-6 py-4 rounded-full hover:bg-stone-900 transition-colors"
            >
              Add a fragrance
            </motion.button>
          </Link>
        </div>
      )}
    </div>
  );
}
