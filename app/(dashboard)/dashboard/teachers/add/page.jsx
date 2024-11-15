"use client";

import addEventToDB from "@/actions/events/addEventToDB";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { db, storage } from "@/firebase/config";
import { ref as refDB, set } from "firebase/database";
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

const AddTeachers = () => {
  const [teacherData, setTeacherData] = useState({
    image: "",
    name: "",
    experience: "",
    subject: "",
  });
  const [addingTeacher, setAddingTeacher] = useState(false);

  const router = useRouter();

  const addTeacherHandler = async (e) => {
    e.preventDefault();
    // console.log(teacherData);

    // Set addingEvent to true at the beginning of the process
    setAddingTeacher(true);

    let loading = toast.loading("Adding teacher...");

    if (
      teacherData.image === "" ||
      teacherData.name === "" ||
      teacherData.experience === "" ||
      teacherData.subject === ""
    ) {
      toast.error("Please fill all the fields.", {
        id: loading,
      });
      setAddingTeacher(false); // Reset addingEvent if there's an error
      return;
    }

    if (teacherData.image.size > 5000000) {
      toast.error("Please upload an image smaller than 5MB.", {
        id: loading,
      });
      setAddingTeacher(false); // Reset addingEvent if there's an error
      return;
    }

    if (teacherData.name.split(" ").length > 25) {
      toast.error("Please enter name with less than 25 words.", {
        id: loading,
      });
      setAddingTeacher(false); // Reset addingEvent if there's an error
      return;
    }

    const teacherID = uuidv4();
    const storageRef = ref(storage, `teachers/${teacherID}`);

    const uploadTask = uploadBytesResumable(storageRef, teacherData.image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            // console.log("Upload is paused");
            break;
          case "running":
            // console.log("Upload is running");
            break;
        }
      },
      (error) => {
        // Handle unsuccessful uploads
        toast.error("Failed to upload image. Please try again.", {
          id: loading,
        });
        setAddingTeacher(false); // Reset addingEvent if upload fails
      },
      async () => {
        // Handle successful uploads on complete
        await getDownloadURL(uploadTask.snapshot.ref).then(
          async (downloadURL) => {
            // console.log("File available at", downloadURL);
            setTeacherData((prevData) => ({
              ...prevData,
              downloadUrl: downloadURL,
            }));

            // Add the event to the database once the download URL is available
            try {
              await set(refDB(db, "teachers/" + teacherID), {
                ...teacherData,
                downloadUrl: downloadURL,
              });
              // console.log("Teacher added to DB");
              toast.success("Teacher added successfully!", {
                id: loading,
              });
              router.push("/dashboard/teachers");
            } catch (error) {
              console.error("Error adding teacher: ", error);
              // return false;
              toast.error("Failed to add teacher. Please try again later.", {
                id: loading,
              });
            }

            // Redirect to events page after successful addition

            setAddingTeacher(false); // Reset addingEvent after successful addition
          }
        );
      }
    );

    // Clear the form after adding the event
    setTeacherData({
      image: "",
      name: "",
      experience: "",
      subject: "",
    });
  };

  return (
    <Container>
      <div className="flex justify-center items-center w-full py-6">
        <div className="w-full md:w-[80%] lg:w-[60%]">
          <h2 className="text-3xl font-bold mb-6">Add Teacher</h2>
          <form onSubmit={addTeacherHandler}>
            {/* Image Input */}
            <div className="flex justify-center items-center w-full">
              {teacherData.image ? (
                <div className="min-h-[200px] rounded-md px-6 py-8 bg-emerald-400/40 w-full flex justify-center items-center flex-col cursor-pointer">
                  <Image
                    src={URL.createObjectURL(teacherData.image)}
                    width={1000}
                    height={1000}
                    alt="Teacher Image"
                    className="w-full max-h-[200px] object-contain"
                  />
                  <span className="text-xl font-bold my-4">
                    Image Uploaded Successfully
                  </span>
                  <button
                    className="px-4 py-2 border-2 border-black hover:bg-black/80 hover:text-white transition-all duration-300 ease-in-out rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      setTeacherData({ ...teacherData, image: "" });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <label
                    htmlFor="eventImage"
                    className="w-full border-2 rounded-md border-orange-400/80 bg-orange-400/20 flex flex-col gap-2 justify-center items-center px-10 h-[200px] cursor-pointer"
                  >
                    <span className="text-xl font-bold">Upload Image</span>
                    <span className="text-sm text-black/50 font-semibold">
                      Click here to upload image!
                    </span>
                    <span className="text-sm text-black/50 font-semibold">
                      Landscape Orientation (1000 x 1000)
                    </span>
                  </label>
                  <input
                    type="file"
                    id="eventImage"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      // console.log(e.target.files[0]);
                      setTeacherData({
                        ...teacherData,
                        image: e.target.files[0],
                      });
                    }}
                  />
                </>
              )}
            </div>

            {/* Title Input */}
            <div className="mt-6">
              <label htmlFor="name" className="block text-lg font-semibold">
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter name of the teacher"
                className="w-full border-2 border-gray-300 rounded-md p-2"
                value={teacherData.name}
                onChange={(e) =>
                  setTeacherData({ ...teacherData, name: e.target.value })
                }
              />
            </div>

            {/* Experience Input */}
            <div className="mt-6">
              <label
                htmlFor="teacherExperience"
                className="block text-lg font-semibold"
              >
                Years of experience
              </label>
              <input
                type="number"
                id="teacherExperience"
                placeholder="Enter years of experience"
                className="w-full border-2 border-gray-300 rounded-md p-2"
                value={teacherData.experience}
                onChange={(e) =>
                  setTeacherData({ ...teacherData, experience: e.target.value })
                }
              />
            </div>

            {/* Subject Input */}
            <div className="mt-6">
              <label
                htmlFor="teacherSubject"
                className="block text-lg font-semibold"
              >
                Subject
              </label>
              <input
                type="text"
                id="teacherSubject"
                placeholder="Enter subject of the teacher"
                className="w-full border-2 border-gray-300 rounded-md p-2"
                value={teacherData.subject}
                onChange={(e) =>
                  setTeacherData({ ...teacherData, subject: e.target.value })
                }
              />
            </div>

            {/* Description Input */}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-8 p-3 bg-black text-white hover:bg-gray-800 transition-all duration-300 ease-in-out rounded-md"
              disabled={addingTeacher}
            >
              {addingTeacher ? (
                <div className="flex justify-center items-center gap-2">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Adding Teacher...
                </div>
              ) : (
                "Add Teacher"
              )}
            </Button>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default AddTeachers;
