// client/src/components/Calendar/Calendar.jsx
// Simple monthly calendar. Pass `records` = array of { attendance_date, status }
// and it renders each day with a colored status marker.
import { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./Calendar.css";

const STATUS_CLASS = {
  Present: "status-present",
  Absent: "status-absent",
  "Half-day": "status-half",
  Leave: "status-leave",
};

export default function Calendar({ records = [], onMonthChange, onDayClick }) {
  const [current, setCurrent] = useState(new Date());

  const recordMap = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const key = new Date(r.attendance_date).toISOString().split("T")[0];
      map[key] = r;
    });
    return map;
  }, [records]);

  const year = current.getFullYear();
  const month = current.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (delta) => {
    const next = new Date(year, month + delta, 1);
    setCurrent(next);
    onMonthChange && onMonthChange(next.getFullYear(), next.getMonth() + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = current.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <button className="cal-nav-btn" onClick={() => changeMonth(-1)}>
          <FiChevronLeft />
        </button>
        <span className="calendar-title">{monthLabel}</span>
        <button className="cal-nav-btn" onClick={() => changeMonth(1)}>
          <FiChevronRight />
        </button>
      </div>

      <div className="calendar-grid calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} className="calendar-cell empty" />;

          const dateKey = new Date(year, month, day).toISOString().split("T")[0];
          const record = recordMap[dateKey];
          const statusClass = record ? STATUS_CLASS[record.status] : "";

          return (
            <div
              key={idx}
              className={`calendar-cell ${statusClass}`}
              onClick={() => onDayClick && onDayClick(dateKey, record)}
              title={record ? record.status : "No record"}
            >
              <span className="calendar-day-num">{day}</span>
              {record && <span className="calendar-dot" />}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span><i className="dot status-present" /> Present</span>
        <span><i className="dot status-absent" /> Absent</span>
        <span><i className="dot status-half" /> Half-day</span>
        <span><i className="dot status-leave" /> Leave</span>
      </div>
    </div>
  );
}
