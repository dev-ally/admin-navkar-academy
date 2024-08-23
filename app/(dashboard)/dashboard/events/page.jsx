import Card from "@/components/shared/Card";
import Container from "@/components/shared/Container";
import React from "react";

const EventsPage = () => {
  return (
    <Container>
      <div className="my-10 flex flex-col items-center px-6">
        <div>
          <h1 className="font-bold py-2 text-center text-3xl md:text-4xl flex items-center gap-2 mb-6 md:mb-8">
            {/* <Calendar className="w-8 h-8" /> */}
            Upcoming Events
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 justify-center">
          {/* {events.map((event, index) => ( */}
          <Card
            // key={index}
            eventTitle={"TITLE"}
            eventDescription={"This is a event description."}
            eventDate={"20-10-2024"}
            eventImg={
              "https://navkar-academy.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FdemoEvent.f560265f.png&w=1080&q=75"
            }
            eventLocation={"Online"}
          />
          {/* ))} */}
        </div>
      </div>
    </Container>
  );
};

export default EventsPage;
