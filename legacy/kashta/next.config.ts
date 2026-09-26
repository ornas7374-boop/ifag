import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // صور المضيفين تُقرأ من حاوية Supabase Storage العامة (0017)،
    // ورابطها يتضمن معرّف المشروع فيتغيّر بين البيئات — نمط عام
    // على نطاق supabase.co بدل معرّف مشروع مُثبَّت في الكود.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;
