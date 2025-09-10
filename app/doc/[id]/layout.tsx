import RoomProvider from "@/components/RoomProvider";
import { auth } from "@clerk/nextjs/server";

export default async function DocLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  // Protect the route
  await auth.protect();

  const id = params.id; // access inside the body
  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
