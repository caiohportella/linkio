"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    if (isOpen) {
      if (initialValue) {
        const date = new Date(initialValue);
        setSelectedDate(date);
        setTimeValue(
          `${date.getHours().toString().padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
        );
      } else {
        const now = new Date();
        setSelectedDate(now);
        setTimeValue(
          `${now.getHours().toString().padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
        );
      }
      setError(null);
    }
  }, [initialValue, isOpen]);

  const minDate = useMemo(() => startOfDay(new Date()), []);

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
            />
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">
                Time
              </p>
              <div className="max-w-[9.5rem]">
                <label className="block mb-2 text-sm font-medium text-foreground">
                  Select time:
                </label>
                <div className="flex shadow-sm">
                  <input
                    type="time"
                    value={timeValue}
                    onChange={(e) => setTimeValue(e.target.value)}
                    className="rounded-l-2xl rounded-r-none bg-input border border-border text-foreground leading-none focus:ring-2 focus:ring-primary focus:border-primary block flex-1 w-full text-sm p-2.5"
                    required
                  />
                  <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-background border border-l-0 border-border rounded-r-2xl">
                    <svg
                      className="w-4 h-4"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="mt-auto flex flex-col gap-2">
              <Button onClick={handleSave} className="rounded-2xl cursor-pointer">
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
