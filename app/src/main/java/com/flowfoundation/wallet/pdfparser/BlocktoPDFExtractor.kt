package com.flowfoundation.wallet.pdfparser

import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.text.PDFTextStripper
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.regex.Pattern

/**
 * Extract JSON data from Blocto RecoveryKit PDF files
 */
class BlocktoPDFExtractor {

    /**
     * Extract JSON string from a PDF file
     * @param file PDF file to extract from
     * @param pageIndex Zero-based page index (default: 0 for first page)
     * @return Extracted JSON string or null if extraction fails
     */
    fun extractJsonFromPdf(file: File, pageIndex: Int = 0): String? {
        return try {
            // Initialize PDFBox for Android if not already initialized
            if (!isPDFBoxInitialized) {
                initializePDFBox()
            }

            // 1. Load PDF document
            val document = PDDocument.load(file)

            // 2. Configure text stripper for specific page
            val stripper = PDFTextStripper()
            // PDFBox uses 1-based page indexing
            stripper.startPage = pageIndex + 1
            stripper.endPage = pageIndex + 1

            // 3. Extract page text
            val pageText = stripper.getText(document)
            document.close()

            // 4. Extract JSON from text
            extractJsonString(pageText)

        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Extract JSON string from text using regex patterns
     * Tries multiple patterns to find valid JSON
     */
    private fun extractJsonString(text: String): String? {
        // Multiple regex patterns for better JSON detection
        val patterns = listOf(
            // Complete JSON objects with nested structures
            "\\{[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}",
            // Array of objects
            "\\[[^\\[\\]]*(?:\\{[^{}]*\\}[^\\[\\]]*)*\\]",
            // Fallback: simpler pattern
            "\\{.*\\}"
        )

        for (patternStr in patterns) {
            try {
                val pattern = Pattern.compile(patternStr, Pattern.DOTALL)
                val matcher = pattern.matcher(text)

                if (matcher.find()) {
                    val jsonString = matcher.group()
                    // Clean up whitespace and newlines
                    val cleanedJson = jsonString
                        .replace(Regex("\\s+"), " ")
                        .trim()

                    // Validate JSON structure
                    if (isValidJSON(cleanedJson)) {
                        return cleanedJson
                    }
                }
            } catch (e: Exception) {
                continue
            }
        }
        return null
    }

    /**
     * Validate if a string is valid JSON (either object or array)
     */
    private fun isValidJSON(jsonString: String): Boolean {
        return try {
            JSONObject(jsonString)
            true
        } catch (e: org.json.JSONException) {
            try {
                JSONArray(jsonString)
                true
            } catch (e2: org.json.JSONException) {
                false
            }
        }
    }

    companion object {
        private var isPDFBoxInitialized = false

        /**
         * Initialize PDFBox resources for Android
         */
        private fun initializePDFBox() {
            try {
                // Initialize PDFBox resources for Android
                // PDFBox-Android handles initialization automatically
                isPDFBoxInitialized = true
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
