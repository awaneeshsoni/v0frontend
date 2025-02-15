import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = import.meta.env.VITE_API_URL;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Set loading to true before the request

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token); // Store auth token
      localStorage.setItem("username", data.username); // Store auth token

      // Fetch user's workspaces after login
      const workspaceRes = await fetch(`${API}/api/workspace`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const workspaces = await workspaceRes.json();
      if (workspaces.length > 0) {
        navigate(`/workspace/${workspaces[0]._id}`); // Redirect to first workspace
      } else {
        navigate("/dashboard"); // No workspaces, go to dashboard
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false); // Set loading to false after the request (success or failure)
    }
  };

  return (
    <div className="bg-gray-900 max-h-screen">
    <Navbar />
    <div className="flex flex-col items-center min-h-screen justify-center bg-gray-900 text-white p-4"> {/* Added padding */}
      <h2 className="text-3xl font-bold mb-6">Welcome Back</h2>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <form onSubmit={handleLogin} className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg"> {/* Added max-w-md */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg mb-4 text-white placeholder-gray-400" // Increased mb
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg mb-4 text-white placeholder-gray-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50" // Added disabled style
          disabled={isLoading} // Disable the button while loading
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
                <div className="animate-spin border-4 border-gray-400 border-t-black rounded-full w-6 h-6"></div>
            </div>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <p className="mt-4 text-gray-400">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="text-white font-semibold hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
    <Footer />
    </div>
  );
}

export default Login;