export const ESTADOS_BRASILEIROS = [
  { value: "AC", label: "AC - Acre" },
  { value: "AL", label: "AL - Alagoas" },
  { value: "AP", label: "AP - Amapá" },
  { value: "AM", label: "AM - Amazonas" },
  { value: "BA", label: "BA - Bahia" },
  { value: "CE", label: "CE - Ceará" },
  { value: "DF", label: "DF - Distrito Federal" },
  { value: "ES", label: "ES - Espírito Santo" },
  { value: "GO", label: "GO - Goiás" },
  { value: "MA", label: "MA - Maranhão" },
  { value: "MT", label: "MT - Mato Grosso" },
  { value: "MS", label: "MS - Mato Grosso do Sul" },
  { value: "MG", label: "MG - Minas Gerais" },
  { value: "PA", label: "PA - Pará" },
  { value: "PB", label: "PB - Paraíba" },
  { value: "PR", label: "PR - Paraná" },
  { value: "PE", label: "PE - Pernambuco" },
  { value: "PI", label: "PI - Piauí" },
  { value: "RJ", label: "RJ - Rio de Janeiro" },
  { value: "RN", label: "RN - Rio Grande do Norte" },
  { value: "RS", label: "RS - Rio Grande do Sul" },
  { value: "RO", label: "RO - Rondônia" },
  { value: "RR", label: "RR - Roraima" },
  { value: "SC", label: "SC - Santa Catarina" },
  { value: "SP", label: "SP - São Paulo" },
  { value: "SE", label: "SE - Sergipe" },
  { value: "TO", label: "TO - Tocantins" },
];

export const TIPOS_CAMINHAO = [
  "Truck (6 eixos)",
  "Bi-trem",
  "Rodotrem",
  "Vanderleia",
  "Carreta Simples",
  "Carreta LS",
  "Bitrem 7 Eixos",
  "Romeu e Julieta",
  "Prancha",
  "Sider",
  "Baú",
  "Graneleiro",
  "Tanque",
  "Frigorífico",
];

export const TIPOS_CARGA = [
  "Granel sólido",
  "Granel líquido",
  "Carga geral",
  "Carga frigorificada",
  "Carga perigosa",
  "Carga indivisível",
  "Minério",
  "Açúcar",
  "Soja",
  "Milho",
  "Combustível",
  "Produtos químicos",
  "Máquinas e equipamentos",
  "Madeira",
  "Veículos",
];

export const CATEGORIAS_CNH = ["C", "D", "E"];

export const STATUS_FRETE_LABELS: Record<string, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const STATUS_CANDIDATURA_LABELS: Record<string, string> = {
  pendente: "Pendente",
  aceita: "Aceita",
  recusada: "Recusada",
  cancelada: "Cancelada",
};

export const STATUS_USER_LABELS: Record<string, string> = {
  pendente: "Pendente",
  ativo: "Ativo",
  bloqueado: "Bloqueado",
};
