package com.flowfoundation.wallet.mixpanel

import com.flowfoundation.wallet.network.interceptor.PayerServiceInterceptor
import com.flowfoundation.wallet.utils.logd

/**
 * SurgePricingMetrics - Telemetry tracking for surge pricing events
 *
 * Tracks impressions, user decisions, and outcomes for surge pricing scenarios
 */
object SurgePricingMetrics {
    private const val TAG = "SurgePricingMetrics"

    /**
     * Track when surge pricing alert is shown to user
     */
    @JvmStatic
    fun trackSurgeAlertShown(errorResponse: PayerServiceInterceptor.PayerErrorResponse) {
        logd(TAG, "Tracking surge alert shown: status=${errorResponse.status}")

        val properties = mutableMapOf<String, Any>(
            "status_code" to errorResponse.status,
            "is_surge_pricing" to errorResponse.isSurgePricing(),
            "is_server_error" to errorResponse.isServerError(),
            "message" to (errorResponse.message ?: ""),
            "timestamp" to System.currentTimeMillis()
        )

        errorResponse.surgeInfo?.multiplier?.let {
            properties["surge_multiplier"] = it
        }

        errorResponse.surgeInfo?.maxFee?.let {
            properties["estimated_fee"] = it
        }

        MixpanelManager.track("surge_alert_shown", properties)
    }

    /**
     * Track user decision on surge pricing
     */
    @JvmStatic
    fun trackSurgeDecision(
        accepted: Boolean,
        errorResponse: PayerServiceInterceptor.PayerErrorResponse
    ) {
        logd(TAG, "Tracking surge decision: accepted=$accepted, status=${errorResponse.status}")

        val properties = mutableMapOf<String, Any>(
            "decision" to if (accepted) "accepted" else "cancelled",
            "status_code" to errorResponse.status,
            "is_surge_pricing" to errorResponse.isSurgePricing(),
            "is_server_error" to errorResponse.isServerError(),
            "timestamp" to System.currentTimeMillis()
        )

        errorResponse.surgeInfo?.multiplier?.let {
            properties["surge_multiplier"] = it
        }

        errorResponse.surgeInfo?.maxFee?.let {
            properties["estimated_fee"] = it
        }

        MixpanelManager.track("surge_decision", properties)
    }

    /**
     * Track the outcome after surge pricing acceptance
     */
    @JvmStatic
    fun trackSurgeTransactionOutcome(
        success: Boolean,
        transactionId: String? = null,
        errorMessage: String? = null
    ) {
        logd(TAG, "Tracking surge transaction outcome: success=$success, txId=$transactionId")

        val properties = mutableMapOf<String, Any>(
            "success" to success,
            "timestamp" to System.currentTimeMillis()
        )

        transactionId?.let {
            properties["transaction_id"] = it
        }

        errorMessage?.let {
            properties["error_message"] = it
        }

        MixpanelManager.track("surge_transaction_outcome", properties)
    }

    /**
     * Track hold-to-confirm interaction
     */
    @JvmStatic
    fun trackHoldToConfirm(
        completed: Boolean,
        holdDurationMs: Long
    ) {
        logd(TAG, "Tracking hold-to-confirm: completed=$completed, duration=${holdDurationMs}ms")

        val properties = mapOf(
            "completed" to completed,
            "hold_duration_ms" to holdDurationMs,
            "timestamp" to System.currentTimeMillis()
        )

        MixpanelManager.track("surge_hold_to_confirm", properties)
    }

    /**
     * Track preflight status cache usage
     */
    @JvmStatic
    fun trackPreflightCacheUsage(
        cacheHit: Boolean,
        cacheAgeMs: Long? = null
    ) {
        logd(TAG, "Tracking preflight cache usage: hit=$cacheHit, age=${cacheAgeMs}ms")

        val properties = mutableMapOf<String, Any>(
            "cache_hit" to cacheHit,
            "timestamp" to System.currentTimeMillis()
        )

        cacheAgeMs?.let {
            properties["cache_age_ms"] = it
        }

        MixpanelManager.track("surge_preflight_cache", properties)
    }
}