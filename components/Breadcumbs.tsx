"use client";

import { usePathname } from "next/navigation";

function Breadcumbs() {
  const path = usePathname();

  return <div>Breadcumbs</div>;
}
export default Breadcumbs;
