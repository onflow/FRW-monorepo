package com.flowfoundation.wallet.page.main.model


data class WalletAccountData(
  val address: String,
  val name: String,
  val emojiId: Int,
  val isSelected: Boolean,
  val linkedAccounts: List<LinkedAccountData> = emptyList(),
  val isEOAAccount: Boolean = false
)

data class LinkedAccountData(
  val address: String,
  val name: String,
  val icon: String? = null,
  val emojiId: Int,
  val isSelected: Boolean,
  val isCOAAccount: Boolean
)
