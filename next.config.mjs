/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Prism Skincare storefront (static Vite build in public/store) is served at /store
  async rewrites() {
    return [
      { source: "/store", destination: "/store/index.html" },
      { source: "/store/", destination: "/store/index.html" },
    ]
  },
}

export default nextConfig
