import { useState, useEffect } from 'react';

declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
    }
}

export const useFacebookSdk = () => {
    const [isSdkLoaded, setIsSdkLoaded] = useState(false);
    const [sdkError, setSdkError] = useState<string | null>(null);

    useEffect(() => {
        if (window.FB) {
            setIsSdkLoaded(true);
            return;
        }

        window.fbAsyncInit = function () {
            window.FB.init({
                appId: import.meta.env.VITE_FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });
            setIsSdkLoaded(true);
        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            (js as any).src = "https://connect.facebook.net/en_US/sdk.js";
            (js as any).onerror = () => {
                setSdkError('Facebook SDK blocked. Please disable AdBlocker.');
                console.error('Facebook SDK failed to load. Likely blocked by client.');
            };
            (fjs as any).parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, []);

    const login = (options: any = {}) => {
        return new Promise((resolve, reject) => {
            if (!window.FB) {
                reject('Facebook SDK not loaded');
                return;
            }

            // The original scope variable is no longer used directly in the FB.login call
            // const scope = 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement';
            // const loginOptions = { scope, ...options };

            window.FB.login((response: any) => {
                if (response.authResponse) {
                    resolve(response);
                } else {
                    reject(new Error('User cancelled login or did not fully authorize.'));
                }
            }, {
                // Added business_management as it seems required for some Business Portfolios
                scope: 'public_profile,email,pages_show_list,instagram_basic,instagram_manage_insights,pages_read_engagement,business_management',
                auth_type: 'reauthenticate'
            });
        });
    };

    return { isSdkLoaded, sdkError, login };
};
