"use client";

import { ConfigOptions, ImageOptions } from "@cloudinary-util/url-loader";
import { CldImage } from "next-cloudinary";
import { ImageProps } from "next/image";
import { JSX, RefAttributes } from "react";

const ImageViewer = ({
  ...props
}: JSX.IntrinsicAttributes &
  Omit<ImageProps, "src" | "quality"> &
  ImageOptions & {
    config?: ConfigOptions;
    src: string;
    unoptimized?: boolean;
  } & RefAttributes<HTMLImageElement>) => {
  return <CldImage {...props} />;
};

export default ImageViewer;
