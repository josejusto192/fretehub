"use client";

import { useState } from "react";
import { Activity, MessageSquare } from "lucide-react";

interface Props {
  progresso: React.ReactNode;
  chat: React.ReactNode;
  mensagensNaoLidas?: number;
}

export function AcompanharLayout({ progresso, chat, mensagensNaoLidas = 0 }: Props) {
  const [tab, setTab] = useState<"progresso" | "chat">("progresso");

  return (
    <>
      {/* Mobile tab bar */}
      <div className="lg:hidden flex bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <button
          onClick={() => setTab("progresso")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
            tab === "progresso"
              ? "bg-blue-900 text-white"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Activity className="w-4 h-4" />
          Progresso
        </button>
        <button
          onClick={() => setTab("chat")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all relative ${
            tab === "chat"
              ? "bg-blue-900 text-white"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Mensagens
          {mensagensNaoLidas > 0 && tab !== "chat" && (
            <span className="absolute top-2 right-6 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {mensagensNaoLidas > 9 ? "9+" : mensagensNaoLidas}
            </span>
          )}
        </button>
      </div>

      {/* Desktop: side-by-side grid */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Progress column */}
        <div
          className={`lg:col-span-2 space-y-5 ${
            tab === "chat" ? "hidden lg:block" : "block"
          }`}
        >
          {progresso}
        </div>

        {/* Chat column */}
        <div
          className={`lg:col-span-1 ${
            tab === "progresso" ? "hidden lg:block" : "block"
          }`}
        >
          {chat}
        </div>
      </div>
    </>
  );
}
