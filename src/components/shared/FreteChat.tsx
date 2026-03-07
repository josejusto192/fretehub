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

  const roleLabel = currentUserRole === "empresa" ? "empresa" : "caminhoneiro";
  const otherLabel = currentUserRole === "empresa" ? "Motorista" : "Empresa";

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[480px]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-blue-700" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Chat com {otherLabel}</p>
          <p className="text-xs text-gray-400">Atualiza automaticamente a cada 10s</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando mensagens...
          </div>
        ) : mensagens.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Nenhuma mensagem ainda</p>
            <p className="text-xs text-gray-400 mt-1">Inicie a conversa com {otherLabel.toLowerCase()}</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium shrink-0">{group.date}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {group.msgs.map((msg, i) => {
                const isOwn = msg.remetente_id === currentUserId;
                const isFirstInGroup =
                  i === 0 || group.msgs[i - 1].remetente_id !== msg.remetente_id;

                return (
                  <div
                    key={msg.id}
                    className={`flex mb-1 ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                      {isFirstInGroup && !isOwn && (
                        <span className="text-xs text-gray-400 mb-1 ml-1 font-medium">
                          {otherLabel}
                        </span>
                      )}
                      {isFirstInGroup && isOwn && (
                        <span className="text-xs text-gray-400 mb-1 mr-1 font-medium">
                          Você
                        </span>
                      )}
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isOwn
                            ? "bg-blue-900 text-white rounded-br-md"
                            : "bg-gray-100 text-gray-900 rounded-bl-md"
                        }`}
                      >
                        {msg.conteudo}
                      </div>
                      <span className={`text-[10px] text-gray-400 mt-0.5 ${isOwn ? "mr-1" : "ml-1"}`}>
                        {formatHora(msg.created_at)}
                        {isOwn && (
                          <span className="ml-1">{msg.lida ? "✓✓" : "✓"}</span>
                        )}
                      </span>
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
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Mensagem para ${otherLabel.toLowerCase()}… (Enter para enviar)`}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[42px] max-h-[120px] leading-relaxed"
            style={{ overflowY: conteudo.includes("\n") || conteudo.length > 60 ? "auto" : "hidden" }}
            disabled={enviando}
          />
          <Button
            onClick={enviar}
            disabled={!conteudo.trim() || enviando}
            className="bg-blue-900 hover:bg-blue-800 h-[42px] w-[42px] p-0 rounded-xl shrink-0"
          >
            {enviando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>

      {/* Suppress unused variable warning */}
      <span className="hidden">{roleLabel}</span>
    </div>
  );
}
