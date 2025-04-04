import { POST } from "../../go/utils/axios/axios";
import { LoginRequest, LoginResponse } from "~~/types/emotion-apt/login";

export function LoginApi(params: LoginRequest) {
  return POST<LoginResponse, LoginRequest>("/login", params);
}
