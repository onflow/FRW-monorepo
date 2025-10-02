package com.flowfoundation.wallet.widgets

import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Handler
import android.os.Looper
import android.view.*
import android.widget.FrameLayout
import android.widget.TextView
import androidx.appcompat.widget.AppCompatButton
import androidx.core.content.ContextCompat
import com.flowfoundation.wallet.R
import com.flowfoundation.wallet.network.interceptor.PayerServiceInterceptor
import com.flowfoundation.wallet.mixpanel.SurgePricingMetrics
import com.flowfoundation.wallet.utils.logd

/**
 * SurgePricingAlertViewXML - XML-based version of the surge pricing alert dialog
 *
 * This version uses an XML layout file for better UI control and preview capabilities
 * in Android Studio's Layout Editor.
 *
 * Benefits:
 * - Visual preview in Android Studio
 * - Better separation of UI and logic
 * - Easier customization through XML
 * - Theme support and style resources
 */
class SurgePricingAlertViewXML {

    companion object {
        private const val TAG = "SurgePricingAlertXML"
        private const val HOLD_DURATION_MS = 2500L // 2.5 seconds hold to confirm

        @Volatile
        private var currentDialog: Dialog? = null

        @Volatile
        private var isAlertShowing = false

        @Volatile
        private var userDecisionCallback: ((Boolean) -> Unit)? = null

        /**
         * Show surge pricing alert dialog using XML layout
         */
        @JvmStatic
        fun showSurgeAlert(
            activity: Activity,
            errorResponse: PayerServiceInterceptor.PayerErrorResponse,
            onUserDecision: (accepted: Boolean) -> Unit
        ) {
            if (isAlertShowing) {
                logd(TAG, "Alert already showing, ignoring duplicate request")
                return
            }

            if (activity.isFinishing || activity.isDestroyed) {
                logd(TAG, "Activity is finishing or destroyed, cannot show alert")
                return
            }

            activity.runOnUiThread {
                try {
                    dismissCurrentAlert()

                    userDecisionCallback = onUserDecision
                    isAlertShowing = true

                    // Track that the alert was shown
                    SurgePricingMetrics.trackSurgeAlertShown(errorResponse)

                    // Create the dialog
                    val dialog = Dialog(activity, android.R.style.Theme_Translucent_NoTitleBar_Fullscreen)

                    // Inflate the XML layout
                    val inflater = LayoutInflater.from(activity)
                    val dialogView = inflater.inflate(R.layout.dialog_surge_pricing_alert, null)

                    // Setup the views
                    setupDialogViews(dialogView, errorResponse, activity)

                    // Setup the dialog
                    dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
                    dialog.setContentView(dialogView)
                    dialog.setCancelable(false)
                    dialog.setCanceledOnTouchOutside(false)

                    // Make the background semi-transparent
                    dialog.window?.apply {
                        setBackgroundDrawable(ColorDrawable(Color.parseColor("#80000000")))
                        setFlags(
                            WindowManager.LayoutParams.FLAG_DIM_BEHIND,
                            WindowManager.LayoutParams.FLAG_DIM_BEHIND
                        )
                        attributes?.dimAmount = 0.5f
                    }

                    currentDialog = dialog
                    dialog.show()

                } catch (e: Exception) {
                    logd(TAG, "Error showing surge alert: ${e.message}")
                    isAlertShowing = false
                    userDecisionCallback = null
                }
            }
        }

        /**
         * Setup the dialog views with data and click listeners
         */
        private fun setupDialogViews(
            dialogView: View,
            errorResponse: PayerServiceInterceptor.PayerErrorResponse,
            context: Context
        ) {
            // Title (now centered)
            val titleText = dialogView.findViewById<TextView>(R.id.titleText)
            titleText.text = context.getString(R.string.surge_pricing_title)

            // Surge fee value
            val surgeFeeValue = dialogView.findViewById<TextView>(R.id.surgeFeeValue)
            surgeFeeValue.text = errorResponse.estimatedFee?.let {
                "$it FLOW"
            } ?: "0.003 FLOW"

            // Description
            val descriptionText = dialogView.findViewById<TextView>(R.id.descriptionText)
            val multiplier = errorResponse.surgeMultiplier?.toInt() ?: 4
            descriptionText.text = "Due to high network activity, transaction fees are elevated, and Flow Wallet is temporarily not paying for your gas. Current network fees are ${multiplier}× higher than usual."

            // Close button (X)
            val closeButton = dialogView.findViewById<TextView>(R.id.closeButton)
            closeButton.setOnClickListener {
                logd(TAG, "User cancelled surge pricing via close button")
                SurgePricingMetrics.trackSurgeDecision(false, errorResponse)
                userDecisionCallback?.invoke(false)
                dismissCurrentAlert()
            }

            // Cancel button removed - user can use X button to cancel

            // Hold to confirm button
            setupHoldToConfirmButton(dialogView, errorResponse)
        }

        /**
         * Setup the hold-to-confirm button with progress animation
         */
        private fun setupHoldToConfirmButton(
            dialogView: View,
            errorResponse: PayerServiceInterceptor.PayerErrorResponse
        ) {
            val holdButton = dialogView.findViewById<AppCompatButton>(R.id.holdButton)
            val progressBackground = dialogView.findViewById<View>(R.id.holdProgressBackground)
            val holdButtonContainer = dialogView.findViewById<FrameLayout>(R.id.holdButtonContainer)

            var holdStartTime = 0L
            var isHolding = false
            val handler = Handler(Looper.getMainLooper())
            var holdRunnable: Runnable? = null

            val resetButton = {
                isHolding = false
                holdStartTime = 0L
                holdRunnable?.let { handler.removeCallbacks(it) }
                holdRunnable = null

                // Reset progress
                progressBackground.layoutParams = progressBackground.layoutParams.apply {
                    width = 0
                }
                progressBackground.requestLayout()

                // Reset button text
                holdButton.text = holdButton.context.getString(R.string.surge_hold_to_confirm)
            }

            holdButton.setOnTouchListener { _, event ->
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        if (!isHolding) {
                            isHolding = true
                            holdStartTime = System.currentTimeMillis()

                            // Animate progress
                            holdRunnable = object : Runnable {
                                override fun run() {
                                    val elapsed = System.currentTimeMillis() - holdStartTime
                                    val progress = (elapsed.toFloat() / HOLD_DURATION_MS).coerceIn(0f, 1f)

                                    // Update progress bar width
                                    val containerWidth = holdButtonContainer.width
                                    progressBackground.layoutParams = progressBackground.layoutParams.apply {
                                        width = (containerWidth * progress).toInt()
                                    }
                                    progressBackground.requestLayout()

                                    // Update button text with countdown
                                    val remainingSeconds = ((HOLD_DURATION_MS - elapsed) / 1000.0).coerceAtLeast(0.0)
                                    holdButton.text = if (remainingSeconds > 0) {
                                        "Hold for ${String.format("%.1f", remainingSeconds)}s"
                                    } else {
                                        "Confirming..."
                                    }

                                    if (progress < 1f) {
                                        handler.postDelayed(this, 50) // Update every 50ms
                                    } else {
                                        // Completed holding
                                        val holdDuration = System.currentTimeMillis() - holdStartTime
                                        SurgePricingMetrics.trackHoldToConfirm(true, holdDuration)
                                        SurgePricingMetrics.trackSurgeDecision(true, errorResponse)

                                        userDecisionCallback?.invoke(true)
                                        dismissCurrentAlert()
                                    }
                                }
                            }
                            handler.post(holdRunnable!!)
                        }
                        true
                    }
                    MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                        if (isHolding) {
                            val holdDuration = System.currentTimeMillis() - holdStartTime
                            SurgePricingMetrics.trackHoldToConfirm(false, holdDuration)
                            resetButton()
                        }
                        true
                    }
                    else -> false
                }
            }
        }

        /**
         * Dismiss the current alert dialog
         */
        @JvmStatic
        fun dismissCurrentAlert() {
            try {
                currentDialog?.dismiss()
                currentDialog = null
                isAlertShowing = false
                userDecisionCallback = null
                logd(TAG, "Alert dismissed")
            } catch (e: Exception) {
                logd(TAG, "Error dismissing alert: ${e.message}")
            }
        }

        /**
         * Check if an alert is currently showing
         */
        @JvmStatic
        fun isAlertShowing(): Boolean = isAlertShowing
    }
}

/**
 * Extension functions for PayerErrorResponse
 */
fun PayerServiceInterceptor.PayerErrorResponse.isSurgePricing(): Boolean {
    return status == 429 || status == 503
}

fun PayerServiceInterceptor.PayerErrorResponse.isServerError(): Boolean {
    return status in 500..599
}

fun PayerServiceInterceptor.PayerErrorResponse.getDisplayMessage(): String {
    return message ?: when (status) {
        429 -> "Network demand is high. Transaction fees have temporarily increased to manage network load."
        503 -> "Service is temporarily unavailable. Higher fees may apply."
        else -> "An unexpected error occurred. Please try again."
    }
}