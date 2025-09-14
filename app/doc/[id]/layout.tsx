import RoomProvider from "@/components/RoomProvider";
import { auth } from "@clerk/nextjs/server";

export default async function DocLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  // Protect the route
  await auth.protect();

  const id = params.id; // access inside the body
  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
