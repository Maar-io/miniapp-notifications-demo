export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    miniapp: {
      version: "1",
      name: "StartaleApp Demo",
      description: "Demo miniapp for StartaleApp showcasing wallet, signing, and notifications",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/opengraph-image`,
      buttonTitle: "Launch Demo",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl: `${appUrl}/api/webhook`,
      primaryCategory: "developer-tools",
      tags: ["demo", "wallet", "notifications", "startale", "soneium"],
    },
  };

  return Response.json(config);
}
