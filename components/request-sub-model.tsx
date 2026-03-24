"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STUDIO_LOCATIONS = [
  "Carrboro Studio",
  "Durham Studio",
  "Chapel Hill Studio",
];

const CLASS_TYPES = [
  "Vinyasa",
  "Vin to Yin",
  "Yogatha Sadhana",
  "Ashtanga",
  "Accessible Ashtanga",
  "Yin",
  "Somatic Flow",
  "Hatha",
  "Slow Flow",
  "Meditation and Flow",
  "Sculpt Flow",
  "Core Barre",
  "Mat Pilates",
  "Strength and Conditioning",
  "Other",
];

interface RequestSubstituteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RequestSubstituteModal({
  open,
  onOpenChange,
}: RequestSubstituteModalProps) {
  const [form, setForm] = useState({
    studioLocation: "",
    date: "",
    startTime: "",
    endTime: "",
    classType: "",
    comment: "",
  });

  const handleSubmit = () => {
    // TODO: wire to Supabase
    console.log("Submitting request:", form);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setForm({
      studioLocation: "",
      date: "",
      startTime: "",
      endTime: "",
      classType: "",
      comment: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Request Substitute
          </DialogTitle>
        </DialogHeader>

        <div className="bg-gray-50 rounded-xl p-4 mb-2">
          <p className="text-sm font-medium text-gray-700">Sub Request Details</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Fill out the form below to request a substitute teacher
          </p>
        </div>

        <div className="space-y-4">
          {/* Studio Location */}
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-700">
              Studio Location <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.studioLocation}
              onValueChange={(val) =>
                setForm((prev) => ({ ...prev, studioLocation: val }))
              }
            >
              <SelectTrigger className="w-full bg-white border-gray-200 text-gray-500">
                <SelectValue placeholder="Select studio" />
              </SelectTrigger>
              <SelectContent>
                {STUDIO_LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-700">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, date: e.target.value }))
              }
              className="bg-white border-gray-200 text-gray-700"
            />
          </div>

          {/* Start Time + End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-700">
                Start Time <span className="text-red-500">*</span>
              </Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startTime: e.target.value }))
                }
                className="bg-white border-gray-200 text-gray-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-700">
                End Time <span className="text-red-500">*</span>
              </Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endTime: e.target.value }))
                }
                className="bg-white border-gray-200 text-gray-700"
              />
            </div>
          </div>

          {/* Class Type */}
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-700">
              Class Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.classType}
              onValueChange={(val) =>
                setForm((prev) => ({ ...prev, classType: val }))
              }
            >
              <SelectTrigger className="w-full bg-white border-gray-200 text-gray-500">
                <SelectValue placeholder="Select class type" />
              </SelectTrigger>
              <SelectContent>
                {CLASS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-700">Comment (Optional)</Label>
            <Textarea
              placeholder="Add any additional context or notes..."
              value={form.comment}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, comment: e.target.value }))
              }
              className="bg-white border-gray-200 text-gray-700 resize-none min-h-[80px]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-[#4a5e4a] hover:bg-[#3d4f3d] text-white font-medium rounded-lg"
          >
            Submit Request
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
