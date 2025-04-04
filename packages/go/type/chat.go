package _type

type ChatRequest struct {
	Profile string         `json:"profile"`
	Chats   []ChatsHistory `json:"chats"`
}
type ChatsHistory struct {
	Text string `json:"text"`
	Role string `json:"role"`
}

type ChatResponse struct {
	Message  string             `json:"message"`
	Keywords *KeyWordFuncParams `json:"keywords"`
}
