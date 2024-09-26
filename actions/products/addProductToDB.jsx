import { db } from "@/firebase/config";
import { ref, set } from "firebase/database";

const addProductToDB = async ({
  // pid,
  // ptitle,
  // pdescription,
  // ppdf,
  // pcoverImg,
  // pclass,
  // psubject,
  // pprice,
  // pcreatedAt,
  data,
  reference,
}) => {
  let added = false;
  await set(ref(db, reference), {
    ...data,
  })
    .then(() => {
      console.log("Product added to DB");
      // return true;
      added = true;
    })
    .catch((error) => {
      console.error("Error adding product: ", error);
      // return false;
      added = false;
    });

  return added;
};

export default addProductToDB;
