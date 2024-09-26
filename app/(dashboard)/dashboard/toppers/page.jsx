"use client";

import ToppersList from "@/components/shared/ToppersList";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, Trash, TrashIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
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
import Dialog from "@/components/shared/Dialog";

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

  const [isTop3Changed, setIsTop3Changed] = useState(false);
  const [isOthersChanged, setIsOthersChanged] = useState(false);
  const fileInputRef = useRef(null);
  const handleDelete = async (item, listType, year) => {
    try {
      const docRef = doc(database, "toppers", year);

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentList = docSnap.data()[listType] || [];

        const updatedList = currentList.filter((i) => i.id !== item.id);

        // Re-index the remaining toppers
        const reIndexedList = updatedList.map((topper, index) => ({
          ...topper,
          index: index + 1,
        }));

        // Update Firestore with the re-indexed list
        await updateDoc(docRef, {
          [listType]: reIndexedList,
        });

        // Update the state with the re-indexed list
        setTopperLists((prev) => ({
          ...prev,
          [year]: {
            ...prev[year],
            [listType]: reIndexedList,
          },
        }));

        toast.success("Topper deleted successfully!");
        console.log("Item successfully deleted!");
      } else {
        console.error("No such document exists!");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const deleteYear = async (year) => {
    try {
      const docRef = doc(database, "toppers", year);
      await deleteDoc(docRef);

      const updatedList = { ...topperLists };
      delete updatedList[year];
      setTopperLists(updatedList);
      toast.success("Year deleted successfully!");
    } catch (error) {
      console.error("Error deleting year:", error);
    }
  };
  // Function to save the updated top3 list to Firestore
  const saveTop3 = async () => {
    if (!selectedYear || !topperLists[selectedYear]?.top3) return;

    try {
      const toppersRef = doc(database, "toppers", selectedYear);

      await setDoc(
        toppersRef,
        {
          top3: topperLists[selectedYear].top3,
        },
        { merge: true }
      );

      setIsTop3Changed(false);
      console.log("Top 3 list updated successfully!");
      toast.success("Top 3 list updated successfully!");
    } catch (error) {
      console.error("Error updating Top 3 list:", error);
      toast.error("Failed to update Top 3 list.");
      X;
    }
  };

  const saveOthers = async () => {
    if (!selectedYear || !topperLists[selectedYear]?.others) return;

    try {
      const toppersRef = doc(database, "toppers", selectedYear);

      await setDoc(
        toppersRef,
        {
          others: topperLists[selectedYear].others,
        },
        { merge: true }
      );
      setIsOthersChanged(false);
      console.log("Others list updated successfully!");
      toast.success("Others list updated successfully!");
    } catch (error) {
      console.error("Error updating Others list:", error);
      toast.error("Failed to update Others list.");
    }
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
        console.log("Fetched data:", yearsData);
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
    console.log(topperLists[year][listType]);

    setDraggingItem(null);
    // setIsSaveEnabled(true);
    if (listType === "top3") {
      setIsTop3Changed(true);
    } else {
      setIsOthersChanged(true);
    }
  };

  const handleInputChange = (e, listType) => {
    const { name, value } = e.target;
    if (listType === "top3") {
      setNewTop3((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewOtherTopper((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isValidYear = (year) => {
    const yearRegex = /^[0-9]{4}$/;
    return yearRegex.test(year) && Number(year) >= 2000;
  };

  const addTopper = async (listType) => {
    const isYearValid = (year) => isValidYear(year);

    if (
      !selectedYear &&
      !isYearValid(listType === "top3" ? newTop3.year : newOtherTopper.year)
    ) {
      return toast.error(
        "Please enter a 4 digit year greater than or equal to 2000"
      );
    }

    const isFormIncomplete = (form) =>
      Object.values(form).some((value) => value === "");

    if (listType === "top3" && isFormIncomplete(newTop3)) {
      return toast.error(
        "Please fill all the fields in the top 3 toppers form"
      );
    }

    if (listType === "others" && isFormIncomplete(newOtherTopper)) {
      return toast.error("Please fill all the fields in other toppers form");
    }

    if (listType === "top3" && !newTop3.image) {
      return toast.error("Please upload an image for the topper!");
    }

    if (
      listType === "top3" &&
      (topperLists[newTop3.year]?.top3?.length || 0) >= 3
    ) {
      return toast.error("Only 3 toppers can be added in the top 3 list");
    }

    const newItem = { ...(listType === "top3" ? newTop3 : newOtherTopper) };
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

    const loading = toast.loading("Adding topper...", { id: 1 });

    const updateStateAndDatabase = async (imageURL) => {
      if (imageURL) newItem.image = imageURL;

      setTopperLists((prev) => {
        const updatedLists = {
          ...prev,
          [year]: {
            ...prev[year],
            [listType]: [...(prev[year]?.[listType] || []), newItem],
          },
        };

        return {
          [year]: updatedLists[year],
          ...Object.keys(prev)
            .filter((key) => key !== year)
            .reduce((acc, key) => {
              acc[key] = prev[key];
              return acc;
            }, {}),
        };
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
        toast.success("Topper added successfully!", { id: loading });
      });

      if (listType === "top3") {
        setNewTop3({
          name: "",
          percentage: "",
          image: "",
          year: selectedYear ? year : "",
        });

        if (fileInputRef.current) fileInputRef.current.value = "";
      }

      if (listType === "others") {
        setNewOtherTopper({
          name: "",
          percentage: "",
          year: selectedYear ? year : "",
        });
      }
    };

    if (listType === "top3") {
      const storageRef = ref(storage, `toppers/${newItem.name.toLowerCase()}`);
      const uploadTask = uploadBytesResumable(storageRef, newItem.image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);
          await updateStateAndDatabase(downloadURL);
        }
      );
    } else {
      await updateStateAndDatabase();
    }
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

    if (listType === "top3") {
      setIsTop3Changed(true);
    } else {
      setIsOthersChanged(true);
    }
    console.log("Sorted ", topperLists[year][listType]);
  };

  return (
    <div className="h-screen p-10 md:flex gap-4">
      <div className="md:w-1/2 w-full">
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
            placeholder="Year (YYYY)"
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
            ref={fileInputRef} // Attach the ref here
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
            placeholder="Year (YYYY)"
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
      <div className="w-full md:w-1/2 bg-gray-100 rounded-lg">
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
              // handleSave={handleSave}
              saveTop3={saveTop3}
              saveOthers={saveOthers}
              // isSaveEnabled={isSaveEnabled}
              isTop3Changed={isTop3Changed}
              isOthersChanged={isOthersChanged}
              handleDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold p-4">
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
                <div className="   rounded-md  hover:text-white flex items-center gap-2  ">
                  <Button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      setAnimation("slide-in");
                      setNewTop3((prev) => ({ ...prev, year }));
                      setNewOtherTopper((prev) => ({ ...prev, year }));
                    }}
                    variant="header"
                    className="w-11/12 hover:bg-[#f27436]/[0.9]"
                  >
                    Year {year}
                    <RiArrowRightLine className="animate-pulse w-5 h-5" />
                  </Button>
                  <Dialog handleDelete={deleteYear} year={year} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
