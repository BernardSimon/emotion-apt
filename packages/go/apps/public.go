package apps

import (
	"bytes"
	"encoding/base64"
	"github.com/dchest/captcha"
)

func GetCaptcha(_ string, _ []byte) (interface{}, error) {
	id := captcha.NewLen(4)
	// 创建一个缓冲区来存储图像数据
	var imgBuffer bytes.Buffer
	// 将图像写入缓冲区
	if err := captcha.WriteImage(&imgBuffer, id, 240, 80); err != nil {
		return nil, err
	}
	// 将图像数据编码为Base64
	encodedImage := base64.StdEncoding.EncodeToString(imgBuffer.Bytes())
	return map[string]interface{}{
		"captchaId": id,
		"captcha":   encodedImage,
	}, nil
}

func VerifyCaptcha(id string, digits string) bool {
	return captcha.VerifyString(id, digits)
}
