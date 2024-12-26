"use client";

import { signinWithCreds } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast"; // Assuming shadcn's toast hook
import { SigninFormSchema, signinFormSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";

function Signin() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormSchema>({
    resolver: zodResolver(signinFormSchema),
    defaultValues: {},
  });
  const router = useRouter();

  // const onSubmitForm: SubmitHandler<SigninFormSchema> = async (data) => {
  //   const formData = new FormData();
  //   formData.append("email", data.email || "");
  //   formData.append("password", data.password);

  //   try {
  //     const { data: success, errors } = await signinWithCreds(formData);

  //     console.log(success, errors);
  //     if (errors) {
  //       console.log(errors);
  //       toast({
  //         title: "Error",
  //         description: errors.map((e) => e.message).join(", "),
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     if (success) {
  //       toast({
  //         title: "Success",
  //         description: "You have successfully signed up!",
  //       });
  //       router.push("/");
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     toast({
  //       title: "Something went wrong",
  //       description: "Please try again later.",
  //       variant: "destructive",
  //     });
  //   }
  // };
  const onSubmitForm: SubmitHandler<SigninFormSchema> = async (data) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    const { data: success, errors } = await signinWithCreds(formData);
    if (errors) {
      toast({
        title: "Error",
        description: Array.isArray(errors)
          ? errors[0].message.split("Read")[0]
          : "Something went wrong",
        variant: "destructive",
      });
      return;
    }

    if (success)
      toast({
        title: "Success",
        description: "You have successfully signed up!",
      });

    router.push("/");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input {...register("email")} id="email" type="email" />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" /> {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input {...register("password")} id="password" type="password" />
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" />{" "}
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Loading..." : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default Signin;
