package com.flowfoundation.wallet.network.interceptor

import com.flowfoundation.wallet.utils.logd
import com.flowfoundation.wallet.utils.loge
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import okhttp3.Interceptor
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import java.io.IOException

/**
 * PayerServiceInterceptor - Intercepts payer service HTTP responses to handle errors
 * and trigger surge pricing alerts when needed.
 *
 * This interceptor checks for non-2xx HTTP status codes from the payer service,
 * particularly handling surge pricing scenarios (429 SURGE_PRICING) and other
 * service errors (5xx).
 */
class PayerServiceInterceptor : Interceptor {
    companion object {
        private const val TAG = "PayerServiceInterceptor"
        private const val SURGE_PRICING_CODE = 429

        // Singleton instance for managing state
        @Volatile
        private var lastErrorResponse: PayerErrorResponse? = null

        @Volatile
        private var errorCallback: ((PayerErrorResponse) -> Unit)? = null

        /**
         * Set the callback to be invoked when a payer service error occurs
         */
        @JvmStatic
        fun setErrorCallback(callback: ((PayerErrorResponse) -> Unit)?) {
            errorCallback = callback
        }

        /**
         * Get the last error response from the payer service
         */
        @JvmStatic
        fun getLastErrorResponse(): PayerErrorResponse? = lastErrorResponse

        /**
         * Clear the last error response
         */
        @JvmStatic
        fun clearLastError() {
            lastErrorResponse = null
        }
    }

    /**
     * Data class representing the error response envelope from the payer service
     */
    data class PayerErrorResponse(
        @SerializedName("status")
        val status: Int,
        @SerializedName("data")
        val data: Any? = null,
        @SerializedName("message")
        val message: String? = null,

        // Additional fields for surge pricing scenarios
        @SerializedName("surgeActive")
        val surgeActive: Boolean = false,
        @SerializedName("surgeMultiplier")
        val surgeMultiplier: Double? = null,
        @SerializedName("estimatedFee")
        val estimatedFee: String? = null
    ) {
        fun isSurgePricing(): Boolean = status == SURGE_PRICING_CODE || surgeActive

        fun isServerError(): Boolean = status in 500..599

        fun getDisplayMessage(): String {
            return when {
                isSurgePricing() -> {
                    val multiplier = surgeMultiplier ?: 4.0
                    "Due to high network activity, transaction fees are elevated (${multiplier}× higher than usual). Flow Wallet is temporarily not paying for your gas."
                }
                isServerError() -> {
                    "The payer service is temporarily unavailable. Please try again later or use self-custody mode."
                }
                else -> {
                    message ?: "An error occurred with the payer service (status: $status)"
                }
            }
        }
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()

        // Only intercept requests to payer endpoints
        val url = request.url.toString()
        val isPayerRequest = url.contains("signAsPayer") ||
                            url.contains("signAsBridgeFeePayer") ||
                            url.contains("/payer/") ||
                            url.contains("/api/payer")

        if (!isPayerRequest) {
            return chain.proceed(request)
        }

        logd(TAG, "Intercepting payer service request: $url")

        val response = try {
            chain.proceed(request)
        } catch (e: IOException) {
            loge(TAG, "Network error during payer service request: ${e.message}")
            throw e
        }

        // Check for non-2xx status codes
        if (!response.isSuccessful) {
            logd(TAG, "Payer service returned error: ${response.code} ${response.message}")

            // Try to parse the error response body
            val errorBody = response.body?.string()
            val errorResponse = try {
                if (!errorBody.isNullOrBlank()) {
                    Gson().fromJson(errorBody, PayerErrorResponse::class.java)?.copy(
                        status = response.code
                    ) ?: PayerErrorResponse(
                        status = response.code,
                        message = response.message
                    )
                } else {
                    PayerErrorResponse(
                        status = response.code,
                        message = response.message
                    )
                }
            } catch (e: Exception) {
                logd(TAG, "Failed to parse error response: ${e.message}")
                PayerErrorResponse(
                    status = response.code,
                    message = response.message
                )
            }

            // Handle surge pricing scenario
            if (errorResponse.isSurgePricing()) {
                logd(TAG, "SURGE PRICING DETECTED: ${errorResponse.getDisplayMessage()}")
                lastErrorResponse = errorResponse

                // Invoke callback if set (will trigger UI alert)
                errorCallback?.invoke(errorResponse)
            } else if (errorResponse.isServerError()) {
                logd(TAG, "PAYER SERVICE ERROR: ${errorResponse.getDisplayMessage()}")
                lastErrorResponse = errorResponse

                // Invoke callback for server errors as well
                errorCallback?.invoke(errorResponse)
            }

            // Rebuild response with the original body so it can be consumed again
            return response.newBuilder()
                .body(errorBody?.toResponseBody(response.body?.contentType()))
                .build()
        }

        // Clear any previous error on successful response
        if (response.isSuccessful) {
            clearLastError()
        }

        return response
    }
}