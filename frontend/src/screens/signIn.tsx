// frontend/src/screens/SignIn.tsx
import React from "react";
import { Button } from "../component/ui/button.tsx";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../component/ui/navigation-menu.tsx";

export const SignIn = (): JSX.Element => {
  const navItems = [
    { name: "Books", active: true },
    { name: "Contact", active: false },
  ];

  return (
    <div className="bg-white">
      <div className="relative max-w-[1200px] mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between p-8 bg-white border-b border-[#d9d9d9]">
          <img
            className="h-[106px] object-cover"
            alt="GIU Logo"
            src="https://c.animaapp.com/m9mtpk9gsPKuRT/img/giu.png"
          />

          <NavigationMenu className="flex-1 flex justify-center">
            <NavigationMenuList className="flex gap-4">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuLink
                    className={`px-4 py-2 rounded-lg ${
                      item.active ? "bg-neutral-100" : ""
                    }`}
                  >
                    {item.name}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-3">
            <Button className="bg-colorsred text-white border border-[#ff3b30] rounded-lg hover:bg-colorsred/90">
              Sign in
            </Button>
            <Button className="bg-colorsorange text-white border border-[#ff9500] rounded-lg hover:bg-colorsorange/90">
              Register
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-col items-center justify-center bg-neutral-100 py-20 px-6">
          {/* Title */}
          <h1 className="mb-6 text-4xl font-extrabold text-center">
            <span className="text-black">G</span>
            <span className="text-[#ff3b30]">I</span>
            <span className="text-[#ff9500]">U</span>
            <span className="text-[#1e1e1e]"> Library</span>
          </h1>

          {/* Sign in card */}
          <form className="w-full max-w-xs bg-white rounded-lg shadow-md p-6 space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white rounded-md py-2 hover:bg-gray-800"
            >
              Sign In
            </Button>
          </form>
        </main>
      </div>
    </div>
  );
};
