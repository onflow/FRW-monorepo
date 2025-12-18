import Crypto

transaction(publicKeys: [String], revokeKeyIndexs: [Int]) {
    prepare(signer: auth(Keys) &Account) {

      for publicKey in publicKeys {
        let signatureAlgorithm = SignatureAlgorithm.ECDSA_secp256k1
        let hashAlgorithm = HashAlgorithm.SHA3_256
        let weight = 1000.0

        let key = PublicKey(
            publicKey: publicKey.decodeHex(),
            signatureAlgorithm: signatureAlgorithm
        )

        signer.keys.add(
            publicKey: key,
            hashAlgorithm: hashAlgorithm,
            weight: weight
        )
      }
      
      for revokeKeyIndex in revokeKeyIndexs {
        signer.keys.revoke(keyIndex: revokeKeyIndex)
      }
    }
}