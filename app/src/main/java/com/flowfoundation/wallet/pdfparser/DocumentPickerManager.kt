package com.flowfoundation.wallet.pdfparser

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.DocumentsContract
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

/**
 * Manages document picker for PDF file selection and processing
 */
class DocumentPickerManager(private val activity: Activity) {

    companion object {
        const val PICK_PDF_REQUEST = 1001
    }

    /**
     * Callback interface for PDF selection results
     */
    interface PDFSelectionCallback {
        fun onSuccess(jsonData: String, fileName: String)
        fun onError(error: String)
        fun onCancelled()
    }

    private var callback: PDFSelectionCallback? = null

    /**
     * Open document picker for PDF file selection
     * @param callback Callback to receive selection results
     */
    fun openDocumentPicker(callback: PDFSelectionCallback) {
        this.callback = callback

        // Create intent for PDF file selection
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "application/pdf"  // Filter for PDF files only

            // Optional: Allow multiple file types
            putExtra(Intent.EXTRA_MIME_TYPES, arrayOf(
                "application/pdf",
                "application/x-pdf"
            ))
        }

        try {
            activity.startActivityForResult(intent, PICK_PDF_REQUEST)
        } catch (e: Exception) {
            callback.onError("Failed to open document picker: ${e.message}")
        }
    }

    /**
     * Handle activity result from file picker
     * Call this from your activity's onActivityResult
     */
    fun handleActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == PICK_PDF_REQUEST && callback != null) {
            if (resultCode == Activity.RESULT_OK && data?.data != null) {
                val uri = data.data!!
                processSelectedFile(uri)
            } else {
                callback?.onCancelled()
                callback = null
            }
        }
    }

    /**
     * Process the selected PDF file
     * Runs on background thread using coroutines
     */
    private fun processSelectedFile(uri: Uri) {
        // Process on background thread
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val contentResolver = activity.contentResolver

                // Get file name
                val fileName = getFileName(uri) ?: "unknown.pdf"

                // Verify it's a PDF file
                val mimeType = contentResolver.getType(uri)
                if (mimeType != "application/pdf") {
                    withContext(Dispatchers.Main) {
                        callback?.onError("Selected file is not a PDF")
                        callback = null
                    }
                    return@launch
                }

                // Create temporary file for PDFBox processing
                val tempFile = createTempFileFromUri(uri)
                if (tempFile != null) {
                    // Parse PDF
                    val extractor = BlocktoPDFExtractor()
                    val result = extractor.extractJsonFromPdf(tempFile)

                    withContext(Dispatchers.Main) {
                        if (result != null) {
                            callback?.onSuccess(result, fileName)
                        } else {
                            callback?.onError("Failed to extract JSON from PDF")
                        }
                        callback = null
                    }

                    // Clean up temp file
                    tempFile.delete()
                } else {
                    withContext(Dispatchers.Main) {
                        callback?.onError("Could not access selected file")
                        callback = null
                    }
                }

            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    callback?.onError("Error processing file: ${e.message}")
                    callback = null
                }
            }
        }
    }

    /**
     * Get the display name of a file from its URI
     */
    private fun getFileName(uri: Uri): String? {
        return try {
            activity.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) {
                    val nameIndex = cursor.getColumnIndex(DocumentsContract.Document.COLUMN_DISPLAY_NAME)
                    if (nameIndex >= 0) cursor.getString(nameIndex) else null
                } else null
            }
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Create a temporary file from content URI
     * Required for PDFBox which needs a File object
     */
    private fun createTempFileFromUri(uri: Uri): File? {
        return try {
            val inputStream = activity.contentResolver.openInputStream(uri)
            val tempFile = File.createTempFile("blocto_pdf", ".pdf", activity.cacheDir)

            inputStream?.use { input ->
                tempFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            }
            tempFile
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
