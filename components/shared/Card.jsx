import { Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

const Card = ({
  eventTitle,
  eventDescription,
  eventDate,
  eventImg,
  eventLocation,
}) => {
  return (
    <div className="relative flex flex-col text-gray-700 bg-white shadow-md border-2 rounded-md mx-auto hover:scale-100 transition-all duration-300 w-[326px]">
      <div>
        <Image
          width={1000}
          height={1000}
          src={eventImg}
          alt="Event Image"
          className="w-full h-56 object-cover rounded-t-md"
        />
      </div>
      <div className="px-6 py-4 flex justify-between items-center">
        <p className="text-primary font-semibold">{eventTitle}</p>
        <AlertDialog>
          <AlertDialogTrigger>
            <Info />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-primary">
                <h2 className="text-2xl font-bold leading-7 mb-2">
                  {eventTitle}
                </h2>
                <span>{eventDate}</span>
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="w-[100%] h-[3px] rounded-full my-2 bg-accent mx-auto md:mx-0" />
            <div className="text-base text-primary">
              <div className="mb-3">
                <span className="font-bold">About this event: </span>
                {eventDescription}
              </div>
              <div className="mb-3">
                <span className="font-bold">Location</span> - {eventLocation}
              </div>
            </div>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Card;
