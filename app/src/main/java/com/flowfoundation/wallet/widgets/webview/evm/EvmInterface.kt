package com.flowfoundation.wallet.widgets.webview.evm

import android.webkit.JavascriptInterface
import androidx.fragment.app.FragmentActivity
import com.flowfoundation.wallet.R
import com.flowfoundation.wallet.base.activity.BaseActivity
import com.flowfoundation.wallet.manager.app.MAINNET_CHAIN_ID
import com.flowfoundation.wallet.manager.app.TESTNET_CHAIN_ID
import com.flowfoundation.wallet.manager.app.networkStringByChainId
import com.flowfoundation.wallet.manager.evm.DAppEVMConnectionManager
import com.flowfoundation.wallet.manager.evm.DAppMethod
import com.flowfoundation.wallet.manager.evm.EVMWalletManager
import com.flowfoundation.wallet.manager.evm.sendCOATransaction
import com.flowfoundation.wallet.manager.evm.sendEOATransaction
import com.flowfoundation.wallet.manager.evm.signEthereumMessage
import com.flowfoundation.wallet.manager.evm.signTypedData
import com.flowfoundation.wallet.manager.wallet.WalletManager
import com.flowfoundation.wallet.page.browser.toFavIcon
import com.flowfoundation.wallet.page.browser.widgets.LilicoWebView
import com.flowfoundation.wallet.page.evm.EnableEVMDialog
import com.flowfoundation.wallet.page.token.custom.widget.AddCustomTokenDialog
import com.flowfoundation.wallet.utils.findActivity
import com.flowfoundation.wallet.utils.logd
import com.flowfoundation.wallet.utils.toast
import com.flowfoundation.wallet.utils.uiScope
import com.flowfoundation.wallet.widgets.webview.evm.dialog.EVMSendTransactionDialog
import com.flowfoundation.wallet.widgets.webview.evm.dialog.EvmRequestAccountDialog
import com.flowfoundation.wallet.widgets.webview.evm.model.EVMDialogModel
import com.flowfoundation.wallet.widgets.webview.evm.model.EvmTransaction
import com.flowfoundation.wallet.widgets.webview.evm.dialog.EVMSignMessageDialog
import com.flowfoundation.wallet.widgets.webview.evm.dialog.EVMSignTypedDataDialog
import com.flowfoundation.wallet.widgets.webview.evm.model.EVMTransactionDialogModel
import com.flowfoundation.wallet.widgets.webview.fcl.dialog.checkAndShowNetworkWrongDialog
import com.flowfoundation.wallet.widgets.webview.fcl.model.FclDialogModel
import com.google.gson.Gson
import org.json.JSONObject
import org.onflow.flow.models.bytesToHex
import org.web3j.utils.Numeric
import wallet.core.jni.CoinType
import wallet.core.jni.Hash
import wallet.core.jni.PublicKey


class EvmInterface(
    private val webView: LilicoWebView
) {
    companion object {
        const val ETH_NETWORK = "ethereum"
        const val TAG = "EVMInterface"
    }

    private fun activity(): FragmentActivity? {
        val activity = findActivity(webView)
        if (activity is FragmentActivity) {
            return activity
        }
        val currentActivity = BaseActivity.getCurrentActivity()
        return currentActivity as? FragmentActivity
    }

    @JavascriptInterface
    fun postMessage(json: String) {
        val obj = JSONObject(json)
        val id = obj.getLong("id")
        val method = DAppMethod.fromValue(obj.getString("name"))
        val network = obj.getString("network")
        val activity = activity()
        if (activity == null) {
            logd(TAG, "Activity is null, cannot show dialog")
            return
        }
        when (method) {
            DAppMethod.REQUEST_ACCOUNTS -> {
                if (webView.isLoading) {
                    toast(msgRes = R.string.wait_website_fully_loaded)
                    return
                }
                uiScope {
                    if (EVMWalletManager.haveEVMAddress()) {
                        val connect = EvmRequestAccountDialog().show(
                            activity.supportFragmentManager,
                            EVMDialogModel(
                                title = webView.title,
                                url = webView.url,
                                network = network
                            )
                        )
                        if (connect) {
                            val address = DAppEVMConnectionManager.getCurrentAccount()?.address.orEmpty()
                            webView.setAddress(network, address, id)
                        }
                    } else {
                        EnableEVMDialog.show(activity.supportFragmentManager)
                    }
                }
            }
            DAppMethod.SWITCH_ETHEREUM_CHAIN -> {
                uiScope {
                    when (val rpcChainId = extractRPCChainId(obj)) {
                        MAINNET_CHAIN_ID, TESTNET_CHAIN_ID -> {
                            if (checkAndShowNetworkWrongDialog(activity.supportFragmentManager,
                                FclDialogModel(
                                    title = webView.title,
                                    url = webView.url,
                                    network = networkStringByChainId(rpcChainId)
                                )
                            )) {
                                logd(TAG, "switch network to::${networkStringByChainId(rpcChainId)}")
                                return@uiScope
                            }
                            logd(TAG, "no need to switch")
                            webView.sendNull(network, id)
                        }
                        else -> {
                            logd(TAG, "Unsupported ChainId::$rpcChainId")
                            val message = activity.getString(R.string.unsupported_chain_id, rpcChainId)
                            toast(msg = message)
                            webView.sendError(network, message, id)
                        }
                    }
                }
            }
            DAppMethod.SIGN_MESSAGE -> {
                val data = extractMessage(obj)
                if (network == ETH_NETWORK)
                    uiScope {
                        handleSignMessage(activity, id, data, network)
                    }
            }
            DAppMethod.SIGN_PERSONAL_MESSAGE -> {
                val data = extractMessage(obj)
                uiScope {
                    handleSignMessage(activity, id, data, network)
                }
            }
            DAppMethod.SIGN_TRANSACTION -> {
                if (network == ETH_NETWORK) {
                    logd(TAG, "transaction obj::$obj")
                    val transaction = Gson().fromJson(obj.optString("object"), EvmTransaction::class.java)
                    logd(TAG, "transaction::$transaction")
                    uiScope {
                        handleTransaction(activity, transaction, id, network)
                    }
                }
            }
            DAppMethod.SIGN_TYPED_MESSAGE -> {
                val data = extractMessage(obj)
                val raw = extractRaw(obj)
                logd(TAG, "signTypedMessage obj::$obj")
                logd(TAG, "signTypedMessage data::$data")
                logd(TAG, "signTypedMessage raw::$raw")

                uiScope {
                    handleSignTypedMessage(activity, id, data, raw, network)
                }
            }
            DAppMethod.WATCH_ASSET -> {
                logd(TAG, "watchAsset obj::$obj")
                val contractAddress = extractContractAddress(obj)
                uiScope {
                    AddCustomTokenDialog.show(
                        activity.supportFragmentManager,
                        contractAddress
                    )
                    AddCustomTokenDialog.observe { approve ->
                        webView.sendResult(network, approve.toString(), id)
                    }
                }
            }
            DAppMethod.EC_RECOVER -> {
                logd(TAG, "EC_RECOVER obj::$obj")
                val param = obj.getJSONObject("object")
                val message = param.optString("message")
                val signature = param.optString("signature")

                if (message != null && signature != null) {
                    uiScope {
                        handleECRecover(id, message, signature, network)
                    }
                } else {
                    webView.sendError(network, "Invalid EC_RECOVER parameters", id)
                }
            }
            else -> {
                logd("evm", "methodNotImplement:::$method")
            }
        }
    }

    private fun handleECRecover(id: Long, message: String, signature: String, network: String) {
        logd(TAG, "=== EvmInterface handleECRecover ===")
        logd(TAG, "Message: $message")
        logd(TAG, "Signature: $signature")

        try {
            // Convert signature from hex to bytes
            val signatureBytes = Numeric.hexStringToByteArray(signature)

            if (signatureBytes.size != 65) {
                logd(TAG, "ERROR: Invalid signature length: ${signatureBytes.size}, expected 65")
                webView.sendError(network, "Invalid signature length", id)
                return
            }

            // Normalize signature (convert recovery ID from 27/28 to 0/1 if needed)
            val normalizedSignature = normalizeSignature(signatureBytes)

            // Create Ethereum signed message prefix: "\u0019Ethereum Signed Message:\n{message.size}"
            val prefix = "\u0019Ethereum Signed Message:\n${message.length}".toByteArray(Charsets.UTF_8)
            val payload = prefix + message.toByteArray(Charsets.UTF_8)

            // Hash the payload with keccak256
            val digest = Hash.keccak256(payload)

            logd(TAG, "Payload length: ${payload.size}")
            logd(TAG, "Digest: ${Numeric.toHexString(digest)}")

            // Recover public key from signature and digest
            val publicKey = try {
                PublicKey.recover(normalizedSignature, digest)
            } catch (e: Exception) {
                logd(TAG, "ERROR: Failed to recover public key: ${e.message}")
                webView.sendError(network, "Failed to recover public key", id)
                return
            }

            if (publicKey == null) {
                logd(TAG, "ERROR: Failed to recover public key - null result")
                webView.sendError(network, "Failed to recover public key", id)
                return
            }

            // Derive Ethereum address from public key
            val address = CoinType.ETHEREUM.deriveAddressFromPublicKey(publicKey)

            logd(TAG, "Recovered address: $address")
            webView.sendResult(network, address, id)

        } catch (e: Exception) {
            logd(TAG, "ERROR: Exception in handleECRecover: ${e.message}")
            e.printStackTrace()
            webView.sendError(network, "EC recovery failed: ${e.message}", id)
        }
    }

    // Normalize Ethereum signature (convert recovery ID from 27/28 to 0/1 if needed)
    private fun normalizeSignature(signature: ByteArray): ByteArray {
        val normalized = signature.copyOf()
        val recoveryId = signature[64].toInt() and 0xFF

        // Convert recovery ID from 27/28 to 0/1 if needed
        when (recoveryId) {
            27 -> normalized[64] = 0
            28 -> normalized[64] = 1
            // If already 0 or 1, keep as is
        }

        return normalized
    }

    private fun handleTransaction(activity: FragmentActivity, transaction: EvmTransaction, id: Long, network: String) {
        val model = EVMTransactionDialogModel(
            url = webView.url,
            title = webView.title,
            logo = webView.url?.toFavIcon(),
            toAddress = transaction.to,
            value = transaction.value,
            data = transaction.data
        )
        EVMSendTransactionDialog.show(
            activity.supportFragmentManager,
            model
        )
        EVMSendTransactionDialog.observe { isApprove ->
            if (isApprove) {
                if (DAppEVMConnectionManager.isCurrentEOAAccount()) {
                    sendEOATransaction(network, transaction) { txHash ->
                        webView.sendResult(network, txHash, id)
                    }
                } else {
                    sendCOATransaction(transaction) { txHash ->
                        webView.sendResult(network, txHash, id)
                    }
                }
            }
        }
    }

    private fun extractRPCChainId(json: JSONObject): Int {
        val param = json.getJSONObject("object")
        val chainId = param.getString("chainId")
        return chainId.removePrefix("0x").toInt(radix = 16)
    }

    private fun extractMessage(json: JSONObject): ByteArray {
        val param = json.getJSONObject("object")
        val data = param.getString("data")
        return Numeric.hexStringToByteArray(data)
    }

    private fun extractContractAddress(json: JSONObject): String {
        val param = json.getJSONObject("object")
        val contract = param.getString("contract")
        return contract
    }

    private fun extractRaw(json: JSONObject): String {
        val param = json.getJSONObject("object")
        return param.getString("raw")
    }

    private fun extractECRecoverParams(json: JSONObject): Pair<String, String>? {
        return try {
            val param = json.getJSONObject("object")

            logd(TAG, "extractECRecoverParams param: $param")

            // Try to extract as array first (like WalletConnect format)
            if (param.has("data")) {
                val dataString = param.getString("data")
                // If data contains both message and signature in some format
                logd(TAG, "Found data field: $dataString")

                // Try to parse as JSON array: ["message", "signature"]
                try {
                    val gson = Gson()
                    val array = gson.fromJson(dataString, Array<String>::class.java)
                    if (array.size >= 2) {
                        return Pair(array[0], array[1])
                    }
                } catch (e: Exception) {
                    logd(TAG, "Failed to parse data as JSON array: ${e.message}")
                }
            }

            // Try to extract separate fields
            if (param.has("message") && param.has("signature")) {
                val message = param.getString("message")
                val signature = param.getString("signature")
                logd(TAG, "Found separate fields - message: $message, signature: $signature")
                return Pair(message, signature)
            }

            // Try alternative field names
            if (param.has("msg") && param.has("sig")) {
                val message = param.getString("msg")
                val signature = param.getString("sig")
                logd(TAG, "Found alternative fields - msg: $message, sig: $signature")
                return Pair(message, signature)
            }

            logd(TAG, "Could not extract EC_RECOVER parameters from: $param")
            null
        } catch (e: Exception) {
            logd(TAG, "Error extracting EC_RECOVER parameters: ${e.message}")
            null
        }
    }

    private fun handleSignMessage(activity: FragmentActivity, id: Long, data: ByteArray, network: String) {
        val signMessage = String(data, Charsets.UTF_8)
        val model = FclDialogModel(
            signMessage = data.bytesToHex(),
            url = webView.url,
            title = webView.title,
            logo = webView.url?.toFavIcon(),
            network = network
        )
        EVMSignMessageDialog.show(
            activity.supportFragmentManager,
            model
        )
        EVMSignMessageDialog.observe { approve ->
            if (approve) {
                uiScope {
                    val signature = if (DAppEVMConnectionManager.isCurrentEOAAccount()) {
                        val result = WalletManager.wallet()?.ethSignPersonalMessage(data)
                        Numeric.toHexString(result)
                    } else {
                        signEthereumMessage(signMessage)
                    }
                    webView.sendResult(network, signature, id)
                }
            }
        }
    }

    private fun handleSignTypedMessage(activity: FragmentActivity, id: Long, data: ByteArray, raw: String, network: String) {
        val model = FclDialogModel(
            signMessage = raw,
            url = webView.url,
            title = webView.title,
            logo = webView.url?.toFavIcon(),
            network = network
        )
        EVMSignTypedDataDialog.show(
            activity.supportFragmentManager,
            model
        )
        EVMSignTypedDataDialog.observe { approve ->
            if (approve) {
                uiScope {
                    val signature = if (DAppEVMConnectionManager.isCurrentEOAAccount()) {
                        val result = WalletManager.wallet()?.ethSignTypedData(raw)
                        Numeric.toHexString(result)
                    } else {
                        signTypedData(data)
                    }
                    webView.sendResult(network, signature, id)
                }
            }
        }
    }

}
