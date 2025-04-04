package main

import (
	"context"
	aptosClient "emotion-apt/utils/aptos"
	"emotion-apt/utils/deepseek"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"emotion-apt/config"
	"emotion-apt/middleware"
	router "emotion-apt/routers"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.InitConfig(); err != nil {
		log.Fatalf("配置初始化失败: %v", err)
	}

	// 添加配置验证
	if err := validateConfig(); err != nil {
		log.Fatalf("配置验证失败: %v", err)
	}

	err := aptosClient.Init()
	if err != nil {
		log.Fatalf("aptosClient 初始化失败: %v", err)
	}
	deepseek.Init()

	switch config.Config.Mode {
	case "dev":
		startService(false)
	case "prod":
		startService(true)
	case "test":
		RunTests()
	default:
		log.Println("未指定运行模式，可用模式: dev|prod|test")
		os.Exit(2)
	}
	select {}
}

// 配置验证函数
func validateConfig() error {
	if config.Config.ServerUrl == "" {
		return fmt.Errorf("serverUrl 不能为空")
	}
	if config.Config.Mode == "prod" &&
		(config.Config.CertPath == "" || config.Config.KeyPath == "") {
		return fmt.Errorf("生产环境必须配置证书路径")
	}
	return nil
}

func startService(isProduction bool) {
	// 初始化Gin引擎
	r := gin.New()

	// 添加健康检查路由
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	// 全局中间件
	r.Use(
		middleware.Cors, // 跨域中间件
	)

	// 生产环境特定配置
	if isProduction {
		//mission.SetMissions() // 定时任务
		gin.SetMode(gin.ReleaseMode)
		log.Println("生产环境初始化完成")
	} else {
		gin.SetMode(gin.DebugMode)
		log.Println("开发环境初始化完成")
	}
	// 路由注册
	router.Register(r)
	log.Println("路由注册完成")

	// 配置HTTP服务器
	srv := &http.Server{
		Addr:         config.Config.ServerUrl,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// 优雅关机处理
	go gracefulShutdown(srv)

	// 启动服务
	log.Printf("启动服务在 %s 模式", config.Config.Mode)
	// 优化服务启动逻辑
	go func() {
		var err error
		if isProduction {
			err = srv.ListenAndServeTLS(
				config.Config.CertPath,
				config.Config.KeyPath,
			)
		} else {
			err = srv.ListenAndServe()
		}

		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("服务启动失败: %v", err)
		}
	}()

	// 添加服务启动成功日志
	log.Printf("服务已成功启动在 %s", config.Config.ServerUrl)
}

func RunTests() {
	// 优化测试函数，添加测试上下文
	// ctx := context.Background()
	log.Println("开始执行测试用例...")
	_, _ = aptosClient.GenerateCoin()
	os.Exit(0)
}

func gracefulShutdown(srv *http.Server) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("正在关闭服务...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("服务强制关闭:", err)
	}
	log.Println("服务已正常终止")
	os.Exit(0)
}
