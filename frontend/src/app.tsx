// frontend/src/App.tsx
import React from "react";
import { SignIn } from "./screens/signIn.tsx";

export default function App() {
  return (
    // Give the page a light background and vertically center
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SignIn />
    </div>
  );
}
