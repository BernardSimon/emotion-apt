package config

import (
	"fmt"
	"gopkg.in/yaml.v3"
	"os"
)

var Config config

type config struct {
	Mode      string `yaml:"mode"`
	ServerUrl string `yaml:"serverUrl"`
	CertPath  string `yaml:"certPath"`
	KeyPath   string `yaml:"keyPath"`
	JwtSecret string `yaml:"jwtSecret"` // jwt加密密钥
	AI        struct {
		Url       string `yaml:"url"`
		AuthToken string `yaml:"authToken"`
		ModelName string `yaml:"modelName"`
	} `yaml:"ai"`
	Aptos struct {
		Name       string `yaml:"name"`
		NodeUrl    string `yaml:"nodeUrl"`
		IndexerUrl string `yaml:"indexerUrl"`
		FaucetUrl  string `yaml:"faucetUrl"`
		ChainId    uint8  `yaml:"chainId"`
	} `yaml:"aptos"`
}

func InitConfig() error {
	data, err := os.ReadFile("./config.yaml")
	if err != nil {
		return fmt.Errorf("配置文件读取失败: %w", err)
	}
	err = yaml.Unmarshal(data, &Config)
	if err != nil {
		return fmt.Errorf("配置解析失败: %w", err)
	}
	return nil
}
