"use client";

import deleteEventFromStorage from "@/actions/events/deleteEventFromStorage";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { db, storage } from "@/firebase/config";
import Autoplay from "embla-carousel-autoplay";
import { child, get, onValue, ref as refDB, remove, runTransaction, set, update } from "firebase/database";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
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
      console.log("DATA", data);
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
        console.log("DATA", data);
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

    // [
    // "https://firebasestorage.googleapis.com/v0/b/navkar-academy.appspot.com/o/events%2F2025%3A02%3A20-20%3A00_new-testing-event_12?alt=media&token=c413dad1-70e3-4e2a-bbb2-57487aaefcba",
    // "https://firebasestorage.googleapis.com/v0/b/navkar-academy.appspot.com/o/events%2F2025%3A02%3A20-20%3A00_new-testing-event_1?alt=media&token=e0feea6c-8bc6-4016-964f-0fba2ffbef63",
    // "https://firebasestorage.googleapis.com/v0/b/navkar-academy.appspot.com/o/events%2F2025%3A02%3A20-20%3A00_new-testing-event_3?alt=media&token=8d23e6e6-35ad-484a-a2e9-ea8747a638d0"
    // ]

    // This is how te images are stored in the database, I want 12 to come at last as it is the greatest numvber among , 3, and 12
    // I want to sort it in descending order and then get the first element and then split it by _ and get the last element and then split it by ? and get the first element
    // const maxNumUploaded = parseInt(eventData?.downloadUrl.sort((a, b) => a - b).reverse()[0].split("_").pop().split("?")[0]) || 0;
    const maxNumUploaded = parseInt(
      eventData?.downloadUrl
        .map(url => parseInt(url.split("_").pop().split("?")[0])) // Extract numbers
        .sort((a, b) => b - a) // Sort numerically in descending order
      [0] // Get the first element (maximum)
    );
    // const maxNumUploaded = parseInt(eventData?.downloadUrl.sort().reverse()[0].split("_").pop().split("?")[0]) || 0;
    // console.log("UPDATTINGNG", eventData?.downloadUrl.sort((a, b) => a - b).reverse())
    console.log("MAXNUMUPLOADED", maxNumUploaded);

    const uploadPromises = updateImages.map(async (image, index) => {
      const storageRef = ref(
        storage,
        `events/${decodeURIComponent(eventSlug)}_${eventData?.downloadUrl.length + maxNumUploaded + index + 1}`
      );

      try {
        await uploadBytes(storageRef, image);
        const downloadURL = await getDownloadURL(storageRef);
        const eventRef = refDB(db, '/events/' + decodeURIComponent(eventSlug) + '/downloadUrl');

        await runTransaction(eventRef, (event) => {
          if (event) {
            event.push(downloadURL);
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

    const deleteFromStorage = await deleteEventFromStorage(
      decodeURIComponent(eventSlug)
    );

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

    // Define the reference to the event in the database
    const eventRef = refDB(db, `events/${decodeURIComponent(eventSlug)}`);

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
    const deleting = toast.loading("Deleting image...")
    if (eventData?.downloadUrl.length <= 1) {
      toast.error("Cannot delete last image", {
        id: deleting
      });
      return
    }

    if (!confirm("Are you sure you want to delete this image?")) {
      toast.error("Image deletion cancelled", {
        id: deleting
      });
      return
    }

    // File Url - https://firebasestorage.googleapis.com/v0/b/navkar-academy.appspot.com/o/events%2F2025%3A02%3A20-08%3A00_again-demo-here..._1?alt=media&token=4afca00d-40bf-4a38-ad07-a4454485f851
    // File Name frrom the url - 2025:02:20-08:00_again-demo-here..._1
    // Get the file name frrom the url and store it

    // events%2F2025%3A02%3A20-10%3A00_demo-testing-event-multiple_1?alt=media&token=0aec37ff-2461-4a3e-b424-9be4f9afbb2
    // events%2F2025%3A02%3A20-10%3A00_demo-testing-event-multiple_3
    const imageStorageName = decodeURIComponent(image).split("/").pop().split("?")[0];
    console.log("IMAGESTORAGENAME", imageStorageName)
    const storageRef = ref(storage, "events/" + imageStorageName);

    await deleteObject(storageRef)

    const eventRef = refDB(db, '/events/' + decodeURIComponent(eventSlug) + '/downloadUrl');

    await runTransaction(eventRef, (event) => {
      if (event) {
        // event.push(downloadURL);
        console.log("EVENT", event);

        // get the index of the image to be deleted
        const index = event.findIndex((url) => url === image);
        console.log("INDEX", index);

        // remove the image from the array
        event.splice(index, 1);
        console.log("EVENT", event);
      }
      return event;
    });

    toast.success("Image deleted successfully!", {
      id: deleting
    })
  }

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
              <span>Total Images: {eventData.downloadUrl.length + updateImages.length} / 10</span>
            </div>
            <div className="grid grid-cols-3 gap-4 justify-center items-center w-full">
              {/* {eventData.downloadUrl.length > 0 && eventData.downloadUrl.map((image, index) => (
                <Image key={index} src={image} alt="Event Image" width={1000} height={1000} className="w-full h-[300px] object-contain" />
              ))
              } */}
              {
                eventData?.downloadUrl.map((image, index) => (
                  <div key={index} className="relative">
                    <Button className="absolute bottom-[10px] right-[10px] p-2 rounded-full bg-accent text-white text-lg" onClick={(e) => deleteUploadedImage(e, image)}>
                      <Trash />
                    </Button>
                    <div className="absolute top-2 left-2 text-emerald-600 bg-white border-2 border-white rounded-full">
                      <Check />
                    </div>
                    <Image src={image} alt="Event Image" width={1000} height={1000} className="w-full max-h-[300px] object-contain" />
                  </div>
                ))
              }
              {
                Array.isArray(updateImages) && updateImages.length > 0 && updateImages.map((image, index) => (
                  <div key={index} className="relative">
                    <Button className="absolute bottom-[10px] right-[10px] p-2 rounded-full bg-accent text-white text-lg" onClick={(e) => {
                      e.preventDefault();
                      setUpdateImages(updateImages.filter((_, i) => i !== index))
                    }}>
                      <Trash />
                    </Button>
                    <Image src={URL.createObjectURL(image)} alt="Event Image" width={1000} height={1000} className="w-full max-h-[300px] object-contain" />
                  </div>
                ))
              }
              {
                eventData.downloadUrl.length + updateImages.length < 10 && (
                  <div className="w-full h-full flex justify-center items-center">
                    <label htmlFor="updateEventImage" className="text-xl font-semibold text-black border-2 border-accent rounded-md flex justify-center items-center gap-2 cursor-pointer p-4 flex-col">
                      <Plus />
                      <span>Add More Images</span>
                    </label>
                    <input type="file" accept="image/*" id="updateEventImage" multiple className="hidden" onChange={(e) => setUpdateImages([...updateImages, ...e.target.files])} />
                  </div>
                )
              }
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
                  disabled={updateImages.length === 0 || eventData.downloadUrl.length + updateImages.length > 10} // Disable button while adding event
                  className={`w-full bg-accent text-white font-semibold hover:bg-orange-500/90 duration-300 ease-in-out rounded-md p-2 mt-6 ${updatingEvent &&
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
              className={`flex justify-center items-center ${updateEvent ? "mt-1" : "mt-6"
                }`}
            >
              <Button
                onClick={deleteEventHandler}
                disabled={deletingEvent}
                className={`w-full bg-red-500 text-white font-semibold hover:bg-red-500/90 duration-300 ease-in-out rounded-md p-2 mt-6 ${deletingEvent
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