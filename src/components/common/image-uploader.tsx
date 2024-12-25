// components/avatar-uploader.tsx
"use client";

import { CldUploadWidget } from "next-cloudinary";

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
}

const cloudinaryUploadPreset =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

export function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
  return (
    <CldUploadWidget
      uploadPreset={cloudinaryUploadPreset}
      signatureEndpoint="/api/sign-cloudinary-params"
      onSuccess={(result) => {
        if (typeof result.info === "object" && "secure_url" in result.info) {
          console.log(result.info.public_id);
          onUploadSuccess(result.info.secure_url);
        }
      }}
      options={{
        singleUploadAutoClose: true,
      }}
    >
      {({ open }) => {
        return (
          <button
            type="button"
            onClick={() => open()}
            className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Upload Avatar
          </button>
        );
      }}
    </CldUploadWidget>
  );
}
