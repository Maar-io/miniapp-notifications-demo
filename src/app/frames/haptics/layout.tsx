import { Metadata } from "next";
import { Providers } from "~/app/providers";

const frame = {
  version: "next",
  imageUrl: `https://farcaster.xyz/og-logo.png`,
  button: {
    title: "Launch haptics",
    action: {
      type: "launch_frame",
      name: "StartaleApp Haptics Demo",
      splashImageUrl: `https://frames-v2.vercel.app/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "StartaleApp Haptics Demo",
    openGraph: {
      title: "StartaleApp Haptics Demo",
      description: "A StartaleApp Haptics demo miniapp.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  }
  