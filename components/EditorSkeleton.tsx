import { cn } from "@/lib/utils"; // optional helper if you use shadcn/ui

function EditorSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-1/3 rounded bg-gray-300 dark:bg-gray-700" />
      <div className="h-6 w-2/3 rounded bg-gray-300 dark:bg-gray-700" />
      <div className="h-6 w-1/2 rounded bg-gray-300 dark:bg-gray-700" />
      <div className="h-24 w-full rounded bg-gray-300 dark:bg-gray-700" />
      <div className="h-6 w-2/3 rounded bg-gray-300 dark:bg-gray-700" />
      <div className="h-6 w-1/3 rounded bg-gray-300 dark:bg-gray-700" />
    </div>
  );
}

export default EditorSkeleton;
