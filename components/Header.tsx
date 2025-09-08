"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Breadcumbs from "./Breadcumbs";

function Header() {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between p-5">
      {user && (
        <h1 className="text-2xl">
          {" "}
          {user?.firstName}
          {`'s`}Space
        </h1>
      )}

      {/* Breadcrumbs */}
      <Breadcumbs />

      <div>
        <SignedOut>
          <SignInButton />
        </SignedOut>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
      {/* signedIn */}
    </div>
  );
}

export default Header;
