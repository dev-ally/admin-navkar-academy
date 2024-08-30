"use client";

import Header from "@/components/shared/Header";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DashboardLayout = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/sign-in");
        setAuthUser(false); // Set loading to false after the user state is checked
      } else {
        setAuthUser(true);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (authUser === null) return <div>Loading</div>;
  if (!authUser) return <div>Redirecting</div>;

  if (authUser)
    return (
      <>
        <Header />
        {children}
      </>
    );
};

export default DashboardLayout;
