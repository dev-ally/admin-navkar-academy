import React from "react";
import { Button } from "../ui/button";
import { RiDragMove2Line } from "react-icons/ri";
import { DeleteIcon, Trash } from "lucide-react";

const ToppersList = ({
  topperLists,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  sortToppers,
  year,
  animation,
  isTop3Changed,
  isOthersChanged,
  saveTop3,
  saveOthers,
  handleDelete,
}) => {
  if (!topperLists) return null;

  return (
    <div
      className={`bg-white p-4 rounded-md transition-transform duration-300 ${
        animation === "slide-in" ? "animate-slideInFromRight" : ""
      } ${animation === "slide-out" ? "animate-slideOutToRight" : ""}`}
    >
      <h2 className="text-2xl font-bold mb-2 text-gray-700">
        {year} Toppers List
      </h2>

      <div className="md:flex justify-between items-center ">
        <h3 className="text-xl font-semibold mt-4">Top 3 Toppers</h3>
        <div className="flex gap-x-4 justify-center items-center">
          {topperLists.top3 && topperLists.top3.length > 1 && (
            <>
              <Button
                onClick={() => sortToppers(year, "top3")}
                className=" text-white p-2 rounded-md my-4"
              >
                Sort Top 3 by Percentage
              </Button>
              <Button onClick={saveTop3} disabled={!isTop3Changed}>
                Save
              </Button>
            </>
          )}
        </div>
      </div>
      <div>
        {topperLists.top3 && topperLists.top3.length > 0 ? (
          topperLists.top3.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item, "top3", year)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item, "top3", year)}
              className="flex items-center p-2 border border-gray-300 mb-2 rounded-md cursor-move"
            >
              <RiDragMove2Line className="text-gray-500 mx-2 w-8 h-8" />
              <img
                src={item.image}
                alt={item.name}
                className="w-10 h-10 rounded-full mr-2"
              />
              <div className="flex justify-between w-full items-center">
                <div className="font-bold">{item.name}</div>
                <div className="flex items-center gap-x-5">
                  <div className="font-bold text-lg text-blue-600">
                    {item.percentage}%
                  </div>
                  <div>
                    <Trash
                      className="w-8 h-8 text-white bg-red-500 cursor-pointer p-1 rounded-full z-10"
                      onClick={() => handleDelete(item, "top3", year)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No top 3 toppers for this year.</p>
        )}
      </div>
      <div className="md:flex justify-between items-center my-4">
        <h3 className="text-xl font-semibold mt-4">Other Toppers</h3>
        <div className="flex gap-x-4 justify-center items-center">
          {topperLists.others && topperLists.others.length > 1 ? (
            <>
              <Button
                onClick={() => sortToppers(year, "others")}
                className=" text-white p-2 rounded-md my-4"
              >
                Sort Others by Percentage
              </Button>
              <Button onClick={saveOthers} disabled={!isOthersChanged}>
                Save
              </Button>
            </>
          ) : null}
        </div>
      </div>
      <div>
        {topperLists.others && topperLists.others.length > 0 ? (
          topperLists.others.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item, "others", year)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item, "others", year)}
              className="flex items-center p-2 border border-gray-300 mb-2 rounded-md cursor-move"
            >
              <RiDragMove2Line className="text-gray-500 mx-2 w-8 h-8" />
              <div className="flex justify-between w-full items-center">
                <div className="font-bold">{item.name}</div>
                <div className="flex items-center gap-x-5">
                  <div className="font-bold text-lg text-blue-600">
                    {item.percentage}%
                  </div>
                  <div>
                    <Trash
                      className="w-8 h-8 text-white bg-red-500 cursor-pointer p-1 rounded-full"
                      onClick={() => handleDelete(item, "others", year)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No other toppers for this year.</p>
        )}
      </div>
    </div>
  );
};

export default ToppersList;
