package com.flowfoundation.wallet.manager.transaction

import android.app.Activity
import com.google.gson.Gson
import com.flowfoundation.wallet.manager.app.ActivityManager
import com.flowfoundation.wallet.mixpanel.MixpanelManager
import com.flowfoundation.wallet.network.interceptor.PayerServiceInterceptor
import com.flowfoundation.wallet.network.functions.executeHttpFunction
import com.flowfoundation.wallet.widgets.SurgePricingAlertViewXML
import io.mockk.*
import io.mockk.impl.annotations.MockK
import io.mockk.impl.annotations.RelaxedMockK
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import okhttp3.*
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.io.IOException
import org.junit.Assert.*

/**
 * Unit tests for SurgePricingManager
 * Tests surge pricing detection, caching, retry logic, and user interaction flows
 */
@ExperimentalCoroutinesApi
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28], manifest = Config.NONE)
class SurgePricingManagerTest {

    @MockK
    private lateinit var mockOkHttpClient: OkHttpClient

    @MockK
    private lateinit var mockCall: Call

    @MockK
    private lateinit var mockResponse: Response

    @MockK
    private lateinit var mockResponseBody: ResponseBody

    @RelaxedMockK
    private lateinit var mockActivity: Activity

    private val gson = Gson()

    @Before
    fun setUp() {
        MockKAnnotations.init(this)

        // Clear cache before each test
        SurgePricingManager.clearCache()

        // Mock static methods
        mockkStatic(ActivityManager::class)
        mockkStatic(MixpanelManager::class)
        mockkStatic(SurgePricingAlertViewXML::class)
        mockkStatic("com.flowfoundation.wallet.network.functions.FunctionsKt")

        // Default mock behavior
        every { ActivityManager.getCurrentActivity() } returns mockActivity
    }

    @After
    fun tearDown() {
        unmockkAll()
    }

    @Test
    fun `fetchPayerStatus should return cached response when cache is valid`() = runTest {
        // Given - Setup cached status
        val cachedStatus = createMockPayerStatus(surgeActive = true)

        // Manually set cache using reflection (since it's private)
        val cacheField = SurgePricingManager::class.java.getDeclaredField("cachedPayerStatus")
        cacheField.isAccessible = true
        val cache = Class.forName("com.flowfoundation.wallet.manager.transaction.SurgePricingManager\$PayerStatusCache")
            .getDeclaredConstructor(
                PayerServiceInterceptor.PayerStatusResponse::class.java,
                Long::class.java,
                Long::class.java
            ).newInstance(cachedStatus, System.currentTimeMillis(), 60000L)
        cacheField.set(SurgePricingManager, cache)

        // When
        val result = SurgePricingManager.fetchPayerStatus()

        // Then
        assertNotNull(result)
        assertEquals(cachedStatus, result)
        assertTrue(SurgePricingManager.hasCachedStatus())
    }

    @Test
    fun `fetchPayerStatus should fetch fresh data when cache is expired`() = runTest {
        // Given - Setup expired cache
        val expiredStatus = createMockPayerStatus(surgeActive = false)
        val freshStatus = createMockPayerStatus(surgeActive = true)

        // Set expired cache (timestamp from 2 minutes ago)
        val cacheField = SurgePricingManager::class.java.getDeclaredField("cachedPayerStatus")
        cacheField.isAccessible = true
        val expiredCache = Class.forName("com.flowfoundation.wallet.manager.transaction.SurgePricingManager\$PayerStatusCache")
            .getDeclaredConstructor(
                PayerServiceInterceptor.PayerStatusResponse::class.java,
                Long::class.java,
                Long::class.java
            ).newInstance(expiredStatus, System.currentTimeMillis() - 120000L, 60000L)
        cacheField.set(SurgePricingManager, expiredCache)

        // Mock OkHttp response
        mockOkHttpResponse(200, gson.toJson(freshStatus))

        // When
        val result = SurgePricingManager.fetchPayerStatus()

        // Then
        assertNotNull(result)
        assertEquals(true, result.data?.surge?.active)
    }

    @Test
    fun `fetchPayerStatus should retry on 5xx errors with exponential backoff`() = runTest {
        // Given - First two calls fail with 500, third succeeds
        val successStatus = createMockPayerStatus(surgeActive = true)
        var callCount = 0

        mockkConstructor(OkHttpClient.Builder::class)
        every { anyConstructed<OkHttpClient.Builder>().build() } answers {
            mockk<OkHttpClient> {
                every { newCall(any()) } answers {
                    mockk<Call> {
                        every { execute() } answers {
                            callCount++
                            when (callCount) {
                                1, 2 -> mockk<Response> {
                                    every { isSuccessful } returns false
                                    every { code } returns 500
                                    every { message } returns "Internal Server Error"
                                    every { body } returns null
                                }
                                else -> mockk<Response> {
                                    every { isSuccessful } returns true
                                    every { code } returns 200
                                    every { body } returns mockk {
                                        every { string() } returns gson.toJson(successStatus)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // When
        val result = SurgePricingManager.fetchPayerStatus()

        // Then
        assertNotNull(result)
        assertEquals(3, callCount)
        assertEquals(true, result.data?.surge?.active)
    }

    @Test
    fun `fetchPayerStatus should not retry on 4xx errors`() = runTest {
        // Given - 401 error (no retry expected)
        mockOkHttpResponse(401, "Unauthorized")

        // When
        val result = SurgePricingManager.fetchPayerStatus()

        // Then
        assertNull(result)
        // Verify only one call was made (no retries)
        verify(exactly = 1) { mockCall.execute() }
    }

    @Test
    fun `fetchPayerStatus should fail open after max retries`() = runTest {
        // Given - All calls fail
        mockkConstructor(OkHttpClient.Builder::class)
        every { anyConstructed<OkHttpClient.Builder>().build() } answers {
            mockk<OkHttpClient> {
                every { newCall(any()) } answers {
                    mockk<Call> {
                        every { execute() } throws IOException("Network error")
                    }
                }
            }
        }

        // When
        val result = SurgePricingManager.fetchPayerStatus()

        // Then
        assertNull(result) // Should fail open (return null)
    }

    @Test
    fun `executePayerRequestWithSurgeHandling should show alert on surge detection`() = runTest {
        // Given - Surge is active
        val surgeStatus = createMockPayerStatus(surgeActive = true, multiplier = 2.0)
        mockOkHttpResponse(200, gson.toJson(surgeStatus))

        var alertShown = false
        every {
            SurgePricingAlertViewXML.showSurgeAlert(any(), any(), any())
        } answers {
            alertShown = true
            // Simulate user accepting surge
            thirdArg<(Boolean) -> Unit>().invoke(true)
        }

        // Mock Mixpanel tracking
        every { MixpanelManager.track(any(), any()) } just Runs

        // When
        val result = SurgePricingManager.executePayerRequestWithSurgeHandling(
            functionName = "/api/signAsFeePayer",
            data = "test_data"
        )

        // Then
        assertTrue(alertShown)
        assertNull(result) // Should return null when user accepts surge (self-custody)

        // Verify telemetry was tracked
        verify {
            MixpanelManager.track(
                "surge_pricing_accepted",
                match {
                    it["source"] == "preflight" &&
                    it["multiplier"] == 2.0
                }
            )
        }
    }

    @Test
    fun `executePayerRequestWithSurgeHandling should cancel when user declines surge`() = runTest {
        // Given - Surge is active
        val surgeStatus = createMockPayerStatus(surgeActive = true)
        mockOkHttpResponse(200, gson.toJson(surgeStatus))

        every {
            SurgePricingAlertViewXML.showSurgeAlert(any(), any(), any())
        } answers {
            // Simulate user declining surge
            thirdArg<(Boolean) -> Unit>().invoke(false)
        }

        every { MixpanelManager.track(any(), any()) } just Runs

        // When - This should throw CancellationException
        try {
            SurgePricingManager.executePayerRequestWithSurgeHandling(
                functionName = "/api/signAsFeePayer",
                data = "test_data"
            )
        } catch (e: Exception) {
            // Expected cancellation
        }

        // Then - Verify decline was tracked
        verify {
            MixpanelManager.track(
                "surge_pricing_declined",
                any()
            )
        }
    }

    @Test
    fun `executePayerRequestWithSurgeHandling should proceed normally when no surge`() = runTest {
        // Given - No surge pricing
        val normalStatus = createMockPayerStatus(surgeActive = false)
        mockOkHttpResponse(200, gson.toJson(normalStatus))

        val expectedResponse = """{"envelopeSigs": {"address": "0x123", "keyId": 1, "sig": "abc"}}"""
        coEvery {
            executeHttpFunction(any(), any(), any())
        } returns expectedResponse

        // When
        val result = SurgePricingManager.executePayerRequestWithSurgeHandling(
            functionName = "/api/signAsFeePayer",
            data = "test_data"
        )

        // Then
        assertEquals(expectedResponse, result)

        // Verify no alert was shown
        verify(exactly = 0) {
            SurgePricingAlertViewXML.showSurgeAlert(any(), any(), any())
        }
    }

    @Test
    fun `cache should be properly managed with TTL from server`() = runTest {
        // Given - Server response with custom TTL
        val statusWithTTL = createMockPayerStatus(
            surgeActive = true,
            ttlSeconds = 120 // 2 minutes
        )
        mockOkHttpResponse(200, gson.toJson(statusWithTTL))

        // When - First call fetches from network
        val result1 = SurgePricingManager.fetchPayerStatus()

        // Then
        assertNotNull(result1)
        assertTrue(SurgePricingManager.hasCachedStatus())

        // When - Clear cache
        SurgePricingManager.clearCache()

        // Then
        assertTrue(!SurgePricingManager.hasCachedStatus())
    }

    // Helper functions

    private fun createMockPayerStatus(
        surgeActive: Boolean = false,
        multiplier: Double = 1.0,
        maxFee: String = "0.001",
        ttlSeconds: Int = 60
    ): PayerServiceInterceptor.PayerStatusResponse {
        return PayerServiceInterceptor.PayerStatusResponse(
            status = 200,
            data = PayerServiceInterceptor.PayerStatusData(
                surge = PayerServiceInterceptor.SurgeInfo(
                    active = surgeActive,
                    multiplier = multiplier,
                    maxFee = maxFee,
                    ttlSeconds = ttlSeconds
                ),
                feePayer = PayerServiceInterceptor.FeePayerInfo(
                    enabled = !surgeActive
                )
            )
        )
    }

    private fun mockOkHttpResponse(code: Int, body: String) {
        mockkConstructor(OkHttpClient.Builder::class)

        every { mockResponseBody.string() } returns body
        every { mockResponse.isSuccessful } returns (code in 200..299)
        every { mockResponse.code } returns code
        every { mockResponse.message } returns ""
        every { mockResponse.body } returns if (code in 200..299) mockResponseBody else null
        every { mockCall.execute() } returns mockResponse

        every { anyConstructed<OkHttpClient.Builder>().build() } answers {
            mockk<OkHttpClient> {
                every { newCall(any()) } returns mockCall
            }
        }
    }
}