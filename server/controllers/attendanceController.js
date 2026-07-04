// server/controllers/attendanceController.js
import Attendance from "../models/Attendance.js";

function todayStr() {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function timeStr(d = new Date()) {
  return d.toTimeString().split(" ")[0]; // HH:MM:SS
}

// ================= EMPLOYEE ENDPOINTS =================

export const checkIn = async (req, res) => {
  try {
    const employeeId = req.user.employee_id || req.user.id;
    const date = req.body.date || todayStr();
    const time = req.body.time || timeStr();

    const record = await Attendance.checkIn(employeeId, date, time);
    res.status(200).json({ success: true, message: "Checked in successfully", data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const employeeId = req.user.employee_id || req.user.id;
    const date = req.body.date || todayStr();
    const time = req.body.time || timeStr();

    const record = await Attendance.checkOut(employeeId, date, time);
    res.status(200).json({ success: true, message: "Checked out successfully", data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getMyToday = async (req, res) => {
  try {
    const employeeId = req.user.employee_id || req.user.id;
    const record = await Attendance.getByEmployeeAndDate(employeeId, todayStr());
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate and endDate are required" });
    }
    const employeeId = req.user.employee_id || req.user.id;
    const records = await Attendance.getByEmployeeRange(employeeId, startDate, endDate);
    res.status(200).json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyMonthlySummary = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const employeeId = req.user.employee_id || req.user.id;
    const summary = await Attendance.getMonthlySummary(employeeId, year, month);
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const employeeId = req.user.employee_id || req.user.id;
    const records = await Attendance.getByEmployeeRange(employeeId, '1970-01-01', '9999-12-31');
    res.status(200).json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ADMIN / HR ENDPOINTS =================

export const getAllByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const records = await Attendance.getAllByDate(date);
    res.status(200).json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllByRange = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate and endDate are required" });
    }
    const records = await Attendance.getAllByRange(startDate, endDate, employeeId || null);
    res.status(200).json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { employeeId, date } = req.params;
    const record = await Attendance.upsertManual(employeeId, date, req.body);
    res.status(200).json({ success: true, message: "Attendance updated", data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Bundle everything into the default controller object for route imports
export const attendanceController = {
  checkIn,
  checkOut,
  getMyToday,
  getMyAttendance,
  getMyMonthlySummary,
  getHistory,
  getAllByDate,
  getAllByRange,
  updateAttendance
};
