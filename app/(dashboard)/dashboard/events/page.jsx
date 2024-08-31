import DisplayEvents from "@/components/private/DisplayEvents";
import Card from "@/components/shared/Card";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const EventsPage = () => {
  return (
    <Container>
      <div className="my-10 flex flex-col px-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold py-2 text-center text-3xl md:text-4xl flex items-center gap-2 mb-6 md:mb-8">
            {/* <Calendar className="w-8 h-8" /> */}
            Upcoming Events
          </h1>
          <Button asChild>
            <Link href="/dashboard/events/add">Add Event</Link>
          </Button>
        </div>
        <DisplayEvents />
      </div>
    </Container>
  );
};

export default EventsPage;
