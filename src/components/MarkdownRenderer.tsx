import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split into blocks by double newlines or single newlines that form block separations
  const blocks = content.split(/\n\s*\n/);

  const parseInline = (text: string): React.ReactNode[] => {
    // Matches **bold**
    const parts = text.split(/(\*\*[^*.]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-extrabold text-[#3C3C3C]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const isTable = (block: string): boolean => {
    const trimmed = block.trim();
    return trimmed.startsWith("|") && trimmed.includes("\n|");
  };

  const renderTable = (block: string) => {
    const lines = block.trim().split("\n");
    const rows = lines
      .map((line) =>
        line
          .split("|")
          .map((cell) => cell.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      )
      .filter((row) => row.length > 0);

    if (rows.length === 0) return null;

    // Check if second line is a separator (like |---|---|)
    const hasSeparator = lines[1] && lines[1].includes("---");
    const headers = hasSeparator ? rows[0] : null;
    const dataRows = hasSeparator ? rows.slice(2) : rows;

    return (
      <div className="overflow-x-auto my-4 border-2 border-[#E5E5E5] rounded-2xl bg-white shadow-sm select-text">
        <table className="w-full text-left text-xs border-collapse">
          {headers && (
            <thead>
              <tr className="bg-[#FAF6EC] border-b-2 border-[#E5E5E5]">
                {headers.map((header, i) => (
                  <th
                    key={i}
                    className="p-3 font-black text-[#3C3C3C] border-r border-[#E5E5E5] last:border-0 uppercase tracking-wider text-[10px]"
                  >
                    {parseInline(header)}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {dataRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAF6EC]/30 transition-colors"
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className="p-2 sm:p-3 font-semibold text-slate-700 border-r border-[#E5E5E5] last:border-0"
                  >
                    {parseInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-3.5 select-text text-left">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Table
        if (isTable(block)) {
          return <React.Fragment key={bIdx}>{renderTable(block)}</React.Fragment>;
        }

        // 2. Headings
        if (trimmed.startsWith("##### ")) {
          return (
            <h5
              key={bIdx}
              className="font-display font-black text-xs text-[#3C3C3C] mt-4 mb-1.5 uppercase tracking-wide"
            >
              {parseInline(trimmed.slice(6))}
            </h5>
          );
        }
        if (trimmed.startsWith("#### ")) {
          return (
            <h4
              key={bIdx}
              className="font-display font-black text-xs sm:text-sm text-[#FF9600] mt-3 mb-1"
            >
              {parseInline(trimmed.slice(5))}
            </h4>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={bIdx}
              className="font-display font-black text-sm sm:text-base text-[#3C3C3C] mt-4 mb-2 border-b border-[#E5E5E5] pb-1"
            >
              {parseInline(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={bIdx}
              className="font-display font-black text-base sm:text-lg text-[#3C3C3C] mt-5 mb-2.5 border-b-2 border-[#E5E5E5] pb-1.5"
            >
              {parseInline(trimmed.slice(3))}
            </h2>
          );
        }

        // 3. Bullet list
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          const listItems = trimmed.split("\n").map((line, lIdx) => {
            const cleaned = line.replace(/^[\s*-]+/, "").trim();
            return (
              <li
                key={lIdx}
                className="relative pl-4 text-slate-600 font-semibold mb-1 text-[11px] sm:text-xs"
              >
                <span className="absolute left-1 top-2 w-1.5 h-1.5 rounded-full bg-[#FF9600]" />
                {parseInline(cleaned)}
              </li>
            );
          });
          return (
            <ul key={bIdx} className="my-2.5 space-y-1">
              {listItems}
            </ul>
          );
        }

        // 4. Default Paragraph
        const lines = trimmed.split("\n");
        return (
          <p
            key={bIdx}
            className="leading-relaxed text-slate-650 font-semibold text-[11px] sm:text-xs"
          >
            {lines.map((line, lIdx) => (
              <span key={lIdx} className="block mt-0.5 first:mt-0">
                {parseInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
