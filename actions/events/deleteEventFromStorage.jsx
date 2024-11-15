import { storage } from "@/firebase/config";
import { ref, deleteObject } from "firebase/storage";

const deleteEventFromStorage = async (eventSlug) => {
  const eventRef = ref(storage, `events/${eventSlug}`);
  let deleted = false;

  // Delete the file
  await deleteObject(eventRef)
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

export default deleteEventFromStorage;
