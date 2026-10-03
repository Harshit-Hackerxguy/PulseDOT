import { apiRequest } from '../lib/api';
import type { AuthResponse, LoginPayload, SignupPayload, SignupResponse } from '../types';

export const authService = {
  login(payload: LoginPayload): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: payload, auth: false });
  },

  signup(payload: SignupPayload): Promise<SignupResponse> {
    return apiRequest<SignupResponse>('/auth/signup', { method: 'POST', body: payload, auth: false });
  },
};
