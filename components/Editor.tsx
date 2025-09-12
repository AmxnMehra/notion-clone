"use client";

import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useEffect, useState } from "react";
import * as Y from "yjs";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import stringToColor from "@/lib/stringToColor";
import TranslateDocument from "./TranslateDocument";

// Types

type EditorProps = {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
  darkMode: boolean;
};

type InnerProps = EditorProps & {
  userInfo: { name: string; email: string };
};

// BlockNoteInner  creates editor once we have userInfo

function BlockNoteInner({ doc, provider, darkMode, userInfo }: InnerProps) {
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);

  useEffect(() => {
    const editorInstance = BlockNoteEditor.create({
      collaboration: {
        provider,
        fragment: doc.getXmlFragment("document-store"),
        user: {
          name: userInfo.name,
          color: stringToColor(userInfo.email),
        },
      },
    });

    setEditor(editorInstance);

    return () => {
      setEditor(null); // cleanup state
    };
  }, [doc, provider, userInfo]);

  if (!editor) return <div>Loading editor…</div>;

  return (
    <div className="relative max-w-6xl mx-auto">
      <BlockNoteView
        className="min-h-screen"
        editor={editor}
        theme={darkMode ? "dark" : "light"}
      />
    </div>
  );
}

//
// BlockNote wrapper waits for userInfo

function BlockNote({ doc, provider, darkMode }: EditorProps) {
  const userInfo = useSelf((me) => me.info);

  if (!userInfo?.name || !userInfo?.email) {
    return <div>Loading user…</div>;
  }

  return (
    <BlockNoteInner
      doc={doc}
      provider={provider}
      darkMode={darkMode}
      userInfo={{ name: userInfo.name, email: userInfo.email }}
    />
  );
}

// Editor main component

function Editor() {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<LiveblocksYjsProvider>();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);

    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yDoc.destroy();
      yProvider.destroy();
    };
  }, [room]);

  if (!doc || !provider) {
    return <div>Loading room…</div>;
  }

  const style = `hover:text-white ${darkMode
    ? "text-gray-300 bg-gray-700 hover:bg-gray-100 "
    : "text-gray-700 bg-gray-200 hover:bg-gray-300 "
    }`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 justify-end mb-10">
        <TranslateDocument doc={doc} />
        {/* Dark mode toggle */}
        <Button className={style} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>

      {/* BlockNote editor */}
      <BlockNote doc={doc} provider={provider} darkMode={darkMode} />
    </div>
  );
}

export default Editor;
