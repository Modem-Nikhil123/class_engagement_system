import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CalendarModal({ onDateSelect }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const handleChange = (date) => {
    setSelectedDate(date);

    // const dateString = date.toISOString().split("T")[0];
    onDateSelect(date); 
  };

  return (
    <div className="p-4">
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        inline // renders calendar directly
      />
    </div>
  );
}
