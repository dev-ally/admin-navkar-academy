"use client";

import ToppersList from "@/components/shared/ToppersList";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, Trash, TrashIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { RiArrowRightLine } from "react-icons/ri";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { database, storage } from "@/firebase/config";

import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import toast from "react-hot-toast";

const App = () => {
  const [topperLists, setTopperLists] = useState({});
  const [draggingItem, setDraggingItem] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [animation, setAnimation] = useState("");
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
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  const handleDelete = async (item, listType, year) => {
    try {
      const docRef = doc(database, "toppers", year);
      await updateDoc(docRef, {
        [listType]: arrayRemove(item),
      }).then(() => {
        toast.success("Topper deleted successfully!");
      });

      // Update the state after deletion
      setTopperLists((prev) => ({
        ...prev,
        [year]: {
          ...prev[year],
          [listType]: prev[year][listType].filter((i) => i.id !== item.id),
        },
      }));

      console.log("Item successfully deleted!");
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleSave = async () => {
    if (!selectedYear) return;

    try {
      const toppersRef = doc(database, "toppers", selectedYear);
      await setDoc(toppersRef, topperLists[selectedYear], { merge: true }).then(
        () => {
          console.log("Document successfully updated!");
          toast.success("Toppers updated successfully!");
        }
      );
    } catch (error) {
      console.error("Error saving document:", error);
    }

    setIsSaveEnabled(false);
  };

  useEffect(() => {
    const fetchToppersData = async () => {
      try {
        const querySnapshot = await getDocs(collection(database, "toppers"));
        const yearsData = querySnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});
        setTopperLists(yearsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchToppersData();
  }, []);

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

    // Swap the items
    [newList[currentIndex], newList[targetIndex]] = [
      newList[targetIndex],
      newList[currentIndex],
    ];

    // Update the index of all items in the new list
    newList.forEach((item, index) => (item.index = index + 1));

    setTopperLists((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [listType]: newList,
      },
    }));
    console.log(topperLists[year][listType]);

    setDraggingItem(null);
    setIsSaveEnabled(true);
  };

  const handleInputChange = (e, listType) => {
    const { name, value } = e.target;
    if (listType === "top3") {
      setNewTop3((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewOtherTopper((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addTopper = async (listType) => {
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

    // Upload the image to Firebase Storage
    const storageRef = ref(storage, `toppers/${newItem.name.toLowerCase()}`);

    const uploadTask = uploadBytesResumable(storageRef, newItem.image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        console.error(error);
      },
      async () => {
        // Get the download URL after the upload completes
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("File available at", downloadURL);

        // Update newItem with the download URL
        newItem.image = downloadURL;

        // Update the state with the new item
        setTopperLists((prev) => {
          const newTopperLists = {
            ...prev,
            [year]: {
              ...prev[year],
              [listType]: [...(prev[year]?.[listType] || []), newItem],
            },
          };

          // Ensure that new years are added at the top
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

        const toppersRef = doc(database, "toppers", year);
        await setDoc(toppersRef, {
          top3: [
            ...(topperLists[year]?.top3 || []),
            ...(listType === "top3" ? [newItem] : []),
          ],
          others: [
            ...(topperLists[year]?.others || []),
            ...(listType === "others" ? [newItem] : []),
          ],
        }).then(() => {
          toast.success("Topper added successfully!");
        });
        // Reset the form inputs after adding the topper
        if (listType === "top3" && selectedYear === year) {
          setNewTop3({ name: "", percentage: "", image: "", year: year });
        } else {
          setNewTop3({ name: "", percentage: "", image: "", year: "" });
        }
        if (listType === "others" && selectedYear === year) {
          setNewOtherTopper({ name: "", percentage: "", year: year });
        }
        if (listType === "others") {
          setNewOtherTopper({ name: "", percentage: "", year: "" });
        }
      }
    );
  };

  const sortToppers = (year, listType) => {
    if (!topperLists[year] || !topperLists[year][listType]) return;

    const sortedList = [...topperLists[year][listType]].sort(
      (a, b) => b.percentage - a.percentage
    );

    // Update the index of all items in the sorted list
    sortedList.forEach((item, index) => (item.index = index + 1));

    setTopperLists({
      ...topperLists,
      [year]: {
        ...topperLists[year],
        [listType]: sortedList,
      },
    });

    setIsSaveEnabled(true);

    console.log("Sorted ", topperLists[year][listType]);
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
            disabled={selectedYear !== null}
          />
          <input
            type="file"
            id="eventImage"
            accept="image/*"
            className="border border-gray-300 p-2 mb-2 w-full rounded-lg"
            onChange={(e) => {
              console.log(e.target.files[0]);
              setNewTop3((prev) => ({ ...prev, image: e.target.files[0] }));
            }}
          />
          <Button
            onClick={() => addTopper("top3")}
            className="bg-[#f27436] text-white p-2 rounded-md w-full hover:bg-[#f27436]/[0.9]"
          >
            Add Topper
          </Button>
        </div>
        <div className="bg-gray-100 p-4 rounded-md border-2">
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
            disabled={selectedYear !== null}
          />
          <Button
            onClick={() => addTopper("others")}
            className="bg-[#f27436] text-white p-2 rounded-md w-full hover:bg-[#f27436]/[0.9]"
          >
            Add Topper
          </Button>
        </div>
      </div>

      {/* Right Column: Toppers List */}
      <div className="w-1/2 bg-gray-100 rounded-lg">
        {selectedYear ? (
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => {
                setSelectedYear(null);
                setAnimation("slide-out");
                setNewTop3((prev) => ({ ...prev, year: "" }));
                setNewOtherTopper((prev) => ({ ...prev, year: "" }));
              }}
              variant="header"
              className="mb-4 flex items-center gap-2 border-2 border-black p-2 rounded-md text-black hover:bg-[#f27436]"
            >
              <ArrowLeft /> Back
            </Button>

            <ToppersList
              year={selectedYear}
              topperLists={topperLists[selectedYear]}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              sortToppers={sortToppers}
              animation={animation}
              handleSave={handleSave}
              isSaveEnabled={isSaveEnabled}
              handleDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold mb-4">
              {Object.keys(topperLists).length > 0
                ? "Select a Year"
                : "No Toppers Added Yet"}
            </h1>
            <div
              className={`flex flex-col gap-3 ${
                selectedYear !== null ? "border" : ""
              } p-4 rounded-md`}
            >
              {Object.keys(topperLists).map((year) => (
                <Button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setAnimation("slide-in");
                    setNewTop3((prev) => ({ ...prev, year }));
                    setNewOtherTopper((prev) => ({ ...prev, year }));
                  }}
                  variant="header"
                  className="p-4 bg-white border-2 border-black rounded-md hover:bg-[#f27436]/[0.9] hover:text-white"
                >
                  Year {year}
                  <RiArrowRightLine className="animate-pulse w-5 h-5" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
