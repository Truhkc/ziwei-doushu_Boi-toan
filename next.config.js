/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lunar-javascript'],
  experimental: {
    // Ghi nhận rằng bản Next.js đang dùng đã được nâng theo khuyến nghị bảo
    // mật, để `next dev` thôi dừng lại nhắc ở mỗi lần khởi động.
    agentUpgrade: 'security',
  },
};

module.exports = nextConfig;
