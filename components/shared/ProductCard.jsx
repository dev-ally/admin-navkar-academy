"use client";

import { Pen, Pencil, Trash } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import deleteProductFromStorage from "@/actions/products/deleteProductFromStorage";
import toast from "react-hot-toast";
import { ref, remove } from "firebase/database";
import { db } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const ProductCard = ({
  pid,
  ptitle,
  pdescription,
  pcoverImg,
  pclass,
  psubject,
  pprice,
  pcreatedAt,
}) => {
  const [deletingEvent, setDeletingEvent] = useState(false);

  const deleteProductHandler = async (e) => {
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this product?")) return;
    console.log("PCOVERIMG", pcoverImg);
    // return;

    setDeletingEvent(true);

    const loading = toast.loading("Deleting product...");
    try {
      await remove(ref(db, `products/${pclass}/${psubject}/${pid}`));
      await deleteProductFromStorage(`${pid}_coverImage`);
      await deleteProductFromStorage(`${pid}_pdfFile`);
      toast.success("Product deleted successfully!", { id: loading });
    } catch (error) {
      console.error("Error deleting product: ", error);
      toast.error("Failed to delete product. Please try again later.", {
        id: loading,
      });
    } finally {
      setDeletingEvent(false);
    }
  };

  return (
    <div className="border-2 border-black/80 rounded-lg h-full">
      <div className="flex w-full flex-col md:flex-row h-full">
        <div className="w-full md:w-[40%] flex justify-center items-center">
          {/* <Image
            src={pcoverImg}
            alt="Product Cover Image"
            width={1000}
            height={1000}
            className="w-[90%] md:w-full h-full object-cover rounded-lg md:rounded-l-lg"
          /> */}
          <Carousel
            plugins={[
              Autoplay({
                delay: 2000,
              }),
            ]}
          >
            <CarouselContent>
              {Array.isArray(pcoverImg) &&
                pcoverImg.length > 0 &&
                pcoverImg.map((img) => (
                  <CarouselItem key={img}>
                    <Image
                      src={img}
                      alt="Product Cover Image"
                      width={1000}
                      height={1000}
                      className="w-[200px] md:w-full h-full object-cover rounded-lg md:rounded-l-lg"
                    />
                  </CarouselItem>
                ))}
            </CarouselContent>
          </Carousel>
        </div>
        <div className="w-full md:w-[60%] px-4 py-6 flex flex-col justify-between">
          <div className="flex flex-col flex-grow">
            <span className="text-sm font-medium">
              {pcreatedAt.split("-").reverse().join("-")}
            </span>
            <h2 className="text-xl font-medium">{ptitle}</h2>
            <span className="mb-2">
              {pdescription.length > 80
                ? pdescription.slice(0, 80) + "..."
                : pdescription}
            </span>
            <div className="flex gap-2 mb-2">
              <span>
                {pclass}
                <sup>th</sup>
              </span>
              <span>{psubject}</span>
            </div>
            <span className="text-lg font-medium mb-2">₹ {pprice}</span>
          </div>
          <div className="flex w-full gap-2 md:gap-4 mt-auto">
            <div className="w-[50%]">
              {/* Edit Button */}
              <Button
                asChild
                variant="outline"
                className="text-black w-full border-2 border-accent"
              >
                <Link href={`products/${pclass}/${psubject}/${pid}`}>
                  <Pencil />
                </Link>
              </Button>
            </div>
            <div className="w-[50%]">
              {/* Delete Button */}
              <Button
                variant="outline"
                className="w-full disabled:opacity-50 hover:bg-red-500 border-2 border-red-500"
                onClick={deleteProductHandler}
                disabled={deletingEvent}
              >
                <Trash />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
