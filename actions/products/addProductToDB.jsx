import { db } from "@/firebase/config";
import { ref, set } from "firebase/database";

const addProductToDB = async ({
  pid,
  ptitle,
  pdescription,
  pcoverImg,
  pclass,
  psubject,
  pprice,
  pcreatedAt,
}) => {
  let added = false;
  await set(ref(db, "products/" + pid), {
    pid,
    ptitle,
    pdescription,
    pcoverImg,
    pclass,
    psubject,
    pprice,
    pcreatedAt,
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
