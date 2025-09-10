"use server";

import DeleteDocument from "@/components/DeleteDocument";
import { adminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { Delete } from "lucide-react";

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

    return { success: true, docId: docRef.id }; // Return docId here
  } catch (error) {
    console.error(error);
    return { success: false, docId: null };
  }
}

// DeleteDocument
export default async function deleteDocument(roomId: string) {
  auth.protect(); // Ensure the user is Authenticated

  console.log("deleteDocument", roomId);

  try {
    // delte the documet refrence itself
    await adminDb.collection("documents").doc(roomId).delete();
    const query = await adminDb
      .collectionGroup("rooms")
      .where("roomId", "==", roomId)
      .get();

    const batch = adminDb.batch();

    //delete the room reference in the user's collection for every user in the room
    query.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // delete the room in liveblocks
    await liveblocks.deleteRoom(roomId);
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

// inviteUserToDocument
export async function inviteUserToDocument(roomId: string, email: string) {
  await auth.protect(); // Ensure the user is Authenticated
  console.log("inviteUserToDocument", roomId, email);

  try {
    await adminDb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .set({
        userId: email,
        role: "editor",
        createdAt: new Date(),
        roomId,
      });

    await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: ["room:write"],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Invite failed:", error);
    return { success: false };
  }
}

// removeUserFromTheDocument
export async function removeUserFromDocument(roomId: string, email: string) {
  await auth.protect(); // Ensure the user is Authenticated
  console.log("removeUserFromDocument", roomId, email);

  try {
    await adminDb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .delete();

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}
