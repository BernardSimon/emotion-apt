package apps

import (
	"emotion-apt/config"
	_type "emotion-apt/type"
	aptosClient "emotion-apt/utils/aptos"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"strconv"
	"time"
)

func generateToken(UserAddress string) (string, error) {
	// 创建声明
	notBefore := jwt.NewNumericDate(time.Now())
	claims := &jwt.RegisteredClaims{
		Subject:   UserAddress,
		NotBefore: notBefore,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(6 * time.Hour)),
	}
	// 生成Token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// 签名并返回Token
	return token.SignedString([]byte(config.Config.JwtSecret))
}

func DecodeToken(tokenString string) (string, error) {
	var claims jwt.RegisteredClaims
	token, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.Config.JwtSecret), nil
	})
	if err != nil {
		return "", err
	}
	if token == nil || !token.Valid {
		return "", errors.New("无效的 token")
	}
	UserAddress := claims.Subject
	return UserAddress, nil
}

func Login(c *gin.Context) {
	var loginRequest _type.LoginRequest
	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.Set("status", 1)
		c.Set("errMsg", "参数错误")
		c.Abort()
		return
	}
	timeStampInt, err := strconv.Atoi(loginRequest.Timestamp)
	if err != nil {
		c.Set("status", 2)
		c.Set("errMsg", "时间戳错误")
		return
	}
	timeStampNow := int(time.Now().Unix())
	if timeStampInt > timeStampNow+300 || timeStampInt < timeStampNow-300 {
		c.Set("status", 2)
		c.Set("errMsg", "时间戳错误")
		return
	}
	if !aptosClient.CheckSign(loginRequest.Address, loginRequest.Sign, loginRequest.Timestamp, loginRequest.Salt) {
		c.Set("status", 2)
		c.Set("errMsg", "签名错误")
		return
	}
	token, _ := generateToken(loginRequest.Address)
	response := _type.LoginResponse{
		Token: token,
	}
	c.Set("data", response)
}
