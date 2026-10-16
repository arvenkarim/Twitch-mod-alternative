"use client";

import { AnimatePresence, MotionConfig, motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

const spring = { type: "spring", stiffness: 520, damping: 34, mass: 0.6 } as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      {children}
    </MotionConfig>
  );
}

export function Pressable({ disabled, ...props }: HTMLMotionProps<"button">) {
  return (
    <motion.button
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.97, y: 0 }}
      {...props}
    />
  );
}

export function Switch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <span className={`switch${checked ? " on" : ""}${disabled ? " disabled" : ""}`}>
      <input
        type="checkbox"
        className="switch-input"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <motion.span
        className="switch-thumb"
        aria-hidden="true"
        initial={false}
        animate={{ x: checked ? 14 : 0 }}
        whileTap={disabled ? undefined : { scale: 0.85 }}
      />
    </span>
  );
}

export function PulseDot({ tone, active }: { tone: "ok" | "warn" | "danger"; active: boolean }) {
  return (
    <span className={`pulse-dot ${tone}`} aria-hidden="true">
      {active ? (
        <motion.span
          className="pulse-ring"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
      ) : null}
    </span>
  );
}

export function AnimatedValue({ value }: { value: string | number }) {
  return (
    <span className="animated-value">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={String(value)}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function PopIn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.span
      layout
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
    >
      {children}
    </motion.span>
  );
}

export { AnimatePresence, motion };
