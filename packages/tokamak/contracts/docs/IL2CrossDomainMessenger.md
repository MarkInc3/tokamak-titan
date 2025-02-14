# IL2CrossDomainMessenger



> IL2CrossDomainMessenger





## Methods

### relayMessage

```solidity
function relayMessage(address _target, address _sender, bytes _message, uint256 _messageNonce) external nonpayable
```

Relays a cross domain message to a contract.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _target | address | Target contract address.
| _sender | address | Message sender address.
| _message | bytes | Message to send to the target.
| _messageNonce | uint256 | Nonce for the provided message.

### sendMessage

```solidity
function sendMessage(address _target, bytes _message, uint32 _gasLimit) external nonpayable
```

Sends a cross domain message to the target messenger.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _target | address | Target contract address.
| _message | bytes | Message to send to the target.
| _gasLimit | uint32 | Gas limit for the provided message.

### xDomainMessageSender

```solidity
function xDomainMessageSender() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined



## Events

### FailedRelayedFastMessage

```solidity
event FailedRelayedFastMessage(address indexed target, address sender, bytes message, uint256 messageNonce)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| target `indexed` | address | undefined |
| sender  | address | undefined |
| message  | bytes | undefined |
| messageNonce  | uint256 | undefined |

### FailedRelayedMessage

```solidity
event FailedRelayedMessage(bytes32 indexed msgHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| msgHash `indexed` | bytes32 | undefined |

### RelayedFastMessage

```solidity
event RelayedFastMessage(address indexed target, address sender, bytes message, uint256 messageNonce)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| target `indexed` | address | undefined |
| sender  | address | undefined |
| message  | bytes | undefined |
| messageNonce  | uint256 | undefined |

### RelayedMessage

```solidity
event RelayedMessage(bytes32 indexed msgHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| msgHash `indexed` | bytes32 | undefined |

### SentMessage

```solidity
event SentMessage(address indexed target, address sender, bytes message, uint256 messageNonce, uint256 gasLimit)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| target `indexed` | address | undefined |
| sender  | address | undefined |
| message  | bytes | undefined |
| messageNonce  | uint256 | undefined |
| gasLimit  | uint256 | undefined |



