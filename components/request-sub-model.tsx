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
import { trpc } from "@/lib/trpc/client";

interface RequestSubstituteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export default function RequestSubstituteModal({
  open,
  onOpenChange,
  onCreated,
}: RequestSubstituteModalProps) {
  const { data: locations = [] } = trpc.coverageRequests.getLocations.useQuery();
  const { data: classTypes = [] } = trpc.coverageRequests.getClassTypes.useQuery();
  const createRequest = trpc.coverageRequests.createRequest.useMutation();

  const [form, setForm] = useState({
    locationId: "",
    date: "",
    startTime: "",
    endTime: "",
    classTypeId: "",
    comment: "",
  });

  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    form.locationId && form.date && form.startTime && form.endTime && form.classTypeId;

  const handleSubmit = async () => {
    setError(null);
    try {
      await createRequest.mutateAsync({
        locationId: parseInt(form.locationId),
        classTypeId: parseInt(form.classTypeId),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        reason: form.comment || undefined,
      });
      handleCancel();
      onCreated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const handleCancel = () => {
    setForm({ locationId: "", date: "", startTime: "", endTime: "", classTypeId: "", comment: "" });
    setError(null);
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
              value={form.locationId}
              onValueChange={(val) => setForm((prev) => ({ ...prev, locationId: val }))}
            >
              <SelectTrigger className="w-full bg-white border-gray-200 text-gray-500">
                <SelectValue placeholder="Select studio" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={String(loc.id)}>
                    {loc.name}
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
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
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
                onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
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
                onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
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
              value={form.classTypeId}
              onValueChange={(val) => setForm((prev) => ({ ...prev, classTypeId: val }))}
            >
              <SelectTrigger className="w-full bg-white border-gray-200 text-gray-500">
                <SelectValue placeholder="Select class type" />
              </SelectTrigger>
              <SelectContent>
                {classTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
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
              onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
              className="bg-white border-gray-200 text-gray-700 resize-none min-h-[80px]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex-1">
              {error}
            </div>
          )}
          {!error && (
            <>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || createRequest.isPending}
                className="flex-1 bg-[#4a5e4a] hover:bg-[#3d4f3d] text-white font-medium rounded-lg disabled:opacity-50"
              >
                {createRequest.isPending ? "Submitting..." : "Submit Request"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </Button>
            </>
          )}
          {error && (
            <Button
              variant="outline"
              onClick={() => setError(null)}
              className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              Try Again
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
