"use client";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
  const [authUser, setAuthUser] = useState(null);
  const router = useRouter();

  const signoutHandler = async () => {
    const loading = toast.loading("Signing Out...");
    await signOut(auth)
      .then(() => {
        toast.success("SignOut Successful", {
          id: loading,
        });
        router.push("/sign-in");
      })
      .catch((err) => {
        toast.error(err.message, {
          id: loading,
        });
        console.log(err);
      });
  };

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
        {auth?.currentUser?.email === "admin@navkaracademy.in" && (
          <Link href="/dashboard">Dashboard</Link>
        )}
        {auth?.currentUser?.email !== "admin@navkaracademy.in" && (
          <>
            <span className="text-center font-medium text-lg">
              You are not logged in as Admin, please signout first!
            </span>
            <Button onClick={signoutHandler}>SignOut</Button>
          </>
        )}
        {/* <Loading /> */}
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
