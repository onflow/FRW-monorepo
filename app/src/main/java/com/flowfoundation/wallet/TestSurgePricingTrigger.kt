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
            error = null,
            message = "Network demand is high. Transaction fees have temporarily increased.",
            surgeInfo = PayerServiceInterceptor.SurgeInfo(
                active = true,
                multiplier = 3.0,  // 3x normal fee
                maxFee = 0.003    // 0.003 FLOW
            )
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
                error = null,
                message = "Extreme network congestion. Fees are 5x higher than normal.",
                surgeInfo = PayerServiceInterceptor.SurgeInfo(
                    active = true,
                    multiplier = 5.0,
                    maxFee = 0.005
                )
            )

            TestScenario.MODERATE_SURGE -> PayerServiceInterceptor.PayerErrorResponse(
                status = 429,
                error = null,
                message = "Moderate network activity. Fees are slightly elevated.",
                surgeInfo = PayerServiceInterceptor.SurgeInfo(
                    active = true,
                    multiplier = 1.5,
                    maxFee = 0.0015
                )
            )

            TestScenario.SERVICE_ERROR -> PayerServiceInterceptor.PayerErrorResponse(
                status = 503,
                error = null,
                message = "Service temporarily unavailable. Please try again.",
                surgeInfo = null
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