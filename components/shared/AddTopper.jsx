"use client";
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toppers } from "@/data/fdata";

const AddTopper = ({ type }) => {
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState("");
  const [image, setImage] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const AddTopperHandler = () => {
    if (name === "" || percentage === "") {
      alert("Please fill in all the fields");
      return;
    } else {
      console.log(name, percentage, image);
      toppers.push({ name, percentage, image });
      console.log(toppers);
      setName("");
      setPercentage("");
      setImage("");
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <button className="bg-gray-900 p-4 text-white border rounded-sm">
          {type === "top3" ? "Add Top 3 Toppers" : "Add Other Toppers"}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {type === "top3" ? "Add Top 3 Toppers" : "Add Other Toppers"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <form className="flex flex-col gap-4">
              <input
                type="text"
                name="topper"
                placeholder="Name of topper"
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-gray-300 p-3 rounded-xl"
              />
              <input
                type="text"
                placeholder="Percentage"
                onChange={(e) => setPercentage(e.target.value)}
                className="border-2 border-gray-300 p-3 rounded-xl"
              />
              <input
                type="text"
                className="border-2 border-gray-300 p-3 rounded-xl"
                placeholder="Year"
                onChange={(e) => setYear(e.target.value)}
                value={year}
              />
              {type === "top3" && (
                <input
                  type="file"
                  name="image"
                  placeholder="Image"
                  onChange={(e) => setImage(e.target.value)}
                  className="border-2 border-gray-300 p-3 rounded-xl"
                />
              )}
            </form>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={AddTopperHandler}>Add</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AddTopper;
