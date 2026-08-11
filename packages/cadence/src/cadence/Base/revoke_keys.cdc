transaction(revokeKeyIndexs: [Int]) {
    prepare(signer: auth(Keys) &Account) {
      for revokeKeyIndex in revokeKeyIndexs {
        signer.keys.revoke(keyIndex: revokeKeyIndex)
      }
    }
}
