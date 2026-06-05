import Image, { type ImageProps } from "next/image";
import type { CSSProperties } from "react";

type SmartImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

function isRemoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

export function SmartImage({ alt, className, fill, src, style, ...props }: SmartImageProps) {
  if (!isRemoteImage(src)) {
    return (
      <Image alt={alt} className={className} fill={fill} src={src} style={style} {...props} />
    );
  }

  const imageStyle: CSSProperties | undefined = fill
    ? {
        ...style,
        height: "100%",
        inset: 0,
        objectFit: style?.objectFit ?? "cover",
        position: "absolute",
        width: "100%",
      }
    : style;

  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} className={className} src={src} style={imageStyle} />;
}
