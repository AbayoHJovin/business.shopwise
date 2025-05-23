
import React from 'react';
import { format } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Time options for the select input
const timeOptions = [
  "00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30",
  "04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00", "07:30",
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30",
];

const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  startTime: z.date({
    required_error: "Start time is required",
  }),
  endTime: z.date({
    required_error: "End time is required",
  }),
  note: z.string().optional(),
}).refine(data => {
  return data.endTime > data.startTime;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type FormValues = z.infer<typeof formSchema>;

type AddAvailabilityFormProps = {
  onSubmit: (data: { 
    id?: string; 
    startTime: Date; 
    endTime: Date; 
    note?: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    id: string;
    startTime: Date;
    endTime: Date;
    note?: string;
  };
};

// Helper function to combine date and time
const combineDateTime = (date: Date, timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

const AddAvailabilityForm = ({ onSubmit, onCancel, initialData }: AddAvailabilityFormProps) => {
  // Extract date and time from initial data if provided
  const initialDate = initialData?.startTime ? new Date(initialData.startTime) : new Date();
  const initialStartTime = initialData?.startTime ? new Date(initialData.startTime) : new Date();
  const initialEndTime = initialData?.endTime ? new Date(initialData.endTime) : new Date();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: initialDate,
      startTime: initialStartTime,
      endTime: initialEndTime,
      note: initialData?.note || "",
    },
  });

  const handleSubmit = (data: FormValues) => {
    onSubmit({
      id: initialData?.id,
      startTime: data.startTime,
      endTime: data.endTime,
      note: data.note,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(date);
                        
                        // Update start and end times to maintain the same time but on the new date
                        const currentStartTime = form.getValues("startTime");
                        const currentEndTime = form.getValues("endTime");
                        
                        const newStartTime = new Date(date);
                        newStartTime.setHours(
                          currentStartTime.getHours(),
                          currentStartTime.getMinutes(),
                          0, 0
                        );
                        
                        const newEndTime = new Date(date);
                        newEndTime.setHours(
                          currentEndTime.getHours(),
                          currentEndTime.getMinutes(),
                          0, 0
                        );
                        
                        form.setValue("startTime", newStartTime);
                        form.setValue("endTime", newEndTime);
                      }
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "h:mm a")
                        ) : (
                          <span>Select start time</span>
                        )}
                        <Clock className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-0" align="start">
                    <div className="h-60 overflow-y-auto p-2">
                      {timeOptions.map((time) => {
                        const date = form.getValues("date");
                        const timeDate = combineDateTime(date, time);
                        
                        return (
                          <Button
                            key={time}
                            variant="ghost"
                            className="w-full justify-start font-normal"
                            onClick={() => {
                              form.setValue("startTime", timeDate);
                              form.clearErrors("endTime");
                            }}
                          >
                            {format(timeDate, "h:mm a")}
                          </Button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "h:mm a")
                        ) : (
                          <span>Select end time</span>
                        )}
                        <Clock className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-0" align="start">
                    <div className="h-60 overflow-y-auto p-2">
                      {timeOptions.map((time) => {
                        const date = form.getValues("date");
                        const timeDate = combineDateTime(date, time);
                        
                        return (
                          <Button
                            key={time}
                            variant="ghost"
                            className="w-full justify-start font-normal"
                            onClick={() => form.setValue("endTime", timeDate)}
                          >
                            {format(timeDate, "h:mm a")}
                          </Button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add additional information about this availability slot"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add any special instructions or information about this time slot.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Availability' : 'Add Availability'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddAvailabilityForm;
