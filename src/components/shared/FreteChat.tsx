"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Mensagem {
  id: string;
  frete_id: string;
  remetente_id: string;
  conteudo: string;
  lida: boolean;
  created_at: string;
  remetente: { email: string; role: string };
}

interface Props {
  freteId: string;
  currentUserId: string;
  currentUserRole: "empresa" | "caminhoneiro" | "admin";
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatData(iso: string) {
  const d = new Date(iso);
  const hoje = new Date();
  if (d.toDateString() === hoje.toDateString()) return "Hoje";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function FreteChat({ freteId, currentUserId, currentUserRole }: Props) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [conteudo, setConteudo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchMensagens = useCallback(async () => {
    try {
      const res = await fetch(`/api/fretes/${freteId}/mensagens`);
      if (res.ok) {
        const data: Mensagem[] = await res.json();
        setMensagens(data);
      }
    } finally {
      setLoading(false);
    }
  }, [freteId]);

  useEffect(() => {
    fetchMensagens();
    const interval = setInterval(fetchMensagens, 10000);
    return () => clearInterval(interval);
  }, [fetchMensagens]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const enviar = async () => {
    const texto = conteudo.trim();
    if (!texto || enviando) return;

    setEnviando(true);
    try {
      const res = await fetch(`/api/fretes/${freteId}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo: texto }),
      });
      if (res.ok) {
        setConteudo("");
        await fetchMensagens();
        inputRef.current?.focus();
      }
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  // Group messages by date
  const groups: { date: string; msgs: Mensagem[] }[] = [];
  for (const msg of mensagens) {
    const date = formatData(msg.created_at);
    const last = groups[groups.length - 1];
    if (last && last.date === date) {
      last.msgs.push(msg);
    } else {
      groups.push({ date, msgs: [msg] });
    }
  }

  const otherLabel = currentUserRole === "empresa" ? "Motorista" : "Empresa";

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[560px] lg:h-[620px]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white shrink-0">
        <div className="w-9 h-9 bg-blue-900 rounded-xl flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">Chat com {otherLabel}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <p className="text-xs text-gray-400">Atualiza a cada 10s</p>
          </div>
        </div>
        <span className="text-xs text-gray-400 font-medium">{mensagens.length} msg{mensagens.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0 bg-[#f8f9fb]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando...
          </div>
        ) : mensagens.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 flex items-center justify-center mb-3 shadow-sm">
              <MessageSquare className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">Nenhuma mensagem</p>
            <p className="text-xs text-gray-400 mt-1">Inicie a conversa com {otherLabel.toLowerCase()}</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-semibold bg-[#f8f9fb] px-2 shrink-0">{group.date}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {group.msgs.map((msg, i) => {
                const isOwn = msg.remetente_id === currentUserId;
                const isFirstInSeq =
                  i === 0 || group.msgs[i - 1].remetente_id !== msg.remetente_id;
                const isLastInSeq =
                  i === group.msgs.length - 1 ||
                  group.msgs[i + 1].remetente_id !== msg.remetente_id;

                return (
                  <div
                    key={msg.id}
                    className={`flex mb-0.5 ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[78%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                      {isFirstInSeq && (
                        <span className="text-[11px] text-gray-400 mb-1 font-medium px-1">
                          {isOwn ? "Você" : otherLabel}
                        </span>
                      )}
                      <div
                        className={`px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                          isOwn
                            ? `bg-blue-900 text-white ${
                                isFirstInSeq && isLastInSeq
                                  ? "rounded-2xl rounded-br-md"
                                  : isFirstInSeq
                                  ? "rounded-2xl rounded-br-sm"
                                  : isLastInSeq
                                  ? "rounded-2xl rounded-tr-sm rounded-br-md"
                                  : "rounded-2xl rounded-r-sm"
                              }`
                            : `bg-white text-gray-900 border border-gray-100 ${
                                isFirstInSeq && isLastInSeq
                                  ? "rounded-2xl rounded-bl-md"
                                  : isFirstInSeq
                                  ? "rounded-2xl rounded-bl-sm"
                                  : isLastInSeq
                                  ? "rounded-2xl rounded-tl-sm rounded-bl-md"
                                  : "rounded-2xl rounded-l-sm"
                              }`
                        }`}
                      >
                        {msg.conteudo}
                      </div>
                      {isLastInSeq && (
                        <span className={`text-[10px] text-gray-400 mt-1 ${isOwn ? "mr-1" : "ml-1"}`}>
                          {formatHora(msg.created_at)}
                          {isOwn && (
                            <span className={`ml-1 font-bold ${msg.lida ? "text-blue-400" : "text-gray-300"}`}>
                              {msg.lida ? "✓✓" : "✓"}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3.5 py-3 border-t border-gray-100 bg-white shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Mensagem para ${otherLabel.toLowerCase()}…`}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white min-h-[42px] max-h-[120px] leading-relaxed transition-colors"
            style={{ overflowY: conteudo.includes("\n") || conteudo.length > 60 ? "auto" : "hidden" }}
            disabled={enviando}
          />
          <Button
            onClick={enviar}
            disabled={!conteudo.trim() || enviando}
            className="bg-blue-900 hover:bg-blue-800 h-[42px] w-[42px] p-0 rounded-xl shrink-0 shadow-sm"
          >
            {enviando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 text-center">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
