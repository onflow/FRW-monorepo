access(all) fun main(address: Address): UFix64 {
  let account = getAccount(address)
  return account.balance - account.availableBalance
}