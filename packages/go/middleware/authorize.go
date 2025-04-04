package middleware

import (
	"emotion-apt/apps"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

func DefaultAuthorize(c *gin.Context) {
	token := c.GetHeader("Authorization")
	if token != "" {
		userAddress, err := apps.DecodeToken(token)
		if err != nil {
			c.Set("status", 4)
			c.Set("errMsg", "token解析错误")
			c.Abort()
			return
		}
		c.Set("userAddress", userAddress)
	} else {
		url := c.Request.URL.Path
		if url == "/api/login" {
			c.Set("userId", "")
			c.Next()
			return
		} else {
			c.Set("status", 4)
			c.Set("errMsg", "未授权")
			c.Abort()
			return
		}
	}
	c.Next()
}
