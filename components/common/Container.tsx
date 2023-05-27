'use client'
import React from "react";
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, usePathname } from "next/navigation";

export default ({ children }: { children: React.ReactNode }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { ease: "easeInOut" } }}
        exit={{ opacity: 0, y: 20 }}
        id="container">
        {children}
      </motion.div>
    </AnimatePresence>
  )
}