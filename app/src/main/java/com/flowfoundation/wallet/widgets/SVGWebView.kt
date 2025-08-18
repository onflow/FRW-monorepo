package com.flowfoundation.wallet.widgets

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.util.AttributeSet
import android.util.Base64
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import java.util.regex.Pattern

/**
 * Simplified SVGWebView that properly handles click events
 * This version doesn't override touch event handling, letting Android handle clicks normally
 */
@SuppressLint("SetJavaScriptEnabled")
class SVGWebView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val webView: WebView

    var onLoadFinished: (() -> Unit)? = null
    var onLoadError: ((String) -> Unit)? = null

    init {
        webView = WebView(context).apply {
            // Configure WebView settings
            settings.apply {
                javaScriptEnabled = false
                domStorageEnabled = false
                allowFileAccess = false
                allowContentAccess = false
                javaScriptCanOpenWindowsAutomatically = false
                setGeolocationEnabled(false)
                setSupportZoom(false)
                displayZoomControls = false
                builtInZoomControls = false
            }

            setBackgroundColor(Color.TRANSPARENT)
            isVerticalScrollBarEnabled = false
            isHorizontalScrollBarEnabled = false

            isClickable = false
            isFocusable = false

            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    onLoadFinished?.invoke()
                }

                override fun onReceivedError(
                    view: WebView?,
                    errorCode: Int,
                    description: String?,
                    failingUrl: String?
                ) {
                    super.onReceivedError(view, errorCode, description, failingUrl)
                    onLoadError?.invoke(description ?: "Unknown error")
                }
            }
        }

        addView(webView, LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    }

    /**
     * Load SVG from string data
     */
    fun loadSvg(svgData: String, borderRadius: Float = 0f) {
        val processedSvg = when {
            svgData.startsWith("data:image/svg+xml;base64,") -> {
                val base64Data = svgData.substringAfter("base64,")
                try {
                    val decodedBytes = Base64.decode(base64Data, Base64.DEFAULT)
                    String(decodedBytes)
                } catch (e: Exception) {
                    onLoadError?.invoke("Failed to decode base64 SVG: ${e.message}")
                    return
                }
            }
            svgData.startsWith("data:image/svg+xml,") -> {
                val encodedData = svgData.substringAfter("data:image/svg+xml,")
                try {
                    java.net.URLDecoder.decode(encodedData, "UTF-8")
                } catch (e: Exception) {
                    onLoadError?.invoke("Failed to decode URL encoded SVG: ${e.message}")
                    return
                }
            }
            else -> svgData
        }

        val rewrittenSvg = rewriteSVGSize(processedSvg)
        val html = createHtmlWrapper(rewrittenSvg, borderRadius)

        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null)
    }

    /**
     * Load SVG from URL
     */
    fun loadSvgFromUrl(url: String) {
        webView.loadUrl(url)
    }

    /**
     * Rewrite SVG size attributes to make it responsive
     */
    private fun rewriteSVGSize(svgString: String): String {
        try {
            val svgTagPattern = Pattern.compile("<svg[^>]*>", Pattern.CASE_INSENSITIVE)
            val matcher = svgTagPattern.matcher(svgString)

            if (!matcher.find()) {
                return svgString
            }

            val originalTag = matcher.group(0) ?: return svgString
            val tagStart = matcher.start()
            val tagEnd = matcher.end()

            // Simple approach: just set width/height to 100% and add preserveAspectRatio
            val newTag = originalTag
                .replace(Regex("width\\s*=\\s*[\"'][^\"']*[\"']"), "width=\"100%\"")
                .replace(Regex("height\\s*=\\s*[\"'][^\"']*[\"']"), "height=\"100%\"")
                .replace(Regex("preserveAspectRatio\\s*=\\s*[\"'][^\"']*[\"']"), "")
                .replace(">", " preserveAspectRatio=\"none\">")

            return svgString.substring(0, tagStart) + newTag + svgString.substring(tagEnd)

        } catch (e: Exception) {
            return svgString
        }
    }

    /**
     * Create HTML wrapper for SVG
     */
    private fun createHtmlWrapper(svg: String, borderRadius: Float = 0f): String {
        val borderRadiusStyle = if (borderRadius > 0f) {
            "border-radius: ${borderRadius}px; overflow: hidden;"
        } else {
            ""
        }

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
                <style>
                    html, body {
                        margin: 0;
                        padding: 0;
                        background: transparent;
                        overflow: hidden;
                        width: 100vw;
                        height: 100vh;
                    }
                    .svg-container {
                        width: 100%;
                        height: 100%;
                        display: block;
                        $borderRadiusStyle
                    }
                    svg {
                        width: 100%;
                        height: 100%;
                        display: block;
                        object-fit: cover;
                    }
                </style>
            </head>
            <body>
                <div class="svg-container">
                    $svg
                </div>
            </body>
            </html>
        """.trimIndent()
    }

    /**
     * Clear the SVG content
     */
    fun clear() {
        webView.loadUrl("about:blank")
    }

    /**
     * Reload current SVG
     */
    fun reload() {
        webView.reload()
    }
}
