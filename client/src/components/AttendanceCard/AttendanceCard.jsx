// client/src/components/AttendanceCard/AttendanceCard.jsx
import { FiClock, FiLogIn, FiLogOut } from "react-icons/fi";
import "./AttendanceCard.css";

export default function AttendanceCard({ today, onCheckIn, onCheckOut, loading }) {
  const hasCheckedIn = !!today?.check_in_time;
  const hasCheckedOut = !!today?.check_out_time;

  return (
    <div className="attendance-card">
      <div className="attendance-card-top">
        <FiClock className="attendance-card-icon" />
        <div>
          <p className="attendance-card-label">Today</p>
          <p className="attendance-card-date">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
        </div>
      </div>

      <div className="attendance-card-times">
        <div>
          <span className="time-label">Check-in</span>
          <span className="time-value">{today?.check_in_time || "--:--"}</span>
        </div>
        <div>
          <span className="time-label">Check-out</span>
          <span className="time-value">{today?.check_out_time || "--:--"}</span>
        </div>
        <div>
          <span className="time-label">Status</span>
          <span className={`time-value status-badge status-${(today?.status || "absent").toLowerCase().replace(" ", "-")}`}>
            {today?.status || "Not marked"}
          </span>
        </div>
      </div>

      <div className="attendance-card-actions">
        <button
          className="btn-checkin"
          onClick={onCheckIn}
          disabled={loading || hasCheckedIn}
        >
          <FiLogIn /> {hasCheckedIn ? "Checked In" : "Check In"}
        </button>
        <button
          className="btn-checkout"
          onClick={onCheckOut}
          disabled={loading || !hasCheckedIn || hasCheckedOut}
        >
          <FiLogOut /> {hasCheckedOut ? "Checked Out" : "Check Out"}
        </button>
      </div>
    </div>
  );
}
