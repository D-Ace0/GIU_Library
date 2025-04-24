// src/screens/Register.tsx

import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "../components/ui/button";

const Register: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:5000/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            username,
            email,
            password,
            role: "user",
          }),
        }
      );

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push("/");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || "Registration failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div className="bg-neutral-900 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-neutral-800 p-4 flex items-center justify-between">
        <img
          src="https://c.animaapp.com/m9mtpk9gsPKuRT/img/giu.png"
          alt="GIU Logo"
          className="h-12"
        />
        <nav className="flex gap-4">
          <Button variant="ghost" className="text-white">
            Books
          </Button>
          <Button variant="ghost" className="text-white">
            Contact
          </Button>
          <Button
            onClick={() => router.push("/")}
            className="border border-red-600 text-red-600 hover:bg-red-700"
          >
            Sign In
          </Button>
          <Button className="border border-yellow-600 bg-yellow-600 text-black">
            Register
          </Button>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-neutral-800 p-6 rounded-lg shadow-lg w-full max-w-sm">
          <h1 className="text-center text-4xl font-bold mb-6 text-white">
            <span className="text-white">G</span>
            <span className="text-red-600">I</span>
            <span className="text-yellow-600">U</span>
            <span className="text-white"> Library</span>
          </h1>

          {showSuccess && (
            <p className="text-green-400 text-center mb-4">
              Registration successful! Redirecting…
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-red-500 text-center">{error}</p>
            )}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-white mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-700 text-white border border-neutral-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-600"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-700 text-white border border-neutral-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-600"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-700 text-white border border-neutral-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-600"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
            >
              Register
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Register;
