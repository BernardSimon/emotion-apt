package deepseek

import (
	"context"
	"emotion-apt/config"
	"emotion-apt/type"
	"encoding/json"
	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

var deepseekClient openai.Client

func Init() {
	deepseekClient = openai.NewClient(option.WithAPIKey(config.Config.AI.AuthToken), option.WithBaseURL(config.Config.AI.Url))
}

func ChatUtil(messages _type.ChatRequest) (string, error) {
	// Create a chat completion request
	var historyMessages []openai.ChatCompletionMessageParamUnion
	for _, message := range messages.Chats {
		if message.Role == "U" {
			historyMessages = append(historyMessages, openai.UserMessage(message.Text))
		} else if message.Role == "A" {
			historyMessages = append(historyMessages, openai.AssistantMessage(message.Text))
		}
	}
	historyMessages = append(historyMessages, openai.SystemMessage("你可以使用markdown语言作为回答格式，也可以是纯文本，这个不需要告诉用户"))
	historyMessages = append(historyMessages, openai.SystemMessage("你是一名专业的心理咨询专家，帮助用户解决情绪问题，请专业且礼貌"))
	historyMessages = append(historyMessages, openai.SystemMessage("在用户没有明确要求的情况下，请尽可能控制你的回复长度，不要过于长，以心理咨询师的方式引导用户，解决用户问题"))
	historyMessages = append(historyMessages, openai.SystemMessage("用户档案: "+messages.Profile))

	//stream := deepseekClient.Chat.Completions.NewStreaming(context.TODO(), openai.ChatCompletionNewParams{
	//	Messages: historyMessage,
	//	Model:    config.Config.AI.ModelName,
	//	Seed:     openai.Int(0),
	//})

	param := openai.ChatCompletionNewParams{
		Messages: historyMessages,
		Seed:     openai.Int(1),
		Model:    config.Config.AI.ModelName,
	}

	completion, err := deepseekClient.Chat.Completions.New(context.TODO(), param)
	if err != nil {
		return "", err
	}
	return completion.Choices[0].Message.Content, nil
}

func GetKeyWord(userMessage _type.ChatsHistory, profile string) (*_type.KeyWordFuncParams, error) {
	if profile == "" {
		profile = "Not Provided"
	}
	params := openai.ChatCompletionNewParams{
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.UserMessage(userMessage.Text),
			openai.SystemMessage("You need to find content related to the following keywords from the user description. There can be multiple keywords. Summarize and summarize the user information and write them in the description. If there is no valid information in the user description, please set isValid to false."),
			openai.SystemMessage("The keywords are as follows: Panic,Helplessness,Shame,Isolation,Worthlessness,Resentment,Emotional Exhaustion,Nervousness,Regret,Grief,Cognitive Dissonance,Black-and-White Thinking,Overgeneralization,Impostor Syndrome,Perfectionism,Avoidance Behavior,Intrusive Thoughts,Emotional Detachment,Learned Helplessness,Negative Self-talk,Work-life Balance Issues,Academic Pressure,Family Conflicts,Peer Pressure,Toxic Relationships,Sleep Disorders,Eating Disorders,Social Withdrawal,Addictive Behavior,Self-sabotage,Emotional Intelligence,Self-awareness,Coping Mechanisms,Self-soothing Techniques,Grounding Exercises,Breathing Techniques,Visualization,Journaling,Positive Reframing,Behavioral Activation,Self-acceptance,Self-empowerment,Post-traumatic Growth,Gratitude Practice,Strength-based Thinking,Emotional Regulation,Self-assertiveness,Boundary Setting,Adaptive Thinking,Psychological Well-being"),
			openai.SystemMessage("User Profile: " + profile),
			openai.SystemMessage("请注意你给出的结果将直接计入用户档案，请称之用户为来访者,请按照用户语言输出description，如果不是关键词相关的信息，请给出isValid为false，如果不是很重要的信息，请给出isValid为false，请不要重复用户档案已经有的信息"),
			openai.SystemMessage("请检查格式，不要输出错误格式，特别是多余的括号"),
		},
		Tools: []openai.ChatCompletionToolParam{
			{
				Function: openai.FunctionDefinitionParam{
					Name:        "storeKeyMessage",
					Description: openai.String("Record the key parts of the user description information into the user profile. The keywords must be given keywords, and the description is written according to the user description. If the user does not provide valid information or the information does not belong to the keywords, please give false in isValid, otherwise please give true.请注意你给出的结果将直接计入用户档案，请称之用户为来访者,请按照用户语言输出description，如果不是关键词相关的信息，请给出isValid为false，如果不是很重要的信息，请给出isValid为false，请不要重复用户档案已经有的信息"),
					Parameters: openai.FunctionParameters{
						"type": "object",
						"properties": map[string]interface{}{
							"isValid": map[string]string{
								"type": "boolean",
							},
							"keyWords": map[string]interface{}{
								"type": "array",
								"properties": map[string]interface{}{
									"type": "string",
								},
							},
							"description": map[string]string{
								"type": "string",
							},
						},
						"required": []string{"location"},
					},
				},
			},
		},
		Seed:  openai.Int(0),
		Model: config.Config.AI.ModelName,
	}
	// Make initial chat completion request
	completion, err := deepseekClient.Chat.Completions.New(context.TODO(), params)
	if err != nil {
		return nil, err
	}

	toolCalls := completion.Choices[0].Message.ToolCalls
	if len(toolCalls) == 0 {
		return nil, nil
	}
	if toolCalls[0].Function.Name == "storeKeyMessage" {
		var result _type.KeyWordFuncParams
		if err := json.Unmarshal([]byte(toolCalls[0].Function.Arguments), &result); err != nil {
			return nil, err
		}
		return &result, nil
	}
	return nil, nil
}
