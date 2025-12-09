import axios, { AxiosInstance } from "axios";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  UpdateUserRequest,
  License,
  CreateLicenseRequest,
  KnowledgeBase,
  CreateKnowledgeBaseRequest,
  UpdateKnowledgeBaseRequest,
  AttachKnowledgeBaseRequest,
  AIConfiguration,
  UpdateAIConfigRequest,
} from "@/types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api-ai-rag-o62iq.ondigitalocean.app";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Don't override Content-Type for FormData (file uploads)
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
      return config;
    });

    // Add response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>("/auth/login", data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/auth/register",
      data
    );
    return response.data;
  }

  // Users
  async getUsers(): Promise<User[]> {
    const response = await this.client.get<User[]>("/users");
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.client.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(data: RegisterRequest): Promise<User> {
    const response = await this.client.post<AuthResponse>(
      "/auth/register",
      data
    );
    return response.data.user;
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await this.client.patch<User>(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.delete(`/users/${id}`);
  }

  // Licenses
  async getLicenses(): Promise<License[]> {
    const response = await this.client.get<License[]>("/licenses");
    return response.data;
  }

  async getLicenseById(id: string): Promise<License> {
    const response = await this.client.get<License>(`/licenses/${id}`);
    return response.data;
  }

  async createLicense(data: CreateLicenseRequest): Promise<License> {
    const response = await this.client.post<License>("/licenses", data);
    return response.data;
  }

  async activateLicense(id: string): Promise<License> {
    const response = await this.client.patch<{
      message: string;
      license: License;
    }>(`/licenses/${id}/activate`);
    return response.data.license;
  }

  async deactivateLicense(id: string): Promise<License> {
    const response = await this.client.patch<{
      message: string;
      license: License;
    }>(`/licenses/${id}/deactivate`);
    return response.data.license;
  }

  // Knowledge Bases
  async getKnowledgeBases(): Promise<KnowledgeBase[]> {
    const response = await this.client.get<KnowledgeBase[]>("/knowledge-bases");
    return response.data;
  }

  async createKnowledgeBase(
    data: CreateKnowledgeBaseRequest
  ): Promise<KnowledgeBase> {
    const response = await this.client.post<KnowledgeBase>(
      "/knowledge-bases",
      data
    );
    return response.data;
  }

  async updateKnowledgeBase(
    id: string,
    data: UpdateKnowledgeBaseRequest
  ): Promise<KnowledgeBase> {
    const response = await this.client.patch<KnowledgeBase>(
      `/knowledge-bases/${id}`,
      data
    );
    return response.data;
  }

  async deleteKnowledgeBase(id: string): Promise<void> {
    await this.client.delete(`/knowledge-bases/${id}`);
  }

  async attachKnowledgeBase(data: AttachKnowledgeBaseRequest): Promise<void> {
    await this.client.post("/knowledge-bases/attach", data);
  }

  async uploadFilesToKnowledgeBase(id: string, files: File[]): Promise<void> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    await this.client.post(`/knowledge-bases/${id}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // Configuration
  async getAIConfiguration(): Promise<AIConfiguration> {
    const response = await this.client.get<AIConfiguration>("/config/ai");
    return response.data;
  }

  async updateAIConfiguration(
    data: UpdateAIConfigRequest
  ): Promise<AIConfiguration> {
    const response = await this.client.put<AIConfiguration>("/config/ai", data);
    return response.data;
  }
}

export const api = new ApiClient();
