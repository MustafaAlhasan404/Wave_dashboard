import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'picsum.photos',
      'loremflickr.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'randomuser.me',
      'avatars.githubusercontent.com',
      'drive.google.com',
      'lh3.googleusercontent.com',
      'storage.googleapis.com',
      'googleusercontent.com'
    ]
  },
};

export default nextConfig;
