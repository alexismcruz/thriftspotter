import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thrift Stores Near Me | ThriftSpotter",
  description: "Find thrift stores near your current location. Use your browser location to discover secondhand shops within 25 miles — free, no sign-up needed.",
  alternates: { canonical: "https://www.thriftspotter.com/near-me" },
};

export default function NearMeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
