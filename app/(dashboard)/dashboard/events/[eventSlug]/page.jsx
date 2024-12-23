"use client";

import deleteEventFromStorage from "@/actions/events/deleteEventFromStorage";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { db, storage } from "@/firebase/config";
import {
  onValue,
  ref as refDB,
  remove,
  runTransaction,
  set,
  update,
} from "firebase/database";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { Check, LoaderCircle, Plus, Trash } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const EventInfoPage = () => {
  const [eventData, setEventData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    downloadUrl: [],
    eventSlug: "",
    createdAt: "",
  });
  const [updateImages, setUpdateImages] = useState([]);
  const [updateEvent, setUpdateEvent] = useState(false);
  const [updatingEvent, setUpdatingEvent] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(false);

  const { eventSlug } = useParams();
  const router = useRouter();

  useEffect(() => {
    const eventsRef = refDB(db, `events/${decodeURIComponent(eventSlug)}`);

    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      // console.log("DATA", data);
      if (data) {
        setEventData({
          title: data.title || "",
          date: data.date || "",
          time: data.time || "",
          location: data.location || "",
          downloadUrl: data.downloadUrl,
          eventSlug: data.eventSlug || "",
          createdAt: data.createdAt || "",
        });
        setFetchedData(data);
        // console.log("DATA", data);
      } else {
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
        eventData.title.trim() !== fetchedData.title ||
        eventData.date !== fetchedData.date ||
        eventData.time !== fetchedData.time || // Check for time updates
        eventData.location.trim() !== fetchedData.location
      ) {
        setUpdateEvent(true);
      } else {
        setUpdateEvent(false);
      }
    }
  }, [
    eventData.title,
    eventData.date,
    eventData.time,
    eventData.location,
    fetchedData,
  ]);

  const updateEventHandler = async (e) => {
    e.preventDefault();

    // Set updatingEvent to true at the beginning of the process
    setUpdatingEvent(true);

    let loading = toast.loading("Updating event...");

    if (updateImages.length === 0) {
      toast.error("Please upload images to update.", {
        id: loading,
      });
      setUpdatingEvent(false); // Reset updatingEvent if there's an error
      return;
    }

    // Get all existing numbers from the download URLs
    const existingNumbers =
      eventData?.downloadUrl.map((url) => {
        const parts = url.split(" ");
        return parseInt(parts[1].split("_")[2]); // Extract the number
      }) || [];

    // Find the next available number in sequence
    let nextNumUploaded =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

    const uploadPromises = updateImages.map(async (image, index) => {
      // Use nextNumUploaded instead of maxNumUploaded
      const storageRef = ref(
        storage,
        `events/${decodeURIComponent(eventSlug)}_${nextNumUploaded + index}_${
          image.type.split("/")[1]
        }`
      );

      try {
        await uploadBytes(storageRef, image);
        const downloadURL = await getDownloadURL(storageRef);
        const eventRef = refDB(
          db,
          "/events/" + decodeURIComponent(eventSlug) + "/downloadUrl"
        );

        await runTransaction(eventRef, (event) => {
          if (event) {
            event.push(
              `${downloadURL} ${eventData?.eventSlug}_${
                nextNumUploaded + index
              }_${image.type.split("/")[1]}`
            );
          }
          return event;
        });
      } catch (error) {
        console.error("Error uploading image: ", error);
        throw new Error("Failed to upload image. Please try again later.");
      }
    });

    try {
      await Promise.all(uploadPromises);
      toast.success("Event updated successfully!", {
        id: loading,
      });
    } catch (error) {
      toast.error(error.message, {
        id: loading,
      });
    } finally {
      setUpdatingEvent(false); // Reset updatingEvent after completion
      setUpdateImages([]);
    }
  };

  const deleteEventHandler = async (e) => {
    e.preventDefault();

    let deleteConfirm = confirm("Are you sure you want to delete this event?");

    if (!deleteConfirm) return;

    // Set deletingEvent to true at the beginning of the process
    setDeletingEvent(true);

    let loading = toast.loading("Deleting event...");

    eventData?.downloadUrl?.map(async (image) => {
      let fileName = image.split(" ")[1];
      const deleteFromStorage = await deleteEventFromStorage(fileName);

      if (!deleteFromStorage) {
        toast.error(
          "Failed to delete event from database. Please try again later.",
          {
            id: loading,
          }
        );
        setDeletingEvent(false); // Reset deletingEvent if there's an error
        return;
      }
    });

    // Define the reference to the event in the database
    const eventRef = refDB(db, `events/${eventData?.eventSlug}`);

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

  const deleteUploadedImage = async (e, image) => {
    e.preventDefault();
    // console.log("IMAGE", image);
    let type = image.split(" ")[1].split("_")[3];
    const deleting = toast.loading(`Deleting ${type}...`);
    if (eventData?.downloadUrl.length <= 1) {
      toast.error(`Cannot delete last ${type}`, {
        id: deleting,
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      toast.error("Image deletion cancelled", {
        id: deleting,
      });
      return;
    }

    // File Url - https://firebasestorage.googleapis.com/v0/b/navkar-academy.appspot.com/o/events%2F2025%3A02%3A20-08%3A00_again-demo-here..._1?alt=media&token=4afca00d-40bf-4a38-ad07-a4454485f851
    // File Name frrom the url - 2025:02:20-08:00_again-demo-here..._1
    // Get the file name frrom the url and store it

    // events%2F2025%3A02%3A20-10%3A00_demo-testing-event-multiple_1?alt=media&token=0aec37ff-2461-4a3e-b424-9be4f9afbb2
    // events%2F2025%3A02%3A20-10%3A00_demo-testing-event-multiple_3
    const imageStorageName = decodeURIComponent(image)
      .split("/")
      .pop()
      .split("?")[0];
    // console.log("IMAGESTORAGENAME", imageStorageName);
    const storageRef = ref(storage, "events/" + imageStorageName);

    await deleteObject(storageRef);

    const eventRef = refDB(
      db,
      "/events/" + decodeURIComponent(eventSlug) + "/downloadUrl"
    );

    await runTransaction(eventRef, (event) => {
      if (event) {
        // event.push(downloadURL);
        // console.log("EVENT", event);

        // get the index of the image to be deleted
        const index = event.findIndex((url) => url === image);
        // console.log("INDEX", index);

        // remove the image from the array
        event.splice(index, 1);
        // console.log("EVENT", event);
      }
      return event;
    });

    toast.success(`${type} deleted successfully!`, {
      id: deleting,
    });
  };

  return (
    <Container>
      <div className="flex justify-center items-center w-full py-6">
        <div className="w-full md:w-[80%] lg:w-[60%]">
          <h2 className="text-3xl font-bold mb-6">Event Information</h2>
          <form>
            {/* Image Input */}
            <div className="flex flex-col gap-2 mb-4">
              <span>Saved Images: {eventData.downloadUrl.length}</span>
              <span>Uploaded Images: {updateImages.length}</span>
              <span>
                Total Images:{" "}
                {eventData.downloadUrl.length + updateImages.length} / 10
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 justify-center items-center w-full">
              {eventData?.downloadUrl.map((image, index) => (
                <div key={index} className="relative">
                  <Button
                    className="absolute top-[10px] right-[10px] p-2 rounded-full bg-accent text-white text-lg z-50"
                    onClick={(e) => deleteUploadedImage(e, image)}
                  >
                    <Trash />
                  </Button>
                  <div className="absolute top-2 left-2 text-emerald-600 bg-white border-2 border-white rounded-full">
                    <Check />
                  </div>
                  {image.split(" ")[1].split("_")[3] == "mp4" ? (
                    <video
                      src={image}
                      alt="Event Video"
                      className="w-full max-h-[300px] object-contain"
                      controls
                    />
                  ) : (
                    <Image
                      src={image}
                      alt="Event Image"
                      width={1000}
                      height={1000}
                      className="w-full max-h-[300px] object-contain"
                    />
                  )}
                </div>
              ))}
              {Array.isArray(updateImages) &&
                updateImages.length > 0 &&
                updateImages.map((image, index) => (
                  <div key={index} className="relative">
                    <Button
                      className="absolute top-[10px] right-[10px] p-2 rounded-full bg-accent text-white text-lg z-50"
                      onClick={(e) => {
                        e.preventDefault();
                        setUpdateImages(
                          updateImages.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <Trash />
                    </Button>
                    {image.type === "video/mp4" ? (
                      <video
                        src={URL.createObjectURL(image)}
                        alt="Event Video"
                        className="w-full max-h-[300px] object-contain"
                        controls
                      />
                    ) : (
                      <Image
                        src={URL.createObjectURL(image)}
                        alt="Event Image"
                        width={1000}
                        height={1000}
                        className="w-full max-h-[300px] object-contain"
                      />
                    )}
                  </div>
                ))}
              {eventData.downloadUrl.length + updateImages.length < 10 && (
                <div className="w-full h-full flex justify-center items-center">
                  <label
                    htmlFor="updateEventImage"
                    className="text-xl font-semibold text-black border-2 border-accent rounded-md flex justify-center items-center gap-2 cursor-pointer p-4 flex-col"
                  >
                    <Plus />
                    <span>Add More Images</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    id="updateEventImage"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      setUpdateImages([...updateImages, ...e.target.files])
                    }
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
                className="w-full border-2 border-gray-300 rounded-md p-2 disabled:bg-black/10"
                value={eventData.title}
                disabled
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
                    className="w-full border-2 border-gray-300 rounded-md p-2 disabled:bg-black/10"
                    value={eventData.date}
                    disabled
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
                    className="w-full border-2 border-gray-300 rounded-md p-2 disabled:bg-black/10"
                    value={eventData.time}
                    disabled
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
                className="w-full border-2 border-gray-300 rounded-md p-2 disabled:bg-black/10"
                value={eventData.location}
                disabled
              />
            </div>

            {/* Submit Button */}
            {updateImages.length > 0 && (
              <div className="flex justify-center items-center mt-6">
                <Button
                  type="submit"
                  onClick={updateEventHandler}
                  disabled={
                    updateImages.length === 0 ||
                    eventData.downloadUrl.length + updateImages.length > 10
                  } // Disable button while adding event
                  className={`w-full bg-accent text-white font-semibold hover:bg-orange-500/90 duration-300 ease-in-out rounded-md p-2 mt-6 ${
                    updatingEvent &&
                    "bg-orange-500/50 text-white cursor-not-allowed"
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

            <div
              className={`flex justify-center items-center ${
                updateEvent ? "mt-1" : "mt-6"
              }`}
            >
              <Button
                onClick={deleteEventHandler}
                disabled={deletingEvent}
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
