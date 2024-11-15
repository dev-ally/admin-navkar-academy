import { storage } from "@/firebase/config";
import { ref, deleteObject } from "firebase/storage";

const deleteProductFromStorage = async (pid) => {
  const productRef = ref(storage, `products/${pid}`);
  let deleted = false;

  // Delete the file
  await deleteObject(productRef)
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

export default deleteProductFromStorage;
