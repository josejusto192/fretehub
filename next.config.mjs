/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent bundling of server-only Prisma client into client bundles
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Suppress deprecation warnings from @supabase/auth-helpers-nextjs
  // (kept as a transitive dependency; using @supabase/ssr directly instead)
};

export default nextConfig;
