"use client";

import addEventToDB from "@/actions/events/addEventToDB";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { storage } from "@/firebase/config";
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";
import { LoaderCircle, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const AddEvents = () => {
  const [eventData, setEventData] = useState({
    image: [],
    title: "",
    date: "",
    time: "",
    location: "",
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

    const downloadUrls = []; // Array to hold download URLs
    let loading = toast.loading("Uploading assets..."); // Initial loading toast

    if (
      eventData.image.length === 0 ||
      eventData.title === "" ||
      eventData.date === "" ||
      eventData.time === "" ||
      eventData.location === ""
    ) {
      toast.error("Please fill all the fields.", {
        id: loading,
      });
      setAddingEvent(false); // Reset addingEvent if there's an error
      return;
    }

    if (eventData.image.length > 10) {
      toast.error("Atmost 10 Images are allowed!", {
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
      setAddingEvent(false);
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

    const eventDateAndTime = `${eventData.date.split("-").join(":")}-${eventData.time
      }`;
    console.log("EVENT DATE AND TIME", eventDateAndTime);

    // const storageRef = ;

    // Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"
    setEventData({
      ...eventData,
      eventSlug:
        eventDateAndTime +
        "_" +
        eventData.title.toLowerCase().trim().replace(/[.\#$\[\]\/]/g, "").replace(/\s/g, "-"),
      createdAt,
    });

    // Upload each image and get the download URL
    for (let i = 0; i < eventData.image.length; i++) {
      const image = eventData.image[i];
      const uploadTask = uploadBytesResumable(ref(
        storage,
        `events/${eventDateAndTime}_${eventData.title
          .toLowerCase()
          .trim()
          .replace(/\s/g, "-")}_${i + 1}`
      ), image);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            toast.loading(`Uploading asset ${i + 1} of ${eventData.image.length}: ${Math.round(progress)}%`, {
              id: loading,
            }); // Update loading toast with progress
          },
          (error) => {
            // Handle unsuccessful uploads
            toast.error("Failed to upload image. Please try again.", {
              id: loading,
            });
            setAddingEvent(false); // Reset addingEvent if upload fails
            reject(error); // Reject the promise on error
          },
          async () => {
            // Handle successful uploads on complete
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            downloadUrls.push(downloadURL);
            resolve();
          }
        );
      });
    }

    toast.success("All assets uploaded successfully!", { id: loading }); // Success toast after all uploads

    // Add the event to the database once all download URLs are available
    const addDataToDb = await addEventToDB({
      ...eventData,
      downloadUrl: downloadUrls, // Use the array of download URLs
      eventSlug:
        eventDateAndTime +
        "_" +
        eventData.title.toLowerCase().trim().replace(/[.\#$\[\]\/]/g, "").replace(/\s/g, "-"),
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

    // Clear the form after adding the event
    setEventData({
      image: "",
      title: "",
      date: "",
      time: "", // Reset time after submission
      location: "",
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
              {Array.isArray(eventData.image) && eventData.image.length > 0 ? (
                <div className="min-h-[200px] rounded-md px-6 py-8 bg-emerald-400/40 w-full flex justify-center items-center flex-col">
                  <div className="grid grid-cols-3 justify-center gap-6">
                    {
                      eventData.image.map((image, index) => (
                        <div key={index} className="flex flex-col justify-between items-center gap-x-2 gap-y-4">
                          <Image
                            src={URL.createObjectURL(image)}
                            width={1000}
                            height={1000}
                            alt="Event Image"
                            className="w-full max-h-[200px] object-contain"
                          />
                          <button
                            className="w-fit px-4 py-2 border-2 border-black hover:bg-black/80 hover:text-white transition-all duration-300 ease-in-out rounded-full"
                            onClick={(e) => {
                              e.preventDefault();
                              // Remove the specific image by filtering out the clicked one
                              setEventData((prevData) => ({
                                ...prevData,
                                image: prevData.image.filter((_, i) => i !== index),
                              }));
                            }}
                          >
                            <Trash />
                          </button>
                        </div>
                      ))
                    }
                  </div>
                  <label htmlFor="eventImage" className="my-2 mt-8 border-2 border-black text-lg font-medium rounded-full px-4 py-2 hover:bg-black hover:text-white duration-200 transition-all ease-in-out cursor-pointer">Upload More</label>
                  <input type="file" id="eventImage" accept="image/*" className="hidden" multiple
                    onChange={(e) => {
                      console.log("E", e.target.files);
                      setEventData({ ...eventData, image: [...eventData.image, ...Array.from(e.target.files)] });
                    }}
                  />
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
                  </label>
                  <input
                    type="file"
                    id="eventImage"
                    accept="image/*"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      console.log(e.target.files);
                      setEventData({ ...eventData, image: Array.from(e.target.files) });
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

            {/* Date and Time Input */}
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
                    htmlFor="eventTime"
                    className="block text-lg font-semibold"
                  >
                    Time
                  </label>
                  <input
                    type="time"
                    id="eventTime"
                    className="w-full border-2 border-gray-300 rounded-md p-2"
                    value={eventData.time}
                    onChange={(e) =>
                      setEventData({ ...eventData, time: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Location Input */}
            <div>
              <label
                htmlFor="eventLocation"
                className="block text-lg font-semibold mt-6"
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

            {/* Description Input */}
            {/* <div>
              <label
                htmlFor="eventDescription"
                className="block text-lg font-semibold mt-6"
              >
                Description
              </label>
              <textarea
                id="eventDescription"
                placeholder="Enter event description"
                className="w-full border-2 border-gray-300 rounded-md p-2 h-[150px]"
                value={eventData.description}
                onChange={(e) =>
                  setEventData({ ...eventData, description: e.target.value })
                }
              />
            </div> */}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-8 p-3 bg-black text-white hover:bg-gray-800 transition-all duration-300 ease-in-out rounded-md"
              disabled={addingEvent}
            >
              {addingEvent ? (
                <div className="flex justify-center items-center gap-2">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Adding Event...
                </div>
              ) : (
                "Add Event"
              )}
            </Button>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default AddEvents;