import React, { useState, useMemo, useCallback } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaRegCalendarAlt,
  FaTimes,
} from "react-icons/fa";

/* ------------------------------------------------------------------
   Color palette (pulling from your global theme)
   You can swap these for CSS vars if preferred.
------------------------------------------------------------------- */
const PALETTE = {
  sage: "#819A91",
  pastel: "#A7C1A8",
  olive: "#D1D8BE",
  cream: "#EEEFE0",
  text: "#213547",
  white: "#FFFFFF",
  red: "#FCA5A5",
  amber: "#FDE68A",
  green: "#BBF7D0",
};

export const LEAVE_TYPE_META = {
  CASUAL:  { label: "Casual",  color: PALETTE.pastel },
  SICK:    { label: "Sick",    color: PALETTE.red },
  EARNED:  { label: "Earned",  color: PALETTE.green },
  UNPAID:  { label: "Unpaid",  color: PALETTE.amber },
  OTHER:   { label: "Other",   color: PALETTE.olive },
};

/* Accepts many possible field names; normalizes to Date objects */
function normalizeLeave(leave) {
  const startRaw =
    leave.from ||
    leave.fromDate ||
    leave.start ||
    leave.startDate ||
    leave.start_time ||
    leave.startAt ||
    leave.start_date ||
    leave.startDay ||
    leave.date ||
    leave.starting ||
    leave.startOn ||
    leave.from_day ||
    leave.from_date ||
    leave.start_dateTime ||
    leave.start_date_time ||
    leave.startdate ||
    leave.begin ||
    leave.beginDate ||
    leave.begin_date ||
    leave.fromDateString ||
    leave.from_dateString ||
    leave.from_date_string ||
    leave.startISO ||
    leave.start_iso ||
    leave.fromISO ||
    leave.from_iso ||
    leave.startdateISO ||
    leave.startdate_iso ||
    leave.startISODate ||
    leave.fromISODate ||
    leave.fromISO_date ||
    leave.startISO_date ||
    leave["fromDate"] ||
    leave["startDate"] ||
    leave["start"];

  const endRaw =
    leave.to ||
    leave.toDate ||
    leave.end ||
    leave.endDate ||
    leave.end_time ||
    leave.endAt ||
    leave.end_date ||
    leave.endDay ||
    leave.to_day ||
    leave.to_date ||
    leave.end_dateTime ||
    leave.end_date_time ||
    leave.enddate ||
    leave.finish ||
    leave.finishDate ||
    leave.finish_date ||
    leave.toDateString ||
    leave.to_dateString ||
    leave.to_date_string ||
    leave.endISO ||
    leave.end_iso ||
    leave.toISO ||
    leave.to_iso ||
    leave.enddateISO ||
    leave.enddate_iso ||
    leave.endISODate ||
    leave.toISODate ||
    leave.toISO_date ||
    leave.endISO_date ||
    leave["toDate"] ||
    leave["endDate"] ||
    leave["end"];

  const s = parseDate(startRaw);
  const e = parseDate(endRaw ?? startRaw); // fallback 1‑day leave

  // Normalize type to upper slug
  let type = leave.type || leave.leaveType || leave.category;
  if (typeof type === "string") {
    type = type.trim().toUpperCase();
    if (!LEAVE_TYPE_META[type]) type = "OTHER";
  } else {
    type = "OTHER";
  }

  // status optional
  const status = leave.status || leave.approvalStatus || "PENDING";

  // label / employee name
  const who =
    leave.employeeName ||
    leave.employee?.name ||
    leave.user?.name ||
    leave.name ||
    "Employee";

  return {
    ...leave,
    _normStart: s,
    _normEnd: e,
    _normType: type,
    _normStatus: status,
    _normEmployee: who,
  };
}

/* Parse a variety of input formats → Date (UTC midnight aligned) */
function parseDate(raw) {
  if (!raw) return null;
  if (raw instanceof Date && !isNaN(raw)) return startOfDay(raw);

  if (typeof raw === "number") return startOfDay(new Date(raw));
  if (typeof raw === "string") {
    // try direct
    const d1 = new Date(raw);
    if (!isNaN(d1)) return startOfDay(d1);

    // Some DBs send "YYYY-MM-DD" no timezone; still handled above.
    // If you have other formats, add parsing here.
  }
  return null;
}

function startOfDay(d) {
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return dd;
}

function dateKey(d) {
  if (!d) return "";
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function sameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDateInRange(d, s, e) {
  if (!d || !s || !e) return false;
  return d >= s && d <= e;
}

/* Build an array of day objects for a given month */
function buildMonthMatrix(year, month /* 0-based */) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const firstWeekday = first.getDay(); // 0 Sun ... 6 Sat
  const daysInMonth = last.getDate();

  const cells = [];
  // leading blanks
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }
  // days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  return cells;
}

/* Modal wrapper */
function LightModal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
        {children}
      </div>
    </div>
  );
}

/* Legend component */
function LeaveLegend() {
  const entries = Object.entries(LEAVE_TYPE_META);
  return (
    <div className="mt-4 flex flex-wrap gap-4 text-sm">
      {entries.map(([k, meta]) => (
        <span key={k} className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: meta.color }}
          />
          {meta.label}
        </span>
      ))}
    </div>
  );
}

/* Format date range nice */
function fmtRange(s, e) {
  if (!s || !e) return "—";
  if (sameDay(s, e)) {
    return s.toLocaleDateString();
  }
  const opts = { month: "short", day: "numeric" };
  const sFmt = s.toLocaleDateString(undefined, opts);
  const eFmt = e.toLocaleDateString(undefined, opts);
  // add year if different
  if (s.getFullYear() !== e.getFullYear()) {
    return (
      s.toLocaleDateString(undefined, { ...opts, year: "numeric" }) +
      " – " +
      e.toLocaleDateString(undefined, { ...opts, year: "numeric" })
    );
  }
  return `${sFmt} – ${eFmt}`;
}

/* Main exported calendar */
export default function LeaveCalendar({ leaves = [], initialMonth }) {
  // initial visible month/year
  const now = new Date();
  const init = initialMonth instanceof Date ? initialMonth : now;
  const [year, setYear] = useState(init.getFullYear());
  const [month, setMonth] = useState(init.getMonth());

  // selected day (for modal)
  const [dayModalDate, setDayModalDate] = useState(null);

  // Normalize leaves once (memo)
  const normalizedLeaves = useMemo(
    () => leaves.map(normalizeLeave).filter((l) => l._normStart && l._normEnd),
    [leaves]
  );

  /* Map each dateKey in visible month to array of relevant leaves */
  const leavesByDate = useMemo(() => {
    const map = {};
    if (!normalizedLeaves.length) return map;
    const startMonth = new Date(year, month, 1);
    const endMonth = new Date(year, month + 1, 0);

    normalizedLeaves.forEach((lv) => {
      const s = lv._normStart;
      const e = lv._normEnd;
      if (!s || !e) return;

      // clamp to visible month (we only map days in month)
      const start = s < startMonth ? startMonth : s;
      const end = e > endMonth ? endMonth : e;

      // iterate days
      const days = 1 + Math.floor((end - start) / (24 * 60 * 60 * 1000));
      for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const k = dateKey(d);
        if (!map[k]) map[k] = [];
        map[k].push(lv);
      }
    });

    return map;
  }, [normalizedLeaves, year, month]);

  /* Month grid cells */
  const cells = useMemo(() => buildMonthMatrix(year, month), [year, month]);

  const goPrevMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goNextMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const goToday = useCallback(() => {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
  }, []);

  const handleDayClick = (d) => {
    if (!d) return;
    setDayModalDate(d);
  };

  const closeModal = () => setDayModalDate(null);

  const modalLeaves = useMemo(() => {
    if (!dayModalDate) return [];
    const k = dateKey(dayModalDate);
    return leavesByDate[k] || [];
  }, [dayModalDate, leavesByDate]);

  // heading label
  const monthLabel = useMemo(() => {
    return new Date(year, month, 1).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [year, month]);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrevMonth}
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={goNextMonth}
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          >
            <FaChevronRight />
          </button>
        </div>
        <h3 className="text-lg font-semibold text-[#213547]">{monthLabel}</h3>
        <button
          onClick={goToday}
          className="px-3 py-1 rounded bg-[var(--color-sage)] text-white text-sm hover:bg-[var(--color-pastel)] transition flex items-center gap-1"
        >
          <FaRegCalendarAlt /> Today
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1 text-center text-xs font-semibold text-gray-600">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar Cells */}
      <div className="grid grid-cols-7 gap-1 text-sm">
        {cells.map((d, i) => {
          if (!d) {
            return (
              <div
                key={`empty-${i}`}
                className="border border-transparent px-2 py-3"
              />
            );
          }

          const k = dateKey(d);
          const dayLeaves = leavesByDate[k] || [];
          const isToday = sameDay(d, new Date());
          const isWeekend = [0, 6].includes(d.getDay());

          // pick a primary color if at least 1 leave
          let bg = "";
          if (dayLeaves.length === 1) {
            bg = LEAVE_TYPE_META[dayLeaves[0]._normType]?.color || PALETTE.olive;
          } else if (dayLeaves.length > 1) {
            // multiple: blended pastel
            bg = "repeating-linear-gradient(45deg, #fff 0 2px, #00000022 2px 4px)";
          }

          return (
            <DayCell
              key={k}
              date={d}
              isToday={isToday}
              isWeekend={isWeekend}
              leaves={dayLeaves}
              bg={bg}
              onClick={() => handleDayClick(d)}
            />
          );
        })}
      </div>

      {/* Legend */}
      <LeaveLegend />

      {/* Modal for Day */}
      <LightModal open={!!dayModalDate} onClose={closeModal}>
        <DayModalContent day={dayModalDate} leaves={modalLeaves} />
      </LightModal>
    </div>
  );
}

/* ------------------------------------------------------------------
   DayCell – visual cell in the month grid
------------------------------------------------------------------- */
function DayCell({ date, isToday, isWeekend, leaves, bg, onClick }) {
  const k = dateKey(date);
  const hasLeaves = leaves?.length > 0;

  // mini dots for each leave type (max 3 shown)
  const typeDots = hasLeaves
    ? leaves
        .slice(0, 3)
        .map((lv, idx) => (
          <span
            key={idx}
            className="inline-block w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                LEAVE_TYPE_META[lv._normType]?.color || "#999999",
            }}
          />
        ))
    : null;

  const baseClasses =
    "relative px-2 py-3 rounded cursor-pointer select-none border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--color-sage)]";
  const weekendCls = isWeekend ? "opacity-90" : "";
  const todayRing = isToday
    ? "ring-2 ring-[var(--color-sage)] ring-offset-2"
    : "";

  const inlineStyle = {};
  if (hasLeaves && typeof bg === "string" && bg.startsWith("repeating-")) {
    inlineStyle.backgroundImage = bg;
    inlineStyle.backgroundColor = PALETTE.cream;
  } else if (hasLeaves && bg) {
    inlineStyle.backgroundColor = bg;
  } else {
    inlineStyle.backgroundColor = "#F9FAFB";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Day ${date.getDate()}`}
      className={`${baseClasses} ${weekendCls} ${todayRing}`}
      style={inlineStyle}
    >
      <div className="flex justify-between items-start">
        <span
          className="text-xs font-semibold"
          style={{ color: hasLeaves ? PALETTE.text : "#374151" }}
        >
          {date.getDate()}
        </span>
        {hasLeaves && (
          <span className="flex gap-0.5 items-center">{typeDots}</span>
        )}
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------
   Day Modal – shows all leaves covering that day
------------------------------------------------------------------- */
function DayModalContent({ day, leaves }) {
  const dayLabel = day
    ? day.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-[#213547]">{dayLabel}</h2>
      {(!leaves || !leaves.length) && (
        <p className="text-gray-600">No leaves on this day.</p>
      )}
      {leaves?.length > 0 && (
        <ul className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {leaves.map((lv) => (
            <li
              key={lv._id || lv.id || Math.random()}
              className="p-3 rounded border shadow-sm bg-[var(--color-cream)] flex flex-col gap-1"
              style={{
                borderColor:
                  LEAVE_TYPE_META[lv._normType]?.color || "transparent",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#213547]">
                  {lv._normEmployee}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor:
                      LEAVE_TYPE_META[lv._normType]?.color || PALETTE.olive,
                    color: "#000",
                  }}
                >
                  {LEAVE_TYPE_META[lv._normType]?.label || "Leave"}
                </span>
              </div>
              <div className="text-xs text-gray-700">
                {fmtRange(lv._normStart, lv._normEnd)}
              </div>
              {lv.reason && (
                <div className="text-xs text-gray-500 italic">
                  {lv.reason}
                </div>
              )}
              <div className="text-[10px] uppercase tracking-wide text-gray-400">
                Status: {lv._normStatus}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
