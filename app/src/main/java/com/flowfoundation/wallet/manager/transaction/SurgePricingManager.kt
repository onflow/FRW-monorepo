package com.flowfoundation.wallet.manager.transaction

import android.app.Activity
import com.google.gson.Gson
import com.flowfoundation.wallet.manager.app.ActivityManager
import com.flowfoundation.wallet.mixpanel.MixpanelManager
import com.flowfoundation.wallet.mixpanel.EVENT_SURGE_PRICING_ACCEPTED
import com.flowfoundation.wallet.mixpanel.EVENT_SURGE_PRICING_DECLINED
import com.flowfoundation.wallet.network.BASE_HOST
import com.flowfoundation.wallet.network.interceptor.HeaderInterceptor
import com.flowfoundation.wallet.network.interceptor.PayerServiceInterceptor
import com.flowfoundation.wallet.network.functions.executeHttpFunction
import com.flowfoundation.wallet.utils.ioScope
import com.flowfoundation.wallet.utils.logd
import com.flowfoundation.wallet.widgets.SurgePricingAlertViewXML
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit
import kotlin.coroutines.resume

/**
 * Manager class for handling surge pricing logic
 * Encapsulates payer status fetching, caching, and surge pricing alert handling
 */
object SurgePricingManager {
  private const val TAG = "SurgePricingManager"
  private const val DEFAULT_TTL_MS = 60000L // Default 1 minute TTL
  private const val MAX_RETRIES = 3
  private const val CONNECT_TIMEOUT_SECONDS = 5L
  private const val READ_TIMEOUT_SECONDS = 5L

  // Cache for payer status with TTL
  private data class PayerStatusCache(
    val response: PayerServiceInterceptor.PayerStatusResponse,
    val timestamp: Long,
    val ttlMs: Long = DEFAULT_TTL_MS
  ) {
    fun isValid(): Boolean = System.currentTimeMillis() - timestamp < ttlMs
  }

  private var cachedPayerStatus: PayerStatusCache? = null

  /**
   * Fetch payer status from the API with caching and retry logic
   * This is called before transactions to check surge pricing status
   */
  suspend fun fetchPayerStatus(): PayerServiceInterceptor.PayerStatusResponse? {
    return withContext(Dispatchers.IO) {
      // Check cache first
      cachedPayerStatus?.let { cache ->
        if (cache.isValid()) {
          logd(TAG, "Using cached payer status (age: ${System.currentTimeMillis() - cache.timestamp}ms)")
          return@withContext cache.response
        }
      }

      logd(TAG, "Fetching fresh payer status from /api/v1/payer/status")

      // Retry configuration
      var retryCount = 0
      var lastException: Exception? = null

      while (retryCount < MAX_RETRIES) {
        try {
          val client = OkHttpClient.Builder()
            .connectTimeout(CONNECT_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .readTimeout(READ_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .addInterceptor(HeaderInterceptor()) // Add authentication headers
            .addInterceptor(PayerServiceInterceptor())
            .build()

          // Build request for status endpoint - ensure no double slash
          val statusUrl = if (BASE_HOST.endsWith("/")) {
            "${BASE_HOST}api/v1/payer/status"
          } else {
            "${BASE_HOST}/api/v1/payer/status"
          }
          val request = Request.Builder()
            .url(statusUrl)
            .get()
            .build()
          val response = client.newCall(request).execute()
          val responseBody = response.body?.string()

          if (response.isSuccessful && !responseBody.isNullOrBlank()) {
            val payerStatus = Gson().fromJson(responseBody, PayerServiceInterceptor.PayerStatusResponse::class.java)
            logd(TAG, "Payer status fetched successfully:")
            logd(TAG, "  - Status: ${payerStatus.status}")
            logd(TAG, "  - Surge active: ${payerStatus.data?.surge?.active}")
            logd(TAG, "  - Surge multiplier: ${payerStatus.data?.surge?.multiplier}")
            logd(TAG, "  - Max fee: ${payerStatus.data?.surge?.maxFee}")
            logd(TAG, "  - Fee payer enabled: ${payerStatus.data?.feePayer?.enabled}")

            // Cache the response with TTL from server or default
            val ttlSeconds = payerStatus.data?.surge?.ttlSeconds ?: 60
            cachedPayerStatus = PayerStatusCache(
              response = payerStatus,
              timestamp = System.currentTimeMillis(),
              ttlMs = ttlSeconds * 1000L
            )

            return@withContext payerStatus
          } else if (response.code in 500..599) {
            // Server error - retry with exponential backoff
            logd(TAG, "Server error (${response.code}) on attempt ${retryCount + 1}, retrying...")
            retryCount++
            if (retryCount < MAX_RETRIES) {
              // Exponential backoff: 1s, 2s, 4s
              val delayMs = (1000L * (1 shl (retryCount - 1))).coerceAtMost(4000L)
              logd(TAG, "Waiting ${delayMs}ms before retry...")
              delay(delayMs)
              continue
            }
          } else {
            // Client error (4xx) or other - don't retry
            logd(TAG, "Failed to fetch payer status: ${response.code} ${response.message}")
            return@withContext null
          }
        } catch (e: Exception) {
          lastException = e
          retryCount++

          if (retryCount < MAX_RETRIES) {
            logd(TAG, "Error fetching payer status (attempt $retryCount): ${e.message}, retrying...")
            // Exponential backoff: 1s, 2s, 4s
            val delayMs = (1000L * (1 shl (retryCount - 1))).coerceAtMost(4000L)
            delay(delayMs)
          } else {
            logd(TAG, "Failed to fetch payer status after $MAX_RETRIES attempts: ${e.message}")
          }
        }
      }

      // Fail open - don't block transactions if status check fails
      logd(TAG, "Payer status check failed after retries, failing open")
      return@withContext null
    }
  }

  /**
   * Helper function to execute payer requests with surge pricing handling
   * Shows alert dialog if surge pricing is detected and waits for user decision
   *
   * @return Response string if successful, null if user accepts surge (proceed without payer) or cancels
   */
  suspend fun executePayerRequestWithSurgeHandling(
    functionName: String,
    data: Any?,
    host: String? = BASE_HOST
  ): String? = suspendCancellableCoroutine { continuation ->
    // Execute preflight and request in IO scope
    ioScope {
      // First, do preflight check for surge pricing to avoid unnecessary calls
      val payerStatus = fetchPayerStatus()

      // Check if surge is active from the preflight check
      if (payerStatus?.data?.surge?.active == true) {
        logd(TAG, "Surge pricing detected from preflight check")
        val currentActivity = getCurrentActivity()

        if (currentActivity != null) {
          // Create error response from status check
          val errorResponse = PayerServiceInterceptor.PayerErrorResponse(
            status = 429,
            message = "Surge pricing is active",
            surgeInfo = payerStatus.data.surge
          )

          logd(TAG, "Showing surge pricing alert from preflight")

          currentActivity.runOnUiThread {
            SurgePricingAlertViewXML.showSurgeAlert(
              activity = currentActivity,
              errorResponse = errorResponse,
              onUserDecision = { accepted ->
                if (accepted) {
                  logd(TAG, "User accepted surge pricing - proceeding without remote payer (self-custody)")
                  // Record telemetry for accepting surge
                  MixpanelManager.track(EVENT_SURGE_PRICING_ACCEPTED, mapOf(
                    "source" to "preflight",
                    "multiplier" to (payerStatus.data.surge?.multiplier ?: 1.0),
                    "max_fee" to (payerStatus.data.surge?.maxFee ?: "0")
                  ))
                  SurgePricingAlertViewXML.dismissCurrentAlert()
                  // Return null to indicate proceeding without payer
                  continuation.resume(null)
                } else {
                  logd(TAG, "User cancelled transaction due to surge pricing")
                  // Record telemetry for declining surge
                  MixpanelManager.track(EVENT_SURGE_PRICING_DECLINED, mapOf(
                    "source" to "preflight",
                    "multiplier" to (payerStatus.data.surge?.multiplier ?: 1.0),
                    "max_fee" to (payerStatus.data.surge?.maxFee ?: "0")
                  ))
                  SurgePricingAlertViewXML.dismissCurrentAlert()
                  continuation.cancel()
                }
              }
            )
          }
          return@ioScope // Exit early, let the dialog callback handle continuation
        }
      }

      // Set up callback for interceptor errors (in case status check missed it or status changed)
      PayerServiceInterceptor.setErrorCallback { errorResponse ->
        val currentActivity = getCurrentActivity()
        logd(TAG, "PayerServiceInterceptor callback triggered. Current activity: ${currentActivity?.javaClass?.simpleName}")

        if (currentActivity != null && (errorResponse.isSurgePricing() || errorResponse.isServerError())) {
          logd(TAG, "Showing surge pricing alert from interceptor on UI thread")
          currentActivity.runOnUiThread {
            SurgePricingAlertViewXML.showSurgeAlert(
              activity = currentActivity,
              errorResponse = errorResponse,
              onUserDecision = { accepted ->
                if (accepted && errorResponse.isSurgePricing()) {
                  logd(TAG, "User accepted surge pricing - proceeding without remote payer (self-custody)")
                  // Record telemetry for accepting surge
                  MixpanelManager.track(EVENT_SURGE_PRICING_ACCEPTED, mapOf(
                    "source" to "interceptor",
                    "status_code" to errorResponse.status,
                    "multiplier" to (errorResponse.surgeInfo?.multiplier ?: 1.0),
                    "max_fee" to (errorResponse.surgeInfo?.maxFee ?: "0")
                  ))
                  SurgePricingAlertViewXML.dismissCurrentAlert()
                  // Return null to indicate proceeding without payer
                  continuation.resume(null)
                } else {
                  logd(TAG, "User cancelled transaction")
                  // Record telemetry for declining
                  MixpanelManager.track(EVENT_SURGE_PRICING_DECLINED, mapOf(
                    "source" to "interceptor",
                    "status_code" to errorResponse.status,
                    "multiplier" to (errorResponse.surgeInfo?.multiplier ?: 1.0),
                    "max_fee" to (errorResponse.surgeInfo?.maxFee ?: "0")
                  ))
                  SurgePricingAlertViewXML.dismissCurrentAlert()
                  continuation.cancel()
                }
              }
            )
          }
        }
      }

      // Execute the actual payer request (only if not already blocked by preflight)
      try {
        val response = executeHttpFunction(functionName, data, host)

        // Check if we have a pending error that wasn't handled
        val lastError = PayerServiceInterceptor.getLastErrorResponse()
        if (lastError != null && (lastError.isSurgePricing() || lastError.isServerError())) {
          // Wait for user decision from the alert
          // The callback above will handle the continuation
        } else {
          // Success or non-surge error
          continuation.resume(response)
        }
      } catch (e: Exception) {
        logd(TAG, "Payer request failed: ${e.message}")
        // For non-surge errors, just fail silently and proceed without payer
        continuation.resume(null)
      } finally {
        // Clean up
        PayerServiceInterceptor.setErrorCallback(null)
      }
    }
  }

  /**
   * Get current activity from the ActivityManager
   */
  private fun getCurrentActivity(): Activity? {
    return ActivityManager.getCurrentActivity()
  }

  /**
   * Clear the cached payer status
   * Useful for testing or forcing a fresh fetch
   */
  fun clearCache() {
    cachedPayerStatus = null
  }

  /**
   * Check if we have a valid cached status
   */
  fun hasCachedStatus(): Boolean {
    return cachedPayerStatus?.isValid() == true
  }
}