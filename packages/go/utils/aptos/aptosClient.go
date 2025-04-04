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
	//if !strings.HasPrefix(address, "0x") || len(address) != 66 { // 0x + 64 hex chars
	//	return false
	//}
	//addressAptos := &aptos.AccountAddress{}
	//err := addressAptos.ParseStringRelaxed(address)
	//account, err := client.Account(*addressAptos)
	//if err != nil {
	//	return false
	//}
	//publicKeyBytes, err := account.AuthenticationKey()

	publicKeyBytes, err := hex.DecodeString(strings.TrimPrefix(address, "0x"))
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
	_, err = client.SimulateTransaction(rawTxn, account)
	if err != nil {
		return "", err
	}
	signedTxn, err := rawTxn.SignedTransaction(account)
	if err != nil {
		return "", err
	}
	_, err = client.SubmitTransaction(signedTxn)
	if err != nil {
		return "", err
	}
	return "success", nil
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

func CreatScale() (string, error) {
	if client == nil {
		_ = Init()
	}
	const name = "SCL-90"
	const content = "SCL-90"
	const description = "症状自评量表，又称90项症状清单(symptom checklist 90, SCL-90)，由Derogatis等编制于1973年 [1]，包括9个因子，共90个项目，用于心理健康与行为问题的测量"
	const price = 20000
	priceFormat, err := bcs.SerializeU64(price)
	var nameSerializer bcs.Serializer
	nameSerializer.WriteString(name)
	nameFormat := nameSerializer.ToBytes()
	contentSerializer := bcs.Serializer{}
	contentSerializer.WriteString(content)
	contentFormat := contentSerializer.ToBytes()
	descriptionSerializer := bcs.Serializer{}
	descriptionSerializer.WriteString(description)
	descriptionFormat := descriptionSerializer.ToBytes()
	address := ""
	key := ""
	account, err := CreateAccountFromKeys(address, key)
	if err != nil {
		return "", err
	}
	rawTxn, err := client.BuildTransaction(account.AccountAddress(), aptos.TransactionPayload{
		Payload: &aptos.EntryFunction{
			Module: aptos.ModuleId{
				Address: account.AccountAddress(),
				Name:    "scales",
			},
			Function: "create_scales",
			ArgTypes: []aptos.TypeTag{},
			Args: [][]byte{
				nameFormat,
				descriptionFormat,
				contentFormat,
				priceFormat,
			},
		}})
	if err != nil {
		return "", err
	}
	_, err = client.SimulateTransaction(rawTxn, account)
	if err != nil {
		return "", err
	}
	signedTxn, err := rawTxn.SignedTransaction(account)
	if err != nil {
		return "", err
	}
	resp, err := client.SubmitTransaction(signedTxn)
	println(resp)
	if err != nil {
		return "", err
	}
	return "success", nil
}
