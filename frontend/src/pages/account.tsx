import React from "react";
import { AccountInfo } from "../screens/AccountInfo";
import Header from "../components/Header";
import {jwtDecode} from "jwt-decode"; // Import jwtDecode for session handling
import { useRouter } from "next/router";

export default function AccountPage() {
  const router = useRouter();

  // Retrieve session data from token
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  let session: any = {};

  try {
    session = token ? jwtDecode(token) : {};
  } catch (error) {
    console.error("Invalid token", error);
  }

  const username = session?.name || "User";
  const role = session?.role || "user";

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div>
      {/* Add Header component */}
      <Header username={username} role={role} handleSignOut={handleSignOut} />
      <AccountInfo />
    </div>
  );
}
