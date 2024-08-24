"use client";
import React, { useState } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AddTopper from "@/components/shared/AddTopper";
import { toppers as initialToppers } from "@/data/fdata";

const DraggableTopper = ({ topper, index, moveTopper }) => {
  const [, ref] = useDrag({
    type: "TOPPER",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "TOPPER",
    hover: (item) => {
      if (item.index !== index) {
        moveTopper(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      className="bg-blue-400 flex flex-col items-center mb-4 mt-2 p-2 rounded-lg shadow-md hover:cursor-grab"
    >
      <h2 className="text-2xl font-bold">{`${index + 1}. ${topper.name}`}</h2>
      <p className="text-lg">{topper.percentage}</p>
    </div>
  );
};

const Page = () => {
  const [toppers, setToppers] = useState(initialToppers);

  const logToppers = (updatedToppers) => {
    console.log("Updated Toppers:", updatedToppers);
  };

  const sortToppers = () => {
    const sortedToppers = [...toppers].sort(
      (a, b) => parseFloat(b.percentage) - parseFloat(a.percentage)
    );
    const updatedToppers = sortedToppers.map((topper, index) => ({
      ...topper,
      index: index + 1,
    }));
    setToppers(updatedToppers);
    logToppers(updatedToppers);
  };

  const moveTopper = (fromIndex, toIndex) => {
    const updatedToppers = [...toppers];
    const [movedTopper] = updatedToppers.splice(fromIndex, 1);
    updatedToppers.splice(toIndex, 0, movedTopper);
    const finalToppers = updatedToppers.map((topper, index) => ({
      ...topper,
      index: index + 1,
    }));
    setToppers(finalToppers);
    logToppers(finalToppers);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex space-x-4">
        {/* Top 3 toppers div */}
        <div className="w-[50%] h-[50%] bg-gray-700 border rounded-lg shadow-md p-10">
          <AddTopper type="top3" />
        </div>

        {/* Other toppers div */}
        <div className="w-[50%] h-[50%] bg-gray-700 border rounded-lg shadow-md p-10">
          <AddTopper type="other" />
          <button
            onClick={sortToppers}
            className="mb-4 bg-green-500 text-white p-2 rounded"
          >
            Sort
          </button>
          {toppers.map((topper, index) => (
            <DraggableTopper
              key={topper.id}
              topper={topper}
              index={index}
              moveTopper={moveTopper}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default Page;
