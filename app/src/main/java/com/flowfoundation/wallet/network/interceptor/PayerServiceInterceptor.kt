package com.flowfoundation.wallet.network.interceptor

import com.flowfoundation.wallet.utils.logd
import com.flowfoundation.wallet.utils.loge
import com.google.gson.Gson
import com.google.gson.JsonObject
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
     * Data class representing the surge info from the payer status API
     */
    data class SurgeInfo(
        @SerializedName("active")
        val active: Boolean = false,

        @SerializedName("multiplier")
        val multiplier: Double? = null,

        @SerializedName("expiresAt")
        val expiresAt: Long? = null,

        @SerializedName("ttlSeconds")
        val ttlSeconds: Long? = null,

        @SerializedName("sampledAt")
        val sampledAt: Long? = null,

        @SerializedName("maxFee")
        val maxFee: Double? = null
    )

    /**
     * Data class representing the payer info
     */
    data class PayerInfo(
        @SerializedName("enabled")
        val enabled: Boolean = false,

        @SerializedName("balance")
        val balance: String? = null
    )

    /**
     * Data class representing the payload from payer/status endpoint
     */
    data class PayerStatusPayload(
        @SerializedName("statusVersion")
        val statusVersion: Int = 1,

        @SerializedName("surge")
        val surge: SurgeInfo? = null,

        @SerializedName("feePayer")
        val feePayer: PayerInfo? = null,

        @SerializedName("network")
        val network: String? = null
    )

    /**
     * Data class representing the API response envelope
     */
    data class PayerStatusResponse(
        @SerializedName("status")
        val status: Int,

        @SerializedName("data")
        val data: PayerStatusPayload? = null,

        @SerializedName("message")
        val message: String? = null
    )

    /**
     * Data class representing the error response for surge pricing (429 responses)
     */
    data class PayerErrorResponse(
        // The HTTP status code (not from JSON, set manually)
        val status: Int,

        // The actual error field from the JSON response (for 429 responses)
        @SerializedName("error")
        val error: String? = null,

        // Standard API response fields (might not be present in all error responses)
        @SerializedName("message")
        val message: String? = null,

        // Surge info extracted from status check or error response
        var surgeInfo: SurgeInfo? = null
    ) {
        fun isSurgePricing(): Boolean = status == SURGE_PRICING_CODE || surgeInfo?.active == true

        fun isServerError(): Boolean = status in 500..599

        fun getSurgeMultiplier(): Double = surgeInfo?.multiplier ?: 4.0

        fun getEstimatedFee(): String {
            return surgeInfo?.maxFee?.let {
                String.format("%.6f", it)
            } ?: "0.003"
        }
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()

        // Only intercept requests to payer endpoints
        val url = request.url.toString()

        // Log ALL requests to see what's happening
        logd(TAG, "Request URL: $url")

        val isPayerRequest = url.contains("signAsFeePayer") ||
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
            logd(TAG, "==================== PAYER SERVICE ERROR ====================")
            logd(TAG, "URL: $url")
            logd(TAG, "Response Code: ${response.code}")
            logd(TAG, "Response Message: ${response.message}")
            logd(TAG, "Headers: ${response.headers}")

            // Try to parse the error response body
            val errorBody = response.body?.string()
            logd(TAG, "Raw Error Response Body: $errorBody")

            // Try to parse as JSON object for better logging
            try {
                val jsonObject = Gson().fromJson(errorBody, com.google.gson.JsonObject::class.java)
                logd(TAG, "Parsed JSON response:")
                jsonObject?.entrySet()?.forEach { entry ->
                    logd(TAG, "  - ${entry.key}: ${entry.value}")
                }
            } catch (e: Exception) {
                logd(TAG, "Could not parse as JSON object: ${e.message}")
            }

            val errorResponse = try {
                if (!errorBody.isNullOrBlank()) {
                    // For 429 responses, the server returns just {"error": "message"}
                    // For other responses, it might return the standard API envelope
                    val parsed = if (response.code == SURGE_PRICING_CODE) {
                        // Parse the simple error response for 429
                        val simpleError = Gson().fromJson(errorBody, PayerErrorResponse::class.java)
                        logd(TAG, "Parsed 429 response:")
                        logd(TAG, "  - error: ${simpleError?.error}")

                        // Create error response with surge info
                        simpleError?.copy(
                            status = response.code,
                            surgeInfo = SurgeInfo(
                                active = true,
                                multiplier = 4.0, // Default multiplier
                                maxFee = 0.003    // Default fee
                            )
                        ) ?: PayerErrorResponse(
                            status = response.code,
                            error = errorBody,
                            surgeInfo = SurgeInfo(active = true, multiplier = 4.0, maxFee = 0.003)
                        )
                    } else {
                        // Try to parse as standard API response
                        try {
                            val apiResponse = Gson().fromJson(errorBody, PayerStatusResponse::class.java)
                            logd(TAG, "Parsed standard API response:")
                            logd(TAG, "  - status: ${apiResponse?.status}")
                            logd(TAG, "  - message: ${apiResponse?.message}")

                            PayerErrorResponse(
                                status = response.code,
                                message = apiResponse?.message ?: response.message,
                                surgeInfo = apiResponse?.data?.surge
                            )
                        } catch (e: Exception) {
                            // Fallback to simple error response
                            val simpleError = Gson().fromJson(errorBody, PayerErrorResponse::class.java)
                            simpleError?.copy(status = response.code) ?: PayerErrorResponse(
                                status = response.code,
                                error = errorBody
                            )
                        }
                    }

                    parsed
                } else {
                    logd(TAG, "Error body is empty, creating default PayerErrorResponse")
                    PayerErrorResponse(
                        status = response.code,
                        message = response.message
                    )
                }
            } catch (e: Exception) {
                logd(TAG, "Failed to parse error response: ${e.message}")
                PayerErrorResponse(
                    status = response.code,
                    message = response.message,
                    error = errorBody
                )
            }

            // Handle surge pricing scenario
            if (errorResponse.isSurgePricing()) {
                logd(TAG, "🚨 SURGE PRICING DETECTED 🚨")
                lastErrorResponse = errorResponse

                // Invoke callback if set (will trigger UI alert)
                errorCallback?.invoke(errorResponse)
            } else if (errorResponse.isServerError()) {
                logd(TAG, "❌ PAYER SERVICE ERROR ❌")
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

            // Log successful response details
            logd(TAG, "==================== PAYER SERVICE SUCCESS ====================")
            logd(TAG, "URL: $url")
            logd(TAG, "Response Code: ${response.code}")
            logd(TAG, "Response Headers: ${response.headers}")

            // Peek at response body without consuming it (for debugging)
            try {
                val responseBody = response.peekBody(1024 * 1024) // Peek at 1MB max
                val bodyString = responseBody.string()
                logd(TAG, "Success Response Body: $bodyString")

                // Try to parse as JSON for better logging
                try {
                    val jsonObject = Gson().fromJson(bodyString, com.google.gson.JsonObject::class.java)
                    logd(TAG, "Parsed success response fields:")
                    jsonObject?.entrySet()?.forEach { entry ->
                        logd(TAG, "  - ${entry.key}: ${entry.value}")
                    }
                } catch (e: Exception) {
                    logd(TAG, "Response is not JSON format")
                }
            } catch (e: Exception) {
                logd(TAG, "Could not peek response body: ${e.message}")
            }
        }

        return response
    }
}
