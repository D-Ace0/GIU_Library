import React ,{useState,useEffect}from "react";
import { AccountInfo } from "../screens/AccountInfo";
import Header from "../components/Header";
import {jwtDecode} from "jwt-decode"; // Import jwtDecode for session handling
import { useRouter } from "next/router";

export default function AccountPage() {
  const router = useRouter();

  // Retrieve session data from token
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

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div>
      {/* Add Header component */}
      <Header username={username} role={role} handleSignOut={handleSignOut} userId={userId} />
      <AccountInfo />
    </div>
  );
}
