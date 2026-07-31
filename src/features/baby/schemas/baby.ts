import { z } from "zod";

export const babyCareTypes = ["feeding", "diaper", "sleep", "note"] as const;
export type BabyCareType = (typeof babyCareTypes)[number];

export const babyStatuses = ["expected", "born"] as const;
export type BabyStatus = (typeof babyStatuses)[number];

export const babyPrepCategories = ["enxoval", "pharmacy", "nursery", "items"] as const;
export type BabyPrepCategory = (typeof babyPrepCategories)[number];

export const createBabySchema = z.object({
  name: z.string().trim().min(1).max(80),
  status: z.enum(babyStatuses),
  dueDate: z.string().max(10).optional(),
  birthDate: z.string().max(10).optional(),
});

export const markBabyBornSchema = z.object({
  babyId: z.string().uuid(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string().trim().min(1).max(80).optional(),
});

export const updateBabyProfileSchema = z.object({
  babyId: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  dueDate: z.string().max(10).optional(),
  birthDate: z.string().max(10).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const addBabyCareLogSchema = z.object({
  babyId: z.string().uuid(),
  type: z.enum(babyCareTypes),
  detail: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(240).optional(),
});

export const deleteBabyCareLogSchema = z.object({
  logId: z.string().uuid(),
});

export const addBabyPrepItemSchema = z.object({
  babyId: z.string().uuid(),
  category: z.enum(babyPrepCategories),
  title: z.string().trim().min(1).max(160),
});

export const toggleBabyPrepItemSchema = z.object({
  itemId: z.string().uuid(),
  checked: z.boolean(),
});

export const deleteBabyPrepItemSchema = z.object({
  itemId: z.string().uuid(),
});

export const applySuggestedPrepSchema = z.object({
  babyId: z.string().uuid(),
  category: z.enum(babyPrepCategories),
});

export const babyMedicalTypes = ["consultation", "exam", "ultrasound", "vaccine", "other"] as const;
export type BabyMedicalType = (typeof babyMedicalTypes)[number];

export const addBabyMedicalAppointmentSchema = z.object({
  babyId: z.string().uuid(),
  type: z.enum(babyMedicalTypes),
  title: z.string().trim().min(1).max(120),
  scheduledAt: z.string().min(1),
  location: z.string().trim().max(160).optional(),
  professional: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(400).optional(),
});

export const deleteBabyMedicalAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
});

export type CreateBabyInput = z.infer<typeof createBabySchema>;
export type AddBabyCareLogInput = z.infer<typeof addBabyCareLogSchema>;
export type AddBabyPrepItemInput = z.infer<typeof addBabyPrepItemSchema>;
export type AddBabyMedicalAppointmentInput = z.infer<typeof addBabyMedicalAppointmentSchema>;

/**
 * Listas sugeridas (Brasil) — lavagem 2–3×/semana.
 * Enxoval: menos RN (muitos bebês passam rápido), mais P; um pouco de M.
 * Fontes típicas de maternidade/enxoval BR (bodies, macacões, fraldas de boca).
 */
export const DEFAULT_PREP_ITEMS: Record<BabyPrepCategory, string[]> = {
  enxoval: [
    // Bodies — manga curta
    "Body manga curta RN (4)",
    "Body manga curta P (6)",
    "Body manga curta M (4)",
    // Bodies — manga longa
    "Body manga longa RN (6)",
    "Body manga longa P (8)",
    "Body manga longa M (4)",
    // Macacões / mijões
    "Macacão / mijão RN (4)",
    "Macacão / mijão P (6)",
    "Macacão / mijão M (4)",
    // Calça + casaquinho
    "Calça RN (3)",
    "Calça P (4)",
    "Casaquinho / cardigan RN-P (3)",
    // Noite / saída
    "Pijama RN (3)",
    "Pijama P (4)",
    "Conjunto saída da maternidade (1)",
    // Acessórios de roupa
    "Touca / gorro RN-P (3)",
    "Luvinhas RN-P (3 pares)",
    "Meias RN-P (6 pares)",
    "Meias M (4 pares)",
    "Babadores (6)",
    // Tecidos / banho / fraldas têxteis
    "Manta leve (2)",
    "Manta / cobertor (2)",
    "Cueiro (3)",
    "Fralda de pano / paninho de boca (12)",
    "Toalha com capuz (3)",
    "Fraldas descartáveis RN (1 pacote)",
    "Fraldas descartáveis P (3 pacotes)",
    "Lençóis de berço (3)",
    "Protetor de colchão (1)",
  ],
  pharmacy: [
    "Termômetro digital (1)",
    "Soro fisiológico (3 frascos)",
    "Pomada para assadura (2)",
    "Algodão / hastes flexíveis",
    "Corta-unhas infantil (1)",
    "Aspirador nasal (1)",
    "Sabonete líquido neutro (1)",
    "Shampoo infantil (1)",
    "Hidratante infantil (1)",
    "Protetor solar infantil (1)",
    "Álcool 70% / antisséptico",
    "Gaze estéril",
    "Curativos hipoalergênicos",
    "Remédio para cólica (orientação médica)",
    "Analgésico infantil (orientação médica)",
    "Kit primeiros socorros",
  ],
  nursery: [
    "Berço / moisés",
    "Colchão adequado + protetor",
    "Trocador + trocador portátil",
    "Cômoda",
    "Poltrona / cadeira de amamentação",
    "Apoio de amamentação",
    "Luminária noturna",
    "Monitor / babá eletrônica",
    "Cesto de roupa suja",
    "Mobile / estímulo visual",
    "Cortina blackout",
    "Tapete / quilting de atividades",
    "Organizador de fraldas",
    "Lixeira com tampa",
  ],
  items: [
    "Carrinho de bebê (travel system ou leve)",
    "Bebê-conforto / cadeirinha p/ carro",
    "Base para o carro (se aplicável)",
    "Bolsa maternidade",
    "Mochila / bolsa de passeio",
    "Canga / wrap / sling",
    "Canguru / mochila ergonômica",
    "Cadeirinha de alimentação (aos ~6 meses)",
    "Banheira + suporte",
    "Redutor de assento sanitário (fase posterior)",
    "Chupeta (2+) + porta-chupeta",
    "Mamadeiras (se for usar) (3)",
    "Esterilizador / panela p/ esterilizar",
    "Escova de mamadeira",
    "Extração / bomba de leite (se amamentar)",
    "Protetores de seio / absorventes de amamentação",
    "Mordedores",
    "Brinquedos estímulo 0–3 meses",
  ],
};
