package com.flowfoundation.wallet.network.interceptor

import android.app.Activity
import com.flowfoundation.wallet.BuildConfig
import com.flowfoundation.wallet.widgets.SurgePricingAlertViewXML
import com.flowfoundation.wallet.utils.logd
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Protocol
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody

/**
 * Test interceptor to simulate surge pricing responses
 * Add this to your OkHttp client to test the horizontal interceptor flow
 */
class TestSurgeInterceptor(
    private val activity: Activity,
    private val testMode: TestMode = TestMode.SURGE_HIGH
) : Interceptor {

    enum class TestMode {
        SURGE_HIGH,      // 429 with 5x multiplier
        SURGE_MODERATE,  // 429 with 1.5x multiplier
        SERVICE_ERROR,   // 503 error
        RANDOM,          // Randomly trigger surge on some requests
        DISABLED         // Pass through normally
    }

    companion object {
        private const val TAG = "TestSurgeInterceptor"

        // Set this to true in debug builds to force surge responses
        @JvmStatic
        var isTestingEnabled = BuildConfig.DEBUG && false // Change to true to enable

        // Probability of triggering surge in RANDOM mode (0.0 to 1.0)
        private const val RANDOM_SURGE_PROBABILITY = 0.3
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()

        // Only intercept if testing is enabled
        if (!isTestingEnabled || testMode == TestMode.DISABLED) {
            return chain.proceed(request)
        }

        // Check if this is a payer service request (adjust URL pattern as needed)
        val isPayerRequest = request.url.toString().contains("/v1/payer") ||
                            request.url.toString().contains("/transaction") ||
                            request.url.toString().contains("/flow")

        if (!isPayerRequest) {
            return chain.proceed(request)
        }

        // Decide whether to simulate surge based on test mode
        val shouldSimulateSurge = when (testMode) {
            TestMode.RANDOM -> Math.random() < RANDOM_SURGE_PROBABILITY
            TestMode.DISABLED -> false
            else -> true
        }

        if (!shouldSimulateSurge) {
            return chain.proceed(request)
        }

        logd(TAG, "Simulating surge pricing for request: ${request.url}")

        // Create mock surge response based on test mode
        val (statusCode, surgeMultiplier, message) = when (testMode) {
            TestMode.SURGE_HIGH -> Triple(
                429,
                5.0,
                "Extreme network congestion detected. Transaction fees are significantly elevated."
            )
            TestMode.SURGE_MODERATE -> Triple(
                429,
                1.5,
                "Moderate network activity. Fees are slightly higher than normal."
            )
            TestMode.SERVICE_ERROR -> Triple(
                503,
                null,
                "Payer service is temporarily unavailable. Please try again later."
            )
            TestMode.RANDOM -> if (Math.random() < 0.5) {
                Triple(429, 3.0, "High network demand detected.")
            } else {
                Triple(503, null, "Service temporarily unavailable.")
            }
            else -> Triple(200, null, "OK") // Should not reach here
        }

        // Create mock error response
        val errorResponse = PayerServiceInterceptor.PayerErrorResponse(
            status = statusCode,
            error = null,
            message = message,
            surgeInfo = if (statusCode == 429 && surgeMultiplier != null) {
                PayerServiceInterceptor.SurgeInfo(
                    active = true,
                    multiplier = surgeMultiplier,
                    maxFee = 0.001 * surgeMultiplier
                )
            } else null
        )

        // Show the surge alert dialog
        activity.runOnUiThread {
            SurgePricingAlertViewXML.showSurgeAlert(activity, errorResponse) { accepted ->
                logd(TAG, "User decision for test surge: accepted=$accepted")

                if (accepted) {
                    // In a real scenario, you would retry the request with surge acceptance
                    // For testing, just log it
                    logd(TAG, "User accepted surge pricing - would retry transaction")
                } else {
                    // User rejected surge pricing
                    logd(TAG, "User rejected surge pricing - transaction cancelled")
                }
            }
        }

        // Return a mock error response
        val responseBody = """
            {
                "status": $statusCode,
                "message": "$message",
                "surgeActive": ${statusCode == 429},
                ${surgeMultiplier?.let { "\"surgeMultiplier\": $it," } ?: ""}
                ${surgeMultiplier?.let { "\"estimatedFee\": \"${0.001 * it}\"," } ?: ""}
                "timestamp": ${System.currentTimeMillis()}
            }
        """.trimIndent()

        return Response.Builder()
            .request(request)
            .protocol(Protocol.HTTP_1_1)
            .code(statusCode)
            .message(if (statusCode == 429) "Too Many Requests" else "Service Unavailable")
            .body(responseBody.toResponseBody("application/json".toMediaType()))
            .build()
    }
}

/**
 * Extension function to add test surge interceptor to OkHttpClient
 *
 * Usage in your network module:
 * ```
 * val client = OkHttpClient.Builder()
 *     .addTestSurgeInterceptor(activity) // Add this line for testing
 *     .addInterceptor(PayerServiceInterceptor())
 *     .build()
 * ```
 */
fun OkHttpClient.Builder.addTestSurgeInterceptor(
    activity: Activity,
    testMode: TestSurgeInterceptor.TestMode = TestSurgeInterceptor.TestMode.SURGE_HIGH
): OkHttpClient.Builder {
    if (BuildConfig.DEBUG) {
        addInterceptor(TestSurgeInterceptor(activity, testMode))
    }
    return this
}