import "./globals.css"

export const metadata = {
	title: "highchat",
	description: "send a message to your high school",
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className="absolute inset-0">{children}</body>
		</html>
	)
}
