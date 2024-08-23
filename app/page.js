"use client";
import { auth } from "@/firebase/config";
import Link from "next/link";

export default function Home() {
  // check if the user is there or now
  // if the user is there then show the dashboard link else sign in link
  const user = auth.currentUser;
  if (user) {
    return (
      <div className="landing-center-div">
        <h1>Go to the Admin Panel.</h1>
        <Link href="/dashboard">Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="landing-center-div">
      <div className="flex flex-col gap-3 items-center justify-center">
        <h2>Welcome to Admin Panel</h2>
        <h1>Navkar Academy</h1>
      </div>
      <Link href="/sign-in">Sign In</Link>
    </div>
  );
}
