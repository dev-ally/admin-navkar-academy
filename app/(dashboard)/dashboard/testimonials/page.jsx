"use client";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Dropdown from "@/components/shared/Dropdown";
import toast from "react-hot-toast";
import { db, storage } from "@/firebase/config";
import {
  set,
  ref as refDB,
  query,
  orderByKey,
  onValue,
  remove,
  update,
} from "firebase/database";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import TestimonialCard from "@/components/private/TestimonialCard";
import deleteTestimonialFromStorage from "@/actions/testimonials/deleteTestimonialFromStorage";

// Dialog component for adding or editing testimonials
const Dialog = ({
  testimonial,
  handleChange,
  addHandler,
  updateHandler,
  editMode,
  isOpen,
  setIsOpen,
  setEditMode,
  setTestimonial,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>Add Testimonial</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {editMode ? "Edit Testimonial" : "Add Testimonial"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <form className="text-black">
              <div className="flex flex-col gap-4">
                <label>
                  <span className="text-lg">Name</span>
                  <input
                    type="text"
                    name="name"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={testimonial.name || ""}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  <span className="text-lg">Image</span>
                  <input
                    type="file"
                    name="image"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    onChange={handleChange}
                    disabled={editMode}
                  />
                </label>
                <label>
                  <span className="text-lg">Designation</span>
                  <Dropdown
                    trigger="Select Designation"
                    options={["Student", "Parent", "Guardian"]}
                    onChange={(value) =>
                      handleChange({
                        target: { name: "designation", value },
                      })
                    }
                    className="w-full"
                    value={testimonial.designation || ""}
                  />
                </label>
                {testimonial.designation === "Student" && (
                  <label>
                    <span className="text-lg">10th Grade</span>
                    <input
                      type="text"
                      name="tenthGrade"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={testimonial.tenthGrade || ""}
                      onChange={handleChange}
                    />
                  </label>
                )}
                <label>
                  <span className="text-lg">Testimonial</span>
                  <textarea
                    name="testimonial"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="5"
                    value={testimonial.testimonial || ""}
                    onChange={handleChange}
                  ></textarea>
                </label>
              </div>
            </form>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setIsOpen(false);
              setEditMode(false);
              setTestimonial({
                name: "",
                image: "",
                designation: "",
                tenthGrade: "",
                testimonial: "",
                downloadUrl: "",
              });
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={editMode ? updateHandler : addHandler}>
            {editMode ? "Update Testimonial" : "Add Testimonial"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Page component
const Page = () => {
  const [addingTestimonial, setAddingTestimonial] = useState(false);
  const [testimonial, setTestimonial] = useState({
    name: "",
    image: "",
    designation: "",
    tenthGrade: "",
    testimonial: "",
    downloadUrl: "",
  });
  const [testimonialData, setTestimonialData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTestimonialId, setCurrentTestimonialId] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setTestimonial((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Add new testimonial
  const addTestimonialHandler = async (e) => {
    e.preventDefault();
    setAddingTestimonial(true);

    const loading = toast.loading("Adding testimonial...");
    if (
      !testimonial.name ||
      !testimonial.designation ||
      !testimonial.testimonial ||
      !testimonial.image
    ) {
      toast.error("Please fill all the fields");
      return;
    }
    if (testimonial.designation === "Student" && !testimonial.tenthGrade) {
      toast.error("Please fill all the fields");
      return;
    }
    try {
      const testimonialID = uuidv4();
      const storageRef = ref(storage, `testimonials/${testimonialID}`);
      const uploadTask = uploadBytesResumable(storageRef, testimonial.image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          toast.error("Failed to upload image. Please try again.");
          setAddingTestimonial(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const newTestimonial = {
            name: testimonial.name,
            designation: testimonial.designation,
            testimonial: testimonial.testimonial,
            downloadUrl: downloadURL,
          };

          // Only add the `tenthGrade` field if the designation is "Student"
          if (testimonial.designation === "Student") {
            newTestimonial.tenthGrade = testimonial.tenthGrade;
          }

          await set(refDB(db, `testimonials/${testimonialID}`), newTestimonial);
          toast.success("Testimonial added successfully!", { id: loading });
          setIsOpen(false);
          setAddingTestimonial(false);
        }
      );
    } catch (error) {
      toast.error("Failed to add testimonial.");
      setAddingTestimonial(false);
    }
    setTestimonial({
      name: "",
      image: "",
      designation: "",
      tenthGrade: "",
      testimonial: "",
      downloadUrl: "",
    });
  };

  // Update existing testimonial
  const updateTestimonialHandler = async (e) => {
    e.preventDefault();
    setAddingTestimonial(true);

    const loading = toast.loading("Updating testimonial...");
    if (
      !testimonial.name ||
      !testimonial.designation ||
      !testimonial.testimonial
    ) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      const updateData = {
        name: testimonial.name,
        designation: testimonial.designation,
        testimonial: testimonial.testimonial,
      };

      // Only add the `tenthGrade` field if the designation is "Student"
      if (testimonial.designation === "Student") {
        updateData.tenthGrade = testimonial.tenthGrade;
      }

      // Update the testimonial in the database
      await update(
        refDB(db, `testimonials/${currentTestimonialId}`),
        updateData
      );

      toast.success("Testimonial updated successfully!", { id: loading });
      setIsOpen(false);
      setAddingTestimonial(false);
    } catch (error) {
      toast.error("Failed to update testimonial.");
      setAddingTestimonial(false);
    }
  };

  useEffect(() => {
    const testimonialRef = query(refDB(db, "testimonials"), orderByKey());

    const unsubscribe = onValue(testimonialRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const testimonialsArray = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .reverse();
        setTestimonialData(testimonialsArray);
      } else {
        setTestimonialData([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (testimonialId) => {
    let deleteConfirm = confirm(
      "Are you sure you want to delete the testimonial?"
    );
    if (!deleteConfirm) return;

    let loading = toast.loading("Deleting testimonial...");

    const deleteFromStorage = await deleteTestimonialFromStorage(testimonialId);
    if (!deleteFromStorage) {
      toast.error("Failed to delete testimonial from storage.", {
        id: loading,
      });
      return;
    }

    try {
      await remove(refDB(db, `testimonials/${testimonialId}`));
      toast.success("Testimonial deleted successfully!", { id: loading });
    } catch (error) {
      toast.error("Failed to delete testimonial.", { id: loading });
    }
  };

  const handleEdit = (testimonial) => {
    setTestimonial({
      name: testimonial.name,
      image: "",
      designation: testimonial.designation,
      tenthGrade: testimonial.tenthGrade || "",
      testimonial: testimonial.testimonial,
      downloadUrl: testimonial.downloadUrl,
    });
    setCurrentTestimonialId(testimonial.id);
    setEditMode(true);
    setIsOpen(true);
  };

  return (
    <Container>
      <div className="flex justify-between">
        <h1 className="font-bold py-2 text-center text-3xl md:text-4xl flex items-center gap-2">
          Testimonials
        </h1>
        <Dialog
          testimonial={testimonial}
          handleChange={handleChange}
          addHandler={addTestimonialHandler}
          updateHandler={updateTestimonialHandler}
          editMode={editMode}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setEditMode={setEditMode}
          setTestimonial={setTestimonial}
        />
      </div>
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-3  gap-y-4 mt-6">
          {testimonialData.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              data={testimonial}
              handleDelete={handleDelete}
              handleEdit={() => handleEdit(testimonial)}
            />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default Page;
