// src/components/CollapsibleSection.jsx
import React from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function CollapsibleSection({
  title,
  icon,
  open,
  onToggle,
  children,
  darkMode,
}) {
  const bg = darkMode ? "#3c4b4e" : "#ffffff";
  const text = darkMode ? "#f0f0f0" : "#213547";
  const border = darkMode ? "#556b6e" : "#dcdcdc";

  return (
    <section
      className="rounded shadow p-4 mb-4"
      style={{ backgroundColor: bg, border: `1px solid ${border}` }}
    >
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={open}
        aria-controls={`collapsible-content-${title.replace(/\s+/g, "-").toLowerCase()}`}
      >
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: text }}>
          {icon} {title}
        </h3>
        {open ? <FaChevronUp aria-label="Collapse section" /> : <FaChevronDown aria-label="Expand section" />}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="collapsible-content"
            id={`collapsible-content-${title.replace(/\s+/g, "-").toLowerCase()}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mt-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
