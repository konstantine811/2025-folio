import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CalendarDatePicker } from "./calendar-date-picker";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const FormSchema = z.object({
  calendar: z.object({
    from: z.date(),
    to: z.date(),
  }),
  datePicker: z.object({
    from: z.date(),
    to: z.date(),
  }),
});

const CardDatePicker = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      calendar: {
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
      },
      datePicker: {
        from: new Date(),
        to: new Date(),
      },
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    toast(
      `1. Date range: ${data.calendar.from.toDateString()} - ${data.calendar.to.toDateString()}
      \n2. Single date: ${data.datePicker.from.toDateString()}`
    );
  };
  return (
    <Card className="w-[400px] p-4 m-8">
      <CardHeader>
        <CardTitle className="text-3xl font-semibold">
          Calendar Date Picker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="calendar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-md font-normal">
                      Date Range
                    </FormLabel>
                    <FormControl className="w-full">
                      <CalendarDatePicker
                        date={field.value}
                        onDateSelect={({ from, to }) => {
                          form.setValue("calendar", { from, to });
                        }}
                        variant="outline"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="datePicker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-md font-normal">
                      Single Date
                    </FormLabel>
                    <FormControl className="w-full">
                      <CalendarDatePicker
                        date={field.value}
                        onDateSelect={({ from, to }) => {
                          form.setValue("datePicker", { from, to });
                        }}
                        variant="outline"
                        numberOfMonths={1}
                        className="min-w-[250px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button variant="default" type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CardDatePicker;
