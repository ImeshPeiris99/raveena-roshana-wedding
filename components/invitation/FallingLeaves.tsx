"use client";

import { motion } from "framer-motion";

const leaves = [
  { left: "3%", delay: 0.2, duration: 13, size: 18, opacity: 0.34 },
  { left: "9%", delay: 4.1, duration: 16, size: 26, opacity: 0.42 },
  { left: "15%", delay: 1.5, duration: 15, size: 15, opacity: 0.28 },
  { left: "22%", delay: 6.2, duration: 18, size: 22, opacity: 0.36 },
  { left: "29%", delay: 2.6, duration: 14, size: 19, opacity: 0.48 },
  { left: "37%", delay: 7.6, duration: 19, size: 27, opacity: 0.27 },
  { left: "44%", delay: 3.3, duration: 16, size: 17, opacity: 0.4 },
  { left: "51%", delay: 0.9, duration: 14, size: 24, opacity: 0.33 },
  { left: "58%", delay: 5.5, duration: 17, size: 20, opacity: 0.46 },
  { left: "65%", delay: 2.0, duration: 13.5, size: 16, opacity: 0.3 },
  { left: "72%", delay: 8.0, duration: 18, size: 25, opacity: 0.4 },
  { left: "79%", delay: 3.9, duration: 15.5, size: 18, opacity: 0.5 },
  { left: "85%", delay: 1.0, duration: 17.5, size: 23, opacity: 0.31 },
  { left: "91%", delay: 6.9, duration: 14.5, size: 16, opacity: 0.44 },
  { left: "96%", delay: 2.8, duration: 18.5, size: 21, opacity: 0.29 },
];

export default function FallingLeaves() {
  return (
    <div className="falling-leaves" aria-hidden="true">
      {leaves.map((leaf, index) => (
        <motion.span
          key={`${leaf.left}-${index}`}
          className={`falling-leaf falling-leaf-${(index % 3) + 1}`}
          style={{
            left: leaf.left,
            width: leaf.size,
            height: leaf.size * 1.45,
            opacity: leaf.opacity,
          }}
          initial={{ y: "-16vh", x: 0, rotate: -18 }}
          animate={{
            y: ["-16vh", "18vh", "48vh", "78vh", "116vh"],
            x: [0, 22, -16, 18, -8],
            rotate: [-18, 38, -42, 28, 70],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
