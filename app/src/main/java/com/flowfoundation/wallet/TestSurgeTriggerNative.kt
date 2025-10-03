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
            error = null,
            message = "High network demand. Transaction fees have increased 3x.",
            surgeInfo = PayerServiceInterceptor.SurgeInfo(
                active = true,
                multiplier = 3.0,
                maxFee = 0.003
            )
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
                error = null,
                message = "Network activity is slightly elevated",
                surgeInfo = PayerServiceInterceptor.SurgeInfo(
                    active = true,
                    multiplier = 1.2,
                    maxFee = 0.0012
                )
            )

            InterceptorScenario.SURGE_MODERATE -> PayerServiceInterceptor.PayerErrorResponse(
                status = 429,
                error = null,
                message = "Moderate network congestion detected",
                surgeInfo = PayerServiceInterceptor.SurgeInfo(
                    active = true,
                    multiplier = 2.0,
                    maxFee = 0.002
                )
            )

            InterceptorScenario.SURGE_HIGH -> PayerServiceInterceptor.PayerErrorResponse(
                status = 429,
                error = null,
                message = "High network demand! Fees are significantly elevated",
                surgeInfo = PayerServiceInterceptor.SurgeInfo(
                    active = true,
                    multiplier = 5.0,
                    maxFee = 0.005
                )
            )

            InterceptorScenario.SURGE_EXTREME -> PayerServiceInterceptor.PayerErrorResponse(
                status = 429,
                error = null,
                message = "EXTREME network congestion! Consider waiting",
                surgeInfo = PayerServiceInterceptor.SurgeInfo(
                    active = true,
                    multiplier = 10.0,
                    maxFee = 0.01
                )
            )

            InterceptorScenario.SERVICE_UNAVAILABLE -> PayerServiceInterceptor.PayerErrorResponse(
                status = 503,
                error = null,
                message = "Payer service is temporarily unavailable",
                surgeInfo = null
            )

            InterceptorScenario.GATEWAY_TIMEOUT -> PayerServiceInterceptor.PayerErrorResponse(
                status = 504,
                error = null,
                message = "Gateway timeout - service is overloaded",
                surgeInfo = null
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
        logd(TAG, "Adding surge multiplier: X-Surge-Multiplier = ${errorResponse.getSurgeMultiplier()}")
        logd(TAG, "Retrying transaction with fee: ${errorResponse.getEstimatedFee()} FLOW")

        // Simulate network delay
        Thread.sleep(1000)

        // Simulate success
        logd(TAG, "Transaction successful with surge pricing!")
        logd(TAG, "Transaction ID: tx_${System.currentTimeMillis()}")
        logd(TAG, "Final fee paid: ${errorResponse.getEstimatedFee()} FLOW")
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