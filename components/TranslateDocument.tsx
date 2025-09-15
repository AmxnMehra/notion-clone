"use client";

import * as Y from "yjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { BotIcon, LanguagesIcon } from "lucide-react";

type Language =
  | "english"
  | "spanish"
  | "portuguese"
  | "french"
  | "german"
  | "chinese"
  | "arabic"
  | "hindi"
  | "russian"
  | "japanese";

const languages: Language[] = [
  "english",
  "spanish",
  "portuguese",
  "french",
  "german",
  "chinese",
  "arabic",
  "hindi",
  "russian",
  "japanese",
];

function TranslateDocument({ doc }: { doc: Y.Doc }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [summary, setSummary] = useState("");
  const [isPending, startTransition] = useTransition();

  // just vibe coded this and it actually works
  const cleanText = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const documentData = doc.get("document-store").toJSON();
        const cleanedText = cleanText(documentData);

        if (!cleanedText || cleanedText.length < 3) {
          toast.error("Document is empty or too short");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/translateDocument`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              documentData: cleanedText,
              targetLang: selectedLanguage,
              sourceLang: "english",
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          setSummary(data.translated_text);
          toast.success("Translation completed!");
        } else {
          const errText = await res.text();
          console.error("Server error", res.status, errText);
          toast.error(`Server error:${res.status}`);
        }
      } catch (error) {
        toast.error("Translation failed");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline">
        <DialogTrigger>
          <LanguagesIcon />
          Translate
        </DialogTrigger>
      </Button>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Translate the Document</DialogTitle>
          <DialogDescription>
            Select a language and AI will translate a summary of the document
          </DialogDescription>
          <hr className="mt-5" />
        </DialogHeader>

        {summary && (
          <div className="flex flex-col gap-3 p-4 bg-green-50 border border-green-200 rounded-lg max-h-80 overflow-y-auto">
            <div className="flex items-center gap-2">
              <BotIcon className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">
                Translated to{" "}
                {selectedLanguage.charAt(0).toUpperCase() +
                  selectedLanguage.slice(1)}
              </span>
            </div>
            <p className="text-green-700 leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          </div>
        )}

        <form className="flex gap-2" onSubmit={handleTranslate}>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={!selectedLanguage || isPending}>
            {isPending ? "Translating..." : "Translate"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TranslateDocument;
