package router

import (
	"emotion-apt/apps"
	"emotion-apt/middleware"
	"github.com/gin-gonic/gin"
)

func Register(engine *gin.Engine) {
	//业务路由
	api := engine.Group("/api")
	api.Use(middleware.Response)         //
	api.Use(middleware.DefaultAuthorize) //默认鉴权中间件
	api.POST("/login", apps.Login)
	api.POST("/chat", apps.Chat)
	//404路由
	engine.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"status": 1, "errMsg": "Not Found"})
		c.Set("status", 1)
		c.Set("errMsg", "Not Found")
		c.Abort()
		return
	})
}
