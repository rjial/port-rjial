'use client'
import React from "react";
import { motion } from 'framer-motion'

export default ({ children }: { children: React.ReactNode }) => <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 20}} id="container">{children}</motion.div>