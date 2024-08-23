"use client";

import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SignInLayout = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
        setAuthUser(false); // Set loading to false after the user state is checked
      } else {
        setAuthUser(true);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (authUser === null) return <div>Loading</div>;
  if (!authUser) return <div>Redirecting</div>;

  if (authUser) return <>{children}</>;
};

export default SignInLayout;
