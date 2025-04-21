// frontend/src/components/Header.tsx
import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./ui/button.tsx";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu.tsx";
import { SignIn } from "../screens/signIn.tsx";

export const Header: React.FC = () => {
  const navItems = [
    { label: "Books", active: true },
    { label: "Contact", active: false },
  ];

  return (
    <header className="flex items-center justify-between p-8 bg-white border-b">
      <img
        className="h-[106px]"
        src="https://c.animaapp.com/m9mounjcyCQFlK/img/giu.png"
        alt="GIU Logo"
      />

      <nav>
        <NavigationMenu>
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuLink
                  className={`p-2 rounded-lg ${
                    item.active ? "bg-neutral-100" : ""
                  }`}
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      <div className="flex gap-3">
        {/* Radix Dialog around your Sign In form */}
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button variant="outline">Sign in</Button>
          </Dialog.Trigger>

          <Dialog.Portal>
            {/* dim the rest of the page */}
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />

            {/* center the dialog */}
            <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg overflow-auto">
              <SignIn />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* If you want Register to open a separate dialog, do the same here */}
        <Button variant="outline">Register</Button>
      </div>
    </header>
  );
};
