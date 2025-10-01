package com.flowfoundation.wallet.widgets

import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.view.WindowManager
import android.widget.*
import com.flowfoundation.wallet.network.interceptor.PayerServiceInterceptor
import com.flowfoundation.wallet.mixpanel.SurgePricingMetrics
import com.flowfoundation.wallet.utils.logd

/**
 * SurgePricingAlertView - Manages the horizontal alert banner for surge pricing
 *
 * This component displays a horizontal interceptor banner when the payer service
 * responds with non-2xx HTTP status (surge pricing or service errors).
 * It blocks auto-submission until the user acknowledges or accepts the surge pricing.
 */
class SurgePricingAlertView {

    companion object {
        private const val TAG = "SurgePricingAlert"
        private const val HOLD_DURATION_MS = 2500L // 2.5 seconds hold to confirm (matching React component)

        @Volatile
        private var currentDialog: Dialog? = null

        @Volatile
        private var isAlertShowing = false

        @Volatile
        private var userDecisionCallback: ((Boolean) -> Unit)? = null

        // Design colors matching SurgeModal.tsx
        private const val COLOR_BACKGROUND = "#1A1A1A" // Dark background ($bg5)
        private const val COLOR_MODAL_BG = "#2A2A2A" // Modal background
        private const val COLOR_WHITE = "#FFFFFF"
        private const val COLOR_ERROR = "#FF5252" // Error/warning red
        private const val COLOR_WARNING = "#FDB022" // Warning orange
        private const val COLOR_WARNING_BG = "#FDB02226" // Warning background with opacity
        private const val COLOR_BORDER = "#3A3A3A" // Border color
        private const val COLOR_TEXT_SECONDARY = "#9CA3AF" // Secondary text

        /**
         * Show surge pricing alert dialog
         *
         * @param activity The current activity context
         * @param errorResponse The error response from payer service
         * @param onDecision Callback with user's decision (true = accepted, false = cancelled)
         */
        @JvmStatic
        fun showAlert(
            activity: Activity,
            errorResponse: PayerServiceInterceptor.PayerErrorResponse,
            onDecision: ((Boolean) -> Unit)? = null
        ) {
            if (isAlertShowing) {
                logd(TAG, "Alert already showing, ignoring duplicate request")
                return
            }

            userDecisionCallback = onDecision

            activity.runOnUiThread {
                try {
                    dismissCurrentAlert()
                    createAndShowAlert(activity, errorResponse)
                    // Track telemetry for alert shown
                    SurgePricingMetrics.trackSurgeAlertShown(errorResponse)
                } catch (e: Exception) {
                    logd(TAG, "Failed to show alert: ${e.message}")
                }
            }
        }

        /**
         * Dismiss the current alert if showing
         */
        @JvmStatic
        fun dismissCurrentAlert() {
            currentDialog?.dismiss()
            currentDialog = null
            isAlertShowing = false
            userDecisionCallback = null
        }

        private fun createAndShowAlert(
            context: Context,
            errorResponse: PayerServiceInterceptor.PayerErrorResponse
        ) {
            val dialog = Dialog(context)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)

            // Create custom view matching SurgeModal.tsx design
            val customView = createCustomAlertView(context, errorResponse)
            dialog.setContentView(customView)

            // Set dialog window properties for full-screen overlay effect
            dialog.window?.apply {
                setBackgroundDrawable(ColorDrawable(Color.parseColor(COLOR_BACKGROUND + "CC"))) // 80% opacity
                setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)

                // Add dim behind
                addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
                setDimAmount(0.8f)

                // Center the dialog content
                setGravity(Gravity.CENTER)
            }

            dialog.setCancelable(false)
            dialog.setCanceledOnTouchOutside(false)

            currentDialog = dialog
            isAlertShowing = true
            dialog.show()
        }

        private fun createCustomAlertView(
            context: Context,
            errorResponse: PayerServiceInterceptor.PayerErrorResponse
        ): View {
            val inflater = LayoutInflater.from(context)
            val parentView = ViewGroup(context) as? ViewGroup

            // Create a simple vertical layout programmatically
            val rootLayout = android.widget.LinearLayout(context).apply {
                orientation = android.widget.LinearLayout.VERTICAL
                setPadding(48, 48, 48, 48)
                setBackgroundColor(Color.WHITE)

                // Add rounded corners background
                val drawable = android.graphics.drawable.GradientDrawable().apply {
                    cornerRadius = 24f
                    setColor(Color.WHITE)
                }
                background = drawable
            }

            // Close button (X)
            val closeButton = TextView(context).apply {
                id = android.R.id.closeButton
                text = "✕"
                textSize = 24f
                setTextColor(Color.BLACK)
                setPadding(16, 0, 16, 16)
                layoutParams = android.widget.LinearLayout.LayoutParams(
                    android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
                    android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    gravity = android.view.Gravity.END
                }
            }
            rootLayout.addView(closeButton)

            // Alert icon and title
            val titleLayout = android.widget.LinearLayout(context).apply {
                orientation = android.widget.LinearLayout.HORIZONTAL
                gravity = android.view.Gravity.CENTER
                setPadding(0, 0, 0, 24)
            }

            val alertIcon = TextView(context).apply {
                text = "⚠️"
                textSize = 32f
                setPadding(0, 0, 16, 0)
            }
            titleLayout.addView(alertIcon)

            val titleText = TextView(context).apply {
                text = if (errorResponse.isSurgePricing()) {
                    "Surge Pricing Active"
                } else {
                    "Payer Service Error"
                }
                textSize = 24f
                setTextColor(Color.BLACK)
                setTypeface(null, android.graphics.Typeface.BOLD)
            }
            titleLayout.addView(titleText)
            rootLayout.addView(titleLayout)

            // Message text
            val messageText = TextView(context).apply {
                text = errorResponse.getDisplayMessage()
                textSize = 16f
                setTextColor(Color.DKGRAY)
                setPadding(0, 0, 0, 32)
                gravity = android.view.Gravity.CENTER
            }
            rootLayout.addView(messageText)

            // Transaction fee display (if available)
            if (errorResponse.estimatedFee != null) {
                val feeLayout = android.widget.LinearLayout(context).apply {
                    orientation = android.widget.LinearLayout.HORIZONTAL
                    gravity = android.view.Gravity.CENTER
                    setPadding(24, 16, 24, 16)
                    setBackgroundColor(Color.parseColor("#FFF3E0"))
                }

                val feeLabel = TextView(context).apply {
                    text = "Estimated Transaction Fee: "
                    textSize = 14f
                    setTextColor(Color.BLACK)
                }
                feeLayout.addView(feeLabel)

                val feeValue = TextView(context).apply {
                    text = errorResponse.estimatedFee
                    textSize = 14f
                    setTextColor(Color.BLACK)
                    setTypeface(null, android.graphics.Typeface.BOLD)
                }
                feeLayout.addView(feeValue)

                rootLayout.addView(feeLayout)
            }

            // Hold to confirm button (for surge pricing)
            if (errorResponse.isSurgePricing()) {
                val holdButton = createHoldToConfirmButton(context, errorResponse) { accepted ->
                    if (accepted) {
                        logd(TAG, "User accepted surge pricing")
                        // Track telemetry for user acceptance
                        SurgePricingMetrics.trackSurgeDecision(true, errorResponse)
                        userDecisionCallback?.invoke(true)
                        dismissCurrentAlert()
                    }
                }
                rootLayout.addView(holdButton)
            }

            // Cancel button
            val cancelButton = Button(context).apply {
                text = "Cancel Transaction"
                setBackgroundColor(Color.LTGRAY)
                setTextColor(Color.BLACK)
                setPadding(32, 16, 32, 16)
                setOnClickListener {
                    logd(TAG, "User cancelled transaction")
                    userDecisionCallback?.invoke(false)
                    dismissCurrentAlert()
                }
            }
            val cancelButtonParams = android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(0, 16, 0, 0)
            }
            cancelButton.layoutParams = cancelButtonParams
            rootLayout.addView(cancelButton)

            return rootLayout
        }

        private fun createHoldToConfirmButton(
            context: Context,
            errorResponse: PayerServiceInterceptor.PayerErrorResponse,
            onConfirm: (Boolean) -> Unit
        ): View {
            val buttonLayout = android.widget.FrameLayout(context)

            val button = Button(context).apply {
                text = "Hold to Accept Surge Pricing"
                setBackgroundColor(Color.parseColor("#FF5252"))
                setTextColor(Color.WHITE)
                setPadding(32, 24, 32, 24)
            }

            val progressBar = ProgressBar(
                context,
                null,
                android.R.attr.progressBarStyleHorizontal
            ).apply {
                max = 100
                progress = 0
                layoutParams = android.widget.FrameLayout.LayoutParams(
                    android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                    android.widget.FrameLayout.LayoutParams.MATCH_PARENT
                )
                alpha = 0.3f
            }

            buttonLayout.addView(button)
            buttonLayout.addView(progressBar)

            var isHolding = false
            var holdStartTime = 0L
            val handler = Handler(Looper.getMainLooper())
            var progressRunnable: Runnable? = null

            button.setOnTouchListener { _, event ->
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        isHolding = true
                        holdStartTime = System.currentTimeMillis()
                        progressBar.progress = 0

                        progressRunnable = object : Runnable {
                            override fun run() {
                                if (isHolding) {
                                    val elapsed = System.currentTimeMillis() - holdStartTime
                                    val progress = ((elapsed.toFloat() / HOLD_DURATION_MS) * 100).toInt()

                                    if (progress >= 100) {
                                        progressBar.progress = 100
                                        isHolding = false
                                        // Track hold-to-confirm completion
                                        SurgePricingMetrics.trackHoldToConfirm(true, elapsed)
                                        onConfirm(true)
                                    } else {
                                        progressBar.progress = progress
                                        handler.postDelayed(this, 50)
                                    }
                                }
                            }
                        }
                        handler.post(progressRunnable!!)
                        true
                    }
                    MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                        if (isHolding) {
                            val elapsed = System.currentTimeMillis() - holdStartTime
                            // Track incomplete hold-to-confirm
                            SurgePricingMetrics.trackHoldToConfirm(false, elapsed)
                        }
                        isHolding = false
                        progressRunnable?.let { handler.removeCallbacks(it) }
                        progressBar.progress = 0
                        true
                    }
                    else -> false
                }
            }

            val params = android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(0, 24, 0, 0)
            }
            buttonLayout.layoutParams = params

            return buttonLayout
        }
    }
}