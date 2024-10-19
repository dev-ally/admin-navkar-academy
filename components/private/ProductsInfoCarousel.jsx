import React from "react";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

const ProductsInfoCarousel = ({ previewNote, current, setApi }) => {
  return (
    <div>
      <Carousel
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
        setApi={setApi}
      >
        <CarouselContent>
          {previewNote &&
            previewNote.map((img, index) => (
              <CarouselItem key={index}>
                <Image
                  src={img}
                  alt="Preview Image"
                  width={1000}
                  height={1000}
                  className="text-xl font-bold"
                />
              </CarouselItem>
            ))}
        </CarouselContent>
      </Carousel>
      <div className="py-2 text-center text-sm text-muted-foreground">
        Slide {current} of {previewNote.length}
      </div>
    </div>
  );
};

export default ProductsInfoCarousel;
