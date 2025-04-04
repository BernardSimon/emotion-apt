package apps

import (
	_type "emotion-apt/type"
	"emotion-apt/utils/deepseek"
	"github.com/gin-gonic/gin"
)

func Chat(c *gin.Context) {
	var messages _type.ChatRequest
	err := c.ShouldBindJSON(&messages)
	if err != nil {
		c.Set("status", 1)
		c.Set("errMsg", "参数错误")
		c.Abort()
		return
	}
	newMessage, err := deepseek.ChatUtil(messages)
	if err != nil {
		c.Set("status", 2)
		c.Set("errMsg", err.Error())
		c.Abort()
		return
	}
	var response _type.ChatResponse
	response.Message = newMessage
	c.Set("status", 0)

	keyWords, err := deepseek.GetKeyWord(messages.Chats[len(messages.Chats)-1], messages.Profile)
	if err == nil && keyWords != nil {
		if keyWords.IsValid {
			if len(keyWords.Keywords) != 0 {
				response.Keywords = keyWords
			}
		}

	}
	c.Set("data", response)
	return
}
