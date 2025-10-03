"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { isBefore, startOfDay } from "date-fns";

interface ScheduleLinkModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: number;
  onConfirm: (timestamp: number | null) => void;
}

const ScheduleLinkModal: React.FC<ScheduleLinkModalProps> = ({
  isOpen,
  onOpenChange,
  initialValue,
  onConfirm,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [timeValue, setTimeValue] = useState<string>("12:00");
  const [error, setError] = useState<string | null>(null);

  // Custom time picker state (24-hour format)
  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const timePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialValue) {
        const date = new Date(initialValue);
        setSelectedDate(date);
        const hours = date.getHours();
        const minutes = date.getMinutes();

        setSelectedHour(hours);
        setSelectedMinute(minutes);
        setTimeValue(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`,
        );
      } else {
        const now = new Date();
        setSelectedDate(now);
        const hours = now.getHours();
        const minutes = now.getMinutes();

        setSelectedHour(hours);
        setSelectedMinute(minutes);
        setTimeValue(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`,
        );
      }
      setError(null);
    }
  }, [initialValue, isOpen]);

  const minDate = useMemo(() => startOfDay(new Date()), []);

  // Handle time picker interactions (24-hour format)
  const handleTimeChange = (hour: number, minute: number) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);

    setTimeValue(
      `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`,
    );
  };

  const handleNowClick = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    handleTimeChange(hours, minutes);
    setIsTimePickerOpen(false);
  };

  const handleTimePickerOk = () => {
    setIsTimePickerOpen(false);
  };

  // Close time picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        timePickerRef.current &&
        !timePickerRef.current.contains(event.target as Node)
      ) {
        setIsTimePickerOpen(false);
      }
    };

    if (isTimePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTimePickerOpen]);

  const handleSave = () => {
    if (!selectedDate) {
      setError("Please choose a date.");
      return;
    }

    const [hoursStr, minutesStr] = timeValue.split(":");
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      setError("Please provide a valid time.");
      return;
    }

    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(hours, minutes, 0, 0);

    if (isBefore(scheduledDate, new Date())) {
      setError("Please choose a future date and time.");
      return;
    }

    onConfirm(scheduledDate.getTime());
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Schedule Link Availability</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <div className="p-3 border border-border rounded-2xl">
            <Calendar
              selected={selectedDate}
              onSelect={setSelectedDate}
              mode="single"
              disabled={{ before: minDate }}
              captionLayout="dropdown"
              classNames={{
                today: selectedDate
                  ? "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground"
                  : "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
                day: "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none [&_button[data-selected-single=true]]:rounded-md",
              }}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Time</p>
              <div className="max-w-32">
                <label className="block mb-2 text-sm font-medium text-foreground">
                  Select time:
                </label>
                <div className="relative w-full" ref={timePickerRef}>
                  <input
                    type="text"
                    value={`${selectedHour.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`}
                    readOnly
                    className="py-2.5 sm:py-3 ps-4 pe-12 block w-full border border-border rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-input text-foreground"
                  />

                  <div className="absolute inset-y-0 end-0 flex items-center pe-3">
                    {/* Dropdown */}
                    <div className="relative inline-flex">
                      <button
                        type="button"
                        onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                        className="size-7 shrink-0 inline-flex justify-center items-center rounded-full bg-white text-gray-500 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        aria-haspopup="menu"
                        aria-expanded={isTimePickerOpen}
                        aria-label="Time picker"
                      >
                        <span className="sr-only">Time picker</span>
                        <svg
                          className="shrink-0 size-4"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </button>

                      {isTimePickerOpen && (
                        <div className="absolute right-0 top-full mt-2 min-w-30 bg-white border border-gray-200 shadow-xl rounded-2xl z-50 overflow-hidden">
                          <div className="flex flex-row divide-x divide-gray-200">
                            {/* Hours (24-hour format) */}
                            <div className="p-1 max-h-56 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                              {Array.from({ length: 24 }, (_, i) => i).map(
                                (hour) => (
                                  <label
                                    key={hour}
                                    className={`group relative flex justify-center items-center p-1.5 w-10 text-center text-sm cursor-pointer rounded-md hover:bg-gray-100 transition-colors ${
                                      selectedHour === hour
                                        ? "text-white bg-blue-600"
                                        : "text-gray-800 hover:text-gray-800"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      className="hidden"
                                      name="hour"
                                      value={hour}
                                      checked={selectedHour === hour}
                                      onChange={() =>
                                        handleTimeChange(hour, selectedMinute)
                                      }
                                    />
                                    <span className="block">
                                      {hour.toString().padStart(2, "0")}
                                    </span>
                                  </label>
                                ),
                              )}
                            </div>

                            {/* Minutes */}
                            <div className="p-1 max-h-56 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                              {Array.from({ length: 60 }, (_, i) => i).map(
                                (minute) => (
                                  <label
                                    key={minute}
                                    className={`group relative flex justify-center items-center p-1.5 w-10 text-center text-sm cursor-pointer rounded-md hover:bg-gray-100 transition-colors ${
                                      selectedMinute === minute
                                        ? "text-white bg-blue-600"
                                        : "text-gray-800 hover:text-gray-800"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      className="hidden"
                                      name="minute"
                                      value={minute}
                                      checked={selectedMinute === minute}
                                      onChange={() =>
                                        handleTimeChange(selectedHour, minute)
                                      }
                                    />
                                    <span className="block">
                                      {minute.toString().padStart(2, "0")}
                                    </span>
                                  </label>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="py-2 px-3 flex flex-wrap justify-between items-center gap-2 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={handleNowClick}
                              className="text-[13px] font-medium rounded-md bg-white text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:text-blue-700 cursor-pointer"
                            >
                              Now
                            </button>
                            <button
                              type="button"
                              onClick={handleTimePickerOk}
                              className="py-1 px-2.5 text-[13px] font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="mt-auto flex flex-col gap-2">
              <Button
                onClick={handleSave}
                className="rounded-2xl cursor-pointer"
              >
                Save Schedule
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  onConfirm(null);
                  onOpenChange(false);
                }}
                className="rounded-2xl cursor-pointer text-muted-foreground"
              >
                Clear Schedule
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleLinkModal;
