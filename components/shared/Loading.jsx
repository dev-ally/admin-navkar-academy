import React from "react";

const Loading = ({ type = "loading" }) => {
  return (
    <div className="w-full h-[100svh] flex flex-col justify-center items-center">
      <div className="loading-wave w-[300px] h-[100px] flex justify-center items-center">
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
      </div>
      <span className="text-2xl font-bold">
        {type === "loading" ? "Loading" : "Redirecting"}
      </span>
    </div>
  );
};

export default Loading;
