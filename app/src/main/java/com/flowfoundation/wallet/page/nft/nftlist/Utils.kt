package com.flowfoundation.wallet.page.nft.nftlist

import android.annotation.SuppressLint
import android.view.View
import androidx.recyclerview.widget.DiffUtil
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.google.android.material.appbar.AppBarLayout
import com.flowfoundation.wallet.cache.NftSelections
import com.flowfoundation.wallet.manager.config.NftCollectionConfig
import com.flowfoundation.wallet.manager.wallet.WalletManager
import com.flowfoundation.wallet.network.model.Nft
import com.flowfoundation.wallet.page.nft.nftlist.model.*
import com.flowfoundation.wallet.utils.logd
import com.flowfoundation.wallet.wallet.toAddress
import kotlin.math.min

val nftListDiffCallback = object : DiffUtil.ItemCallback<Any>() {
    override fun areItemsTheSame(oldItem: Any, newItem: Any): Boolean {
        if (oldItem is NFTItemModel && newItem is NFTItemModel) {
            return oldItem.nft.uniqueId() == newItem.nft.uniqueId()
        }

        if (oldItem is CollectionTabsModel && newItem is CollectionTabsModel) {
            return true
        }

        if (oldItem is NftSelections && newItem is NftSelections) {
            return true
        }

        return oldItem == newItem
    }

    @SuppressLint("DiffUtilEquals")
    override fun areContentsTheSame(oldItem: Any, newItem: Any): Boolean {
        if (oldItem is CollectionTabsModel && newItem is CollectionTabsModel) {
            return true
        }

        if (oldItem is NftSelections && newItem is NftSelections) {
            return true
        }

        return oldItem == newItem
    }
}

fun Nft.getNFTCover(): Any? {
    return cover() // Simplified - no SVG processing
}

/**
 * Check if string is SVG data URL (base64 or regular)
 */
fun String?.isSvgDataUrl(): Boolean {
    return this?.startsWith("data:image/svg+xml") == true
}

/**
 * Check if URL points to SVG file
 */
fun String?.isSvgUrl(): Boolean {
    return this?.lowercase()?.let { url ->
        url.endsWith(".svg") || url.contains("svg") || isSvgDataUrl()
    } ?: false
}

fun Nft.cover(): String? {
    return postMedia?.image ?: video()
}

fun Nft.name(): String? {
    if (!postMedia?.title.isNullOrBlank()) {
        return postMedia?.title
    }
    val config = NftCollectionConfig.get(collectionAddress, contractName()) ?: return null
    return "${config.name} #${id}"
}

fun Nft.desc(): String? {
    return postMedia?.description ?: metadata?.metadata?.firstOrNull { it.name == "description" }?.value
}

fun Nft.video(): String? {
    return postMedia?.video
}

fun Nft.title(): String? = postMedia?.title

fun Nft.websiteUrl(walletAddress: String): String? {
    // First priority: Check if collection has an external URL
    if (!collectionExternalURL.isNullOrBlank()) {
        return collectionExternalURL
    }

    // Second priority: Fallback URLs based on NFT type
    // For Flow-EVM NFTs, use OpenSea profile
    if (canBridgeToEVM() || !evmAddress.isNullOrBlank()) {
        val evmAddr = getEVMAddress() ?: evmAddress
        if (!evmAddr.isNullOrBlank()) {
            return "https://opensea.io/$evmAddr"
        }
    }

    // For Flow NFTs, use FlowPort
    if (canBridgeToFlow() || !flowIdentifier.isNullOrBlank()) {
        return "https://port.flow.com/nfts/$walletAddress"
    }

    // If no URL can be determined, return null to hide the option
    return null
}

fun findSwipeRefreshLayout(view: View): SwipeRefreshLayout? {
    if (view.parent == null) return null
    if (view.parent is SwipeRefreshLayout) return (view.parent as SwipeRefreshLayout)

    return findSwipeRefreshLayout(view.parent as View)
}

fun findParentAppBarLayout(view: View): AppBarLayout? {
    if (view.parent == null) return null
    if (view.parent is AppBarLayout) return (view.parent as AppBarLayout)

    return findParentAppBarLayout(view.parent as View)
}

fun isSingleNftItem(model: Any): Boolean {
    return model is NFTCountTitleModel || model is HeaderPlaceholderModel || model is NFTTitleModel || model is NftSelections
      || model is CollectionTitleModel || model is CollectionItemModel || model is CollectionTabsModel || model is NftLoadMoreModel
}

fun nftWalletAddress(): String {
//    if (BuildConfig.DEBUG) {
//        return "0x95601dba5c2506eb"
//    }
    val rawAddress = WalletManager.selectedWalletAddress()
    val formattedAddress = rawAddress.toAddress()

    // Log for debugging
    logd("nftWalletAddress", "Raw address: '$rawAddress'")
    logd("nftWalletAddress", "Formatted address: '$formattedAddress'")

    // Return the formatted address with 0x prefix
    return formattedAddress
}

fun Nft.isDomain() = media?.firstOrNull { it.uri.contains("flowns.org") && it.uri.contains(".meow") } != null

internal fun generateEmptyNftPlaceholders(count: Int) = (0 until min(count, 12)).map { NftItemShimmerModel() }
