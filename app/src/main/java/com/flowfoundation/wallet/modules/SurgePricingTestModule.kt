package com.flowfoundation.wallet.modules

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.flowfoundation.wallet.network.interceptor.PayerServiceInterceptor
import com.flowfoundation.wallet.widgets.SurgePricingAlertViewXML
import com.flowfoundation.wallet.utils.logd

/**
 * React Native module to test surge pricing dialog from JavaScript
 */
class SurgePricingTestModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "SurgePricingTest"
    }

    @ReactMethod
    fun showTestDialog() {
        currentActivity?.let { activity ->
            activity.runOnUiThread {
                val testErrorResponse = PayerServiceInterceptor.PayerErrorResponse(
                    status = 429,
                    error = null,
                    message = "Network demand is high. Transaction fees have temporarily increased to manage network load.",
                    surgeInfo = PayerServiceInterceptor.SurgeInfo(
                        active = true,
                        multiplier = 3.0,
                        maxFee = 0.003
                    )
                )

                SurgePricingAlertViewXML.showSurgeAlert(activity, testErrorResponse) { accepted ->
                    logd("SurgePricingTest", "User decision: $accepted")
                }
            }
        }
    }

    @ReactMethod
    fun showHighSurge() {
        showScenario(429, "Extreme network congestion!", 5.0, "0.005")
    }

    @ReactMethod
    fun showModerateSurge() {
        showScenario(429, "Moderate network activity.", 1.5, "0.0015")
    }

    @ReactMethod
    fun showServiceError() {
        showScenario(503, "Service temporarily unavailable.", null, null)
    }

    private fun showScenario(status: Int, message: String, multiplier: Double?, fee: String?) {
        currentActivity?.let { activity ->
            activity.runOnUiThread {
                val errorResponse = PayerServiceInterceptor.PayerErrorResponse(
                    status = status,
                    error = null,
                    message = message,
                    surgeInfo = if (status == 429 && multiplier != null && fee != null) {
                        PayerServiceInterceptor.SurgeInfo(
                            active = true,
                            multiplier = multiplier,
                            maxFee = fee.toDoubleOrNull() ?: 0.001
                        )
                    } else null
                )

                SurgePricingAlertViewXML.showSurgeAlert(activity, errorResponse) { accepted ->
                    logd("SurgePricingTest", "Scenario status=$status, accepted=$accepted")
                }
            }
        }
    }
}