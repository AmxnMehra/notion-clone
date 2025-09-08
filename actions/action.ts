"use server";

import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";

export async function createNewDocument() {
  await auth.protect();

  const { sessionClaims } = await auth();

  const docCollectionRef = adminDb.collection("documents");
  const docRef = await docCollectionRef.add({
    title: "New Doc",
  });

  try {
    await adminDb
      .collection("users")
      .doc(sessionClaims?.email!)
      .collection("rooms")
      .doc(docRef.id)
      .set({
        userId: sessionClaims?.email!,
        role: "owner",
        createdAt: new Date(),
        roomId: docRef.id,
      });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
  return { docId: docRef.id };
}
