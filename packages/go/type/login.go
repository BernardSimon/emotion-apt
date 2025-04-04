package _type

type LoginRequest struct {
	Address   string `json:"address"`
	Timestamp string `json:"timestamp"`
	Sign      string `json:"sign"`
	Salt      string `json:"salt"`
	FullMsg   string `json:"full_msg"`
}

type LoginResponse struct {
	Token string `json:"token"`
}
