"use client";

import React from "react";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Implement logout logic here (e.g., clearing user session)
    // Redirect to login page
    router.push("/login");
  };

  return (
    <button onClick={handleLogout} className="btn">
      Logout
    </button>
  );
};

export default LogoutButton;
