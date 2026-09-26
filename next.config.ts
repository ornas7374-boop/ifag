import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    // المحادثة انتقلت إلى الرئيسية في PHASE 2 — الرابط القديم يبقى صالحًا.
    return [{ source: "/chat", destination: "/", permanent: false }];
  },
};

export default nextConfig;
