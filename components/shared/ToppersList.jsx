import React from "react";
import { Button } from "../ui/button";
import { RiDragMove2Line } from "react-icons/ri";

const ToppersList = ({
  topperLists,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  sortToppers,
  year,
}) => {
  if (!topperLists) return null;

  return (
    <div className="bg-white p-4 rounded-md ">
      <h2 className="text-2xl font-bold mb-2 text-gray-700">
        {year} Toppers List
      </h2>

      <div className="flex justify-between items-center ">
        <h3 className="text-xl font-semibold mt-4">Top 3 Toppers</h3>
        <Button
          onClick={() => sortToppers(year, "top3")}
          className=" text-white p-2 rounded-md my-4"
        >
          Sort Top 3 by Percentage
        </Button>
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
              //   className="p-2 border-b"
              className="flex items-center p-2 border border-gray-300 mb-2 rounded-md cursor-move"
            >
              <RiDragMove2Line className="text-gray-500 ml-2" />
              <img
                src={item.image}
                alt={item.name}
                className="w-10 h-10 rounded-full mr-2"
              />
              <div className="flex justify-between w-full">
                <div className="font-bold">{item.name}</div>
                <div className="font-bold text-lg text-blue-600">
                  {item.percentage}%
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No top 3 toppers for this year.</p>
        )}
      </div>
      <div className="flex justify-between items-center mt-4">
        <h3 className="text-xl font-semibold mt-4">Other Toppers</h3>
        <Button
          onClick={() => sortToppers(year, "others")}
          className=" text-white p-2 rounded-md mt-4 ml-2"
        >
          Sort Others by Percentage
        </Button>
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
              className="p-2 border-b"
            >
              {item.name} - {item.percentage}%
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
