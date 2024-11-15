import { storage } from "@/firebase/config";
import { ref, deleteObject } from "firebase/storage";

const deleteTestimonialFromStorage = async (testimonialId) => {
  // console.log("Deleting testimonial with id: ", testimonialId);
  const testimonialRef = ref(storage, `testimonials/${testimonialId}`);
  let deleted = false;

  // Delete the file
  await deleteObject(testimonialRef)
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

export default deleteTestimonialFromStorage;
