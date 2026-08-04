import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth"

import { LogIn, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      await login(username, passcode);
      navigate("/");
    } catch (err) {
      setErrorMessage(
        err.message || "Authentication failed. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light px-3">
      <div
        className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white"
        style={{ maxWidth: "420px", width: "100%" }}
      >
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary-subtle rounded-circle p-3 mb-3">
            <ShieldCheck size={32} className="text-primary" />
          </div>
          <h4 className="fw-bold text-dark mb-1">Official Portal Login</h4>
          <p className="text-muted small mb-0">
            Project Management & Real-time Analytics
          </p>
        </div>

        {errorMessage && (
          <div
            className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 rounded-3 border-0 shadow-sm mb-4"
            role="alert"
          >
            <AlertCircle size={18} className="flex-shrink-0" />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              Email / Mobile Number
            </label>
            <input
              type="text"
              className="form-control form-control-lg fs-6 rounded-3 shadow-none border-light-subtle"
              placeholder="e.g. user@planning.gov.bd or 01700000000"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">
              Passcode
            </label>
            <div className="input-group">
              <input
                type={showPasscode ? "text" : "password"}
                className="form-control form-control-lg fs-6 rounded-start-3 shadow-none border-light-subtle border-end-0"
                placeholder="Enter active passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
              />
              <button
                className="btn btn-outline-light border-light-subtle border-start-0 text-muted px-3 rounded-end-3"
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                tabIndex="-1"
              >
                {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 fs-6 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top">
          <span className="text-muted extra-small">
            Authorized Personnel Only &bull; Security Level 3 Access
          </span>
        </div>
      </div>
    </div>
  );
}