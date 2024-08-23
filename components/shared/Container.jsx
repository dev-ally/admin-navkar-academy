import React from "react";

const Container = ({ children }) => {
  return (
    <div className="flex justify-center items-center w-full">
      <div className="max-w-8xl xl:max-w-8xl w-full">{children}</div>
    </div>
  );
};

export default Container;
