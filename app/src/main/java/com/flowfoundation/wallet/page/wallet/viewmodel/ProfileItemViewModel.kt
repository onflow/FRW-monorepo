package com.flowfoundation.wallet.page.wallet.viewmodel

import androidx.lifecycle.ViewModel
import com.flowfoundation.wallet.manager.account.Account
import com.flowfoundation.wallet.manager.emoji.AccountEmojiManager
import com.flowfoundation.wallet.manager.flowjvm.cadenceGetAllFlowBalance
import com.flowfoundation.wallet.manager.wallet.WalletManager
import com.flowfoundation.wallet.network.ApiService
import com.flowfoundation.wallet.network.retrofitApi
import com.flowfoundation.wallet.utils.formatLargeBalanceNumber
import com.flowfoundation.wallet.utils.ioScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.math.BigDecimal
import kotlin.collections.forEach

// Sealed class to represent avatar data (either icon URL or emoji ID)
sealed class AvatarData {
  data class Icon(val url: String) : AvatarData()
  data class Emoji(val emojiId: Int) : AvatarData()
}

class ProfileItemViewModel: ViewModel() {
  private val _avatarList = MutableStateFlow<List<AvatarData>>(emptyList())
  val avatarList: StateFlow<List<AvatarData>> = _avatarList.asStateFlow()

  private val _balanceMap = MutableStateFlow<Map<String, String>>(emptyMap())
  val balanceMap: StateFlow<Map<String, String>> = _balanceMap.asStateFlow()

  private val service by lazy { retrofitApi().create(ApiService::class.java) }

  // Cache for verified COA addresses and their avatar data
  private val verifiedCoaAvatars = mutableMapOf<String, AvatarData>()

  fun fetchWalletList(profile: Account) {
    ioScope {
      val wallet = profile.wallet ?: return@ioScope
      val addressList = mutableListOf<String>()
      val avatars = mutableListOf<AvatarData>()
      val address = wallet.walletAddress() ?: return@ioScope
      val emojiInfo = AccountEmojiManager.getEmojiByAddress(address)

      // Add main account emoji
      avatars.add(AvatarData.Emoji(emojiInfo.emojiId))
      addressList.add(address)

      // Add child accounts
      WalletManager.childAccountList(address)?.get()?.forEach { childAccount ->
        addressList.add(childAccount.address)
        if (childAccount.icon.isNotEmpty()) {
          avatars.add(AvatarData.Icon(childAccount.icon))
        } else {
          val childEmojiInfo = AccountEmojiManager.getEmojiByAddress(childAccount.address)
          avatars.add(AvatarData.Emoji(childEmojiInfo.emojiId))
        }
      }

      var pendingCoaAddress: String? = null
      val coaAddress = profile.evmAddressData?.evmAddressMap?.get(address)
      coaAddress?.let { coa ->
        addressList.add(coa)
        // Add to pending list for verification if not already verified
        if (coa !in verifiedCoaAvatars) {
          pendingCoaAddress = coa
        } else {
          // Add directly to avatars if already verified
          avatars.add(verifiedCoaAvatars[coa]!!)
        }
      }

      _avatarList.value = avatars
      fetchAllBalances(addressList, pendingCoaAddress)
    }
  }

  private fun fetchAllBalances(addressList: List<String>, pendingCoaAddress: String?) {
    ioScope {
      val balanceMap = cadenceGetAllFlowBalance(addressList) ?: return@ioScope
      val formattedBalanceMap = balanceMap.mapValues { (_, balance) ->
        "${balance.formatLargeBalanceNumber(isAbbreviation = true)} FLOW"
      }
      _balanceMap.value = formattedBalanceMap

      // Check if COA address should be added to linkedAccounts
      pendingCoaAddress?.let { coaAddress ->
        val coaBalance = balanceMap[coaAddress]
        val hasBalance = coaBalance != null && coaBalance > BigDecimal.ZERO
        var hasNFTs = false

        if (!hasBalance) {
          try {
            val nftResponse = service.getEVMNFTCollections(coaAddress)
            val totalNftCount = nftResponse.data?.sumOf { it.count ?: 0 } ?: 0
            hasNFTs = nftResponse.data?.isNotEmpty() == true && totalNftCount > 0
          } catch (e: Exception) {
            // Ignore NFT API errors
          }
        }

        if (hasBalance || hasNFTs) {
          // Add COA address to avatar list
          if (coaAddress !in verifiedCoaAvatars) {
            val emojiInfo = AccountEmojiManager.getEmojiByAddress(coaAddress)
            val avatarData = AvatarData.Emoji(emojiInfo.emojiId)
            verifiedCoaAvatars[coaAddress] = avatarData

            // Update avatar list
            val currentAvatars = _avatarList.value.toMutableList()
            currentAvatars.add(avatarData)
            _avatarList.value = currentAvatars
          }
        } else {
          // Remove COA address from avatar list if it no longer has assets
          if (coaAddress in verifiedCoaAvatars) {
            val avatarToRemove = verifiedCoaAvatars[coaAddress]
            verifiedCoaAvatars.remove(coaAddress)

            // Update avatar list
            val currentAvatars = _avatarList.value.toMutableList()
            currentAvatars.remove(avatarToRemove)
            _avatarList.value = currentAvatars
          }
        }
      }
    }
  }
}
