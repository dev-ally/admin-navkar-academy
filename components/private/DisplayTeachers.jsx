import React from "react";
import Image from "next/image";
import { Trash } from "lucide-react";

const DisplayTeacher = ({ data, handleDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-14">
      {data.map((teacher) => (
        <div key={teacher.id} className="flex flex-col items-center">
          <div className="rounded-t-full border-4 hover:border-accent transition-all duration-300 overflow-hidden">
            <div className="p-4 overflow-hidden flex justify-center items-center ">
              <Image
                src={teacher.downloadUrl}
                alt={`${teacher.name} Profile`}
                width={1000}
                height={1000}
                className="w-[90%] md:w-full"
              />
            </div>
            <div className="w-full flex justify-center items-center flex-col p-3 pt-0">
              <h3 className="text-xl font-semibold">{teacher.name}</h3>
              <p className="text-base text-center">{teacher.subject}</p>
              <p className="text-base text-center">
                Years of experience: {teacher.experience}
              </p>
              <div className="relative w-full h-full">
                <Trash
                  className="absolute bottom-3 right-1 bg-red-500 text-white rounded-full p-2 w-10 h-10 cursor-pointer"
                  onClick={() => handleDelete(teacher.id)}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisplayTeacher;
