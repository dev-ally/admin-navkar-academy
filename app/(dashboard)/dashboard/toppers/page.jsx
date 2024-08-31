"use client";

import ToppersList from "@/components/shared/ToppersList";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { RiArrowRightLine } from "react-icons/ri";

const App = () => {
  const [topperLists, setTopperLists] = useState({});
  const [draggingItem, setDraggingItem] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [newTop3, setNewTop3] = useState({
    name: "",
    percentage: "",
    image: "",
    year: "",
  });
  const [newOtherTopper, setNewOtherTopper] = useState({
    name: "",
    percentage: "",
    year: "",
  });

  useEffect(() => {
    console.log("Updated Topper Lists:", topperLists);
  }, [topperLists]);

  const handleDragStart = (e, item, listType, year) => {
    setDraggingItem({ item, listType, year });
    e.dataTransfer.setData("text/plain", "");
  };

  const handleDragEnd = () => {
    setDraggingItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetItem, listType, year) => {
    if (!draggingItem) return;

    const {
      item: draggedItem,
      listType: draggedListType,
      year: draggedYear,
    } = draggingItem;

    if (draggedYear !== year || draggedListType !== listType) return;

    const currentIndex = topperLists[year][listType].findIndex(
      (i) => i.id === draggedItem.id
    );
    const targetIndex = topperLists[year][listType].findIndex(
      (i) => i.id === targetItem.id
    );

    if (currentIndex === -1 || targetIndex === -1) return;

    const newList = [...topperLists[year][listType]];

    [newList[currentIndex], newList[targetIndex]] = [
      newList[targetIndex],
      newList[currentIndex],
    ];

    newList.forEach((item, index) => (item.index = index + 1));

    setTopperLists((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [listType]: newList,
      },
    }));

    setDraggingItem(null);
  };

  const handleInputChange = (e, listType) => {
    const { name, value } = e.target;
    if (listType === "top3") {
      setNewTop3((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewOtherTopper((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addTopper = (listType) => {
    const newItem =
      listType === "top3" ? { ...newTop3 } : { ...newOtherTopper };

    const year = newItem.year;
    if (!year) return;

    const newId =
      Math.max(
        ...Object.values(topperLists).flatMap((list) =>
          Object.values(list).flatMap((l) => l.map((i) => i.id))
        ),
        0
      ) + 1;

    newItem.id = newId;
    newItem.index = (topperLists[year]?.[listType]?.length || 0) + 1;

    setTopperLists((prev) => {
      const newTopperLists = {
        ...prev,
        [year]: {
          ...prev[year],
          [listType]: [...(prev[year]?.[listType] || []), newItem],
        },
      };

      const orderedTopperLists = {
        [year]: newTopperLists[year],
        ...Object.keys(prev)
          .filter((key) => key !== year)
          .reduce((acc, key) => {
            acc[key] = prev[key];
            return acc;
          }, {}),
      };

      return orderedTopperLists;
    });

    if (listType === "top3") {
      setNewTop3({ name: "", percentage: "", image: "", year: "" });
    } else {
      setNewOtherTopper({ name: "", percentage: "", year: "" });
    }
  };

  const sortToppers = (year, listType) => {
    if (!topperLists[year] || !topperLists[year][listType]) return;

    const sortedList = [...topperLists[year][listType]].sort(
      (a, b) => b.percentage - a.percentage
    );

    sortedList.forEach((item, index) => (item.index = index + 1));

    setTopperLists({
      ...topperLists,
      [year]: {
        ...topperLists[year],
        [listType]: sortedList,
      },
    });
  };

  return (
    <div className="h-screen p-10 flex gap-4">
      <div className="w-1/2">
        <div className="bg-gray-100 p-4 rounded-md mb-4 border">
          <h3 className="text-2xl font-bold mb-2">Add Top 3 Toppers</h3>
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={newTop3.name}
            onChange={(e) => handleInputChange(e, "top3")}
            className="border border-gray-300 p-2 mb-2 w-full rounded-lg"
          />
          <input
            type="text"
            placeholder="Percentage"
            name="percentage"
            value={newTop3.percentage}
            onChange={(e) => handleInputChange(e, "top3")}
            className="border border-gray-300 p-2 mb-2 w-full rounded-lg"
          />
          <input
            type="text"
            placeholder="Year"
            name="year"
            value={newTop3.year}
            onChange={(e) => handleInputChange(e, "top3")}
            className="border border-gray-300 p-2 mb-2 w-full rounded-lg"
          />
          <input
            type="text"
            placeholder="Image URL"
            name="image"
            value={newTop3.image}
            onChange={(e) => handleInputChange(e, "top3")}
            className="border border-gray-300 p-2 mb-2 w-full rounded-lg"
          />
          <Button
            onClick={() => addTopper("top3")}
            className="bg-[#f27436] text-white p-2 rounded-md w-full hover:bg-[#f27436]/[0.9]"
          >
            Add Topper
          </Button>
        </div>
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="text-2xl font-bold mb-2">Add Other Toppers</h3>
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={newOtherTopper.name}
            onChange={(e) => handleInputChange(e, "others")}
            className="border border-gray-300 p-2 mb-2 w-full rounded-lg"
          />
          <input
            type="text"
            placeholder="Percentage"
            name="percentage"
            value={newOtherTopper.percentage}
            onChange={(e) => handleInputChange(e, "others")}
            className="border border-gray-300 p-2 mb-2 w-full rounded-lg"
          />
          <input
            type="text"
            placeholder="Year"
            name="year"
            value={newOtherTopper.year}
            onChange={(e) => handleInputChange(e, "others")}
            className="border border-gray-300 p-2 mb-2 w-full rounded-lg"
          />
          <Button
            onClick={() => addTopper("others")}
            className="bg-[#f27436] text-white p-2 rounded-md w-full hover:bg-[#f27436]/[0.9]"
          >
            Add Topper
          </Button>
        </div>
      </div>
      <div className="w-1/2 flex flex-col gap-4 overflow-auto">
        <div className="bg-white p-4 rounded-md shadow-md mb-4">
          <h2 className="text-2xl font-bold mb-2 text-gray-700">
            {Object.keys(topperLists).length === 0 ? (
              <p className="text-gray-500">No Toppers List Available</p>
            ) : (
              "Toppers List"
            )}
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.keys(topperLists).map((year) => (
              <div>
                {selectedYear === year ? (
                  <div
                    key={year}
                    onClick={() => setSelectedYear(null)}
                    className={`p-3 rounded-md cursor-pointer ${
                      selectedYear === year
                        ? "bg-[#f27436] text-white"
                        : "bg-transparent text-gray-700"
                    } w-full border border-gray-300 text-center hover:bg-[#f27436] hover:text-white flex items-center justify-center`}
                  >
                    Close <X className="w-6 h-6 ml-2" />
                  </div>
                ) : (
                  <div
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`p-3 rounded-md cursor-pointer ${
                      selectedYear === year
                        ? "bg-[#f27436] text-white"
                        : "bg-transparent text-gray-700"
                    } w-full border border-gray-300 text-center hover:bg-[#f27436] hover:text-white flex items-center justify-center`}
                  >
                    {year}
                    <RiArrowRightLine className="w-6 h-6 ml-2" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedYear && (
            <ToppersList
              topperLists={topperLists[selectedYear] || {}}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              sortToppers={sortToppers}
              year={selectedYear}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
