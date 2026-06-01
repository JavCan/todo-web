import api from "../api";

export interface RegisterResponse {
  id: string;
  fullName: string;
  email: string;
  active: boolean;
  firebaseUuid: string;
  role: string;
}

export const registerUser = async (
  email: string,
  password: string,
  fullName: string
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>("/user", { email, password, fullName });
  return response.data;
};
