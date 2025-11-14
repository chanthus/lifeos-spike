/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@project/shared',
    '@project/api',
    '@project/ui',
    'react-native-web',
    'react-native-reanimated',
    'react-native-svg',
    'react-native-screens',
    'nativewind',
    'react-native-css-interop'
  ],
  webpack: (config, options) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
      'lucide-react-native': 'lucide-react',
    };
    config.resolve.extensions = [
      '.web.js',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];

    if (!config.plugins) {
      config.plugins = [];
    }

    config.plugins.push(
      new options.webpack.DefinePlugin({
        __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      })
    );

    return config;
  },
};

export default nextConfig;
