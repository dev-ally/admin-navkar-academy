import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dropdown = ({ trigger, options, onChange }) => {
  return (
    <div>
      <Select onValueChange={onChange}>
        {" "}
        {/* Add onValueChange prop here */}
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={trigger} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => (
            <SelectItem key={index} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Dropdown;
