import React, { useEffect, useState } from 'react';

import Image, { ImageProps } from 'next/image';

interface LazyImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  lowResSrc?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, lowResSrc, ...props }) => {
  const [imageSrc, setImageSrc] = useState(lowResSrc || src);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
    };
  }, [src]);

  return (
    <div className={`relative ${loading ? 'animate-pulse' : ''}`}>
      <Image
        {...props}
        src={imageSrc}
        className={`transition-opacity duration-300 ${
          loading ? 'opacity-50' : 'opacity-100'
        } ${props.className || ''}`}
        alt={props.alt || 'Pokemon image'}
      />
    </div>
  );
};

export default LazyImage;
