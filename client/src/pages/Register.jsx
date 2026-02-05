import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await register(form); // calls backend /api/auth/register
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to create account. Try again."
      );
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <p style={{ color: "#555", marginBottom: "1rem" }}>
      ⏳ Waking up server… first request may take a few seconds.
    </p>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
            />
          </label>
        </div>

        <button type="submit">Create account</button>
      </form>

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Register;
