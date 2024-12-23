import { db } from "@/firebase/config";
import { ref, set } from "firebase/database";

const addEventToDB = async ({
  title,
  date,
  time,
  location,
  downloadUrl,
  eventSlug,
  createdAt,
}) => {
  let added = false;
  await set(ref(db, "events/" + eventSlug), {
    title,
    date,
    time,
    location,
    downloadUrl,
    eventSlug,
    createdAt,
  })
    .then(() => {
      // console.log("Event added to DB");
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
