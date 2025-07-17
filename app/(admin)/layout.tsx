import Navbar from "@/components/Navbar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      <main className="max-w-7xl lg:mx-auto pt-28 px-4 xl:px-0">
        {children}
      </main>
    </div>
  );
}
