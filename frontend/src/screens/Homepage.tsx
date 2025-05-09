import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";
import Header from "../components/Header";

const HomePage: React.FC = () => {
  const router = useRouter();
  const [session, setSession] = useState<any>({});
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Access localStorage only on the client
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (storedToken) {
      try {
        const decodedSession = jwtDecode(storedToken);
        setSession(decodedSession);
        console.log("session", decodedSession);
        console.log("token", storedToken);
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  const username = session?.name || "User";
  const role = session?.role || "user";
  const userId = session?.user_id || "userId";
  console.log("myid", userId);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header username={username} role={role} handleSignOut={handleSignOut} userId={userId} />
      <main className="flex-grow p-8 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          <span className="text-black">G</span>
          <span className="text-red-600">I</span>
          <span className="text-yellow-500">U</span>
          <span className="text-black"> Library</span>
        </h1>
        <p className="text-gray-600 mb-8">About us</p>
        <div className="max-w-2xl mx-auto text-gray-700">
          <p>
            Welcome to the GIU Library. We offer a comprehensive collection of
            resources to support your learning and research. Our mission is to
            foster academic excellence by providing world-class services and a
            welcoming environment.
          </p>
        </div>
      </main>
    </div>
  );
};

export default HomePage;