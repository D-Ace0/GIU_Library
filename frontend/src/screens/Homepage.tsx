import React from "react";
import { useRouter } from "next/router";
import { Button } from "../component/ui/button";
import { Bell } from "lucide-react";
import { jwtDecode } from "jwt-decode"; // ✅ fixed import

const HomePage: React.FC = () => {
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  let session: any = {};

  try {
    session = token ? jwtDecode(token) : {};
    console.log("session", session);
    console.log("token", token);
  } catch (error) {
    console.error("Invalid token", error);
  }

  const username = session?.name || "User";

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
      <div className="bg-gray-100 min-h-screen flex flex-col">
        <header className="bg-white p-4 flex items-center justify-between shadow">
          <img
              src="https://c.animaapp.com/m9mtpk9gsPKuRT/img/giu.png"
              alt="GIU Logo"
              className="h-12"
          />
          <nav className="flex items-center gap-4">
            <Button variant="ghost">Books</Button>
            <Button variant="ghost">Contact</Button>
            <Button variant="ghost" onClick={() => router.push("/account")}>
              AccountInfo
            </Button>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Hello, {username}</span>
            <Button variant="ghost">
              <Bell className="w-5 h-5 text-gray-600" />
            </Button>
            <Button
                onClick={handleSignOut}
                className="bg-red-500 text-white hover:bg-red-600"
            >
              Sign Out
            </Button>
          </div>
        </header>

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
              foster academic excellence by providing world-class services and
              a welcoming environment.
            </p>
          </div>
        </main>
      </div>
  );
};

export default HomePage;
