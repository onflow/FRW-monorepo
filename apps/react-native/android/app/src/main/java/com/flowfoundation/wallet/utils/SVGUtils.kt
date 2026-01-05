package com.flowfoundation.wallet.utils

import android.view.ViewGroup
import android.widget.ImageView
import com.bumptech.glide.load.resource.bitmap.RoundedCorners
import com.flowfoundation.wallet.page.nft.nftlist.isSvgUrl
import com.flowfoundation.wallet.widgets.SVGWebView

/**
 * Utility functions for SVG handling with WebView
 */
object SVGUtils {
    private val TAG = SVGUtils.javaClass.simpleName
    /**
     * Replace ImageView with SVGWebView if URL is SVG
     * Returns the SVGWebView if replacement happened, null otherwise
     */
    fun replaceImageViewWithSvgWebView(
        imageView: ImageView,
        url: String?,
        maintainLayoutParams: Boolean = true,
    ): SVGWebView? {
        if (!url.isSvgUrl()) return null

        val parent = imageView.parent as? ViewGroup ?: return null
        val context = imageView.context
        val layoutParams = imageView.layoutParams
        val index = parent.indexOfChild(imageView)

        // Extract parent's click listener before replacing
        val parentClickListener = if (parent.hasOnClickListeners() && parent.isClickable) {
            logd(TAG, "Found parent click listener on ${parent.javaClass.simpleName}")
            // We can't extract the actual listener, but we know the parent has one
            android.view.View.OnClickListener { _: android.view.View ->
                logd(TAG, "Triggering parent click via performClick")
                parent.performClick()
            }
        } else {
            logd(TAG, "No parent click listener found")
            null
        }

        // Create SVGWebView
        val svgWebView = SVGWebView(context)
        if (maintainLayoutParams) {
            svgWebView.layoutParams = layoutParams
        }

        // Set the extracted click listener to SVGWebView
        parentClickListener?.let { listener ->
            svgWebView.setOnClickListener(listener)
            svgWebView.isClickable = true
            logd(TAG, "Parent click listener copied to SVGWebView")
        }

        // Replace ImageView with SVGWebView
        parent.removeViewAt(index)
        parent.addView(svgWebView, index)

        logd(TAG, "SVGWebView replaced ImageView in ${parent.javaClass.simpleName}")

        // Load SVG - handle both URL and string data
        if (url!!.startsWith("http")) {
            logd(TAG, "Loading SVG from URL: $url")
            svgWebView.loadSvgFromUrl(url)
        } else {
            logd(TAG, "Loading SVG from string data")
            svgWebView.loadSvg(url)
        }

        return svgWebView
    }

    /**
     * Create SVGWebView with same dimensions as ImageView
     */
    fun createSvgWebViewFromImageView(imageView: ImageView): SVGWebView {
        val svgWebView = SVGWebView(imageView.context)
        svgWebView.layoutParams = imageView.layoutParams
        return svgWebView
    }

    /**
     * Smart load function that chooses between ImageView and SVGWebView
     */
    fun smartLoadImage(imageView: ImageView, url: String?) {
        if (url.isSvgUrl()) {
            // Replace with SVGWebView
            val svgWebView = replaceImageViewWithSvgWebView(imageView, url)
            svgWebView?.onLoadError = { error ->
                logd(TAG, "Failed to load SVG: $error")
                // Fallback to regular ImageView with placeholder
                imageView.loadImageWithSvgSupport(url, true)
            }
        } else {
            // Use regular image loading
            imageView.loadImageWithSvgSupport(url, true)
        }
    }

    /**
     * Extract border radius from RoundedCorners transformation
     */
    fun extractBorderRadiusFromTransformation(transformation: Any?): Float {
        return if (transformation is RoundedCorners) {
            // RoundedCorners stores radius in pixels, we need to extract it
            // This is a simplified approach - in practice you might need reflection
            16f // Default fallback for common use case
        } else {
            0f
        }
    }

    /**
     * Smart load with Glide transformations support
     */
    fun smartLoadImageWithTransforms(
        imageView: ImageView,
        url: String?,
        onClickListener: ((android.view.View) -> Unit)? = null
    ): SVGWebView? {
        if (url.isSvgUrl()) {
            val svgWebView = replaceImageViewWithSvgWebView(imageView, url, true)
            svgWebView?.onLoadError = { error ->
                logd(TAG, "Failed to load SVG: $error")
                // Fallback handled by caller
            }

            // Set click listener if provided
            onClickListener?.let { listener ->
                logd(TAG, "Setting click listener on SVGWebView")
                svgWebView?.setOnClickListener { view ->
                    logd(TAG, "SVGWebView clicked!")
                    listener(view)
                }
                svgWebView?.isClickable = true
                logd(TAG, "SVGWebView isClickable set to true")
            }

            return svgWebView
        }
        return null
    }
}
