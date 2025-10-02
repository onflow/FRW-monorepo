package com.flowfoundation.wallet

import android.app.Activity
import com.flowfoundation.wallet.network.interceptor.PayerServiceInterceptor
import com.flowfoundation.wallet.widgets.SurgePricingAlertViewXML
import com.flowfoundation.wallet.utils.logd

/**
 * Test helper to trigger surge pricing dialog for development/testing
 */
object TestSurgePricingTrigger {

    /**
     * Trigger the surge pricing dialog with test data
     * Call this from any Activity where you want to test the dialog
     */
    @JvmStatic
    fun showTestSurgeDialog(activity: Activity) {
        // Create a mock error response that simulates surge pricing
        val testErrorResponse = PayerServiceInterceptor.PayerErrorResponse(
            status = 429,  // 429 = surge pricing, 503 = service unavailable
            data = null,
            message = "Network demand is high. Transaction fees have temporarily increased.",
            surgeActive = true,
            surgeMultiplier = 3.0,  // 3x normal fee
            estimatedFee = "0.003"  // 0.003 FLOW
        )

        // Show the dialog
        SurgePricingAlertViewXML.showSurgeAlert(activity, testErrorResponse) { accepted ->
            if (accepted) {
                logd("TestSurge", "User accepted surge pricing in test")
                // Handle acceptance - in real scenario, this would retry the transaction
            } else {
                logd("TestSurge", "User rejected surge pricing in test")
                // Handle rejection - in real scenario, this would cancel the transaction
            }
        }
    }

    /**
     * Trigger with different test scenarios
     */
    @JvmStatic
    fun showTestScenario(activity: Activity, scenario: TestScenario) {
        val errorResponse = when (scenario) {
            TestScenario.HIGH_SURGE -> PayerServiceInterceptor.PayerErrorResponse(
                status = 429,
                data = null,
                message = "Extreme network congestion. Fees are 5x higher than normal.",
                surgeActive = true,
                surgeMultiplier = 5.0,
                estimatedFee = "0.005"
            )

            TestScenario.MODERATE_SURGE -> PayerServiceInterceptor.PayerErrorResponse(
                status = 429,
                data = null,
                message = "Moderate network activity. Fees are slightly elevated.",
                surgeActive = true,
                surgeMultiplier = 1.5,
                estimatedFee = "0.0015"
            )

            TestScenario.SERVICE_ERROR -> PayerServiceInterceptor.PayerErrorResponse(
                status = 503,
                data = null,
                message = "Service temporarily unavailable. Please try again.",
                surgeActive = false,
                surgeMultiplier = null,
                estimatedFee = null
            )
        }

        SurgePricingAlertViewXML.showSurgeAlert(activity, errorResponse) { accepted ->
            logd("TestSurge", "Scenario: $scenario, Accepted: $accepted")
        }
    }

    enum class TestScenario {
        HIGH_SURGE,
        MODERATE_SURGE,
        SERVICE_ERROR
    }
}