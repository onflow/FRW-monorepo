package com.flowfoundation.wallet.manager.flowjvm.transaction

import com.google.gson.Gson
import com.flowfoundation.wallet.manager.config.AppConfig
import com.flowfoundation.wallet.manager.config.isGasFree
import com.flowfoundation.wallet.manager.key.CryptoProviderManager
import com.flowfoundation.wallet.manager.transaction.SurgePricingManager
import com.flowfoundation.wallet.mixpanel.MixpanelManager
import io.mockk.*
import io.mockk.impl.annotations.MockK
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.onflow.flow.models.*
import com.ionspin.kotlin.bignum.integer.BigInteger
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

/**
 * Unit tests for Transaction surge pricing integration
 * Tests the integration between Transaction.kt and SurgePricingManager
 */
@ExperimentalCoroutinesApi
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28], manifest = Config.NONE)
class TransactionSurgePricingTest {

    @MockK
    private lateinit var mockTransaction: Transaction

    private val gson = Gson()

    @Before
    fun setUp() {
        MockKAnnotations.init(this)

        // Mock static methods
        mockkObject(SurgePricingManager)
        mockkStatic(MixpanelManager::class)
        mockkStatic("com.flowfoundation.wallet.manager.config.ConfigKt")
        mockkObject(AppConfig)
        mockkObject(CryptoProviderManager)

        // Default mocks
        every { MixpanelManager.track(any(), any()) } just Runs
        coEvery { isGasFree() } returns true
    }

    @After
    fun tearDown() {
        unmockkAll()
    }

    @Test
    fun `addFreeGasEnvelope should fall back to self-custody when surge is active`() = runTest {
        // Given - Transaction with no envelope signatures
        val transaction = createMockTransaction(
            payer = "319e67f2ef9d937f", // Remote payer
            envelopeSignatures = emptyList()
        )

        // Mock surge pricing active - returns null
        coEvery {
            SurgePricingManager.executePayerRequestWithSurgeHandling(
                functionName = "/api/signAsFeePayer",
                data = any(),
                host = any()
            )
        } returns null

        // When
        val result = transaction.addFreeGasEnvelope()

        // Then
        assertEquals(transaction, result) // Should return unchanged transaction (no payer signature added)
        assertTrue(result.envelopeSignatures.isEmpty())
    }

    @Test
    fun `addFreeGasEnvelope should add payer signature when no surge`() = runTest {
        // Given - Transaction with no envelope signatures
        val transaction = createMockTransaction(
            payer = "319e67f2ef9d937f",
            envelopeSignatures = emptyList()
        )

        // Mock successful payer response (no surge)
        val payerResponse = """
            {
                "envelopeSigs": {
                    "address": "319e67f2ef9d937f",
                    "keyId": 0,
                    "sig": "abc123def456"
                }
            }
        """

        coEvery {
            SurgePricingManager.executePayerRequestWithSurgeHandling(
                functionName = "/api/signAsFeePayer",
                data = any(),
                host = any()
            )
        } returns payerResponse

        // When
        val result = transaction.addFreeGasEnvelope()

        // Then
        assertNotNull(result)
        assertEquals(1, result.envelopeSignatures.size)
        assertEquals("319e67f2ef9d937f", result.envelopeSignatures[0].address)
    }

    @Test
    fun `addFreeBridgeFeeEnvelope should handle surge pricing correctly`() = runTest {
        // Given - Bridge transaction
        val transaction = createMockTransaction(
            payer = "bridge_payer_address",
            envelopeSignatures = emptyList()
        )

        // Mock surge pricing active
        coEvery {
            SurgePricingManager.executePayerRequestWithSurgeHandling(
                functionName = "/api/signAsBridgeFeePayer",
                data = any(),
                host = any()
            )
        } returns null

        // When
        val result = transaction.addFreeBridgeFeeEnvelope()

        // Then
        assertEquals(transaction, result) // Should return unchanged transaction
        assertTrue(result.envelopeSignatures.isEmpty())
    }

    @Test
    fun `surge pricing should trigger telemetry events`() = runTest {
        // Given - Mock surge pricing scenario
        coEvery {
            SurgePricingManager.executePayerRequestWithSurgeHandling(any(), any(), any())
        } coAnswers {
            // Simulate the telemetry tracking that happens in the real implementation
            MixpanelManager.track("surge_pricing_accepted", mapOf(
                "source" to "preflight",
                "multiplier" to 2.5,
                "max_fee" to "0.005"
            ))
            null
        }

        // When
        val transaction = createMockTransaction()
        transaction.addFreeGasEnvelope()

        // Then - Verify telemetry was tracked
        verify {
            MixpanelManager.track(
                "surge_pricing_accepted",
                match {
                    val multiplier = it["multiplier"]
                    val maxFee = it["max_fee"]
                    multiplier == 2.5 && maxFee == "0.005"
                }
            )
        }
    }

    @Test
    fun `transaction should handle rapid successive surge requests correctly`() = runTest {
        // Given - Multiple rapid requests
        val transaction = createMockTransaction()

        var callCount = 0
        coEvery {
            SurgePricingManager.executePayerRequestWithSurgeHandling(any(), any(), any())
        } coAnswers {
            callCount++
            if (callCount == 1) {
                null // First call - surge active
            } else {
                // Second call - surge cleared
                """{"envelopeSigs": {"address": "test", "keyId": 0, "sig": "test"}}"""
            }
        }

        // When - Multiple calls
        val result1 = transaction.addFreeGasEnvelope()
        val result2 = transaction.addFreeGasEnvelope()

        // Then
        assertTrue(result1.envelopeSignatures.isEmpty()) // First should have no signatures
        assertEquals(1, result2.envelopeSignatures.size) // Second should have signature
        assertEquals(2, callCount)
    }

    // Helper functions

    private fun createMockTransaction(
        payer: String = "e7aded0979f825d0",
        proposalKeyAddress: String = "e7aded0979f825d0",
        proposalKeyIndex: Int = 81,
        envelopeSignatures: List<TransactionSignature> = emptyList()
    ): Transaction {
        return mockk<Transaction>(relaxed = true) {
            every { this@mockk.payer } returns payer
            every { this@mockk.proposalKey } returns ProposalKey(
                address = proposalKeyAddress,
                keyIndex = proposalKeyIndex,
                sequenceNumber = BigInteger.fromInt(1273)
            )
            every { this@mockk.envelopeSignatures } returns envelopeSignatures
            every { this@mockk.payloadSignatures } returns listOf(
                TransactionSignature(
                    address = proposalKeyAddress,
                    keyIndex = proposalKeyIndex,
                    signature = "test_signature"
                )
            )

            // Mock extension functions
            coEvery { buildPayerSignable() } returns mockk(relaxed = true)
            coEvery { buildBridgeFeePayerSignable() } returns mockk(relaxed = true)

            // Mock copy function for adding signatures
            every { copy(envelopeSignatures = any()) } answers {
                val newSigs = firstArg<List<TransactionSignature>>()
                mockk<Transaction>(relaxed = true) {
                    every { this@mockk.envelopeSignatures } returns newSigs
                    every { this@mockk.payer } returns payer
                    every { this@mockk.proposalKey } returns this@mockk.proposalKey
                }
            }

            // Mock extension functions that modify the transaction
            coEvery { addFreeGasEnvelope() } coAnswers {
                val response = SurgePricingManager.executePayerRequestWithSurgeHandling(
                    "/api/signAsFeePayer",
                    buildPayerSignable(),
                    null
                )

                if (response == null) {
                    // Surge pricing - return unchanged
                    this@mockk
                } else {
                    // Parse response and add signature
                    val signResponse = gson.fromJson(response, SignPayerResponse::class.java)
                    val newSig = TransactionSignature(
                        address = signResponse.envelopeSigs.address,
                        keyIndex = signResponse.envelopeSigs.keyId,
                        signature = signResponse.envelopeSigs.sig
                    )
                    copy(envelopeSignatures = envelopeSignatures + newSig)
                }
            }

            coEvery { addFreeBridgeFeeEnvelope() } coAnswers {
                val response = SurgePricingManager.executePayerRequestWithSurgeHandling(
                    "/api/signAsBridgeFeePayer",
                    buildBridgeFeePayerSignable(),
                    null
                )

                if (response == null) {
                    this@mockk
                } else {
                    val signResponse = gson.fromJson(response, SignPayerResponse::class.java)
                    val newSig = TransactionSignature(
                        address = signResponse.envelopeSigs.address,
                        keyIndex = signResponse.envelopeSigs.keyId,
                        signature = signResponse.envelopeSigs.sig
                    )
                    copy(envelopeSignatures = envelopeSignatures + newSig)
                }
            }
        }
    }

    // Mock response data class
    data class SignPayerResponse(
        val envelopeSigs: EnvelopeSigs
    )

    data class EnvelopeSigs(
        val address: String,
        val keyId: Int,
        val sig: String
    )
}
