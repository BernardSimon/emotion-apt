package middleware

import (
	"github.com/gin-contrib/cors"
	"time"
)

var corsConfig = cors.Config{
	AllowOrigins:     []string{"*"},              // 允许的源
	AllowMethods:     []string{"POST"},           // 允许的 HTTP 方法
	AllowHeaders:     []string{"*"},              // 允许的头部
	ExposeHeaders:    []string{"Content-Length"}, // 暴露的头部
	AllowCredentials: true,                       // 是否允许发送 Cookie
	MaxAge:           12 * time.Hour,             // 预检请求的有效期
}

var Cors = cors.New(corsConfig)
