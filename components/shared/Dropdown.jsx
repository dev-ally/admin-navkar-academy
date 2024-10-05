import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dropdown = ({ trigger, options, onChange, className, value }) => {
  return (
    <div>
      <Select onValueChange={onChange} value={value}>
        {" "}
        {/* Add onValueChange prop here */}
        <SelectTrigger className={`${className} `}>
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
