"use client";

import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";

const AddEvents = () => {
  // Input to be taken for event: Title, Description, Date, Image, Location
  const [eventData, setEventData] = useState({
    image: "",
    title: "",
    date: "",
    location: "",
    description: "",
  });

  const addEventHandler = async (e) => {
    e.preventDefault();
    console.log(eventData);
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
      return;
    }

    if (eventData.image.height > eventData.image.width) {
      toast.error("Please upload a landscape image.", {
        id: loading,
      });
      return;
    }

    if (eventData.image.size > 5000000) {
      toast.error("Please upload an image smaller than 5MB.", {
        id: loading,
      });
      return;
    }

    if (eventData.title.split(" ").length > 8) {
      toast.error("Please enter a title with less than 8 words.", {
        id: loading,
      });
      return;
    }

    if (eventData.date < new Date().toISOString().split("T")[0]) {
      toast.error("Please select a valid date.", {
        id: loading,
      });
      return;
    }

    // Add event to database
  };

  return (
    <Container>
      <div className="flex justify-center items-center w-full py-6">
        <div className="w-full md:w-[80%] lg:w-[60%]">
          <h2 className="text-3xl font-bold mb-6">Add Event.</h2>
          <form onSubmit={addEventHandler}>
            <div className="flex justify-center items-center w-full">
              {/* Image Input */}
              {eventData.image ? (
                <div className="min-h-[200px] rounded-md px-6 py-8 bg-emerald-400/40 w-full flex justify-center items-center flex-col cursor-pointer">
                  {/* Display the image [review here] */}
                  <Image
                    src={URL.createObjectURL(eventData.image)}
                    width={1000}
                    height={1000}
                    alt="Event Image"
                    className="w-full max-h-[200px] object-contain"
                  />
                  {/* <img src={eventData?.image} alt="Event Image" /> */}
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
                    className="w-full border-2 rounded-md border-orange-400/80 bg-orange-400/20 flex flex-col gap-3 justify-center items-center px-10 h-[200px] cursor-pointer"
                  >
                    <span className="text-xl font-bold">Upload Image</span>
                    <span className="text-sm text-black/50 font-semibold">
                      Click here to upload image!
                    </span>
                    <span className="text-sm text-black/50 font-semibold">
                      (1000 x 700)
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
            <div>
              {/* Title Input */}
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
                onChange={(e) =>
                  setEventData({ ...eventData, title: e.target.value })
                }
              />
            </div>
            <div>
              {/* Date and Location Input */}
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
                    onChange={(e) =>
                      setEventData({ ...eventData, location: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div>
              {/* Description Input */}
              <label
                htmlFor="eventDescription"
                className="block text-lg font-semibold mt-6"
              >
                Description
              </label>
              <textarea
                id="eventDescription"
                placeholder="Enter event description"
                className="w-full border-2 border-gray-300 rounded-md p-2 resize-none"
                rows={4}
                onChange={(e) =>
                  setEventData({ ...eventData, description: e.target.value })
                }
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-accent text-white font-semibold hover:bg-orange-500/90 duration-300 ease-in-out rounded-md p-2 mt-6"
            >
              Add Event
            </Button>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default AddEvents;
