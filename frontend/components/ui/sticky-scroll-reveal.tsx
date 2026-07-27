"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    "rgb(6 9 14)",
    "rgb(10 10 10)",
    "rgb(12 16 23)",
  ];

  const linearGradients = useMemo(
    () => [
      "linear-gradient(to bottom right, rgb(5 150 105), rgb(16 185 129))",
      "linear-gradient(to bottom right, rgb(16 185 129), rgb(20 184 166))",
      "linear-gradient(to bottom right, rgb(4 120 87), rgb(16 185 129))",
    ],
    []
  );

  const [backgroundGradient, setBackgroundGradient] = useState(
    linearGradients[0]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeCard, linearGradients]);

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="h-[32rem] overflow-y-auto flex justify-between relative space-x-10 rounded-2xl p-10 border border-emerald-500/30 dark:border-zinc-800 shadow-2xl"
      ref={ref}
    >
      <div className="div relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-16">
              <motion.h2
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-3xl font-extrabold text-slate-100 font-sans"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-sm text-slate-300 max-w-xl mt-4 leading-relaxed font-sans"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-20" />
        </div>
      </div>
      <div
        style={{ background: backgroundGradient }}
        className={cn(
          "hidden lg:block h-64 w-80 rounded-xl sticky top-10 overflow-hidden shadow-2xl border border-white/20",
          contentClassName
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};
