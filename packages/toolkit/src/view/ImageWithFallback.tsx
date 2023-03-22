import Image from "next/image";
import { ReactElement, useState } from "react";

export type ImageWithFallbackProps = {
  src: string;
  fallbackImg: ReactElement;
  alt: string;
  width: number;
  height: number;
};

export const ImageWithFallback = ({
  src,
  fallbackImg,
  alt,
  width,
  height,
}: ImageWithFallbackProps) => {
  const [error, setError] = useState(false);
  return error ? (
    fallbackImg
  ) : (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt}
      onError={() => {
        setError(true);
      }}
    />
  );
};
