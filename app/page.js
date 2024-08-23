"use client";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          signOut(auth).then(() => {
            console.log("Sign-out successful.");
          });
        }}
      >
        Sign Out
      </button>
    </main>
  );
}
