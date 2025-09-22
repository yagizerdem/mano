import Editor, { type BeforeMount } from "@monaco-editor/react";
import { useAppContext } from "../context/AppContext";
import { sampleCode } from "../sampleCode";

function ManoEditor() {
  const { program, setProgram } = useAppContext();

  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.languages.register({ id: "mano" });

    monaco.languages.setMonarchTokensProvider("mano", {
      defaultToken: "",
      tokenizer: {
        root: [
          [
            /\b(AND|ADD|LDA|STA|BUN|BSA|ISZ|CLA|CLE|CMA|CME|CIR|CIL|INC|SPA|SNA|SZA|SZE|HLT|INP|OUT|SKI|SKO|ION|IOF|ORG|END|HEX|DEC)\b/,
            "KEYWORD",
          ],
          [/\b[0-9]+\b/, "NUMBER_DEC"],
          [/\b[0-9A-F]+H\b/, "NUMBER_HEX"],
          [/,I\b/, "INDIRECTION"],
          [/[A-Z_][A-Z0-9_]*/, "IDENTIFIER"],
        ],
      },
    });

    monaco.editor.defineTheme("mano-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "IDENTIFIER", foreground: "9CDCFE" },
        { token: "KEYWORD", foreground: "C586C0", fontStyle: "bold" },
        { token: "NUMBER_DEC", foreground: "B5CEA8" },
        { token: "NUMBER_HEX", foreground: "D69D85" },
        { token: "INDIRECTION", foreground: "FFD700", fontStyle: "italic" },
      ],
      colors: {}, // vs-dark'ın tüm arka planı zaten siyah
    });
  };

  async function importProgram() {
    try {
      // File chooser aç
      const [handle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: "Text file",
            accept: { "text/plain": [".txt"] },
          },
        ],
        multiple: false,
      });

      const file = await handle.getFile();
      const text = await file.text();

      setProgram(text);
    } catch (err) {
      console.log("Import canceled", err);
    }
  }

  async function exportProgram() {
    try {
      const blob = new Blob([program], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "program.txt"; // default file name
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  }

  function loadSampleProgram() {
    setProgram(sampleCode);
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-start gap-3 p-1 h-8 ">
        <button
          className="flex items-center justify-center cursor-pointer px-3 py-1 bg-primary-800 text-primary-300 rounded h-4 hover:bg-primary-700 transition-all duration-500"
          onMouseUp={() => importProgram()}
        >
          Import
        </button>
        <button
          className="flex items-center justify-center cursor-pointer px-3 py-1 bg-primary-800 text-primary-300 rounded h-4 hover:bg-primary-700 transition-all duration-500"
          onMouseUp={() => exportProgram()}
        >
          Export
        </button>

        <button
          className="flex items-center justify-center cursor-pointer px-3 py-1 bg-primary-800 text-primary-300 rounded h-4 hover:bg-primary-700 transition-all duration-500"
          onMouseUp={() => loadSampleProgram()}
          style={{
            fontSize: "8px",
          }}
        >
          Load Sample
        </button>
      </div>

      {/* Altta editor */}
      <div className="flex-1">
        <Editor
          defaultLanguage="mano"
          theme="mano-dark"
          beforeMount={handleBeforeMount}
          value={program}
          onChange={(value) => setProgram(value || "")}
        />
      </div>
    </div>
  );
}

export { ManoEditor };
