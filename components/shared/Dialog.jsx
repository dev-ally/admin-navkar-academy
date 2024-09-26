import React from "react";
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
import { Trash } from "lucide-react";

const Dialog = ({ handleDelete, year }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Trash className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 cursor-pointer z-50 w-10 h-10" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the year{" "}
            <b>{year}</b> with it's toppers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-400 text-white p-2 rounded-md hover:bg-gray-300">
            {" "}
            Cancel{" "}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleDelete(year)}
            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Dialog;
