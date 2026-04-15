import { Metadata } from "next";
import App from "./app";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "StartaleApp Demo",
  description: "A StartaleApp demo miniapp",
  openGraph: {
    title: "StartaleApp Demo",
    description: "A StartaleApp demo miniapp",
  },
};

export default function Home() {
  return (
    <App />
  );
}
