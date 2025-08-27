package com.flowfoundation.wallet.reactnative.bridge

import com.flowfoundation.wallet.manager.token.model.FungibleToken
import com.flowfoundation.wallet.manager.token.model.FungibleTokenType
import com.flowfoundation.wallet.network.model.Nft

/**
 * Convert FungibleToken to RNBridge.TokenModel
 */
fun FungibleToken.toRNBridgeTokenModel(): RNBridge.TokenModel {
    return RNBridge.TokenModel(
        type = when (this.tokenType) {
            FungibleTokenType.FLOW -> RNBridge.WalletType.FLOW
            FungibleTokenType.EVM -> RNBridge.WalletType.EVM
        },
        name = this.name,
        symbol = this.symbol,
        description = null,
        balance = this.balance,
        contractAddress = this.tokenAddress().takeIf { it.isNotEmpty() },
        contractName = this.tokenContractName().takeIf { it.isNotEmpty() },
        storagePath = this.flowStoragePath?.let { path ->
            // Parse storage path if it contains domain and identifier
            val parts = path.split("/")
            if (parts.size >= 3) {
                RNBridge.FlowPath(parts[1], parts[2])
            } else null
        },
        receiverPath = this.flowReceiverPath?.let { path ->
            // Parse receiver path if it contains domain and identifier
            val parts = path.split("/")
            if (parts.size >= 3) {
                RNBridge.FlowPath(parts[1], parts[2])
            } else null
        },
        balancePath = this.flowBalancePath?.let { path ->
            // Parse balance path if it contains domain and identifier
            val parts = path.split("/")
            if (parts.size >= 3) {
                RNBridge.FlowPath(parts[1], parts[2])
            } else null
        },
        identifier = this.tokenIdentifier(),
        isVerified = this.isVerified,
        logoURI = this.logoURI,
        priceInUSD = this.balanceInUSD,
        balanceInUSD = this.balanceInUSD,
        priceInFLOW = null, // Not available in FungibleToken
        balanceInFLOW = null, // Not available in FungibleToken
        currency = this.currency,
        priceInCurrency = this.priceInCurrency,
        balanceInCurrency = this.balanceInCurrency,
        displayBalance = this.balance,
        availableBalanceToUse = this.balance,
        change = null, // Not available in FungibleToken
        decimal = this.tokenDecimal(),
        evmAddress = this.evmAddress,
        website = this.tokenWebsite().takeIf { it.isNotEmpty() }
    )
}

/**
 * Convert Nft to RNBridge.NFTModel
 */
fun Nft.toRNBridgeNFTModel(): RNBridge.NFTModel {
    return RNBridge.NFTModel(
        id = this.id,
        name = this.title,
        description = this.description,
        thumbnail = this.postMedia?.image,
        externalURL = this.collectionExternalURL,
        collectionName = this.collectionName,
        collectionContractName = this.collectionContractName,
        contractAddress = this.collectionAddress,
        evmAddress = this.getEVMAddress(),
        address = this.collectionAddress,
        contractName = this.contractName(),
        collectionDescription = this.collectionDescription,
        collectionSquareImage = this.collectionSquareImage,
        collectionBannerImage = this.collectionBannerImage,
        collectionExternalURL = this.collectionExternalURL,
        flowIdentifier = this.getNFTIdentifier(),
        postMedia = this.postMedia?.let { media ->
            RNBridge.NFTPostMedia(
                image = media.image,
                isSvg = media.isSvg?.toBoolean(),
                description = media.description,
                title = media.title
            )
        },
        contractType = this.contractType,
        amount = this.amount,
        type = if (this.getEVMAddress() != null) RNBridge.WalletType.EVM else RNBridge.WalletType.FLOW
    )
}
