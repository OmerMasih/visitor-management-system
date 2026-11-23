import "./VisitorBadge.css";

function VisitorBadge({ visitor, onClose }) {
  if (!visitor) return null;

  const visitDate = visitor.timeIn
    ? new Date(visitor.timeIn).toLocaleDateString()
    : new Date().toLocaleDateString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="badge-overlay">
      <div className="badge-modal">
        <div className="badge-actions">
          <button onClick={handlePrint}>Print Badge</button>

          <button onClick={onClose}>Close</button>
        </div>

        <div className="visitor-badge-print-area">
          <div className="visitor-badge">
            <div className="badge-header">
              <h2>VISITOR</h2>
              <p>VISITOR MANAGEMENT SYSTEM</p>
            </div>

            <div className="badge-number">
              {visitor.badgeNumber || "NOT ASSIGNED"}
            </div>

            <div className="badge-visitor-info">
              <h1>{visitor.fullName}</h1>
              <p>{visitor.company || "Company not provided"}</p>
            </div>

            <div className="badge-details">
              <div>
                <span>DEPARTMENT</span>
                <strong>{visitor.department}</strong>
              </div>

              <div>
                <span>PERSON TO VISIT</span>
                <strong>{visitor.personToVisit}</strong>
              </div>

              <div>
                <span>ESCORT</span>
                <strong>{visitor.escortName || "Pending"}</strong>
              </div>

              <div>
                <span>VISIT DATE</span>
                <strong>{visitDate}</strong>
              </div>
            </div>

            <div className="badge-footer">
              <p>PLEASE DISPLAY THIS BADGE WHILE ON SITE</p>
              <strong>AUTHORIZED VISITOR</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisitorBadge;
