"use client";

import Header from "@/components/shared/Header";
import Loading from "@/components/shared/Loading";
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
        if (user.email === "admin@navkaracademy.in") {
          setAuthUser(true);
        } else {
          router.push("/");
          setAuthUser(false);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (authUser === null) return <Loading />;
  if (!authUser) return <Loading type="redirecting" />;

  if (authUser)
    return (
      <>
        <Header />
        {children}
      </>
    );
};

export default DashboardLayout;
