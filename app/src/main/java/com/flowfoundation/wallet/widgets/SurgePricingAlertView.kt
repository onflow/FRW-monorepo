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
import android.util.TypedValue
import android.graphics.Typeface
import androidx.core.content.ContextCompat
import com.flowfoundation.wallet.R

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
                setBackgroundDrawable(ColorDrawable(ContextCompat.getColor(context, R.color.surge_modal_overlay)))
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
            // Main container that centers the modal
            val mainContainer = FrameLayout(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                setOnClickListener {
                    // Clicking outside does nothing (modal is not dismissible by outside click)
                }
            }

            // Modal card container (width: 343, matching React component)
            val modalCard = LinearLayout(context).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(dpToPx(context, 16), dpToPx(context, 16), dpToPx(context, 16), dpToPx(context, 16))

                // Set background with rounded corners
                background = GradientDrawable().apply {
                    setColor(ContextCompat.getColor(context, R.color.surge_modal_bg))
                    cornerRadius = dpToPx(context, 16).toFloat()
                }

                val cardParams = FrameLayout.LayoutParams(
                    dpToPx(context, 343),
                    ViewGroup.LayoutParams.WRAP_CONTENT
                ).apply {
                    gravity = Gravity.CENTER
                }
                layoutParams = cardParams
            }

            // Close button container (positioned absolutely in top-right)
            val closeButtonContainer = FrameLayout(context).apply {
                // Use TextView styled as a button instead of ImageButton
                val closeButton = TextView(context).apply {
                    text = "✕"
                    textSize = 20f
                    setTextColor(ContextCompat.getColor(context, R.color.surge_text_secondary))
                    gravity = Gravity.CENTER
                    setPadding(dpToPx(context, 8), dpToPx(context, 8), dpToPx(context, 8), dpToPx(context, 8))
                    isClickable = true
                    isFocusable = true

                    setOnClickListener {
                        logd(TAG, "User cancelled surge pricing")
                        SurgePricingMetrics.trackSurgeDecision(false, errorResponse)
                        userDecisionCallback?.invoke(false)
                        dismissCurrentAlert()
                    }
                }

                val closeParams = FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                ).apply {
                    gravity = Gravity.TOP or Gravity.END
                }
                closeButton.layoutParams = closeParams

                addView(closeButton)
            }

            // Content container
            val contentContainer = LinearLayout(context).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER_HORIZONTAL
            }

            // Alert icon (64x64)
            val alertIconContainer = FrameLayout(context).apply {
                val iconBg = View(context).apply {
                    background = GradientDrawable().apply {
                        setColor(ContextCompat.getColor(context, R.color.surge_error))
                        shape = GradientDrawable.OVAL
                    }
                    layoutParams = FrameLayout.LayoutParams(dpToPx(context, 64), dpToPx(context, 64))
                }

                val alertIcon = TextView(context).apply {
                    text = "⚠"
                    textSize = 32f
                    setTextColor(ContextCompat.getColor(context, R.color.white))
                    gravity = Gravity.CENTER
                    layoutParams = FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                }

                addView(iconBg)
                addView(alertIcon)

                val iconParams = LinearLayout.LayoutParams(dpToPx(context, 64), dpToPx(context, 64))
                iconParams.bottomMargin = dpToPx(context, 16)
                layoutParams = iconParams
            }
            contentContainer.addView(alertIconContainer)

            // Title text
            val titleText = TextView(context).apply {
                text = "Are you really sure that you want to continue with surge pricing?"
                textSize = 24f
                setTextColor(ContextCompat.getColor(context, R.color.surge_text_primary))
                setTypeface(typeface, Typeface.BOLD)
                gravity = Gravity.CENTER
                setPadding(dpToPx(context, 16), 0, dpToPx(context, 16), dpToPx(context, 16))
            }
            contentContainer.addView(titleText)

            // Divider line
            val divider = View(context).apply {
                setBackgroundColor(ContextCompat.getColor(context, R.color.surge_border))
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    dpToPx(context, 1)
                ).apply {
                    topMargin = dpToPx(context, 16)
                    bottomMargin = dpToPx(context, 16)
                }
            }
            contentContainer.addView(divider)

            // Transaction fee section (warning background)
            val feeSection = LinearLayout(context).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(dpToPx(context, 16), dpToPx(context, 16), dpToPx(context, 16), dpToPx(context, 16))

                background = GradientDrawable().apply {
                    setColor(ContextCompat.getColor(context, R.color.surge_warning_bg))
                    cornerRadius = dpToPx(context, 8).toFloat()
                }
            }

            // Transaction fee row
            val feeRow = LinearLayout(context).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
            }

            val feeLabel = TextView(context).apply {
                text = "Your transaction fee"
                textSize = 14f
                setTextColor(ContextCompat.getColor(context, R.color.surge_text_primary))
                layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
            }
            feeRow.addView(feeLabel)

            val feeValue = TextView(context).apply {
                text = errorResponse.estimatedFee ?: "- 500.00 FLOW"
                textSize = 14f
                setTextColor(ContextCompat.getColor(context, R.color.surge_text_primary))
                setTypeface(typeface, Typeface.BOLD)
            }
            feeRow.addView(feeValue)
            feeSection.addView(feeRow)

            // Surge price active row
            val surgeRow = LinearLayout(context).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(0, dpToPx(context, 8), 0, dpToPx(context, 8))
            }

            val surgeIcon = TextView(context).apply {
                text = "⚡"
                textSize = 20f
                setTextColor(ContextCompat.getColor(context, R.color.surge_warning))
                setPadding(0, 0, dpToPx(context, 8), 0)
            }
            surgeRow.addView(surgeIcon)

            val surgeText = TextView(context).apply {
                text = "Surge price active"
                textSize = 14f
                setTextColor(ContextCompat.getColor(context, R.color.surge_warning))
                setTypeface(typeface, Typeface.BOLD)
            }
            surgeRow.addView(surgeText)
            feeSection.addView(surgeRow)

            // Description text
            val descriptionText = TextView(context).apply {
                text = errorResponse.getDisplayMessage()
                textSize = 14f
                setTextColor(ContextCompat.getColor(context, R.color.surge_warning))
                setLineSpacing(0f, 1.2f)  // (add, mult) - 0 additional spacing, 1.2x multiplier
            }
            feeSection.addView(descriptionText)
            contentContainer.addView(feeSection)

            // Hold to agree button
            val holdButton = createHoldToConfirmButton(context, errorResponse) { accepted ->
                if (accepted) {
                    logd(TAG, "User accepted surge pricing")
                    SurgePricingMetrics.trackSurgeDecision(true, errorResponse)
                    userDecisionCallback?.invoke(true)
                    dismissCurrentAlert()
                }
            }
            val buttonParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dpToPx(context, 52)
            ).apply {
                topMargin = dpToPx(context, 24)
            }
            holdButton.layoutParams = buttonParams
            contentContainer.addView(holdButton)

            // Add content to modal card
            modalCard.addView(closeButtonContainer)
            modalCard.addView(contentContainer)

            // Add modal card to main container
            mainContainer.addView(modalCard)

            return mainContainer
        }

        private fun createHoldToConfirmButton(
            context: Context,
            errorResponse: PayerServiceInterceptor.PayerErrorResponse,
            onConfirm: (Boolean) -> Unit
        ): View {
            val buttonContainer = FrameLayout(context)

            // Button background
            val buttonBg = View(context).apply {
                background = GradientDrawable().apply {
                    setColor(ContextCompat.getColor(context, R.color.surge_button_bg))
                    cornerRadius = dpToPx(context, 8).toFloat()
                }
                layoutParams = FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            }
            buttonContainer.addView(buttonBg)

            // Progress overlay
            val progressOverlay = View(context).apply {
                background = GradientDrawable().apply {
                    setColor(ContextCompat.getColor(context, R.color.surge_button_progress))
                    cornerRadius = dpToPx(context, 8).toFloat()
                }
                layoutParams = FrameLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT)
                visibility = View.GONE
            }
            buttonContainer.addView(progressOverlay)

            // Button text
            val buttonText = TextView(context).apply {
                text = "Hold to agree to surge pricing"
                textSize = 16f
                setTextColor(ContextCompat.getColor(context, R.color.white))
                setTypeface(typeface, Typeface.BOLD)
                gravity = Gravity.CENTER
                layoutParams = FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            }
            buttonContainer.addView(buttonText)

            // Touch handling
            var isHolding = false
            var holdStartTime = 0L
            val handler = Handler(Looper.getMainLooper())
            var progressRunnable: Runnable? = null

            buttonContainer.setOnTouchListener { _, event ->
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        isHolding = true
                        holdStartTime = System.currentTimeMillis()
                        progressOverlay.visibility = View.VISIBLE

                        progressRunnable = object : Runnable {
                            override fun run() {
                                if (isHolding) {
                                    val elapsed = System.currentTimeMillis() - holdStartTime
                                    val progress = ((elapsed.toFloat() / HOLD_DURATION_MS) * 100).toInt()

                                    if (progress >= 100) {
                                        // Complete
                                        val params = progressOverlay.layoutParams as FrameLayout.LayoutParams
                                        params.width = ViewGroup.LayoutParams.MATCH_PARENT
                                        progressOverlay.layoutParams = params
                                        isHolding = false
                                        SurgePricingMetrics.trackHoldToConfirm(true, elapsed)
                                        onConfirm(true)
                                    } else {
                                        // Update progress width
                                        val params = progressOverlay.layoutParams as FrameLayout.LayoutParams
                                        params.width = (buttonContainer.width * progress / 100)
                                        progressOverlay.layoutParams = params
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
                            SurgePricingMetrics.trackHoldToConfirm(false, elapsed)
                        }
                        isHolding = false
                        progressRunnable?.let { handler.removeCallbacks(it) }
                        progressOverlay.visibility = View.GONE
                        val params = progressOverlay.layoutParams as FrameLayout.LayoutParams
                        params.width = 0
                        progressOverlay.layoutParams = params
                        true
                    }
                    else -> false
                }
            }

            return buttonContainer
        }

        private fun dpToPx(context: Context, dp: Int): Int {
            return TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                dp.toFloat(),
                context.resources.displayMetrics
            ).toInt()
        }
    }
}