package com.flowfoundation.wallet;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.flowfoundation.wallet.bridge.QRCodeScanManager;
import com.flowfoundation.wallet.bridge.RNBridge;
import com.flowfoundation.wallet.manager.wallet.WalletManager;
import com.flowfoundation.wallet.manager.app.ChainNetworkKt;
import com.flowfoundation.wallet.wallet.WalletUtilsKt;
import com.google.gson.Gson;
import java.util.List;

public class ReactNativeDemoActivity extends ReactActivity {

    private static final String TAG = "ReactNativeDemoActivity";

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "FRWRN";
    }

    /**
     * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
     * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
     * (aka React 18) with two boolean flags.
     */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(
            this,
            getMainComponentName(),
            false, // fabricEnabled
            false  // concurrentRootEnabled
        ) {
            @Override
            protected Bundle getLaunchOptions() {
                Bundle launchOptions = new Bundle();

                Intent intent = getIntent();
                if (intent != null) {
                    String address = intent.getStringExtra("address");
                    String network = intent.getStringExtra("network");
                    String initialRoute = intent.getStringExtra("initialRoute");
                    String screen = intent.getStringExtra("screen");
                    String sendToConfigJson = intent.getStringExtra("sendToConfig");

                    // Top level props
                    if (address != null) {
                        launchOptions.putString("address", address);
                        Log.d(TAG, "Added address to launch options: " + address);
                    }
                    if (network != null) {
                        launchOptions.putString("network", network);
                        Log.d(TAG, "Added network to launch options: " + network);
                    }
                    if (initialRoute != null) {
                        launchOptions.putString("initialRoute", initialRoute);
                        Log.d(TAG, "Added initialRoute to launch options: " + initialRoute);
                    }

                    // Create initialProps object if we have screen or sendToConfig
                    if (screen != null || sendToConfigJson != null) {
                        Bundle initialPropsBundle = new Bundle();

                        if (screen != null) {
                            initialPropsBundle.putString("screen", screen);
                            Log.d(TAG, "Added screen to initialProps: " + screen);
                        }
                        if (sendToConfigJson != null) {
                            initialPropsBundle.putString("sendToConfig", sendToConfigJson);
                            Log.d(TAG, "Added sendToConfig to initialProps: " + sendToConfigJson);
                        }

                        launchOptions.putBundle("initialProps", initialPropsBundle);
                        Log.d(TAG, "Added initialProps bundle with " + initialPropsBundle.size() + " properties");
                    }
                }

                Log.d(TAG, "Launch options created with " + launchOptions.size() + " properties");
                return launchOptions;
            }

            @Override
            protected ReactRootView createRootView() {
                ReactRootView rootView = new ReactRootView(getContext()) {
                    @Override
                    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
                        try {
                            super.onMeasure(widthMeasureSpec, heightMeasureSpec);
                        } catch (Exception e) {
                            Log.w(TAG, "Error in ReactRootView onMeasure, using default size: " + e.getMessage());
                            // Set a default size if measurement fails
                            setMeasuredDimension(
                                MeasureSpec.getSize(widthMeasureSpec),
                                MeasureSpec.getSize(heightMeasureSpec)
                            );
                        }
                    }

                    @Override
                    protected void onAttachedToWindow() {
                        try {
                            super.onAttachedToWindow();
                        } catch (Exception e) {
                            Log.w(TAG, "Error attaching ReactRootView to window: " + e.getMessage());
                        }
                    }

                    @Override
                    protected void onDetachedFromWindow() {
                        try {
                            super.onDetachedFromWindow();
                        } catch (Exception e) {
                            Log.w(TAG, "Error detaching ReactRootView from window: " + e.getMessage());
                        }
                    }
                };
                return rootView;
            }
        };
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.d(TAG, "onCreate called");
        Log.d(TAG, "Build type: " + BuildConfig.BUILD_TYPE);
        
        // Store the original exception handler
        final Thread.UncaughtExceptionHandler originalHandler = Thread.getDefaultUncaughtExceptionHandler();
        
        // Set up custom exception handler for this activity
        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            @Override
            public void uncaughtException(Thread thread, Throwable ex) {
                Log.e(TAG, "Uncaught exception in ReactNativeDemoActivity: " + ex.getMessage());
                ex.printStackTrace();
                
                // Try to gracefully finish the activity
                try {
                    if (!isFinishing() && !isDestroyed()) {
                        finish();
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Failed to finish activity after uncaught exception: " + e.getMessage());
                }
                
                // Call the original handler to maintain crash reporting
                if (originalHandler != null) {
                    originalHandler.uncaughtException(thread, ex);
                }
            }
        });
        
        try {
            Log.d(TAG, "Calling super.onCreate()...");
            super.onCreate(savedInstanceState);
            Log.d(TAG, "super.onCreate() completed successfully");
            
            
            // Log the intent extras for debugging
            Intent intent = getIntent();
            if (intent != null) {
                Log.d(TAG, "Intent extras:");
                Log.d(TAG, "  address: " + intent.getStringExtra("address"));
                Log.d(TAG, "  network: " + intent.getStringExtra("network"));
                Log.d(TAG, "  initialRoute: " + intent.getStringExtra("initialRoute"));
                Log.d(TAG, "  screen: " + intent.getStringExtra("screen"));
                Log.d(TAG, "  sendToConfig: " + intent.getStringExtra("sendToConfig"));
            }
            
            // Check if React context is available
            Log.d(TAG, "Checking React Native initialization...");
            if (getReactInstanceManager() != null) {
                Log.d(TAG, "ReactInstanceManager is available");
                if (getReactInstanceManager().getCurrentReactContext() != null) {
                    Log.d(TAG, "React context is available");
                } else {
                    Log.w(TAG, "React context is null");
                }
            } else {
                Log.w(TAG, "ReactInstanceManager is null");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in onCreate: " + e.getMessage());
            e.printStackTrace();
            // If React Native fails to initialize, finish the activity
            finish();
        }
    }

    @Override
    protected void onDestroy() {
        Log.d(TAG, "onDestroy called");
        try {
            // Check if React context is still valid before destroying
            if (getReactInstanceManager() != null && getReactInstanceManager().getCurrentReactContext() != null) {
                Log.d(TAG, "React context is active, proceeding with normal destroy");
                super.onDestroy();
            } else {
                Log.d(TAG, "React context is null, skipping React cleanup");
                // Call Activity.onDestroy() directly to avoid React cleanup issues
                try {
                    super.onDestroy();
                } catch (Exception e) {
                    Log.w(TAG, "Even direct destroy failed: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Error during onDestroy: " + e.getMessage());
            // Don't call super.onDestroy() if React context is problematic
            // Just let the activity die naturally
        }
    }

    @Override
    protected void onPause() {
        Log.d(TAG, "onPause called");
        super.onPause();
    }

    @Override
    protected void onResume() {
        Log.d(TAG, "onResume called");
        super.onResume();
    }


    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        // Handle QR scan result
        QRCodeScanManager.INSTANCE.handleScanResult(resultCode, data);
    }

    /**
     * Launch the React Native Demo Activity
     */
    public static void launch(Context context) {
        launch(context, null, null, null);
    }

    /**
     * Launch the React Native Demo Activity with default address and network
     */
    public static void launch(Context context, RNBridge.ScreenType screenType) {
        String address = WalletUtilsKt.toAddress(WalletManager.INSTANCE.selectedWalletAddress());
        String network = ChainNetworkKt.chainNetWorkString();
        launch(context, screenType, address, network);
    }

    /**
     * Launch the React Native Demo Activity with parameters
     */
    public static void launch(Context context, RNBridge.ScreenType screenType, String address, String network) {
        Log.d(TAG, "Launching ReactNativeDemoActivity with params:");
        Log.d(TAG, "  screenType: " + screenType);
        Log.d(TAG, "  address: " + address);
        Log.d(TAG, "  network: " + network);

        Intent intent = new Intent(context, ReactNativeDemoActivity.class);

        // Add flags for standard launch mode
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        if (address != null) {
            intent.putExtra("address", address);
        }
        if (network != null) {
            intent.putExtra("network", network);
        }
        if (screenType != null) {
            // Convert screen enum to string and set both screen and initialRoute
            String screenString = screenType == RNBridge.ScreenType.SEND_ASSET ? "send-asset" : "token-detail";
            String routeName = screenType == RNBridge.ScreenType.SEND_ASSET ? "SelectTokens" : "Home";

            intent.putExtra("screen", screenString);
            intent.putExtra("initialRoute", routeName);
        }
        // Add a small delay to ensure any previous React Native instances are fully cleaned up
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
            try {
                context.startActivity(intent);
            } catch (Exception e) {
                Log.e(TAG, "Failed to start activity: " + e.getMessage());
            }
        }, 200);
    }

    /**
     * Launch with InitialProps containing screen and SendToConfig
     */
    public static void launchWithConfig(Context context, RNBridge.ScreenType screenType, RNBridge.SendToConfig sendToConfig, String address, String network) {
        Log.d(TAG, "Launching ReactNativeDemoActivity with config:");
        Log.d(TAG, "  screenType: " + screenType);
        Log.d(TAG, "  address: " + address);
        Log.d(TAG, "  network: " + network);

        Intent intent = new Intent(context, ReactNativeDemoActivity.class);

        // Add flags for standard launch mode
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        if (address != null) {
            intent.putExtra("address", address);
        }
        if (network != null) {
            intent.putExtra("network", network);
        }

        // Convert screen enum to string and set both screen and initialRoute
        String screenString = screenType == RNBridge.ScreenType.SEND_ASSET ? "send-asset" : "token-detail";
        String routeName;
        
        if (screenType == RNBridge.ScreenType.SEND_ASSET) {
            // If NFTs or tokens are pre-selected, navigate to SendTo (recipient selection)
            // The user needs to select recipient before going to the final send screen
            if (sendToConfig != null && 
                ((sendToConfig.getSelectedNFTs() != null && !sendToConfig.getSelectedNFTs().isEmpty()) ||
                 (sendToConfig.getSelectedToken() != null))) {
                routeName = "SendTo";
            } else {
                routeName = "SelectTokens";
            }
        } else {
            routeName = "Home";
        }

        intent.putExtra("screen", screenString);
        intent.putExtra("initialRoute", routeName);

        // Serialize SendToConfig to JSON
        if (sendToConfig != null) {
            String sendToConfigJson = new Gson().toJson(sendToConfig);
            intent.putExtra("sendToConfig", sendToConfigJson);
            Log.d(TAG, "  sendToConfig JSON: " + sendToConfigJson);
        }

        // Add a small delay to ensure any previous React Native instances are fully cleaned up
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
            try {
                context.startActivity(intent);
            } catch (Exception e) {
                Log.e(TAG, "Failed to start activity: " + e.getMessage());
            }
        }, 200);
    }

    /**
     * Convenience method for token send with default address and network
     */
    public static void launchTokenSend(Context context, RNBridge.TokenModel token) {
        String address = WalletUtilsKt.toAddress(WalletManager.INSTANCE.selectedWalletAddress());
        String network = ChainNetworkKt.chainNetWorkString();
        RNBridge.SendToConfig sendToConfig = new RNBridge.SendToConfig(token, null, null, null);
        launchWithConfig(context, RNBridge.ScreenType.SEND_ASSET, sendToConfig, address, network);
    }

    /**
     * Convenience method for NFT send with default address and network
     */
    public static void launchNFTSend(Context context, List<RNBridge.NFTModel> nfts) {
        String address = WalletUtilsKt.toAddress(WalletManager.INSTANCE.selectedWalletAddress());
        String network = ChainNetworkKt.chainNetWorkString();
        
        // Let React Native handle from account selection via bridge.getSelectedAccount()
        RNBridge.SendToConfig sendToConfig = new RNBridge.SendToConfig(null, null, nfts, null);
        launchWithConfig(context, RNBridge.ScreenType.SEND_ASSET, sendToConfig, address, network);
    }

    /**
     * Convenience method for Wallet send with default address and network
     * @param fromAccount can be null - if null, RN will handle account selection
     * @param targetAddress can be null - if null, user will select target in RN
     */
    public static void launchWalletSend(Context context, RNBridge.WalletAccount fromAccount, String targetAddress) {
        String address = WalletUtilsKt.toAddress(WalletManager.INSTANCE.selectedWalletAddress());
        String network = ChainNetworkKt.chainNetWorkString();
        RNBridge.SendToConfig sendToConfig = new RNBridge.SendToConfig(null, fromAccount, null, targetAddress);
        launchWithConfig(context, RNBridge.ScreenType.SEND_ASSET, sendToConfig, address, network);
    }
}
