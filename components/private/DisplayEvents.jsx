"use client";

import React, { useState, useEffect } from "react";
import Card from "../shared/Card";
import { onValue, orderByKey, query, ref } from "firebase/database";
import { db } from "@/firebase/config";
import { ArrowRight, LoaderCircle } from "lucide-react";
import Link from "next/link";

const DisplayEvents = () => {
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    const eventsRef = query(ref(db, "events"), orderByKey());

    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the object data to an array for easier mapping
        const eventsArray = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .reverse();
        // console.log("EVENTS", eventsArray);
        setEventData(eventsArray);
      } else {
        setEventData([]); // Clear the event data if no events found
      }
    });

    // Clean up the subscription on component unmount
    return () => unsubscribe();
  }, []);

  if (eventData === null) {
    return (
      <h1 className="font-medium py-2 text-center text-2xl flex items-center gap-2 mb-6 md:mb-8">
        <LoaderCircle className="animate-spin" />
        Loading Events
      </h1>
    );
  }

  return (
    <div
      className={`justify-center ${
        eventData.length === 0
          ? "flex"
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-10"
      }`}
    >
      {eventData.length === 0 && (
        <Link
          href="/dashboard/events/add"
          className="py-2 text-center text-2xl flex items-center gap-2 mb-6 md:mb-8"
        >
          Add Event to Get Started
          <ArrowRight />
        </Link>
      )}
      {eventData.map((event) => (
        <Card
          key={event.id}
          eventTitle={event.title || "No Title"}
          eventDate={event.date || "No Date"}
          eventImg={event.downloadUrl || []}
          eventLocation={event.location || "No Location"}
          eventSlug={event.eventSlug || ""}
        />
      ))}
    </div>
  );
};

export default DisplayEvents;
