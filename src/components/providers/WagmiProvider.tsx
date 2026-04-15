import { startaleConnector } from "@startale/app-sdk";
import { createConfig, http, WagmiProvider } from "wagmi";
import { soneium } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const config = createConfig({
  chains: [soneium],
  connectors: [startaleConnector()],
  transports: {
    [soneium.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
