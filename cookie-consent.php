<?php

/**
 * Simple cookie consent display
 *
 * Original code based on: https://github.com/orestbida/cookieconsent
 *
 * We've stripped down this code a lot to only provide the needed
 * features. If more features are needed it would be best to download
 * the latest version and start fresh. It is a very simple setup and
 * does not take much effort to customize. 
 */

/**
 * Add styles and scripts
 *
 * We can't dynamically load resources in PHP or site caching will
 * get in the way. Instead we're checking the cookie in the main
 * JS file and if it hasn't been set we load the consent file, which
 * then loads the consent CSS file. Here we just need to set some
 * environment variables so they know where to look.
 *
 * NOTES:
 *     1. Be sure to update the "my-script" reference to the alias of
 *        your theme or plugin script file. This code will then load after.
 *     2. Change the MY_PLUGIN_URL to your plugin/theme folder path.
 */
function cookie_consent_load_scripts() {

    // include path for CSS/JS files to load on demand
    wp_localize_script( 'my-script', 'cookie_consent_obj',
        array(
            'cookie_name' => 'my_cookie_consent',
            'css_url' => MY_PLUGIN_URL . '/assets/cookie-consent.css',
            'js_url'  => MY_PLUGIN_URL . '/assets/cookie-consent.js'
        )
    );
}
// this loads before the main enquque so must have priority setting
// or the main plugin script won't be registered yet
add_action( 'wp_enqueue_scripts', 'cookie_consent_load_scripts', 99 );
