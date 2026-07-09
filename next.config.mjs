/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "https", hostname: "i.ebayimg.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      // Deleted duplicate Silverlake Flea listing → surviving listing
      {
        source: "/shop/silverlake-flea-w-sunset-blvd-los-angeles-ca",
        destination: "/shop/silverlake-flea-los-angeles-ca",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
