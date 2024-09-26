"use client";
import { auth } from "@/firebase/config";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Image from "next/image";

import { useRouter } from "next/navigation";

import React, { useState } from "react";
import toast from "react-hot-toast";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const signInHandler = async (e) => {
    e.preventDefault();
    let message = toast.loading("Signing in...");
    if (email === "" || password === "") {
      // alert("Please fill in all the fields");
      toast.error("Please enter all the fields", {
        id: message,
      });
      return;
    } else if (email !== "admin@navkaracademy.in") {
      toast.error("Invalid credentials", {
        id: message,
      });
      return;
    } else {
      console.log(email, password);
      await signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          toast.success("Admin signed in successfully", {
            id: message,
          });
          console.log("User:", user);
          router.push("/");
          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          toast.error("Invalid credentials", {
            id: message,
          });
          console.log("Error signing in:", errorCode, errorMessage);
        });
    }
    setEmail("");
    setPassword("");
  };

  const resetHandler = async () => {
    let emailToReset = prompt("Enter your email to reset password");
    console.log("Resetting password");
    let loading = toast.loading("Sending Reset Password Email...");
    await sendPasswordResetEmail(auth, emailToReset)
      .then(() => {
        toast.success("Email sent if you are already registered", {
          id: loading,
        });
      })
      .catch((err) => {
        if (err.code === "auth/user-not-found") {
          toast.error("You don't have an account with this email", {
            id: loading,
          });
        } else if (err.code === "auth/missing-email") {
          toast.error("Please enter your email", {
            id: loading,
          });
        } else {
          toast.error(err.message, {
            id: loading,
          });
        }
      });
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[100svh] px-4 py-8">
      <div className="flex items-center justify-center w-full">
        <div className="mb-3  w-32 h-32  flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="logo"
            width={300}
            height={300}
            className="w-full h-full"
          />
        </div>
      </div>

      <form
        action="submit"
        className="p-8 rounded-lg border-2 min-w-[250px] md:min-w-[400px] lg:min-w-[500px] flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-gray-700 text-center mb-2">
          Log In to Admin Panel
        </h2>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-gray-500 font-bold ">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="border-2 border-gray-300 p-3 rounded-xl"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-gray-500 font-bold ">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="border-2 border-gray-300 p-3 rounded-xl"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <p
            className="text-base cursor-pointer text-black/80 font-medium"
            onClick={resetHandler}
          >
            Forget Password?
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <button
            type="submit"
            className="p-4 bg-[#f27436] hover:bg-[#f27436]/80 text-white rounded-lg"
            onClick={signInHandler}
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
