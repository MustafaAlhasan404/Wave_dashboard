"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Check, User, Mail, KeyRound, Shield, UserPlus } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";
import { authApi } from "@/lib/api/client";
import { useRouter } from "next/navigation";

// Define form validation schema
const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmedPassword: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "EMPLOYEE", "USER"], {
    required_error: "Please select a role",
  }),
}).refine((data) => data.password === data.confirmedPassword, {
  message: "Passwords do not match",
  path: ["confirmedPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function AddEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmedPassword: "",
      role: "EMPLOYEE",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await authApi.createUser(data);
      
      if (response.success) {
        toast.success("Employee added successfully");
        // Reset form after successful submission
        form.reset();
      } else {
        toast.error(response.message || "Failed to add employee");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/employees');
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add New Employee</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCancel}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </Button>
      </div>
      
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create New User</CardTitle>
              <CardDescription className="mt-1.5">
                Add a new employee, user, or admin to the system
              </CardDescription>
            </div>
            <UserPlus className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="px-6 space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} className="h-10" />
                      </FormControl>
                      <FormDescription className="text-xs">
                        The display name for this user
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} className="h-10" />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Email address for login and notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmedPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <Check className="h-4 w-4 text-muted-foreground" />
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm password" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-between h-full">
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        Role
                      </FormLabel>
                      <div className="mt-auto">
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              style={{
                                backgroundColor: field.value === "USER" 
                                  ? "#efffef" // Light green
                                  : field.value === "EMPLOYEE" 
                                  ? "#edf5ff" // Light blue
                                  : "#fff0f0", // Light red
                                color: field.value === "USER"
                                  ? "#166534" // Dark green
                                  : field.value === "EMPLOYEE"
                                  ? "#1e40af" // Dark blue
                                  : "#991b1b", // Dark red
                                borderRadius: "0.75rem",
                                padding: "0.35rem 0.75rem",
                                minHeight: "36px",
                                maxWidth: "fit-content",
                                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                                fontWeight: "500",
                                fontSize: "0.875rem",
                                border: "none"
                              }}
                              className="hover:opacity-90 transition-opacity"
                            >
                              <span>{field.value}</span>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ADMIN" className="flex items-center">
                              ADMIN
                            </SelectItem>
                            <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                            <SelectItem value="USER">USER</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col justify-between h-full">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <span>Action</span>
                  </div>
                  <div className="mt-auto">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      style={{
                        borderRadius: "0.75rem",
                        padding: "0.35rem 1.5rem",
                        minHeight: "36px",
                        maxWidth: "fit-content",
                        fontSize: "0.875rem",
                        fontWeight: "500"
                      }}
                      className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingDots size={4} color="currentColor" className="mr-1" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          <span>Create User</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="px-6 py-4 border-t flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            All fields are required to create a new user
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => form.reset()}
            disabled={isSubmitting}
            className="h-8"
          >
            Reset Form
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 