package com.flowfoundation.wallet

import android.app.Activity
import com.flowfoundation.wallet.network.interceptor.PayerServiceInterceptor
import com.flowfoundation.wallet.network.interceptor.TestSurgeInterceptor
import com.flowfoundation.wallet.widgets.SurgePricingAlertView
import com.flowfoundation.wallet.widgets.SurgePricingAlertViewXML
import com.flowfoundation.wallet.utils.logd

/**
 * Native Android test methods for surge pricing horizontal interceptor
 * This simulates what would happen when the PayerServiceInterceptor
 * receives a 429/503 response from the network
 */
object TestSurgeTriggerNative {

    private const val TAG = "TestSurgeTriggerNative"

    /**
     * Method 1: Directly show the dialog (simplest for UI testing)
     */
    @JvmStatic
    fun testDirectDialog(activity: Activity) {
        val errorResponse = PayerServiceInterceptor.PayerErrorResponse(
            status = 429,
            data = null,
            message = "High network demand. Transaction fees have increased 3x.",
            surgeActive = true,
            surgeMultiplier = 3.0,
            estimatedFee = "0.003"
        )

        // Use XML version for better UI control
        SurgePricingAlertViewXML.showSurgeAlert(activity, errorResponse) { accepted ->
            logd(TAG, "Direct dialog test - User accepted: $accepted")

            if (accepted) {
                // Simulate transaction retry with surge acceptance
                logd(TAG, "Would retry transaction with surge fee")
            } else {
                // Simulate transaction cancellation
                logd(TAG, "Transaction cancelled by user")
            }
        }
    }

    /**
     * Method 2: Enable test interceptor globally
     * This will intercept actual network requests
     */
    @JvmStatic
    fun enableTestInterceptor(enable: Boolean = true) {
        TestSurgeInterceptor.isTestingEnabled = enable
        logd(TAG, "Test interceptor ${if (enable) "ENABLED" else "DISABLED"}")

        if (enable) {
            logd(TAG, "All payer service requests will now trigger surge pricing alerts")
        }
    }

    /**
     * Method 3: Simulate what PayerServiceInterceptor would do
     * This is the most realistic test of the horizontal interceptor flow
     */
    @JvmStatic
    fun simulateInterceptorFlow(activity: Activity, scenario: InterceptorScenario) {
        logd(TAG, "Simulating interceptor flow for scenario: $scenario")

        // Create error response based on scenario
        val errorResponse = when (scenario) {
            InterceptorScenario.SURGE_LOW -> PayerServiceInterceptor.PayerErrorResponse(
                status = 429,
                data = null,
                message = "Network activity is slightly elevated",
                surgeActive = true,
                surgeMultiplier = 1.2,
                estimatedFee = "0.0012"
            )

            InterceptorScenario.SURGE_MODERATE -> PayerServiceInterceptor.PayerErrorResponse(
                status = 429,
                data = null,
                message = "Moderate network congestion detected",
                surgeActive = true,
                surgeMultiplier = 2.0,
                estimatedFee = "0.002"
            )

            InterceptorScenario.SURGE_HIGH -> PayerServiceInterceptor.PayerErrorResponse(
                status = 429,
                data = null,
                message = "High network demand! Fees are significantly elevated",
                surgeActive = true,
                surgeMultiplier = 5.0,
                estimatedFee = "0.005"
            )

            InterceptorScenario.SURGE_EXTREME -> PayerServiceInterceptor.PayerErrorResponse(
                status = 429,
                data = null,
                message = "EXTREME network congestion! Consider waiting",
                surgeActive = true,
                surgeMultiplier = 10.0,
                estimatedFee = "0.01"
            )

            InterceptorScenario.SERVICE_UNAVAILABLE -> PayerServiceInterceptor.PayerErrorResponse(
                status = 503,
                data = null,
                message = "Payer service is temporarily unavailable",
                surgeActive = false,
                surgeMultiplier = null,
                estimatedFee = null
            )

            InterceptorScenario.GATEWAY_TIMEOUT -> PayerServiceInterceptor.PayerErrorResponse(
                status = 504,
                data = null,
                message = "Gateway timeout - service is overloaded",
                surgeActive = false,
                surgeMultiplier = null,
                estimatedFee = null
            )
        }

        // Set the error callback (simulating what the app would do)
        PayerServiceInterceptor.setErrorCallback { error ->
            logd(TAG, "Interceptor callback triggered with status: ${error.status}")

            // This is where the horizontal interceptor would trigger the alert
            SurgePricingAlertViewXML.showSurgeAlert(activity, error) { accepted ->
                logd(TAG, "Interceptor flow - User decision: $accepted")

                if (accepted) {
                    // In real flow, this would:
                    // 1. Add surge acceptance header to request
                    // 2. Retry the transaction
                    // 3. Monitor the result
                    logd(TAG, "Simulating transaction retry with surge acceptance")
                    simulateTransactionRetry(error)
                } else {
                    // In real flow, this would:
                    // 1. Cancel the pending transaction
                    // 2. Clear any cached preflight data
                    // 3. Notify the UI of cancellation
                    logd(TAG, "Simulating transaction cancellation")
                    simulateTransactionCancel()
                }

                // Clear the callback after handling
                PayerServiceInterceptor.setErrorCallback(null)
            }
        }

        // Trigger the error (simulating network response)
        // In a real scenario, this would be triggered by the interceptor
        // For testing, we directly invoke the callback we just set
        errorResponse.let { error ->
            activity.runOnUiThread {
                SurgePricingAlertViewXML.showSurgeAlert(activity, error) { accepted ->
                    logd(TAG, "Interceptor flow - User decision: $accepted")

                    if (accepted) {
                        simulateTransactionRetry(error)
                    } else {
                        simulateTransactionCancel()
                    }
                }
            }
        }
    }

    /**
     * Simulate transaction retry after surge acceptance
     */
    private fun simulateTransactionRetry(errorResponse: PayerServiceInterceptor.PayerErrorResponse) {
        logd(TAG, "=== SIMULATING TRANSACTION RETRY ===")
        logd(TAG, "Adding surge acceptance header: X-Accept-Surge = true")
        logd(TAG, "Adding surge multiplier: X-Surge-Multiplier = ${errorResponse.surgeMultiplier}")
        logd(TAG, "Retrying transaction with fee: ${errorResponse.estimatedFee} FLOW")

        // Simulate network delay
        Thread.sleep(1000)

        // Simulate success
        logd(TAG, "Transaction successful with surge pricing!")
        logd(TAG, "Transaction ID: tx_${System.currentTimeMillis()}")
        logd(TAG, "Final fee paid: ${errorResponse.estimatedFee} FLOW")
    }

    /**
     * Simulate transaction cancellation
     */
    private fun simulateTransactionCancel() {
        logd(TAG, "=== TRANSACTION CANCELLED ===")
        logd(TAG, "Clearing preflight cache")
        logd(TAG, "Notifying UI of cancellation")
        logd(TAG, "Transaction rolled back")
    }

    enum class InterceptorScenario {
        SURGE_LOW,           // 1.2x multiplier
        SURGE_MODERATE,      // 2x multiplier
        SURGE_HIGH,          // 5x multiplier
        SURGE_EXTREME,       // 10x multiplier
        SERVICE_UNAVAILABLE, // 503 error
        GATEWAY_TIMEOUT      // 504 error
    }
}