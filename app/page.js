"use client";
import Loading from "@/components/shared/Loading";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [authUser, setAuthUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // router.push("/sign-in");
        setAuthUser(false); // Set loading to false after the user state is checked
      } else {
        setAuthUser(true);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (authUser === null) return <Loading />;
  if (authUser) {
    return (
      <div className="landing-center-div">
        <h1>Go to the Admin Panel.</h1>
        <Link href="/dashboard">Dashboard</Link>
        <Loading />
      </div>
    );
  }

  if (!authUser)
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
