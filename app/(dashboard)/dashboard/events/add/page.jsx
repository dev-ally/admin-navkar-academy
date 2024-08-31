"use client";

import addEventToDB from "@/actions/events/addEventToDB";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { storage } from "@/firebase/config";
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const AddEvents = () => {
  const [eventData, setEventData] = useState({
    image: "",
    title: "",
    date: "",
    location: "",
    description: "",
    downloadUrl: "",
    eventSlug: "",
    createdAt: "",
  });
  const [addingEvent, setAddingEvent] = useState(false);

  const router = useRouter();

  const addEventHandler = async (e) => {
    e.preventDefault();
    console.log(eventData);

    // Set addingEvent to true at the beginning of the process
    setAddingEvent(true);

    let loading = toast.loading("Adding event...");

    if (
      eventData.image === "" ||
      eventData.title === "" ||
      eventData.date === "" ||
      eventData.location === "" ||
      eventData.description === ""
    ) {
      toast.error("Please fill all the fields.", {
        id: loading,
      });
      setAddingEvent(false); // Reset addingEvent if there's an error
      return;
    }

    if (eventData.image.size > 5000000) {
      toast.error("Please upload an image smaller than 5MB.", {
        id: loading,
      });
      setAddingEvent(false); // Reset addingEvent if there's an error
      return;
    }

    if (eventData.title.split(" ").length > 8) {
      toast.error("Please enter a title with less than 8 words.", {
        id: loading,
      });
      setAddingEvent(false); // Reset addingEvent if there's an error
      return;
    }

    if (eventData.date < new Date().toISOString().split("T")[0]) {
      toast.error("Please select a valid date.", {
        id: loading,
      });
      setAddingEvent(false); // Reset addingEvent if there's an error
      return;
    }

    // Generate createdAt timestamp
    const today = new Date();
    const createdAt = `${today.getFullYear()}:${String(
      today.getMonth() + 1
    ).padStart(2, "0")}:${String(today.getDate()).padStart(2, "0")}-${String(
      today.getHours()
    ).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}:${String(
      today.getSeconds()
    ).padStart(2, "0")}`;

    const storageRef = ref(
      storage,
      `events/${eventData.title
        .toLowerCase()
        .trim()
        .replace(/\s/g, "-")}_${createdAt}`
    );

    setEventData({
      ...eventData,
      eventSlug:
        eventData.title.toLowerCase().trim().replace(/\s/g, "-") +
        "_" +
        createdAt,
      createdAt,
    });

    const uploadTask = uploadBytesResumable(storageRef, eventData.image);

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
        // Handle unsuccessful uploads
        toast.error("Failed to upload image. Please try again.", {
          id: loading,
        });
        setAddingEvent(false); // Reset addingEvent if upload fails
      },
      async () => {
        // Handle successful uploads on complete
        await getDownloadURL(uploadTask.snapshot.ref).then(
          async (downloadURL) => {
            console.log("File available at", downloadURL);
            setEventData((prevData) => ({
              ...prevData,
              downloadUrl: downloadURL,
            }));

            // Add the event to the database once the download URL is available
            const addDataToDb = await addEventToDB({
              ...eventData,
              downloadUrl: downloadURL,
              eventSlug:
                eventData.title.toLowerCase().trim().replace(/\s/g, "-") +
                "_" +
                createdAt,
              createdAt,
            });

            console.log("ADD DATA TO DB", addDataToDb);

            if (addDataToDb) {
              toast.success("Event added successfully!", {
                id: loading,
              });

              router.push("/dashboard/events"); // Redirect to events page after successful addition
            } else {
              toast.error("Failed to add event. Please try again later.", {
                id: loading,
              });
            }

            setAddingEvent(false); // Reset addingEvent after successful addition
          }
        );
      }
    );

    // Clear the form after adding the event
    setEventData({
      image: "",
      title: "",
      date: "",
      location: "",
      description: "",
      downloadUrl: "",
      eventSlug: "",
      createdAt: "",
    });
  };

  return (
    <Container>
      <div className="flex justify-center items-center w-full py-6">
        <div className="w-full md:w-[80%] lg:w-[60%]">
          <h2 className="text-3xl font-bold mb-6">Add Event.</h2>
          <form onSubmit={addEventHandler}>
            {/* Image Input */}
            <div className="flex justify-center items-center w-full">
              {eventData.image ? (
                <div className="min-h-[200px] rounded-md px-6 py-8 bg-emerald-400/40 w-full flex justify-center items-center flex-col cursor-pointer">
                  <Image
                    src={URL.createObjectURL(eventData.image)}
                    width={1000}
                    height={1000}
                    alt="Event Image"
                    className="w-full max-h-[200px] object-contain"
                  />
                  <span className="text-xl font-bold my-4">
                    Image Uploaded Successfully
                  </span>
                  <button
                    className="px-4 py-2 border-2 border-black hover:bg-black/80 hover:text-white transition-all duration-300 ease-in-out rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      setEventData({ ...eventData, image: "" });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <label
                    htmlFor="eventImage"
                    className="w-full border-2 rounded-md border-orange-400/80 bg-orange-400/20 flex flex-col gap-2 justify-center items-center px-10 h-[200px] cursor-pointer"
                  >
                    <span className="text-xl font-bold">Upload Image</span>
                    <span className="text-sm text-black/50 font-semibold">
                      Click here to upload image!
                    </span>
                    <span className="text-sm text-black/50 font-semibold">
                      Landscape Orientation (1000 x 700)
                    </span>
                  </label>
                  <input
                    type="file"
                    id="eventImage"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      console.log(e.target.files[0]);
                      setEventData({ ...eventData, image: e.target.files[0] });
                    }}
                  />
                </>
              )}
            </div>

            {/* Title Input */}
            <div>
              <label
                htmlFor="eventTitle"
                className="block text-lg font-semibold mt-6"
              >
                Title
              </label>
              <input
                type="text"
                id="eventTitle"
                placeholder="Enter event title"
                className="w-full border-2 border-gray-300 rounded-md p-2"
                value={eventData.title}
                onChange={(e) =>
                  setEventData({ ...eventData, title: e.target.value })
                }
              />
            </div>

            {/* Date and Location Input */}
            <div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <label
                    htmlFor="eventDate"
                    className="block text-lg font-semibold"
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border-2 border-gray-300 rounded-md p-2"
                    value={eventData.date}
                    onChange={(e) =>
                      setEventData({ ...eventData, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="eventLocation"
                    className="block text-lg font-semibold"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="eventLocation"
                    placeholder="Enter event location"
                    className="w-full border-2 border-gray-300 rounded-md p-2"
                    value={eventData.location}
                    onChange={(e) =>
                      setEventData({ ...eventData, location: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label
                htmlFor="eventDescription"
                className="block text-lg font-semibold mt-6"
              >
                Description
              </label>
              <textarea
                id="eventDescription"
                placeholder="Enter event description"
                className="w-full border-2 border-gray-300 rounded-md p-2"
                rows="4"
                value={eventData.description}
                onChange={(e) =>
                  setEventData({ ...eventData, description: e.target.value })
                }
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center items-center mt-6">
              <Button
                type="submit"
                disabled={addingEvent} // Disable button while adding event
                className={`w-full bg-accent text-white font-semibold hover:bg-orange-500/90 duration-300 ease-in-out rounded-md p-2 mt-6 ${
                  addingEvent
                    ? "bg-orange-500/50 text-white cursor-not-allowed"
                    : ""
                }`}
              >
                {addingEvent ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Add Event"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default AddEvents;
