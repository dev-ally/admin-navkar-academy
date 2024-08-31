import { db } from "@/firebase/config";
import { ref, set } from "firebase/database";

const addEventToDB = async ({
  image,
  title,
  date,
  location,
  description,
  downloadUrl,
  eventSlug,
  createdAt,
}) => {
  let added = false;
  await set(ref(db, "events/" + eventSlug), {
    title,
    date,
    location,
    description,
    downloadUrl,
    eventSlug,
    createdAt,
  })
    .then(() => {
      console.log("Event added to DB");
      // return true;
      added = true;
    })
    .catch((error) => {
      console.error("Error adding event: ", error);
      // return false;
      added = false;
    });

  return added;
};

export default addEventToDB;
