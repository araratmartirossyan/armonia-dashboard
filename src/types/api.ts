// API Types based on Swagger documentation

export type UserRole = "ADMIN" | "CUSTOMER";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  licenses?: License[];
  createdAt: string;
  updatedAt: string;
}

export interface License {
  id: string;
  key: string;
  isActive: boolean;
  expiresAt: string | null;
  user: User;
  knowledgeBases?: KnowledgeBase[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string | null;
  documents: Record<string, unknown> | null;
  promptInstructions: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIConfiguration {
  id: string;
  key: string;
  llmProvider: "OPENAI" | "GEMINI" | "ANTHROPIC";
  model: string | null;
  temperature: number | null;
  maxTokens: number | null;
  topP: number | null;
  topK: number | null;
  frequencyPenalty: number | null;
  presencePenalty: number | null;
  stopSequences: string[] | null;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  email?: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateLicenseRequest {
  userId: string;
  validityPeriodDays?: number;
}

export interface CreateKnowledgeBaseRequest {
  name: string;
  description?: string | null;
  documents?: Record<string, unknown> | null;
  promptInstructions?: string | null;
}

export interface UpdateKnowledgeBaseRequest {
  name?: string;
  description?: string | null;
  promptInstructions?: string | null;
}

export interface AttachKnowledgeBaseRequest {
  kbId: string;
  licenseId: string;
}

export interface UpdateAIConfigRequest {
  llmProvider?: "OPENAI" | "GEMINI" | "ANTHROPIC";
  model?: string | null;
  temperature?: number | null;
  maxTokens?: number | null;
  topP?: number | null;
  topK?: number | null;
  frequencyPenalty?: number | null;
  presencePenalty?: number | null;
  stopSequences?: string[] | null;
}

export interface ErrorResponse {
  message: string;
}

