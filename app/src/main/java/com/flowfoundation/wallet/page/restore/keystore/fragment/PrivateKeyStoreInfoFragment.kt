package com.flowfoundation.wallet.page.restore.keystore.fragment

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.flowfoundation.wallet.databinding.FragmentPrivateKeyStoreInfoBinding
import com.flowfoundation.wallet.page.restore.keystore.viewmodel.KeyStoreRestoreViewModel
import com.flowfoundation.wallet.pdfparser.DocumentPickerManager
import com.flowfoundation.wallet.utils.listeners.SimpleTextWatcher
import com.flowfoundation.wallet.utils.toast
import com.instabug.library.Instabug
import org.json.JSONObject


class PrivateKeyStoreInfoFragment: Fragment() {
    private lateinit var binding: FragmentPrivateKeyStoreInfoBinding
    private val restoreViewModel by lazy {
        ViewModelProvider(requireActivity())[KeyStoreRestoreViewModel::class.java]
    }
    private lateinit var documentPicker: DocumentPickerManager

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentPrivateKeyStoreInfoBinding.inflate(inflater)
        return binding.root
    }

    private fun canRestore(): Boolean {
        val json = binding.etJson.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()
        return isValidJson(json) && password.isNotEmpty()
    }

    private fun isValidJson(input: String): Boolean {
        return try {
            JSONObject(input)
            true
        } catch (e: Exception) {
            false
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        // Initialize document picker
        documentPicker = DocumentPickerManager(requireActivity())

        with(binding) {
            etJson.addTextChangedListener(object : SimpleTextWatcher() {
                override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {
                    btnImport.isEnabled = canRestore()
                }
            })
            etPassword.addTextChangedListener(object : SimpleTextWatcher() {
                override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {
                    btnImport.isEnabled = canRestore()
                }
            })
            btnImport.setOnClickListener {
                restoreViewModel.importKeyStore(
                    etJson.text.toString().trim(),
                    etPassword.text.toString().trim(),
                    etAddress.text.toString().trim()
                )
            }
            btnImport.isEnabled = false

            // Set up PDF import button
            btnImportFromPdf.setOnClickListener {
                openPDFPicker()
            }

            Instabug.addPrivateViews(etJson)
            Instabug.addPrivateViews(etPassword)
        }
    }

    /**
     * Open PDF file picker
     */
    private fun openPDFPicker() {
        android.util.Log.d("PDF_IMPORT", "openPDFPicker called in Fragment")
        val callback = object : DocumentPickerManager.PDFSelectionCallback {
            override fun onSuccess(jsonData: String, fileName: String) {
                // Populate the JSON field with extracted data
                binding.etJson.setText(jsonData)
                toast(msg = "PDF imported successfully: $fileName")
            }

            override fun onError(error: String) {
                toast(msg = "Error: $error")
            }

            override fun onCancelled() {
                // User cancelled, no action needed
            }
        }

        // Store callback for later use
        documentPicker.setCallback(callback)

        // Start activity from Fragment (not Activity) to ensure result comes back to Fragment
        try {
            val intent = documentPicker.createPickerIntent()
            android.util.Log.d("PDF_IMPORT", "Starting PDF picker from Fragment with requestCode=${DocumentPickerManager.PICK_PDF_REQUEST}")
            startActivityForResult(intent, DocumentPickerManager.PICK_PDF_REQUEST)
        } catch (e: Exception) {
            android.util.Log.e("PDF_IMPORT", "Failed to start PDF picker", e)
            callback.onError("Failed to open document picker: ${e.message}")
        }
    }

    /**
     * Handle activity result from document picker
     */
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        android.util.Log.d("PDF_IMPORT", "Fragment onActivityResult: requestCode=$requestCode, resultCode=$resultCode, data=$data")
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == DocumentPickerManager.PICK_PDF_REQUEST && resultCode == Activity.RESULT_OK) {
            android.util.Log.d("PDF_IMPORT", "Passing result to DocumentPickerManager")
            documentPicker.handleActivityResult(requestCode, resultCode, data)
        } else {
            android.util.Log.d("PDF_IMPORT", "Result not handled: requestCode=${DocumentPickerManager.PICK_PDF_REQUEST}, RESULT_OK=${Activity.RESULT_OK}")
        }
    }

}