"use client";

import React, { useState, useEffect } from "react";
import { onValue, orderByKey, query, ref, remove } from "firebase/database";
import { db } from "@/firebase/config";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import Container from "@/components/shared/Container";
import DisplayTeachers from "../../../../components/private/DisplayTeachers";
import { Button } from "@/components/ui/button";
import deleteTeacherFromStorage from "@/actions/teachers/deleteTeacherFromStorage";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Teachers = () => {
  const router = useRouter();
  const [teachersData, setTeachersData] = useState(null);
  const [deletingTeacher, setDeletingTeacher] = useState(false);

  useEffect(() => {
    const teachersRef = query(ref(db, "teachers"), orderByKey());

    const unsubscribe = onValue(teachersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the object data to an array for easier mapping
        const teachersArray = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .reverse();
        setTeachersData(teachersArray);
        console.log(teachersArray);
        console.log("DATA", data);
      } else {
        setTeachersData([]); // Clear the event data if no events found
      }
    }); // Clean up the subscription on component unmount

    return () => unsubscribe();
  }, []);

  if (teachersData === null) {
    return (
      <div className="w-full flex justify-center items-center h-full mt-6">
        <h1 className="font-medium py-2 text-center text-2xl flex items-center gap-2 mb-6 md:mb-8">
          <LoaderCircle className="animate-spin" />
          Loading Teachers
        </h1>
      </div>
    );
  }

  const deleteHandler = async (teacherId) => {
    let deleteConfirm = confirm("Are you sure you want to delete the teacher?");

    if (!deleteConfirm) return;

    // Set deletingTeacher to true at the beginning of the process
    setDeletingTeacher(true);

    let loading = toast.loading("Deleting teacher...");

    const deleteFromStorage = await deleteTeacherFromStorage(teacherId);

    if (!deleteFromStorage) {
      toast.error(
        "Failed to delete teacher from storage. Please try again later.",
        {
          id: loading,
        }
      );
      setDeletingTeacher(false); // Reset deletingTeacher if there's an error
      return;
    }

    // Define the reference to the teacher in the database
    const teacherRef = ref(db, `teachers/${teacherId}`);

    // Delete the teacher in the database
    try {
      await remove(teacherRef);

      toast.success("Teacher deleted successfully!", {
        id: loading,
      });

      router.push("/dashboard/teachers");
    } catch (error) {
      console.error("Error deleting teacher: ", error);
      toast.error("Failed to delete teacher. Please try again later.", {
        id: loading,
      });
    } finally {
      // Reset deletingTeacher after completion
      setDeletingTeacher(false);
    }
  };

  return (
    <Container>
      <div className="my-10 flex flex-col px-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold py-2 text-center text-3xl md:text-4xl flex items-center gap-2 mb-6 md:mb-8">
            Teachers.
          </h1>
          <Button asChild>
            <Link href="/dashboard/teachers/add">Add Teacher</Link>
          </Button>
        </div>
        {teachersData.length === 0 && (
          <h2 className="text-xl font-medium text-center mt-4">
            No teachers found. Add a teacher to get started.
          </h2>
        )}
        <DisplayTeachers data={teachersData} handleDelete={deleteHandler} />
      </div>
    </Container>
  );
};

export default Teachers;
