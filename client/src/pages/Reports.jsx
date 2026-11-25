import { useEffect, useMemo, useState } from "react";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import DashboardSidebar from "../components/DashboardSidebar";
import "./Reports.css";

const API_URL = "http://localhost:5000/api/visitors";

// Authentication helper
const adminFetch = async (url, options = {}) => {
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    window.location.assign("/admin/login");
    throw new Error("Please log in again.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    window.location.assign("/admin/login");
  }

  return response;
};

function Reports() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [period, setPeriod] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");

  // Fetch visitor records
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await adminFetch(API_URL);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load reports.");
        }

        setVisitors(data.visitors || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  // Get available departments
  const departments = useMemo(() => {
    return [
      "All",
      ...new Set(visitors.map((visitor) => visitor.department).filter(Boolean)),
    ];
  }, [visitors]);

  // Calculate reporting date range
  const getDateRange = () => {
    const now = new Date();
    const start = new Date(now);

    if (period === "today") {
      start.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    } else if (period === "month") {
      start.setDate(now.getDate() - 29);
      start.setHours(0, 0, 0, 0);
    }

    return { start, end: now };
  };

  // Filter visitor records
  const filteredVisitors = useMemo(() => {
    const { start, end } = getDateRange();

    return visitors.filter((visitor) => {
      const visitDate = visitor.timeIn ? new Date(visitor.timeIn) : null;

      let matchesDate = true;

      if (period === "custom") {
        const customStart = startDate
          ? new Date(`${startDate}T00:00:00`)
          : null;

        const customEnd = endDate ? new Date(`${endDate}T23:59:59.999`) : null;

        matchesDate =
          (!customStart || (visitDate && visitDate >= customStart)) &&
          (!customEnd || (visitDate && visitDate <= customEnd));
      } else if (period !== "all") {
        matchesDate = visitDate && visitDate >= start && visitDate <= end;
      }

      const matchesDepartment =
        department === "All" || visitor.department === department;

      const matchesStatus = status === "All" || visitor.status === status;

      return matchesDate && matchesDepartment && matchesStatus;
    });
  }, [visitors, period, startDate, endDate, department, status]);

  // Prepare report data for Excel and PDF
  const reportRows = filteredVisitors.map((visitor) => ({
    "Visitor Name": visitor.fullName || "",
    "Badge Number": visitor.badgeNumber || "",
    Company: visitor.company || "",
    "Person to Visit": visitor.personToVisit || "",
    Department: visitor.department || "",
    Purpose: visitor.purposeOfVisit || "",
    "Time In": visitor.timeIn ? new Date(visitor.timeIn).toLocaleString() : "",
    "Time Out": visitor.timeOut
      ? new Date(visitor.timeOut).toLocaleString()
      : "",
    Status: visitor.status || "",
    Escort: visitor.escortName || "",
  }));

  // Export Excel report
  const exportExcel = () => {
    if (!reportRows.length) {
      alert("No visitor records to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(reportRows);

    worksheet["!cols"] = [
      { wch: 22 },
      { wch: 16 },
      { wch: 20 },
      { wch: 22 },
      { wch: 18 },
      { wch: 25 },
      { wch: 24 },
      { wch: 24 },
      { wch: 22 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Visitor Report");

    XLSX.writeFile(
      workbook,
      `Visitor-Report-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  // Export PDF report
  const exportPDF = () => {
    if (!reportRows.length) {
      alert("No visitor records to export.");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    doc.text("Visitor Management Report", 14, 18);

    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

    doc.text(`Total Records: ${filteredVisitors.length}`, 14, 31);

    autoTable(doc, {
      startY: 37,
      head: [Object.keys(reportRows[0])],
      body: reportRows.map((row) => Object.values(row)),
      theme: "grid",
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [23, 61, 93],
      },
      margin: { left: 10, right: 10 },
    });

    doc.save(`Visitor-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="admin-layout">
      <DashboardSidebar />

      <main className="admin-main">
        <div className="reports-page">
          <header className="reports-header">
            <div>
              <p className="reports-label">REPORTING CENTER</p>
              <h1>Visitor Reports</h1>
              <p>Generate, filter, and export visitor activity reports.</p>
            </div>
          </header>

          {/* Summary Cards */}
          <section className="reports-summary">
            <div className="report-stat-card">
              <span>Total Records</span>
              <strong>{filteredVisitors.length}</strong>
            </div>

            <div className="report-stat-card">
              <span>Checked Out</span>
              <strong>
                {
                  filteredVisitors.filter(
                    (visitor) => visitor.status === "Checked Out",
                  ).length
                }
              </strong>
            </div>

            <div className="report-stat-card">
              <span>Currently Active</span>
              <strong>
                {
                  filteredVisitors.filter(
                    (visitor) =>
                      visitor.status !== "Checked Out" &&
                      visitor.status !== "Cancelled",
                  ).length
                }
              </strong>
            </div>
          </section>

          {/* Search and Filters */}
          <section className="report-filter-panel">
            <h2>Report Filters</h2>

            <div className="report-filters">
              <div className="report-field">
                <label>Reporting Period</label>
                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              {period === "custom" && (
                <>
                  <div className="report-field">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                    />
                  </div>

                  <div className="report-field">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(event) => setEndDate(event.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="report-field">
                <label>Department</label>
                <select
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                >
                  {departments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="report-field">
                <label>Visitor Status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Registered">Registered</option>
                  <option value="Waiting for Department">
                    Waiting for Department
                  </option>
                  <option value="Escort Requested">Escort Requested</option>
                  <option value="Escort Accepted">Escort Accepted</option>
                  <option value="Escort in Progress">Escort in Progress</option>
                  <option value="Checked Out">Checked Out</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </section>

          {/* Export Reports */}
          <section className="report-export-panel">
            <div>
              <h2>Export Reports</h2>
              <p>
                Download {filteredVisitors.length} filtered visitor records.
              </p>
            </div>

            <div className="report-export-buttons">
              <button
                className="excel-export-button"
                onClick={exportExcel}
                disabled={loading || filteredVisitors.length === 0}
              >
                ↓ Export Excel
              </button>

              <button
                className="pdf-export-button"
                onClick={exportPDF}
                disabled={loading || filteredVisitors.length === 0}
              >
                ↓ Export PDF
              </button>
            </div>
          </section>

          {error && <p className="reports-error">{error}</p>}

          {loading ? (
            <p className="reports-message">Loading visitor records...</p>
          ) : (
            <section className="reports-table-wrapper">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Visitor Name</th>
                    <th>Badge Number</th>
                    <th>Department</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Status</th>
                    <th>Escort</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredVisitors.length === 0 ? (
                    <tr>
                      <td colSpan="7">No records match your filters.</td>
                    </tr>
                  ) : (
                    filteredVisitors.map((visitor) => (
                      <tr key={visitor._id}>
                        <td>{visitor.fullName}</td>
                        <td>{visitor.badgeNumber || "—"}</td>
                        <td>{visitor.department}</td>
                        <td>
                          {visitor.timeIn
                            ? new Date(visitor.timeIn).toLocaleString()
                            : "—"}
                        </td>
                        <td>
                          {visitor.timeOut
                            ? new Date(visitor.timeOut).toLocaleString()
                            : "—"}
                        </td>
                        <td>{visitor.status}</td>
                        <td>{visitor.escortName || "Not assigned"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default Reports;
