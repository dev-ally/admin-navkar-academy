"use client";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      Enter to the admin Panel
      <Link href="/sign-in">Sign In</Link>
    </main>
  );
}
