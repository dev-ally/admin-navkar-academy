import { Pencil, Trash } from "lucide-react";
import Image from "next/image";
import React from "react";

const TestimonialCard = ({ data, handleDelete, handleEdit }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-center md:w-[480px] md:h-[250px] border-2 border-accent hover:bg-main rounded-lg px-[2rem] py-[2rem] md:py-[2.2rem] mx-[0.4rem] duration-300 ease-in-out select-none relative  ">
      <div className="absolute top-2 right-2">
        <Trash
          className="bg-red-500 text-white rounded-full p-2 w-10 h-10 cursor-pointer"
          onClick={() => handleDelete(data.id)}
        />
      </div>
      <div className="absolute top-2 left-2">
        <Pencil
          className="text-black p-1 w-8 h-8 cursor-pointer"
          onClick={() => handleEdit(data)} // Pass the data for editing
        />
      </div>
      <div className="w-[180px] h-[180px]">
        <Image
          src={data.downloadUrl}
          alt="Student Image"
          width={200}
          height={200}
          className="h-[180px] w-fit object-cover border-2 border-accent rounded-full p-2"
        />
      </div>
      <div className="md:w-[70%] flex justify-center items-start flex-col">
        <p className="text-lg barlow-regular "> {data.testimonial}</p>
        <div className="w-full h-[1px] bg-black/20 my-4" />
        <span className="text-base md:text-lg barlow-semibold">
          {data.name}
        </span>
        <span className="text-base md:text-md barlow-regular">
          {data.designation}
        </span>
        <span className="text-md barlow-regular">
          {data.tenthGrade ? `10th Grade - ${data.tenthGrade}%` : ""}
        </span>
      </div>
    </div>
  );
};

export default TestimonialCard;
