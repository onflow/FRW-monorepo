package com.flowfoundation.wallet.page.nft.nftlist.presenter

import android.annotation.SuppressLint
import android.view.View
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.bitmap.RoundedCorners
import com.flowfoundation.wallet.R
import com.flowfoundation.wallet.base.presenter.BasePresenter
import com.flowfoundation.wallet.base.recyclerview.BaseViewHolder
import com.flowfoundation.wallet.databinding.ItemNftListBinding
import com.flowfoundation.wallet.page.nft.nftdetail.NftDetailActivity
import com.flowfoundation.wallet.page.nft.nftlist.getNFTCover
import com.flowfoundation.wallet.page.nft.nftlist.model.NFTItemModel
import com.flowfoundation.wallet.page.nft.nftlist.title

import com.flowfoundation.wallet.page.profile.subpage.wallet.ChildAccountCollectionManager
import com.flowfoundation.wallet.utils.extensions.dp2px
import com.flowfoundation.wallet.utils.extensions.setVisible
import com.flowfoundation.wallet.utils.SVGUtils
import com.flowfoundation.wallet.utils.logd

class NFTListItemPresenter(
    private val view: View,
) : BaseViewHolder(view), BasePresenter<NFTItemModel> {
    private val binding by lazy { ItemNftListBinding.bind(view) }
    private val context = view.context

    @SuppressLint("SetTextI18n")
    override fun bind(model: NFTItemModel) {
        val nft = model.nft
        val fromAddress = model.accountAddress
        with(binding) {
            // Smart load with SVG support and preserved transformations
            val borderRadius = 10.dp2px()
            val svgWebView = SVGUtils.smartLoadImageWithTransforms(
                coverView,
                nft.getNFTCover() as? String,
            ) { _ ->
                // Handle SVGWebView click - same as coverViewWrapper click
                logd("NFTListItemPresenter", "SVGWebView clicked for NFT: ${nft.uniqueId()}")
                NftDetailActivity.launch(context, nft.uniqueId(), nft.getCollectionContractId(), nft.contractName(), fromAddress)
            }
            if (svgWebView != null) {
                // SVG loaded with WebView - rounded corners handled by CSS
                svgWebView.onLoadError = { error ->
                    // Fallback to regular image loading with transformations
                    Glide.with(coverView).load(nft.getNFTCover())
                        .transform(RoundedCorners(borderRadius.toInt()))
                        .placeholder(R.drawable.ic_placeholder)
                        .into(coverView)
                }
            } else {
                // Regular image loading with transformations
                Glide.with(coverView).load(nft.getNFTCover())
                    .transform(RoundedCorners(borderRadius.toInt()))
                    .placeholder(R.drawable.ic_placeholder)
                    .into(coverView)
            }
            nameView.text = nft.title() ?: nft.title ?: nft.contractName()
            priceView.text = nft.postMedia?.description ?: ""
            coverViewWrapper.setOnClickListener {
                logd("NFTListItemPresenter", "coverViewWrapper clicked for NFT: ${nft.uniqueId()}")
                NftDetailActivity.launch(context, nft.uniqueId(), nft.getCollectionContractId(), nft.contractName(), fromAddress)
            }
            // Long click handler removed - no menu items to show
            coverViewWrapper.setOnLongClickListener(null)

            view.setBackgroundResource(R.color.transparent)
            view.setPadding(0, 0, 0, 0)
            tvAmount.setVisible(nft.isERC1155NFT())
            tvAmount.text = nft.amount ?: "1"
        }
        view.setOnClickListener {
            logd("NFTListItemPresenter", "main view clicked for NFT: ${nft.uniqueId()}")
            NftDetailActivity.launch(context, nft.uniqueId(), nft.getCollectionContractId(), nft.contractName(), fromAddress)
        }
        bindAccessible(model)
    }

    private fun bindAccessible(model: NFTItemModel) {
        val accessible = ChildAccountCollectionManager.isNFTAccessible(model.nft.collectionAddress, model.nft.contractName())
        binding.priceView.setVisible(accessible)
        binding.tvInaccessibleTag.setVisible(accessible.not())
    }
}
