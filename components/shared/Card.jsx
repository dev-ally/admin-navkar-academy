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
import { Button } from "../ui/button";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Card = ({
  eventTitle,
  eventDate,
  eventImg,
  eventLocation,
  eventSlug,
}) => {
  return (
    <div className="relative flex justify-between flex-col text-gray-700 bg-white shadow-md border-2 rounded-md mx-auto hover:scale-100 transition-all duration-300 min-w-[300px] max-w-[340px]">
      {/* <div> */}
      {/* <Image
        width={1000}
        height={700}
        src={eventImg}
        alt="Event Image"
        className="w-full h-full object-cover rounded-t-md"
      /> */}
      <div className="max-h-[300px] flex justify-center items-center">
        <Carousel
          className="w-full max-w-[200px] max-h-[300px]"
          plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}
        >
          <CarouselContent className="h-full items-center">
            {eventImg?.length > 0 &&
              eventImg?.map((image, index) => {
                console.log(
                  "IMAGE SINGLE",
                  image,
                  image.split(" ")[1]?.split("_")[3]
                );
                return (
                  <CarouselItem
                    key={index}
                    className="w-full h-full flex justify-center items-center"
                  >
                    <div className="p-1 pt-2 w-full flex justify-center items-center">
                      {image.split(" ")[1].split("_")[3] === "mp4" ? (
                        <video
                          src={image?.split(" ")[0]}
                          autoPlay
                          controls
                          className="max-h-[300px] w-fit object-contain"
                        />
                      ) : (
                        <Image
                          width={1000}
                          height={300}
                          src={image.split(" ")[0]}
                          alt="Event Image"
                          className="max-h-[300px] w-fit object-contain rounded-t-md"
                        />
                      )}
                    </div>
                  </CarouselItem>
                );
              })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      {/* </div> */}
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
            <div className="w-full flex justify-center items-center flex-col gap-3">
              <Carousel
                className="w-[80%] max-h-[300px]"
                plugins={[
                  Autoplay({
                    delay: 4000,
                  }),
                ]}
              >
                <CarouselContent>
                  {eventImg?.length > 0 &&
                    eventImg?.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1 w-fit h-fit">
                          {image.split(" ")[1].split("_")[3] === "mp4" ? (
                            <video
                              src={image?.split(" ")[0]}
                              autoPlay
                              controls
                            />
                          ) : (
                            <Image
                              width={1000}
                              height={300}
                              src={image.split(" ")[0]}
                              alt="Event Image"
                              className="h-[300px] w-full max-w-[440px] object-contain rounded-t-md"
                            />
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              <div className="text-base text-primary mt-4">
                <div className="mb-3">
                  <span className="font-bold">Location</span> - {eventLocation}
                </div>
              </div>
            </div>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <Button asChild variant="native">
              <Link href={`/dashboard/events/${eventSlug}`}>Edit Event</Link>
            </Button>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Card;
