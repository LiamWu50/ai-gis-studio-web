"use client";

import type { ReactNode } from "react";

type MarkdownTextProps = {
  text: string;
};

type InlineToken = {
  text: string;
  strong: boolean;
};

const parseInline = (text: string): InlineToken[] => {
  const tokens: InlineToken[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      tokens.push({ text: text.slice(lastIndex, match.index), strong: false });
    }

    tokens.push({ text: match[1] ?? "", strong: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push({ text: text.slice(lastIndex), strong: false });
  }

  return tokens.length ? tokens : [{ text, strong: false }];
};

const renderInline = (text: string) =>
  parseInline(text).map((token, index) =>
    token.strong ? (
      <strong className="font-semibold" key={index}>
        {token.text}
      </strong>
    ) : (
      <span key={index}>{token.text}</span>
    ),
  );

const isListItem = (line: string) => /^\s*(?:[-*+]|\d+\.)\s+/.test(line);

const stripListMarker = (line: string) =>
  line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, "");

const renderParagraph = (lines: string[], key: string) => (
  <p className="whitespace-pre-wrap" key={key}>
    {lines.flatMap((line, index) => {
      const nodes: ReactNode[] = [];
      if (index > 0) nodes.push(<br key={`${key}-br-${index}`} />);
      nodes.push(
        <span key={`${key}-line-${index}`}>{renderInline(line)}</span>,
      );
      return nodes;
    })}
  </p>
);

const renderList = (lines: string[], key: string) => (
  <ul className="space-y-1 pl-4" key={key}>
    {lines.map((line, index) => (
      <li className="list-disc pl-1" key={`${key}-${index}`}>
        {renderInline(stripListMarker(line))}
      </li>
    ))}
  </ul>
);

export function MarkdownText({ text }: MarkdownTextProps) {
  const blocks: ReactNode[] = [];
  const pendingParagraph: string[] = [];
  const pendingList: string[] = [];

  const flushParagraph = () => {
    if (!pendingParagraph.length) return;
    blocks.push(renderParagraph([...pendingParagraph], `p-${blocks.length}`));
    pendingParagraph.length = 0;
  };

  const flushList = () => {
    if (!pendingList.length) return;
    blocks.push(renderList([...pendingList], `list-${blocks.length}`));
    pendingList.length = 0;
  };

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    if (isListItem(line)) {
      flushParagraph();
      pendingList.push(line);
      continue;
    }

    flushList();
    pendingParagraph.push(line);
  }

  flushParagraph();
  flushList();

  return <div className="space-y-3">{blocks}</div>;
}
