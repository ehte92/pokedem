'use client';

import HolyLoader from 'holy-loader';
import { useTheme } from 'next-themes';

export type NextLoaderProps = {
  darkColor?: string;
  lightColor?: string;
  showSpinner?: boolean;
};
export const NextLoader = ({
  lightColor = 'gray.900',
  darkColor = 'gray.300',
  showSpinner = false,
}: NextLoaderProps) => {
  const { theme } = useTheme();
  const loaderColor = theme === 'dark' ? darkColor : lightColor;
  return (
    <HolyLoader
      height={2}
      zIndex={99999}
      color={loaderColor}
      showSpinner={showSpinner}
    />
  );
};
