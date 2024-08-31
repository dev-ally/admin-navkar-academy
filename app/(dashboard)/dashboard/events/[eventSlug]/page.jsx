"use client";

import deleteEventFromStorage from "@/actions/events/deleteEventFromStorage";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase/config";
import { onValue, ref, remove, update } from "firebase/database";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const EventInfoPage = () => {
  const [eventData, setEventData] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    downloadUrl: "",
    eventSlug: "",
    createdAt: "",
  });
  // const [updateEvent, setAddingEvent] = useState(false);
  const [updateEvent, setUpdateEvent] = useState(false);
  const [updatingEvent, setUpdatingEvent] = useState(false);
  const [dataFound, setDataFound] = useState(null);
  const [fetchedData, setFetchedData] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(false);

  const { eventSlug } = useParams();

  const router = useRouter();

  useEffect(() => {
    const eventsRef = ref(db, `events/${decodeURIComponent(eventSlug)}`);

    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      console.log("DATA", data);
      if (data) {
        setEventData({
          title: data.title || "",
          date: data.date || "",
          location: data.location || "",
          description: data.description || "",
          downloadUrl: data.downloadUrl || "",
          eventSlug: data.eventSlug || "",
          createdAt: data.createdAt || "",
        });
        setFetchedData(data);
        console.log("DATA", data);
        setDataFound(true);
      } else {
        setDataFound(false);
        router.push("/dashboard/events");
      }
    });

    // Clean up the subscription on component unmount
    return () => unsubscribe();
  }, [eventSlug, router]);

  // Check if any of the input is updated, if yes, enable the update button
  useEffect(() => {
    if (fetchedData) {
      if (
        eventData.title !== fetchedData.title ||
        eventData.date !== fetchedData.date ||
        eventData.location !== fetchedData.location ||
        eventData.description !== fetchedData.description
      ) {
        setUpdateEvent(true);
      } else {
        setUpdateEvent(false);
      }
    }
  }, [
    eventData.title,
    eventData.date,
    eventData.location,
    eventData.description,
    fetchedData,
  ]);

  const updateEventHandler = async (e) => {
    e.preventDefault();

    // Set updatingEvent to true at the beginning of the process
    setUpdatingEvent(true);

    let loading = toast.loading("Updating event...");

    if (
      eventData.title === "" ||
      eventData.date === "" ||
      eventData.location === "" ||
      eventData.description === ""
    ) {
      toast.error("Please fill all the fields.", {
        id: loading,
      });
      setUpdatingEvent(false); // Reset updatingEvent if there's an error
      return;
    }

    if (eventData.title.split(" ").length > 8) {
      toast.error("Please enter a title with less than 8 words.", {
        id: loading,
      });
      setUpdatingEvent(false); // Reset updatingEvent if there's an error
      return;
    }

    if (eventData.date < new Date().toISOString().split("T")[0]) {
      toast.error("Please select a valid date.", {
        id: loading,
      });
      setUpdatingEvent(false); // Reset updatingEvent if there's an error
      return;
    }

    // Define the reference to the event in the database
    const eventRef = ref(db, `events/${eventData.eventSlug}`);

    // Update the event in the database
    try {
      await update(eventRef, {
        title: eventData.title,
        date: eventData.date,
        location: eventData.location,
        description: eventData.description,
      });

      toast.success("Event updated successfully!", {
        id: loading,
      });
    } catch (error) {
      console.error("Error updating event: ", error);
      toast.error("Failed to update event. Please try again later.", {
        id: loading,
      });
    } finally {
      // Reset updatingEvent after completion
      setUpdatingEvent(false);
    }
  };

  const deleteEventHandler = async (e) => {
    e.preventDefault();

    // Set deletingEvent to true at the beginning of the process
    setDeletingEvent(true);

    let loading = toast.loading("Deleting event...");

    const deleteFromStorage = await deleteEventFromStorage(eventData.eventSlug);

    if (!deleteFromStorage) {
      toast.error(
        "Failed to delete event. from database Please try again later.",
        {
          id: loading,
        }
      );
      setDeletingEvent(false); // Reset deletingEvent if there's an error
      return;
    }

    // Define the reference to the event in the database
    const eventRef = ref(db, `events/${decodeURIComponent(eventSlug)}`);

    // Delete the event in the database
    try {
      await remove(eventRef);

      toast.success("Event deleted successfully!", {
        id: loading,
      });

      router.push("/dashboard/events");
    } catch (error) {
      console.error("Error deleting event: ", error);
      toast.error("Failed to delete event. Please try again later.", {
        id: loading,
      });
    } finally {
      // Reset deletingEvent after completion
      setDeletingEvent(false);
    }
  };

  return (
    <Container>
      <div className="flex justify-center items-center w-full py-6">
        <div className="w-full md:w-[80%] lg:w-[60%]">
          <h2 className="text-3xl font-bold mb-6">Event Information.</h2>
          <form onSubmit={updateEventHandler}>
            {/* Image Input */}
            <div className="flex justify-center items-center w-full">
              {eventData?.downloadUrl && (
                <div className="min-h-[200px] rounded-md w-full flex justify-center items-center flex-col cursor-pointer">
                  <Image
                    src={eventData.downloadUrl}
                    width={1000}
                    height={1000}
                    alt="Event Image"
                    className="w-full max-h-[240px] object-contain"
                  />
                </div>
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
            {updateEvent && (
              <div className="flex justify-center items-center mt-6">
                <Button
                  type="submit"
                  disabled={updatingEvent} // Disable button while adding event
                  className={`w-full bg-accent text-white font-semibold hover:bg-orange-500/90 duration-300 ease-in-out rounded-md p-2 mt-6 ${
                    updatingEvent
                      ? "bg-orange-500/50 text-white cursor-not-allowed"
                      : ""
                  }`}
                >
                  {updatingEvent ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    "Update Event"
                  )}
                </Button>
              </div>
            )}

            <div className="flex justify-center items-center mt-6">
              <Button
                onClick={deleteEventHandler}
                disabled={deletingEvent} // Disable button while adding event
                className={`w-full bg-red-500 text-white font-semibold hover:bg-red-500/90 duration-300 ease-in-out rounded-md p-2 mt-6 ${
                  deletingEvent
                    ? "opacity-50 text-white cursor-not-allowed"
                    : ""
                }`}
              >
                {deletingEvent ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Delete Event"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default EventInfoPage;
