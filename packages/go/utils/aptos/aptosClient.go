package aptosClient

import (
	"crypto/ed25519"
	"emotion-apt/config"
	"encoding/hex"
	"fmt"
	"github.com/aptos-labs/aptos-go-sdk"
	"github.com/aptos-labs/aptos-go-sdk/bcs"
	"github.com/aptos-labs/aptos-go-sdk/crypto"
	"strings"
)

var client *aptos.Client

func Init() error {
	var err error
	var aptosConfig = aptos.NetworkConfig{
		NodeUrl:    config.Config.Aptos.NodeUrl,
		IndexerUrl: config.Config.Aptos.IndexerUrl,
		FaucetUrl:  config.Config.Aptos.FaucetUrl,
		Name:       config.Config.Aptos.Name,
		ChainId:    config.Config.Aptos.ChainId,
	}
	client, err = aptos.NewClient(aptosConfig)
	if err != nil {
		return err
	}
	return nil
}

func CheckSign(address, sign, originalMessage, nonce string) bool {
	//return true
	if address == "" || sign == "" || originalMessage == "" || nonce == "" {
		return false
	}
	// 2. 地址格式验证（32字节hex带0x前缀）
	if !strings.HasPrefix(address, "0x") || len(address) != 66 { // 0x + 64 hex chars
		return false
	}
	addressAptos := &aptos.AccountAddress{}
	err := addressAptos.ParseStringRelaxed(address)
	account, err := client.Account(*addressAptos)
	if err != nil {
		return false
	}
	publicKeyBytes, err := account.AuthenticationKey()
	if err != nil || len(publicKeyBytes) != ed25519.PublicKeySize {
		return false
	}

	// 4. 解码签名（必须为64字节）
	signatureBytes, err := hex.DecodeString(strings.TrimPrefix(sign, "0x"))
	if err != nil || len(signatureBytes) != ed25519.SignatureSize {
		return false
	}
	// 5. 构造标准消息结构
	fullMessage := createSigningMessage(originalMessage, nonce)

	// 7. 构造完整签名载荷
	hashedMessage := []byte(fullMessage)
	// 8. 最终验证（附加防御性检查）
	if len(publicKeyBytes) != ed25519.PublicKeySize ||
		len(signatureBytes) != ed25519.SignatureSize {
		return false
	}

	return verifySignature(publicKeyBytes, signatureBytes, hashedMessage)

}

func createSigningMessage(message string, nonce string) string {
	return fmt.Sprintf("APTOS\nmessage: %s\nnonce: %s", message, nonce)
}

func verifySignature(publicKey ed25519.PublicKey, signature []byte, hashedMessage []byte) bool {
	return ed25519.Verify(publicKey, hashedMessage, signature)
}

func GenerateCoin() (string, error) {
	if client == nil {
		_ = Init()
	}
	const FundAmount = 100_000_000_000

	address := ""
	key := ""
	account, err := CreateAccountFromKeys(address, key)
	if err != nil {
		return "", err
	}
	accountBytes, err := bcs.Serialize(&account.Address)
	if err != nil {
		return "", err
	}
	amountBytes, err := bcs.SerializeU64(FundAmount)
	if err != nil {
		return "", err
	}
	rawTxn, err := client.BuildTransaction(account.AccountAddress(), aptos.TransactionPayload{
		Payload: &aptos.EntryFunction{
			Module: aptos.ModuleId{
				Address: account.AccountAddress(),
				Name:    "emotion_coin",
			},
			Function: "mint",
			ArgTypes: []aptos.TypeTag{},
			Args: [][]byte{
				accountBytes,
				amountBytes,
			},
		}})
	if err != nil {
		return "", err
	}
	simulationResult, err := client.SimulateTransaction(rawTxn, account)
	if err != nil {
		return "", err
	}
	return simulationResult[0].VmStatus, nil
}

func CreateAccountFromKeys(addressHex string, authKeyHex string) (*aptos.Account, error) {

	// to derive an account with a private key and account address
	address := &aptos.AccountAddress{}
	err := address.ParseStringRelaxed(addressHex)
	if err != nil {
		return nil, err
	}
	var privateKey crypto.Ed25519PrivateKey
	err = privateKey.FromHex(authKeyHex)
	if err != nil {
		return nil, err
	}
	account, err := aptos.NewAccountFromSigner(&privateKey, *address)
	if err != nil {
		return nil, err
	}
	return account, nil
}
