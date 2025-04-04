package middleware

import (
	"github.com/gin-gonic/gin"
)

type ResponseModel struct {
	Status int    `json:"status"`
	Data   any    `json:"data"`
	ErrMsg string `json:"errMsg"`
}

func Response(c *gin.Context) {
	c.Next()
	var resp ResponseModel
	status := c.GetInt("status")
	resp.Status = status
	errMsg := c.GetString("errMsg")
	resp.ErrMsg = errMsg
	if status == 0 {
		data, exist := c.Get("data")
		if exist {
			resp.Data = data
		}
	}
	c.JSON(200, resp)
	return
}
