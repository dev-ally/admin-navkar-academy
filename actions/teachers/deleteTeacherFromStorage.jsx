import { storage } from "@/firebase/config";
import { ref, deleteObject } from "firebase/storage";

const deleteTeacherFromStorage = async (teacherId) => {
  // console.log("Deleting teacher with id: ", teacherId);
  const teacherRef = ref(storage, `teachers/${teacherId}`);
  let deleted = false;

  // Delete the file
  await deleteObject(teacherRef)
    .then(() => {
      // File deleted successfully
      // console.log("File deleted successfully");
      deleted = true;
    })
    .catch((error) => {
      // Uh-oh, an error occurred!
      console.error("Error deleting file:", error);
      deleted = false;
    });

  return deleted;
};

export default deleteTeacherFromStorage;
