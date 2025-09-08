"use client";

import Document from "@/components/Document";
import React from "react";

function DocumentPage({
  params: paramsPromise,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const params = React.use(paramsPromise); // Unwrap the params Promise
  const { id } = params;

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Document id={id} />
    </div>
  );
}

export default DocumentPage;

