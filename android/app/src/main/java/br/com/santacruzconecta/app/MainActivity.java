package br.com.santacruzconecta.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.os.Message;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;

/** Aplicativo simples e restrito ao domínio oficial do Santa Cruz Conecta. */
public final class MainActivity extends Activity {
    private static final String START_URL = "https://santa-cruz-conecta.pepirocha123.workers.dev/";
    private static final String PORTAL_HOST = "santa-cruz-conecta.pepirocha123.workers.dev";
    private WebView portal;
    private ProgressBar loading;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(16,62,52));
        getWindow().setNavigationBarColor(Color.rgb(16,62,52));

        FrameLayout screen = new FrameLayout(this);
        screen.setBackgroundColor(Color.rgb(247,250,245));
        portal = new WebView(this);
        screen.addView(portal, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        loading = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        loading.setMax(100);
        screen.addView(loading, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 7));
        setContentView(screen);

        WebView.setWebContentsDebuggingEnabled(false);
        WebSettings settings = portal.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setSupportMultipleWindows(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSafeBrowsingEnabled(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(portal, false);

        portal.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) return false;
                return handleNavigation(request.getUrl());
            }
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                loading.setVisibility(View.VISIBLE);
            }
            @Override
            public void onPageFinished(WebView view, String url) {
                loading.setVisibility(View.GONE);
            }
            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel();
                Toast.makeText(MainActivity.this,
                    "Falha na conexão segura. Não é possível abrir o portal.",
                    Toast.LENGTH_LONG).show();
            }
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request,
                                        WebResourceError error) {
                if (request.isForMainFrame()) {
                    loading.setVisibility(View.GONE);
                    Toast.makeText(MainActivity.this,
                        "Não foi possível carregar o portal. Verifique a conexão.",
                        Toast.LENGTH_LONG).show();
                }
            }
        });

        portal.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int progress) {
                loading.setProgress(progress);
                if (progress >= 100) loading.setVisibility(View.GONE);
            }
            @Override
            public boolean onCreateWindow(WebView view, boolean dialog,
                                          boolean userGesture, Message message) {
                if (!userGesture) return false;
                final WebView popup = new WebView(MainActivity.this);
                popup.getSettings().setJavaScriptEnabled(false);
                AtomicBoolean handled = new AtomicBoolean(false);
                popup.setWebViewClient(new WebViewClient() {
                    private void openOnce(Uri destination) {
                        if (handled.compareAndSet(false, true)) {
                            openExternal(destination);
                            popup.post(popup::destroy);
                        }
                    }
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView web,
                                                            WebResourceRequest request) {
                        openOnce(request.getUrl());
                        return true;
                    }
                    @Override
                    public void onPageStarted(WebView web, String url, Bitmap icon) {
                        openOnce(Uri.parse(url));
                    }
                });
                WebView.WebViewTransport transport = (WebView.WebViewTransport) message.obj;
                transport.setWebView(popup);
                message.sendToTarget();
                return true;
            }
            @Override
            public void onCloseWindow(WebView window) {
                if (window != portal) window.destroy();
            }
        });

        if (state != null) {
            portal.restoreState(state);
        } else {
            portal.loadUrl(START_URL);
        }
    }

    private boolean handleNavigation(Uri destination) {
        if ("https".equalsIgnoreCase(destination.getScheme())
            && PORTAL_HOST.equalsIgnoreCase(destination.getHost())) return false;
        openExternal(destination);
        return true;
    }

    private void openExternal(Uri uri) {
        String scheme=uri.getScheme();
        if (scheme == null) return;
        scheme=scheme.toLowerCase(Locale.ROOT);
        if (!(scheme.equals("https") || scheme.equals("http") || scheme.equals("mailto")
            || scheme.equals("tel") || scheme.equals("geo") || scheme.equals("whatsapp"))) {
            Toast.makeText(this, "Link não suportado.", Toast.LENGTH_SHORT).show();
            return;
        }
        try {
            Intent open=new Intent(Intent.ACTION_VIEW,uri);
            open.addCategory(Intent.CATEGORY_BROWSABLE);
            startActivity(open);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "Nenhum aplicativo disponível para este link.",
                Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public void onBackPressed() {
        if (portal != null && portal.canGoBack()) portal.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onSaveInstanceState(Bundle state) {
        if (portal != null) portal.saveState(state);
        super.onSaveInstanceState(state);
    }

    @Override
    protected void onDestroy() {
        if (portal != null) {
            portal.stopLoading();
            portal.loadUrl("about:blank");
            portal.destroy();
            portal=null;
        }
        super.onDestroy();
    }
}
