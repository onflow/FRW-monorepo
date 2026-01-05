package com.flowfoundation.wallet.page.nft.nftlist.widget

import android.view.View
import com.flowfoundation.wallet.R
import com.flowfoundation.wallet.network.model.Nft
import com.flowfoundation.wallet.utils.extensions.res2String
import com.flowfoundation.wallet.utils.popupMenu
import com.flowfoundation.wallet.utils.uiScope
import com.flowfoundation.wallet.widgets.popup.PopupListView

class NftItemPopupMenu(
    private val view: View,
    val nft: Nft,
) {

    fun show() {
        uiScope {
            popupMenu(
                view,
                items = listOf(
                    // No items - context menu is now empty
                ),
                selectListener = { _, text -> onMenuItemClick(text) },
            ).show()
        }
    }

    private fun onMenuItemClick(text: String): Boolean {
        // No menu items to handle anymore
        return true
    }
}