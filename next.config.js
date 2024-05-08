/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  eslint: {
    dirs: ['api/', 'app/', 'components/', 'lib/'],
  },
};

module.exports = nextConfig;
