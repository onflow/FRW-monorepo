package com.flowfoundation.wallet.reactnative.bridge

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.flowfoundation.wallet.modules.SurgePricingTestModule

class NativeFRWBridgePackage : BaseReactPackage() {

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        when (name) {
            NativeFRWBridge.NAME -> NativeFRWBridge(reactContext)
            "SurgePricingTest" -> SurgePricingTestModule(reactContext)
            else -> null
        }

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            NativeFRWBridge.NAME to ReactModuleInfo(
                name = NativeFRWBridge.NAME,
                className = NativeFRWBridge.NAME,
                canOverrideExistingModule = false,
                needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = true
            ),
            "SurgePricingTest" to ReactModuleInfo(
                name = "SurgePricingTest",
                className = "SurgePricingTest",
                canOverrideExistingModule = false,
                needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = false
            )
        )
    }
}
