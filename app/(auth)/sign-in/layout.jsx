"use client";

import Loading from "@/components/shared/Loading";
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

  if (authUser === null) return <Loading />;
  if (!authUser) return <Loading type="redirecting" />;

  if (authUser) return <>{children}</>;
};

export default SignInLayout;
