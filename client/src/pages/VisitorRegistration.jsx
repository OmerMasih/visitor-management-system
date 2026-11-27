import { useState } from "react";
import { registerVisitor } from "../services/api";
import "./VisitorRegistration.css";

function VisitorRegistration() {
  const [formData, setFormData] = useState({
    fullName: "",
    identificationTypes: [],
    visitorSignature: "",
    company: "",
    personToVisit: "",
    department: "",
    purposeOfVisit: "",
    confidentialityAccepted: false,
    escortPolicyAccepted: false,
  });

  const [otherDepartment, setOtherDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "identificationTypes") {
      setFormData((previous) => ({
        ...previous,
        identificationTypes: checked
          ? [...previous.identificationTypes, value]
          : previous.identificationTypes.filter((item) => item !== value),
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "department" && value !== "Other") {
      setOtherDepartment("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.identificationTypes.length === 0) {
      setError(
        "Please select at least one identification type: CDL, DL, or OTH.",
      );
      return;
    }
    if (formData.department === "Other" && !otherDepartment.trim()) {
      setError("Please enter the department name.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const registrationData = {
        ...formData,
        department:
          formData.department === "Other"
            ? otherDepartment.trim()
            : formData.department,
      };

      const result = await registerVisitor(registrationData);

      setSuccess(result.visitor);

      setFormData({
        fullName: "",
        identificationTypes: [],
        visitorSignature: "",
        company: "",
        personToVisit: "",
        department: "",
        purposeOfVisit: "",
        confidentialityAccepted: false,
        escortPolicyAccepted: false,
      });

      setOtherDepartment("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="registration-page">
        <section className="success-card">
          <div className="success-icon">✓</div>

          <h1>Thank You for Registering!</h1>

          <p>Your visitor registration has been successfully received.</p>

          <div className="confirmation-details">
            <p>
              <strong>Visitor:</strong> {success.fullName}
            </p>

            <p>
              <strong>Department:</strong> {success.department}
            </p>

            <p>
              <strong>Registration ID:</strong> {success._id}
            </p>

            <p>
              <strong>Status:</strong> {success.status}
            </p>
          </div>

          <p className="waiting-message">
            Please remain in the lobby while security arranges your escort.
          </p>

          <button className="submit-button" onClick={() => setSuccess(null)}>
            Register Another Visitor
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="registration-page">
      <header className="welcome-header">
        <div className="brand">
          <span className="brand-icon">✦</span>
          <div>
            <h2>VISITOR MANAGEMENT SYSTEM</h2>
            <p>SECURITY & ESCORT REGISTRATION</p>
          </div>
        </div>

        <div className="welcome-content">
          <h1>Welcome to Our Facility</h1>
          <p>
            We are pleased to have you here. Please complete the visitor
            registration form below.
          </p>
        </div>
      </header>

      <section className="form-card">
        <div className="form-heading">
          <h2>Visitor Registration</h2>
          <p>Please complete all required information.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="fullName">Visitor Full Name *</label>
              <input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">Company / Organization</label>
              <input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter company name"
              />
            </div>
            <div className="form-group full-width">
              <label>Identification Type Presented *</label>

              <div className="identification-options">
                {["CDL", "DL", "OTH"].map((type) => (
                  <label key={type} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="identificationTypes"
                      value={type}
                      checked={formData.identificationTypes.includes(type)}
                      onChange={handleChange}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="personToVisit">Person You Are Visiting *</label>
              <input
                id="personToVisit"
                name="personToVisit"
                value={formData.personToVisit}
                onChange={handleChange}
                placeholder="Employee name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select department</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Information Technology">
                  Information Technology
                </option>
                <option value="Administration">Administration</option>
                <option value="Legal">Legal</option>
                <option value="Facility">Facility</option>
                <option value="Interview">Interview</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {formData.department === "Other" && (
              <div className="form-group">
                <label htmlFor="otherDepartment">
                  Please Specify Department *
                </label>
                <input
                  id="otherDepartment"
                  name="otherDepartment"
                  value={otherDepartment}
                  onChange={(event) => setOtherDepartment(event.target.value)}
                  placeholder="Enter department name"
                  required
                />
              </div>
            )}

            <div className="form-group full-width">
              <label htmlFor="purposeOfVisit">Purpose of Visit *</label>
              <textarea
                id="purposeOfVisit"
                name="purposeOfVisit"
                value={formData.purposeOfVisit}
                onChange={handleChange}
                placeholder="Briefly explain the purpose of your visit"
                rows="3"
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="visitorSignature">
                Visitor Signature – Type Your Full Name *
              </label>
              <input
                id="visitorSignature"
                name="visitorSignature"
                value={formData.visitorSignature}
                onChange={handleChange}
                placeholder="Type your full legal name"
                required
              />
              <small>
                By entering your name, you acknowledge the agreements below.
              </small>
            </div>
          </div>

          <div className="policy-section">
            <h3>Visitor Policies & Acknowledgments</h3>

            <div className="policy-text">
              <strong>Confidentiality Agreement</strong>
              <p>
                I agree to protect confidential and proprietary information,
                access only authorized areas, and not read, remove, record,
                photograph, or copy information unless authorized for my visit.
              </p>

              <strong>Badge and Escort Policy</strong>
              <p>
                I understand that I must remain accompanied by an authorized
                facility employee while on the premises. I agree to return my
                visitor badge to the security desk when my visit ends.
              </p>
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="confidentialityAccepted"
                checked={formData.confidentialityAccepted}
                onChange={handleChange}
                required
              />
              <span>
                I have read and agree to the confidentiality requirements. *
              </span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="escortPolicyAccepted"
                checked={formData.escortPolicyAccepted}
                onChange={handleChange}
                required
              />
              <span>
                I understand and agree to the badge and escort policy. *
              </span>
            </label>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading
              ? "Submitting Registration..."
              : "Submit Visitor Registration"}
          </button>

          <p className="required-note">* Required information</p>
        </form>
      </section>

      <footer className="page-footer">
        Visitor Management System | Security Services &copy; Masihullah Omer
        2026
      </footer>
    </main>
  );
}

export default VisitorRegistration;
