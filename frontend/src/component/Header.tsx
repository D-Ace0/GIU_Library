// frontend/src/components/Header.tsx
import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import SignIn from "../screens/signIn";
import { useRouter } from "next/router";
import { useAuth } from "../lib/hooks";

export const Header: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
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
        onClick={() => router.push('/')}
        style={{ cursor: 'pointer' }}
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
        {!isAuthenticated ? (
          <>
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
            <Button variant="outline" onClick={() => router.push('/register')}>Register</Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mr-2">
              <span>Hello, {user?.username}</span>
              <img className="w-[26px] h-[23px]" alt="Bell" src="/bell.svg" />
            </div>
            {/* Account button */}
            <Button 
              variant="outline" 
              onClick={() => router.push('/account')}
              className="flex items-center gap-2"
            >
              <img
                src={user?.image_url || "/account-circle.svg"}
                alt="Account"
                className="w-5 h-5"
              />
              Account
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
