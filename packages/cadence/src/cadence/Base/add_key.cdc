import Crypto

transaction(
    publicKey: String,
    signatureAlgorithm: UInt8,
    hashAlgorithm: UInt8,
    weight: UFix64
) {
    prepare(signer: auth(Keys) &Account) {
        let signAlgo = SignatureAlgorithm(rawValue: signatureAlgorithm)
            ?? panic("Invalid signature algorithm")
        let hashAlgo = HashAlgorithm(rawValue: hashAlgorithm)
            ?? panic("Invalid hash algorithm")

        let key = PublicKey(
            publicKey: publicKey.decodeHex(),
            signatureAlgorithm: signAlgo
        )

        signer.keys.add(
            publicKey: key,
            hashAlgorithm: hashAlgo,
            weight: weight
        )
    }
}
