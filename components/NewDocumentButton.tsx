"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useTransition } from "react";
import { createNewDocument } from "@/actions/action";

function NewDocumentButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateNewFunction = () => {
    // create a new document
    startTransition(async () => {
      const { docId } = await createNewDocument();
      router.push(`/doc/${docId}`);
    });
  };
  return (
    <Button onClick={handleCreateNewFunction} disabled={isPending}>
      {isPending ? "creating..." : "New Document"}
    </Button>
  );
}
export default NewDocumentButton;
