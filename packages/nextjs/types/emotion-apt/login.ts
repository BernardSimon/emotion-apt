export type LoginRequest = {
  address: string;
  sign: string;
  timestamp: string;
  salt: string;
  full_msg: string;
};

export type LoginResponse = {
  token: string;
};
