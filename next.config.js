/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverActions: true,
		serverComponentsExternalPackages: ["libsql"],
	},
	reactStrictMode: false,
	webpack: (config, { isServer }) => {
		if (isServer)
			config.resolve.fallback = {
				...config.resolve.fallback,
				crypto: require.resolve("crypto-browserify"),
				stream: require.resolve("stream-browserify"),
				buffer: require.resolve("buffer-browserify"),
			}

		return config
	},
}

module.exports = nextConfig
