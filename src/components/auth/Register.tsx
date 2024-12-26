"use client";

import { registerMember } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { signupFormSchema, SignupFormSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

const cloudinaryUploadPreset =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

function RegisterForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormSchema>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { image: "" },
  });

  const router = useRouter();
  const [imagePublicId, setImagePublicId] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageUploadSuccess = (result: any) => {
    if (typeof result.info === "object") {
      const { public_id, secure_url } = result.info;
      setImagePublicId(public_id);
      setPreview(secure_url);
      setValue("image", public_id); // Store the public_id instead of the file
    }
  };

  const removeImage = () => {
    setPreview(null);
    setImagePublicId("");
    setValue("image", "");
  };

  const onSubmitForm: SubmitHandler<SignupFormSchema> = async (data) => {
    try {
      // Create form data with the image public ID instead of the file
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email || "");
      formData.append("password", data.password);
      formData.append("image", imagePublicId); // Send public_id instead of file

      const { data: success, errors } = await registerMember(formData);

      if (errors) {
        toast({
          title: "Error",
          description: errors.map((e) => e.message).join(", "),
          variant: "destructive",
        });
        return;
      }

      if (success) {
        toast({
          title: "Success",
          description: "You have successfully signed up!",
        });
        router.push("/");
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Profile Picture */}
          <div className="space-y-2">
            <Label htmlFor="image">Profile Picture</Label>
            <div className="flex items-center justify-center w-full">
              {!preview ? (
                <CldUploadWidget
                  uploadPreset={cloudinaryUploadPreset}
                  signatureEndpoint="/api/sign-cloudinary-params"
                  onSuccess={handleImageUploadSuccess}
                  options={{
                    singleUploadAutoClose: true,
                    maxFiles: 1,
                  }}
                >
                  {({ open }) => (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => open?.()}
                      className="w-full h-32 border-dashed"
                    >
                      Upload Image
                    </Button>
                  )}
                </CldUploadWidget>
              ) : (
                <div className="relative w-32 h-32">
                  <Image
                    src={preview}
                    alt="Profile Picture"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-full">
                    <CldUploadWidget
                      uploadPreset={cloudinaryUploadPreset}
                      signatureEndpoint="/api/sign-cloudinary-params"
                      onSuccess={handleImageUploadSuccess}
                      options={{
                        singleUploadAutoClose: true,
                        maxFiles: 1,
                      }}
                    >
                      {({ open }) => (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => open?.()}
                          className="text-white mr-2"
                        >
                          Change
                        </Button>
                      )}
                    </CldUploadWidget>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeImage}
                      className="text-white"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {errors.image && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" /> {errors.image.message}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input {...register("name")} id="name" type="text" />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" /> {errors.name.message}
              </p>
            )}
          </div>

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

export default RegisterForm;
