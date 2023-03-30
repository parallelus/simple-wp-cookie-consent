/*
 * CookieConsent v3.0.0-beta.1
 * https://www.github.com/orestbida/cookieconsent
 * Author Orest Bida
 * Released under the MIT License
 *
 * With massive edits by Andy @ Saturday Drive. The unused code has been commented
 * out rather than deleted. You can see the changes this way and either remove them
 * or add them back as needed.
 */
(function(){
    'use strict';
    /**
     * @param {HTMLElement} [root] - [optional] element where the cookieconsent will be appended
     * @returns {Object} cookieconsent object with API
     */
    var CookieConsent = function(root){

        /**
         * CHANGE THIS FLAG FALSE TO DISABLE console.log()
         */
        // var ENABLE_LOGS = false;

        var _config = {
            'mode': 'opt-out',                          // 'opt-in', 'opt-out'
            // 'current_lang': 'en',
            // 'auto_language': null,
            // 'autorun': true,                         // run as soon as loaded
            // 'page_scripts': true,
            // 'hide_from_bots': true,
            'c_name': cookie_consent_obj.cookie_name,   // Default: 'my_cookie_consent'
            'c_exp': 365,                               // default: 1 year (in days)
            'c_domain': window.location.hostname,       // default: current domain
            'c_path': '/',
            'c_samesite': 'Lax',                        // Default: 'Lax'
            'use_rfc': true,                            // Default: false
            // 'autoclear_cookies': true,
            // 'revision': 0,
            // 'script_selector': 'data-cookiecategory',
            // 'theme': 'dark'                          // 'light', 'dark'
            'theme_css': cookie_consent_obj.css_url     // path to CSS file used for styling
        };

        var
            /**
             * Object which holds the main methods/API (.show, .run, ...)
            */
            _cookieconsent = {},

            /**
             * Global user configuration object
             */
            u_config,

            /**
             * Internal state variables
             */
            saved_cc = {},
            cc_data = null,
            cc_accepted = false,

            dialog_exists = false,
            dialog_visible = false,

            modal_visible = false,
            clicked_in = false,
            focusable,

            // all_table_headers,
            all_blocks; //,

            // // Helper callback functions
            // // (avoid calling "u_config['onAccept']" all the time)
            // onAccept,
            // onChange,
            // onFirstAction,

            // revision_enabled = false,
            // valid_revision = true,
            // revision_message = '';

            // State variables for the autoclearCookies function
            // changed_settings = [],
            // reload_page = false;

        /**
         * Accept type:
         *  - "all"
         *  - "necessary"
         *  - "custom"
         * @type {string}
         */
        var accept_type;

        /**
         * Contains all accepted categories
         * @type {string[]}
         */
        // var accepted_cats = [];

        /**
         * Contains all non-accepted (rejected) categories
         * @type {string[]}
         */
        // var rejected_cats = [];

        /**
         * Contains all categories enabled by default
         * @type {string[]}
         */
        // var default_cats = [];

        // Don't run plugin (to avoid indexing its text content) if bot detected
        // var is_bot = false;

        /**
         * Save reference to the last focused element on the page
         * (used later to restore focus when both modals are closed)
         */
        var last_elem_before_modal;
        var last_dialog_btn_focus;

        /**
         * Both of the arrays below have the same structure:
         * [0] => holds reference to the FIRST focusable element inside modal
         * [1] => holds reference to the LAST focusable element inside modal
         */
        var dialog_focusable = [];
        var modal_focusable = [];

        /**
         * Keep track of enabled/disabled categories
         * @type {boolean[]}
         */
        // var toggle_states = [];

        /**
         * Stores all available categories
         * @type {string[]}
         */
        // var all_cats = [];

        /**
         * Keep track of readonly toggles
         * @type {boolean[]}
         */
        // var readonly_cats = [];

        /**
         * Pointers to main dom elements (to avoid retrieving them later using document.getElementById)
         */
        var
            /** @type {HTMLElement} */ html_dom = document.documentElement,
            /** @type {HTMLElement} */ main_ctnr,
            /** @type {HTMLElement} */ modals_ctnr,

            /** @type {HTMLElement} */ dialog,
            /** @type {HTMLElement} */ dialog_title,
            /** @type {HTMLElement} */ dialog_desc,
            /** @type {HTMLElement} */ btn_1,
            // /** @type {HTMLElement} */ btn_2,
            /** @type {HTMLElement} */ cc_btns,
            /** @type {HTMLElement} */ dialog_inner,

            /** @type {HTMLElement} */ settings_ctnr,
            /** @type {HTMLElement} */ settings_inner,
            /** @type {HTMLElement} */ settings_title,
            /** @type {HTMLElement} */ x_btn,
            /** @type {HTMLElement} */ settings_blks,
            /** @type {HTMLElement} */ new_settings_blks,
            /** @type {HTMLElement} */ settings_btns,
            // /** @type {HTMLElement} */ settings_save_btn,
            /** @type {HTMLElement} */ settings_all_btn; // ,
            // /** @type {HTMLElement} */ settings_reject_all_btn;

        /**
         * Update config settings
         * @param {Object} u_config
         */
        var _setConfig = function(_u_config){

            /**
             * Make user configuration globally available
             */
            u_config = _u_config;

            // _log("CookieConsent [CONFIG]: received_config_settings ", u_config);

            // if(typeof u_config['c_exp'] === "number")
            //     _config.c_exp = u_config['c_exp'];

            // if(typeof u_config['cookie_necessary_only_exp'] === "number")
            //     _config.cookie_necessary_only_exp  = u_config['cookie_necessary_only_exp'];

            // if(typeof u_config['autorun'] === "boolean")
            //     _config.autorun = u_config['autorun'];

            // if(typeof u_config['c_domain'] === "string")
            //     _config.c_domain = u_config['c_domain'];

            // if(typeof u_config['c_samesite'] === "string")
            //     _config.c_samesite = u_config['c_samesite'];

            // if(typeof u_config['c_path'] === "string")
            //     _config.c_path = u_config['c_path'];

            // if(typeof u_config['c_name'] === "string")
            //     _config.c_name = u_config['c_name'];

            // if(typeof u_config['onAccept'] === "function")
            //     onAccept = u_config['onAccept'];

            // if(typeof u_config['onFirstAction'] === "function")
            //     onFirstAction = u_config['onFirstAction'];

            // if(typeof u_config['onChange'] === "function")
            //     onChange = u_config['onChange'];

            // _config.mode = (u_config['mode'] === 'opt-out') ? 'opt-out' : 'opt-in';

            // if(typeof u_config['revision'] === "number"){
            //     u_config['revision'] > -1 && (_config.revision = u_config['revision']);
            //     revision_enabled = true;
            // }

            // if(typeof u_config['autoclear_cookies'] === "boolean")
            //     _config.autoclear_cookies = u_config['autoclear_cookies'];

            // _config.use_rfc = (u_config['use_rfc'] === true) ? true : false;

            // if(u_config['hide_from_bots'] === true){
            //     is_bot = navigator &&
            //         ((navigator.userAgent && /bot|crawl|spider|slurp|teoma/i.test(navigator.userAgent)) || navigator.webdriver);
            // }

            // _config.page_scripts = u_config['page_scripts'] === true;
            // _config.page_scripts_order = u_config['page_scripts_order'] !== false; //[WARNING] Will be removed in v3

            // if (u_config['auto_language'] === 'browser' || u_config['auto_language'] === true) {
            //     _config.auto_language = 'browser';
            // } else if (u_config['auto_language'] === 'document') {
            //     _config.auto_language = 'document';
            // }

            // u_config['theme_class'] = '';
            // if(u_config['theme'] === 'dark')
            //     u_config['theme_class'] = 'c_darkmode';

            // if ( typeof u_config['theme_css'] === "string" )
            //     _config.theme_css = u_config['theme_css'];

            // _log("CookieConsent [LANG]: auto_language strategy is '" + _config.auto_language + "'");

            // _config.current_lang = 'en'; // _resolveCurrentLang(u_config.languages, u_config['current_lang']);
        }

        /**
         * Add an onClick listeners to all html elements with data-cc attribute
         */
        var _addDataButtonListeners = function(elem){

            var _a = 'accept-';

            var show_settings = _getElements('c-settings');
            // var accept_all = _getElements(_a + 'all');
            // var accept_necessary = _getElements(_a + 'necessary');
            // var accept_selection = _getElements(_a + 'selection');

            for(var i=0; i<show_settings.length; i++){
                show_settings[i].setAttribute('aria-haspopup', 'dialog');
                _addEvent(show_settings[i], 'click', function(event){
                    event.preventDefault ? event.preventDefault() : event.returnValue = false;
                    _cookieconsent.showSettings(0);
                });
            }

            // for(i=0; i<accept_all.length; i++){
            //     _addEvent(accept_all[i], 'click', function(event){
            //         _acceptAction(event, 'all');
            //     });
            // }

            // for(i=0; i<accept_selection.length; i++){
            //     _addEvent(accept_selection[i], 'click', function(event){
            //         _acceptAction(event);
            //     });
            // }

            // for(i=0; i<accept_necessary.length; i++){
            //     _addEvent(accept_necessary[i], 'click', function(event){
            //         _acceptAction(event, []);
            //     });
            // }

            /**
             * Return all elements with given data-cc role
             * @param {string} data_role
             * @returns {NodeListOf<Element>}
             */
            function _getElements(data_role){
                return (elem || document).querySelectorAll('a[data-cc="' + data_role + '"], button[data-cc="' + data_role + '"]');
            }

            /**
             * Helper function: accept and then hide modals
             * @param {PointerEvent} e source event
             * @param {string} [accept_type]
             */
            function _acceptAction(e, accept_type){
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
                _cookieconsent.accept(accept_type);
                _cookieconsent.hideSettings();
                _cookieconsent.hide();
            }
        }

        /**
         * Get a valid language (at least 1 must be defined)
         * @param {string} lang - desired language
         * @param {Object} all_languages - all defined languages
         * @returns {string} validated language
         */
        // var _getValidatedLanguage = function(lang, all_languages){
        //     if(Object.prototype.hasOwnProperty.call(all_languages, lang)){
        //         return lang;
        //     }else if(_getKeys(all_languages).length > 0){
        //         if(Object.prototype.hasOwnProperty.call(all_languages, _config.current_lang)){
        //             return _config.current_lang ;
        //         }else{
        //             return _getKeys(all_languages)[0];
        //         }
        //     }
        // }

        /**
         * Save reference to first and last focusable elements inside each modal
         * to prevent losing focus while navigating with TAB
         */
        // var _getModalFocusableData = function(){

        //     /**
        //      * Note: any of the below focusable elements, which has the attribute tabindex="-1" AND is either
        //      * the first or last element of the modal, won't receive focus during "open/close" modal
        //      */
        //     var allowed_focusable_types = ['[href]', 'button', 'input', 'details', '[tabindex="0"]'];

        //     function _getAllFocusableElements(modal, _array){
        //         var focus_later=false, focus_first=false;

        //         // ie might throw exception due to complex unsupported selector => a:not([tabindex="-1"])
        //         try{
        //             var focusable_elems = modal.querySelectorAll(allowed_focusable_types.join(':not([tabindex="-1"]), '));
        //             var attr, len=focusable_elems.length, i=0;

        //             while(i < len){

        //                 attr = focusable_elems[i].getAttribute('data-focus');

        //                 if(!focus_first && attr === "1"){
        //                     focus_first = focusable_elems[i];

        //                 }else if(attr === "0"){
        //                     focus_later = focusable_elems[i];
        //                     if(!focus_first && focusable_elems[i+1].getAttribute('data-focus') !== "0"){
        //                         focus_first = focusable_elems[i+1];
        //                     }
        //                 }

        //                 i++;
        //             }

        //         }catch(e){
        //             return modal.querySelectorAll(allowed_focusable_types.join(', '));
        //         }

        //         /**
        //          * Save first and last elements (used to lock/trap focus inside modal)
        //          */
        //         _array[0] = focusable_elems[0];
        //         _array[1] = focusable_elems[focusable_elems.length - 1];
        //         _array[2] = focus_later;
        //         _array[3] = focus_first;
        //     }

        //     /**
        //      * Get settings modal'S all focusable elements
        //      * Save first and last elements (used to lock/trap focus inside modal)
        //      */
        //     _getAllFocusableElements(settings_inner, modal_focusable);

        //     /**
        //      * If consent modal exists, do the same
        //      */
        //     if(dialog_exists){
        //         _getAllFocusableElements(dialog, dialog_focusable);
        //     }
        // }

        // var _createConsentModal = function(lang){
        var _createConsentModal = function(){

            // if(u_config['force_consent'] === true)
            //     _addClass(html_dom, 'force--consent');

            // Create modal if it doesn't exist
            if(!dialog){

                dialog = _newElm('div');
                var dialog_inner_inner = _newElm('div');
                var overlay = _newElm('div');

                dialog.id = 'cm';
                dialog_inner_inner.id = 'c-inr-i';
                overlay.id = 'cm-ov';

                dialog.setAttribute('role', 'dialog');
                dialog.setAttribute('aria-modal', 'true');
                dialog.setAttribute('aria-hidden', 'false');
                dialog.setAttribute('aria-labelledby', 'c-ttl');
                dialog.setAttribute('aria-describedby', 'c-txt');

                // Append consent modal to main container
                modals_ctnr.appendChild(dialog);
                modals_ctnr.appendChild(overlay);

                /**
                 * Make modal by default hidden to prevent weird page jumps/flashes (shown only once css is loaded)
                 */
                dialog.style.visibility = overlay.style.visibility = "hidden";
                overlay.style.opacity = 0;
            }

            // Use insertAdjacentHTML instead of innerHTML
            var dialog_title_value = u_config.content['dialog']['title'];

            // Add title (if valid)
            if(dialog_title_value){

                if(!dialog_title){
                    dialog_title = _newElm('div');
                    dialog_title.id = 'c-ttl';
                    dialog_title.setAttribute('role', 'heading');
                    dialog_title.setAttribute('aria-level', '2');
                    dialog_inner_inner.appendChild(dialog_title);
                }

                dialog_title.innerHTML = dialog_title_value;
            }

            var desc = u_config.content['dialog']['desc'];

            // if(revision_enabled){
            //     if(!valid_revision){
            //         desc = desc.replace("{{revision_message}}", revision_message || u_config.content['dialog']['revision_message'] || "");
            //     }else{
            //         desc = desc.replace("{{revision_message}}", "");
            //     }
            // }

            if(!dialog_desc){
                dialog_desc = _newElm('div');
                dialog_desc.id = 'c-txt';
                dialog_inner_inner.appendChild(dialog_desc);
            }

            // Set description content
            dialog_desc.innerHTML = desc;

            var btn_1_data = u_config.content['dialog']['primary_btn'],   // accept current selection
                btn_2_data = u_config.content['dialog']['secondary_btn'];

            // Add primary button if not false
            if(btn_1_data){

                if(!btn_1){
                    btn_1 = _newElm('button');
                    btn_1.id = 'c-p-bn';
                    btn_1.className =  "c-bn";

                    var _accept_type;

                    if(btn_1_data['role'] === 'accept_all')
                        _accept_type = 'all'

                    _addEvent(btn_1, "click", function(){
                        _cookieconsent.hide();
                        // _log("CookieConsent [ACCEPT]: cookie_consent was accepted!");
                        _cookieconsent.accept(_accept_type);
                    });
                }

                btn_1.innerHTML = u_config.content['dialog']['primary_btn']['text'];
            }

            // // Add secondary button if not false
            // if(btn_2_data){

            //     if(!btn_2){
            //         btn_2 = _newElm('button');
            //         btn_2.id = 'c-s-bn';
            //         btn_2.className = "c-bn c_link";

            //         if(btn_2_data['role'] === 'accept_necessary'){
            //             _addEvent(btn_2, 'click', function(){
            //                 _cookieconsent.hide();
            //                 _cookieconsent.accept([]); // accept necessary only
            //             });
            //         }else{
            //             _addEvent(btn_2, 'click', function(){
            //                 _cookieconsent.showSettings(0);
            //             });
            //         }
            //     }

            //     btn_2.innerHTML = u_config.content['dialog']['secondary_btn']['text'];
            // }

            // Swap buttons
            var gui_options_data = u_config['gui_options'];

            if(!dialog_inner){
                dialog_inner = _newElm('div');
                dialog_inner.id = 'c-inr';

                dialog_inner.appendChild(dialog_inner_inner);
            }

            if(!cc_btns){
                cc_btns = _newElm('div');
                cc_btns.id = "c-bns";

                // if(gui_options_data && gui_options_data['dialog'] && gui_options_data['dialog']['swap_buttons'] === true){
                //     btn_2_data && cc_btns.appendChild(btn_2);
                //     btn_1_data && cc_btns.appendChild(btn_1);
                //     cc_btns.className = 'swap';
                // }else{
                    btn_1_data && cc_btns.appendChild(btn_1);
                //     btn_2_data && cc_btns.appendChild(btn_2);
                // }

                (btn_1_data || btn_2_data ) && dialog_inner.appendChild(cc_btns);
                dialog.appendChild(dialog_inner);
            }

            dialog_exists = true;
        }

        // var _createSettingsModal = function(lang){
        var _createSettingsModal = function(){

            /**
             * Create all dialog elements
             */
            if(!settings_ctnr){
                settings_ctnr = _newElm('div');
                var settings_ctnr_valign = _newElm('div');
                var settings = _newElm('div');
                var settings_ctnr_inner = _newElm('div');
                settings_inner = _newElm('div');
                settings_title = _newElm('div');
                var settings_header = _newElm('div');
                x_btn = _newElm('button');
                var x_btn_container = _newElm('div');
                settings_blks = _newElm('div');
                var overlay = _newElm('div');

                /**
                 * Set ids
                 */
                settings_ctnr.id = 's-cnt';
                settings_ctnr_valign.id = "c-vln";
                settings_ctnr_inner.id = "c-s-in";
                settings.id = "c-cs";
                settings_title.id = 's-ttl';
                settings_inner.id = 's-inr';
                settings_header.id = "s-hdr";
                settings_blks.id = 's-bl';
                x_btn.id = 's-c-bn';
                overlay.id = 'cs-ov';
                x_btn_container.id = 's-c-bnc';
                x_btn.className = 'c-bn';

                settings_ctnr.setAttribute('role', 'dialog');
                settings_ctnr.setAttribute('aria-modal', 'true');
                settings_ctnr.setAttribute('aria-hidden', 'true');
                settings_ctnr.setAttribute('aria-labelledby', 's-ttl');
                settings_title.setAttribute('role', 'heading');
                settings_ctnr.style.visibility = overlay.style.visibility = "hidden";
                overlay.style.opacity = 0;

                x_btn_container.appendChild(x_btn);

                // If 'esc' key is pressed inside settings_ctnr div => hide settings
                _addEvent(settings_ctnr_valign, 'keydown', function(evt){
                    evt = evt || window.event;
                    if (evt.keyCode === 27) {
                        _cookieconsent.hideSettings(0);
                    }
                }, true);

                _addEvent(x_btn, 'click', function(){
                    _cookieconsent.hideSettings(0);
                });
            }else{
                new_settings_blks = _newElm('div');
                new_settings_blks.id = 's-bl';
            }

            // Add label to close button
            x_btn.setAttribute('aria-label', u_config.content['modal']['close_btn_label'] || 'Close');

            all_blocks = u_config.content['modal']['blocks'];
            // all_table_headers = u_config.content['modal']['cookie_table_headers'];

            var n_blocks = all_blocks.length;

            // Set settings modal title
            settings_title.innerHTML = u_config.content['modal']['title'];

            // Create settings modal content (blocks)
            for(var i=0; i<n_blocks; ++i){

                var title_data = all_blocks[i]['title'],
                    desc_data = all_blocks[i]['desc'],
                    toggle_data = all_blocks[i]['toggle'],
                    cookie_table_data = all_blocks[i]['cookie_table'],
                    // remove_cookie_tables = u_config['remove_cookie_tables'] === true,
                    isExpandable = (desc_data && 'truthy'); // || (!remove_cookie_tables && (cookie_table_data && 'truthy'));

                // Create title
                var block_section = _newElm('div');
                var block_table_container = _newElm('div');

                // Create description
                if(desc_data){
                    var block_desc = _newElm('div');
                    block_desc.className = 'p';
                    block_desc.insertAdjacentHTML('beforeend', desc_data);
                }

                var block_title_container = _newElm('div');
                block_title_container.className = 'title';

                block_section.className = 'c-bl';
                block_table_container.className = 'desc';

                // Create toggle if specified (opt in/out)
                if(typeof toggle_data !== 'undefined'){

                    // var accordion_id = "c-ac-"+i;

                    // // Create button (to collapse/expand block description)
                    // var block_title_btn = isExpandable ? _newElm('button') : _newElm('div');
                    // var block_switch_label = _newElm('label');
                    // var block_switch = _newElm('input');
                    // var block_switch_span = _newElm('span');
                    // var label_text_span = _newElm('span');

                    // // These 2 spans will contain each 2 pseudo-elements to generate 'tick' and 'x' icons
                    // var block_switch_span_on_icon = _newElm('span');
                    // var block_switch_span_off_icon = _newElm('span');

                    // block_title_btn.className = isExpandable ? 'b-tl exp' : 'b-tl';
                    // block_switch_label.className = 'b-tg';
                    // block_switch.className = 'c-tgl';
                    // block_switch_span_on_icon.className = 'on-i';
                    // block_switch_span_off_icon.className = 'off-i';
                    // block_switch_span.className = 'c-tg';
                    // label_text_span.className = "t-lb";

                    // if(isExpandable){
                    //     block_title_btn.setAttribute('aria-expanded', 'false');
                    //     block_title_btn.setAttribute('aria-controls', accordion_id);
                    // }

                    // block_switch.type = 'checkbox';
                    // block_switch_span.setAttribute('aria-hidden', 'true');

                    // var cookie_category = toggle_data.value;
                    // block_switch.value = cookie_category;

                    // label_text_span.textContent = title_data;
                    // block_title_btn.insertAdjacentHTML('beforeend', title_data);

                    // block_title_container.appendChild(block_title_btn);
                    // block_switch_span.appendChild(block_switch_span_on_icon);
                    // block_switch_span.appendChild(block_switch_span_off_icon);

                    // /**
                    //  * If consent modal does not exist => retrieve category states from cookie
                    //  * Otherwise use states defined in the u_config. object
                    //  */
                    // if(cc_accepted){
                    //     if(_inArray(saved_cc['level'], cookie_category) > -1){
                    //         block_switch.checked = true;
                    //         !new_settings_blks && toggle_states.push(true);
                    //     }else{
                    //         !new_settings_blks && toggle_states.push(false);
                    //     }
                    // }else if(toggle_data['enabled']){
                    //     block_switch.checked = true;
                    //     !new_settings_blks && toggle_states.push(true);

                    //     /**
                    //      * Keep track of categories enabled by default (useful when mode=='opt-out')
                    //      */
                    //     if(toggle_data['enabled'])
                    //         !new_settings_blks && default_cats.push(cookie_category);

                    // }else{
                    //     !new_settings_blks && toggle_states.push(false);
                    // }

                    // !new_settings_blks && all_cats.push(cookie_category);

                    // /**
                    //  * Set toggle as readonly if true (disable checkbox)
                    //  */
                    // if(toggle_data['readonly']){
                    //     block_switch.disabled = true;
                    //     _addClass(block_switch_span, 'c-ro');
                    //     !new_settings_blks && readonly_cats.push(true);
                    // }else{
                    //     !new_settings_blks && readonly_cats.push(false);
                    // }

                    // _addClass(block_table_container, 'b-acc');
                    // _addClass(block_title_container, 'b-bn');
                    // _addClass(block_section, 'b-ex');

                    // block_table_container.id = accordion_id;
                    // block_table_container.setAttribute('aria-hidden', 'true');

                    // block_switch_label.appendChild(block_switch);
                    // block_switch_label.appendChild(block_switch_span);
                    // block_switch_label.appendChild(label_text_span);
                    // block_title_container.appendChild(block_switch_label);

                    // /**
                    //  * On button click handle the following :=> aria-expanded, aria-hidden and act class for current block
                    //  */
                    // isExpandable && (function(accordion, block_section, btn){
                    //     _addEvent(block_title_btn, 'click', function(){
                    //         if(!_hasClass(block_section, 'act')){
                    //             _addClass(block_section, 'act');
                    //             btn.setAttribute('aria-expanded', 'true');
                    //             accordion.setAttribute('aria-hidden', 'false');
                    //         }else{
                    //             _removeClass(block_section, 'act');
                    //             btn.setAttribute('aria-expanded', 'false');
                    //             accordion.setAttribute('aria-hidden', 'true');
                    //         }
                    //     }, false);
                    // })(block_table_container, block_section, block_title_btn);

                }else{
                    /**
                     * If block is not a button (no toggle defined),
                     * create a simple div instead
                     */
                    if(title_data){
                        var block_title = _newElm('div');
                        block_title.className = 'b-tl';
                        block_title.setAttribute('role', 'heading');
                        block_title.setAttribute('aria-level', '3');
                        block_title.insertAdjacentHTML('beforeend', title_data);
                        block_title_container.appendChild(block_title);
                    }
                }

                title_data && block_section.appendChild(block_title_container);
                desc_data && block_table_container.appendChild(block_desc);

                // // if cookie table found, generate table for this block
                // if(!remove_cookie_tables && typeof cookie_table_data !== 'undefined'){
                //     var tr_tmp_fragment = document.createDocumentFragment();

                //     /**
                //      * Use custom table headers
                //      */
                //     for(var p=0; p<all_table_headers.length; ++p){
                //         // create new header
                //         var th1 = _newElm('th');
                //         var obj = all_table_headers[p];
                //         th1.setAttribute('scope', 'col');

                //         // get custom header content
                //         if(obj){
                //             var new_column_key = obj && _getKeys(obj)[0];
                //             th1.textContent = all_table_headers[p][new_column_key];
                //             tr_tmp_fragment.appendChild(th1);
                //         }
                //     }

                //     var tr_tmp = _newElm('tr');
                //     tr_tmp.appendChild(tr_tmp_fragment);

                //     // create table header & append fragment
                //     var thead = _newElm('thead');
                //     thead.appendChild(tr_tmp);

                //     // append header to table
                //     var block_table = _newElm('table');
                //     block_table.appendChild(thead);

                //     var tbody_fragment = document.createDocumentFragment();

                //     // create table content
                //     for(var n=0; n<cookie_table_data.length; n++){
                //         var tr = _newElm('tr');

                //         for(var g=0; g<all_table_headers.length; ++g){
                //             // get custom header content
                //             obj = all_table_headers[g];
                //             if(obj){
                //                 new_column_key = _getKeys(obj)[0];

                //                 var td_tmp = _newElm('td');

                //                 // Allow html inside table cells
                //                 td_tmp.insertAdjacentHTML('beforeend', cookie_table_data[n][new_column_key]);
                //                 td_tmp.setAttribute('data-column', obj[new_column_key]);

                //                 tr.appendChild(td_tmp);
                //             }
                //         }

                //         tbody_fragment.appendChild(tr);
                //     }

                //     // append tbody_fragment to tbody & append the latter into the table
                //     var tbody = _newElm('tbody');
                //     tbody.appendChild(tbody_fragment);
                //     block_table.appendChild(tbody);

                //     block_table_container.appendChild(block_table);
                // }

                /**
                 * Append only if is either:
                 * - togglable div with title
                 * - a simple div with at least a title or description
                 */
                if(toggle_data && title_data || (!toggle_data && (title_data || desc_data))){
                    block_section.appendChild(block_table_container);

                    if(new_settings_blks)
                        new_settings_blks.appendChild(block_section);
                    else
                        settings_blks.appendChild(block_section);
                }
            }

            // Create settings buttons
            if(!settings_btns){
                settings_btns = _newElm('div');
                settings_btns.id = 's-bns';
            }

            settings_all_btn = u_config.content['modal']['accept_all_btn'];

            if(settings_all_btn){
                settings_all_btn = _newElm('button');
                settings_all_btn.id = 's-all-bn';
                settings_all_btn.className ='c-bn';
                settings_btns.appendChild(settings_all_btn);

                _addEvent(settings_all_btn, 'click', function(){
                    _cookieconsent.hideSettings();
                    _cookieconsent.hide();
                    _cookieconsent.accept('all');
                });

                settings_all_btn.innerHTML = u_config.content['modal']['accept_all_btn'];
            }


            // var reject_all_btn_text = u_config.content['modal']['reject_all_btn'];

            // // Add third [optional] reject all button if provided
            // if(reject_all_btn_text){

            //     if(!settings_reject_all_btn){
            //         settings_reject_all_btn = _newElm('button');
            //         settings_reject_all_btn.id = 's-rall-bn';
            //         settings_reject_all_btn.className = 'c-bn';

            //         _addEvent(settings_reject_all_btn, 'click', function(){
            //             _cookieconsent.hideSettings();
            //             _cookieconsent.hide();
            //             _cookieconsent.accept([]);
            //         });

            //         settings_inner.className = "bns-t";
            //         settings_btns.appendChild(settings_reject_all_btn);
            //     }

            //     settings_reject_all_btn.innerHTML = reject_all_btn_text;
            // }

            // settings_save_btn = u_config.content['modal']['save_settings_btn'];

            // if(settings_save_btn){
            //     settings_save_btn = _newElm('button');
            //     settings_save_btn.id = 's-sv-bn';
            //     settings_save_btn.className ='c-bn';
            //     settings_btns.appendChild(settings_save_btn);

            //     // Add save preferences button onClick event
            //     // Hide both settings modal and consent modal
            //     _addEvent(settings_save_btn, 'click', function(){
            //         _cookieconsent.hideSettings();
            //         _cookieconsent.hide();
            //         _cookieconsent.accept();
            //     });

            //     settings_save_btn.innerHTML = u_config.content['modal']['save_settings_btn'];
            // }



            // if(new_settings_blks) {
            //     // replace entire existing cookie category blocks with the new cookie categories new blocks (in a different language)
            //     settings_inner.replaceChild(new_settings_blks, settings_blks);
            //     settings_blks = new_settings_blks;
            //     return;
            // };

            settings_header.appendChild(settings_title);
            settings_header.appendChild(x_btn_container);
            settings_inner.appendChild(settings_header);
            settings_inner.appendChild(settings_blks);
            settings_inner.appendChild(settings_btns);
            settings_ctnr_inner.appendChild(settings_inner);

            settings.appendChild(settings_ctnr_inner);
            settings_ctnr_valign.appendChild(settings);
            settings_ctnr.appendChild(settings_ctnr_valign);

            modals_ctnr.appendChild(settings_ctnr);
            modals_ctnr.appendChild(overlay);
        }

        /**
         * Generate cookie consent html markup
         */
        var _createCookieConsentHTML = function(){

            // Create main container which holds both consent modal & settings modal
            main_ctnr = _newElm('div');
            main_ctnr.id = 'cc--main';

            // Fix layout flash
            main_ctnr.style.position = "fixed";
            main_ctnr.style.zIndex = "1000000";

            main_ctnr.innerHTML = '<!--[if lt IE 9 ]><div id="cc_div" class="cc_div ie"></div><![endif]--><!--[if (gt IE 8)|!(IE)]><!--><div id="cc_div" class="cc_div"></div><!--<![endif]-->'
            modals_ctnr = main_ctnr.children[0];

            // Get current language
            // var lang = _config.current_lang;

            // Create consent modal
            if (dialog_exists)
                // _createConsentModal(lang);
                _createConsentModal();

            // Always create settings modal
            // _createSettingsModal(lang);
            _createSettingsModal();

            // Finally append everything (main_ctnr holds both modals)
            (root || document.body).appendChild(main_ctnr);
        }

        /**
         * Update/change modals language
         * @param {String} lang new language
         * @param {Boolean} [force] update language fields forcefully
         * @returns {Boolean}
         */
        // _cookieconsent.updateLanguage = function(lang, force){

        //     if(typeof lang !== 'string') return;

        //     /**
        //      * Validate language to avoid errors
        //      */
        //     var new_validated_lang = _getValidatedLanguage(lang, u_config.languages);

        //     /**
        //      * Set language only if it differs from current
        //      */
        //     if(new_validated_lang !== _config.current_lang || force === true){
        //         _config.current_lang = new_validated_lang;

        //         if(dialog_exists){
        //             _createConsentModal(new_validated_lang);
        //             _addDataButtonListeners(dialog_inner);
        //         }

        //         _createSettingsModal(new_validated_lang);

        //         // _log("CookieConsent [LANGUAGE]: curr_lang: '" + new_validated_lang + "'");

        //         return true;
        //     }

        //     return false;
        // }

        /**
         * Delete all cookies which are unused (based on selected preferences)
         *
         * @param {boolean} [clearOnFirstAction]
         */
        // var _autoclearCookies = function(clearOnFirstAction){

        //     // Get number of blocks
        //     var len = all_blocks.length;
        //     var count = -1;

        //     // reset reload state
        //     reload_page = false;

        //     // Retrieve all cookies
        //     var all_cookies_array = _getCookie('', 'all');

        //     // delete cookies on 'www.domain.com' and '.www.domain.com' (can also be without www)
        //     var domains = [_config.c_domain, '.'+_config.c_domain];

        //     // if domain has www, delete cookies also for 'domain.com' and '.domain.com'
        //     if(_config.c_domain.slice(0, 4) === 'www.'){
        //         var non_www_domain = _config.c_domain.substr(4);  // remove first 4 chars (www.)
        //         domains.push(non_www_domain);
        //         domains.push('.' + non_www_domain);
        //     }

        //     // For each block
        //     for(var i=0; i<len; i++){

        //         // Save current block (local scope & less accesses -> ~faster value retrieval)
        //         var curr_block = all_blocks[i];

        //         // If current block has a toggle for opt in/out
        //         if(Object.prototype.hasOwnProperty.call(curr_block, "toggle")){

        //             // if current block has a cookie table, an off toggle,
        //             // and its preferences were just changed => delete cookies
        //             var category_just_disabled = _inArray(changed_settings, curr_block['toggle']['value']) > -1;
        //             if(
        //                 !toggle_states[++count] &&
        //                 Object.prototype.hasOwnProperty.call(curr_block, "cookie_table") &&
        //                 (clearOnFirstAction || category_just_disabled)
        //             ){
        //                 var curr_cookie_table = curr_block['cookie_table'];

        //                 // Get first property name
        //                 var ckey = _getKeys(all_table_headers[0])[0];

        //                 // Get number of cookies defined in cookie_table
        //                 var clen = curr_cookie_table.length;

        //                 // set "reload_page" to true if reload=on_disable
        //                 if(curr_block['toggle']['reload'] === 'on_disable')
        //                     category_just_disabled && (reload_page = true);

        //                 // for each row defined in the cookie table
        //                 for(var j=0; j<clen; j++){

        //                     // Get current row of table (corresponds to all cookie params)
        //                     var curr_row = curr_cookie_table[j], found_cookies = [];
        //                     var curr_c_name = curr_row[ckey];
        //                     var is_regex = curr_row['is_regex'] || false;
        //                     var curr_c_domain = curr_row['domain'] || null;
        //                     var curr_c_path = curr_row['path'] || false;

        //                     // set domain to the specified domain
        //                     curr_c_domain && ( domains = [curr_c_domain, '.'+curr_c_domain]);

        //                     // If regex provided => filter cookie array
        //                     if(is_regex){
        //                         for(var n=0; n<all_cookies_array.length; n++){
        //                             if(all_cookies_array[n].match(curr_c_name)){
        //                                 found_cookies.push(all_cookies_array[n]);
        //                             }
        //                         }
        //                     }else{
        //                         var found_index = _inArray(all_cookies_array, curr_c_name);
        //                         if(found_index > -1) found_cookies.push(all_cookies_array[found_index]);
        //                     }

        //                     // _log("CookieConsent [AUTOCLEAR]: search cookie: '" + curr_c_name + "', found:", found_cookies);

        //                     // If cookie exists -> delete it
        //                     if(found_cookies.length > 0){
        //                         _eraseCookies(found_cookies, curr_c_path, domains);
        //                         curr_block['toggle']['reload'] === 'on_clear' && (reload_page = true);
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }

        /**
         * Set toggles/checkboxes based on accepted categories and save cookie
         * @param {string[]} accepted_cats - Array of categories to accept
         */
        // var _saveCookiePreferences = function(accepted_cats){
        var _saveCookiePreferences = function(){

            // changed_settings = [];

            // // Retrieve all toggle/checkbox values
            // var category_toggles = document.querySelectorAll('.c-tgl') || [];

            // // If there are opt in/out toggles ...
            // if(category_toggles.length > 0){

            //     for(var i=0; i<category_toggles.length; i++){
            //         if(_inArray(accepted_cats, all_cats[i]) !== -1){
            //             category_toggles[i].checked = true;
            //             if(!toggle_states[i]){
            //                 changed_settings.push(all_cats[i]);
            //                 toggle_states[i] = true;
            //             }
            //         }else{
            //             category_toggles[i].checked = false;
            //             if(toggle_states[i]){
            //                 changed_settings.push(all_cats[i]);
            //                 toggle_states[i] = false;
            //             }
            //         }
            //     }
            // }

            /**
             * Clear cookies when settings/preferences change
             */
            // if(cc_accepted && _config.autoclear_cookies && changed_settings.length > 0)
            //     _autoclearCookies();

            saved_cc = {
                "level": "accept all",                        // accepted_cats,
                // "revision": _config.revision,
                "data": "",                            // cc_data,
                "rfc_cookie": _config.use_rfc
            }

            // save cookie with preferences 'level' (only if never accepted or settings were updated)
            // if(!cc_accepted || changed_settings.length > 0 || !valid_revision){
            if(!cc_accepted){
                // valid_revision = true;

                /**
                 * Update accept type
                 */
                accept_type = _getAcceptType(_getCurrentCategoriesState());

                _setCookie(_config.c_name, JSON.stringify(saved_cc));
                // _manageExistingScripts();
            }

            // if(!cc_accepted){

            //     /**
            //      * Delete unused/"zombie" cookies the very-first time
            //      */
            //     if(_config.autoclear_cookies)
            //         _autoclearCookies(true);

            //     // if(typeof onFirstAction === 'function')
            //     //     onFirstAction(_cookieconsent.getUserPreferences(), saved_cc);

            //     if(typeof onAccept === 'function')
            //         onAccept(saved_cc);

            //     cc_accepted = true;

            //     if(_config.mode === 'opt-in') return;
            // }

            // fire onChange only if settings were changed
            // if(typeof onChange === "function" && changed_settings.length > 0)
            //     onChange(saved_cc, changed_settings);

            /**
             * reload page if needed
             */
            // if(reload_page)
            //     window.location.reload();
        }

        /**
         * Function to run after css load
         * @callback cssLoaded
         */

        /**
         * Load style via ajax in background (and then show modal)
         * @param {string} css_path
         * @param {cssLoaded} callback
         */
        var _loadCSS = function(css_path, callback){

            // Enable if given path is string and non empty
            var enable = typeof css_path === 'string' && css_path !== "";

            if(enable && !document.getElementById('cc--style')){

                // Create style tag
                var style = _newElm('style');

                // ad an id so that in SPA apps (react-like) the style doesn't get loaded multiple times when plugin is called
                style.id = 'cc--style';

                var xhr = new XMLHttpRequest();

                xhr.onreadystatechange = function() {
                    if(this.readyState === 4 && this.status === 200){

                        // Necessary for <IE9
                        style.setAttribute('type', 'text/css');

                        if(style.styleSheet){ // if <IE9
                            style.styleSheet.cssText = this.responseText;
                        }else{ // all other browsers
                            style.appendChild(document.createTextNode(this.responseText));
                        }

                        // Append css text content
                        document.getElementsByTagName('head')[0].appendChild(style);
                        // _log("CookieConsent [AUTOLOAD_CSS]: loaded style = '"+ css_path + "'");

                        callback();
                    }
                };

                xhr.open("GET", css_path);
                xhr.send();
            }else{
                callback();
            }
        }

        /**
         * Returns index of found element inside array, otherwise -1
         * @param {Array} arr
         * @param {Object} value
         * @returns {number}
         */
        var _inArray = function(arr, value){
            var len = arr.length;
            for(var i=0; i<len; i++){
                if(arr[i] === value)
                    return i;
            }
            return -1;
        }

        /**
         * Helper function which prints info (console.log())
         * @param {Object} print_msg
         * @param {Object} [optional_param]
         */
        // var _log = function(print_msg, optional_param, error){
        //     ENABLE_LOGS && (!error ? console.log(print_msg, optional_param !== undefined ? optional_param : ' ') : console.error(print_msg, optional_param || ""));
        // }

        /**
         * Helper function which creates an HTMLElement object based on 'type' and returns it.
         * @param {string} type
         * @returns {HTMLElement}
         */
        var _newElm = function(type){
            var el = document.createElement(type);
            if(type === 'button'){
                el.setAttribute('type', type);
            }
            return el;
        }

        /**
         * Resolve which language should be used.
         *
         * @param {Object} languages Object with language translations
         * @param {string} [requested_language] Language specified by given configuration parameters
         * @returns {string}
         */
        // var _resolveCurrentLang = function (languages, requested_language) {

        //     if (_config.auto_language === 'browser') {
        //         return _getValidatedLanguage(_getBrowserLang(), languages);
        //     } else if (_config.auto_language === 'document') {
        //         return _getValidatedLanguage(document.documentElement.lang, languages);
        //     } else {
        //         if (typeof requested_language === 'string') {
        //             return _config.current_lang = _getValidatedLanguage(requested_language, languages);
        //         }
        //     }

        //     _log("CookieConsent [LANG]: setting current_lang = '" + _config.current_lang + "'");
        //     return _config.current_lang; // otherwise return default
        // }

        /**
         * Get current client's browser language
         * @returns {string}
         */
        // var _getBrowserLang = function(){
        //     var browser_lang = navigator.language || navigator.browserLanguage;
        //     browser_lang.length > 2 && (browser_lang = browser_lang[0]+browser_lang[1]);
        //     _log("CookieConsent [LANG]: detected_browser_lang = '"+ browser_lang + "'");
        //     return browser_lang.toLowerCase()
        // }

        /**
         * Trap focus inside modal and focus the first
         * focusable element of current active modal
         */
        var _handleFocusTrap = function(){
            var tabbedOutsideDiv = false;
            var tabbedInsideModal = false;

            // _addEvent(document, 'keydown', function(e){
            //     e = e || window.event;

            //     // If is tab key => ok
            //     if(e.key !== 'Tab') return;

            //     // If there is any modal to focus
            //     if(focusable){
            //         // If reached natural end of the tab sequence => restart
            //         if(e.shiftKey){
            //             if (document.activeElement === focusable[0]) {
            //                 focusable[1].focus();
            //                 e.preventDefault();
            //             }
            //         }else{
            //             if (document.activeElement === focusable[1]) {
            //                 focusable[0].focus();
            //                 e.preventDefault();
            //             }
            //         }

            //         // If have not yet used tab (or shift+tab) and modal is open ...
            //         // Focus the first focusable element
            //         if(!tabbedInsideModal && !clicked_in){
            //             tabbedInsideModal = true;
            //             !tabbedOutsideDiv && e.preventDefault();

            //             if(e.shiftKey){
            //                 if(focusable[3]){
            //                     if(!focusable[2]){
            //                         focusable[0].focus();
            //                     }else{
            //                         focusable[2].focus();
            //                     }
            //                 }else{
            //                     focusable[1].focus();
            //                 }
            //             }else{
            //                 if(focusable[3]){
            //                     focusable[3].focus();
            //                 }else{
            //                     focusable[0].focus();
            //                 }
            //             }
            //         }
            //     }

            //     !tabbedInsideModal && (tabbedOutsideDiv = true);
            // });

            if(document.contains){
                _addEvent(main_ctnr, 'click', function(e){
                    e = e || window.event;
                    /**
                     * If click is on the foreground overlay (and not inside modal),
                     * hide settings modal
                     *
                     * Notice: click on div is not supported in IE
                     */
                    if(modal_visible){
                        if(!settings_inner.contains(e.target)){
                            _cookieconsent.hideSettings(0);
                            clicked_in = false;
                        }else{
                            clicked_in = true;
                        }
                    }else if(dialog_visible){
                        if(dialog.contains(e.target)){
                            clicked_in = true;
                        }
                    }

                }, true);
            }
        }

        /**
         * Manage each modal's layout
         * @param {Object} gui_options
         */
        var _guiManager = function(gui_options, only_dialog){

            // If gui_options is not object => exit
            if(typeof gui_options !== 'object') return;

            var dialog_options = gui_options['dialog'];
            var modal_options = gui_options['modal'];

            /**
             * Helper function which adds layout and
             * position classes to given modal
             *
             * @param {HTMLElement} modal
             * @param {string[]} allowed_layouts
             * @param {string[]} allowed_positions
             * @param {string} layout
             * @param {string[]} position
             */
            function _setLayout(modal, allowed_layouts, allowed_positions, allowed_transitions, layout, position, transition){
                position = (position && position.split(" ")) || [];

                // Check if specified layout is valid
                if(_inArray(allowed_layouts, layout) > -1){

                    // Add layout classes
                    _addClass(modal, layout);

                    // Add position class (if specified)
                    if(!(layout === 'bar' && position[0] === 'middle') && _inArray(allowed_positions, position[0]) > -1){
                        for(var i=0; i<position.length; i++){
                            _addClass(modal, position[i]);
                        }
                    }
                }

                // Add transition class
                (_inArray(allowed_transitions, transition) > -1) && _addClass(modal, transition);
            }

            if(dialog_exists && dialog_options){
                _setLayout(
                    dialog,
                    ['box', 'bar', 'cloud'],
                    ['top', 'middle', 'bottom'],
                    ['zoom', 'slide'],
                    dialog_options['layout'],
                    dialog_options['position'],
                    dialog_options['transition']
                );
            }

            if(!only_dialog && modal_options){
                _setLayout(
                    settings_ctnr,
                    ['bar'],
                    ['left', 'right'],
                    ['zoom', 'slide'],
                    modal_options['layout'],
                    modal_options['position'],
                    modal_options['transition']
                );
            }
        }

        /**
         * Returns true if cookie category is accepted by the user
         * @param {string} cookie_category
         * @returns {boolean}
         */
        // _cookieconsent.allowedCategory = function(cookie_category){

        //     if(cc_accepted || _config.mode === 'opt-in')
        //         var allowed_categories = JSON.parse(_getCookie(_config.c_name, 'one', true) || '{}')['level'] || []
        //     else  // mode is 'opt-out'
        //         var allowed_categories = default_cats;

        //     return _inArray(allowed_categories, cookie_category) > -1;
        // }

        /**
         * "Init" method. Will run once and only if modals do not exist
         */
        _cookieconsent.run = function(u_config){
            if(!document.getElementById('cc_div')){

                // configure all parameters
                _setConfig(u_config);

                // if is bot, don't run plugin
                // if(is_bot) return;

                // Retrieve cookie value (if set)
                saved_cc = JSON.parse(_getCookie(_config.c_name, 'one', true) || "{}");
                cc_accepted = saved_cc['level'] !== undefined;

                /**
                 * Immediately retrieve the 'data' field from cookie
                 * (since this value is allowed to be accessed/used before the .run method)
                 */
                cc_data = saved_cc['data'] !== undefined ? saved_cc['data'] : null;

                // Compare current revision with the one retrieved from cookie
                // valid_revision = typeof u_config['revision'] === "number"
                //     ? cc_accepted
                //         ? u_config['revision'] > -1
                //             ? saved_cc['revision'] === _config.revision
                //             : true
                //         : true
                //     : true;

                // If invalid revision or cookie is empty => create consent modal
                // dialog_exists = (!cc_accepted || !valid_revision);
                dialog_exists = !cc_accepted;

                // Generate cookie-settings dom (& consent modal)
                _createCookieConsentHTML();

                _loadCSS(_config.theme_css, function(){
                    // _getModalFocusableData();
                    _guiManager(u_config['gui_options']);
                    _addDataButtonListeners();

                    // if(_config.autorun && dialog_exists){
                    if(dialog_exists){
                        // _cookieconsent.show(u_config['delay'] || 0);
                        _cookieconsent.show(0);
                    }

                    // Add class to enable animations/transitions
                    setTimeout(function(){_addClass(main_ctnr, 'c--anim');}, 30);

                    // Add class to set theme (light/dark)
                    // setTimeout(function(){_addClass(main_ctnr, u_config['theme_class']);}, 30);

                    // Accessibility :=> if tab pressed => trap focus inside modal
                    setTimeout(function(){_handleFocusTrap();}, 100);
                });

                // if(cc_accepted && valid_revision){
                if(cc_accepted){
                    var rfc_prop_exists = typeof saved_cc['rfc_cookie'] === "boolean";

                    /*
                     * Convert cookie to rfc format (if `use_rfc` is enabled)
                     */
                    if(!rfc_prop_exists || (rfc_prop_exists && saved_cc['rfc_cookie'] !== _config.use_rfc)){
                        saved_cc['rfc_cookie'] = _config.use_rfc;
                        _setCookie(_config.c_name, JSON.stringify(saved_cc));
                    }

                    /**
                     * Update accept type
                     */
                    accept_type = _getAcceptType(_getCurrentCategoriesState());

                    // _manageExistingScripts();

                    // if(typeof onAccept === 'function')
                    //     onAccept(saved_cc);


                }
                // else if(_config.mode === 'opt-out'){
                //     _log("CookieConsent [CONFIG] mode='" + _config.mode + "', default enabled categories:", default_cats);
                //     _manageExistingScripts(default_cats);
                // }
            }else{
                // _log("CookieConsent [NOTICE]: cookie consent already attached to body!");
            }
        }

        /**
         * Show settings modal (with optional delay)
         * @param {number} delay
         */
        _cookieconsent.showSettings = function(delay){
            setTimeout(function() {
                _addClass(html_dom, "show--settings");
                settings_ctnr.setAttribute('aria-hidden', 'false');
                modal_visible = true;

                /**
                 * Set focus to the first focusable element inside settings modal
                 */
                setTimeout(function(){
                    // If there is no consent-modal, keep track of the last focused elem.
                    if(!dialog_visible){
                        last_elem_before_modal = document.activeElement;
                    }else{
                        last_dialog_btn_focus = document.activeElement;
                    }

                    if (modal_focusable.length === 0) return;

                    if(modal_focusable[3]){
                        modal_focusable[3].focus();
                    }else{
                        modal_focusable[0].focus();
                    }
                    focusable = modal_focusable;
                }, 200);

                // _log("CookieConsent [SETTINGS]: show modal");
            }, delay > 0 ? delay : 0);
        }

        /**
         * This function handles the loading/activation logic of the already
         * existing scripts based on the current accepted cookie categories
         *
         * @param {string[]} [must_enable_categories]
         */
        // var _manageExistingScripts = function(must_enable_categories){

        //     if(!_config.page_scripts) return;

        //     // get all the scripts with "cookie-category" attribute
        //     var scripts = document.querySelectorAll('script[' + _config.script_selector + ']');
        //     var sequential_enabled = _config.page_scripts_order;
        //     var accepted_cats = must_enable_categories || saved_cc['level'] || [];
        //     _log("CookieConsent [SCRIPT_MANAGER]: sequential loading:", sequential_enabled);

        //     /**
        //      * Load scripts (sequentially), using a recursive function
        //      * which loops through the scripts array
        //      * @param {Element[]} scripts scripts to load
        //      * @param {number} index current script to load
        //      */
        //     var _loadScripts = function(scripts, index){
        //         if(index < scripts.length){

        //             var curr_script = scripts[index];
        //             var curr_script_category = curr_script.getAttribute(_config.script_selector);

        //             /**
        //              * If current script's category is on the array of categories
        //              * accepted by the user => load script
        //              */
        //             if(_inArray(accepted_cats, curr_script_category) > -1){

        //                 curr_script.type = 'text/javascript';
        //                 curr_script.removeAttribute(_config.script_selector);

        //                 // get current script data-src
        //                 var src = curr_script.getAttribute('data-src');

        //                 // some scripts (like ga) might throw warning if data-src is present
        //                 src && curr_script.removeAttribute('data-src');

        //                 // create fresh script (with the same code)
        //                 var fresh_script = _newElm('script');
        //                 fresh_script.textContent = curr_script.innerHTML;

        //                 // Copy attributes over to the new "revived" script
        //                 (function(destination, source){
        //                     var attributes = source.attributes;
        //                     var len = attributes.length;
        //                     for(var i=0; i<len; i++){
        //                         var attr_name = attributes[i].nodeName;
        //                         destination.setAttribute(attr_name , source[attr_name] || source.getAttribute(attr_name));
        //                     }
        //                 })(fresh_script, curr_script);

        //                 // set src (if data-src found)
        //                 src ? (fresh_script.src = src) : (src = curr_script.src);

        //                 // if script has "src" attribute
        //                 // try loading it sequentially
        //                 if(src){
        //                     if(sequential_enabled){
        //                         // load script sequentially => the next script will not be loaded
        //                         // until the current's script onload event triggers
        //                         if(fresh_script.readyState) {  // only required for IE <9
        //                             fresh_script.onreadystatechange = function() {
        //                                 if (fresh_script.readyState === "loaded" || fresh_script.readyState === "complete" ) {
        //                                     fresh_script.onreadystatechange = null;
        //                                     _loadScripts(scripts, ++index);
        //                                 }
        //                             };
        //                         }else{  // others
        //                             fresh_script.onload = function(){
        //                                 fresh_script.onload = null;
        //                                 _loadScripts(scripts, ++index);
        //                             };
        //                         }
        //                     }else{
        //                         // if sequential option is disabled
        //                         // treat current script as inline (without onload event)
        //                         src = false;
        //                     }
        //                 }

        //                 // Replace current "sleeping" script with the new "revived" one
        //                 curr_script.parentNode.replaceChild(fresh_script, curr_script);

        //                 /**
        //                  * If we managed to get here and scr is still set, it means that
        //                  * the script is loading/loaded sequentially so don't go any further
        //                  */
        //                 if(src) return;
        //             }

        //             // Go to next script right away
        //             _loadScripts(scripts, ++index);
        //         }
        //     }

        //     _loadScripts(scripts, 0);
        // }

        /**
         * Save custom data inside cookie
         * @param {object|string} new_data
         * @param {string} [mode]
         * @returns {boolean}
         */
        var _setCookieData = function(new_data, mode){

            // var set = false;
            /**
             * If mode is 'update':
             * add/update only the specified props.
             */
            // if(mode === 'update'){
            //     cc_data = _cookieconsent.get('data');
            //     var same_type = typeof cc_data === typeof new_data;

            //     if(same_type && typeof cc_data === "object"){
            //         !cc_data && (cc_data = {});

            //         for(var prop in new_data){
            //             if(cc_data[prop] !== new_data[prop]){
            //                 cc_data[prop] = new_data[prop]
            //                 set = true;
            //             }
            //         }
            //     }else if((same_type || !cc_data) && cc_data !== new_data){
            //         cc_data = new_data;
            //         set = true;
            //     }
            // }else{
                cc_data = new_data;
                set = true;
            // }

            if(set){
                saved_cc['data'] = cc_data;
                _setCookie(_config.c_name, JSON.stringify(saved_cc));
            }

            return set;
        }

        /**
         * Forcefully set a specific revision and show consent modal
         * @param {number} new_revision
         * @param {boolean} [prompt_consent]
         * @returns {boolean}
         */
        // var _setRevision = function(new_revision, prompt_consent, message){

        //     // If plugin has been initialized and new revision is valid
        //     if(
        //         main_ctnr
        //         && typeof new_revision === "number"
        //         && saved_cc['revision'] !== new_revision
        //     ){

        //         revision_enabled = true;
        //         revision_message = message;
        //         valid_revision = false;
        //         _config.revision = new_revision;

        //         // Show consent modal ?
        //         if(prompt_consent === true){
        //             _createConsentModal(u_config);
        //             _guiManager(u_config['gui_options'], true);
        //             _getModalFocusableData();
        //             _cookieconsent.show();
        //         }else {
        //             // If revision was modified, save cookie with the new revision
        //             _cookieconsent.accept();
        //         }

        //         return true;
        //     }

        //     return false;
        // }

        /**
         * Helper method to set a variety of fields
         * @param {string} field
         * @param {object} data
         * @returns {boolean}
         */
        // _cookieconsent.set = function(field, data){
        //     switch(field){
        //         case 'data': return _setCookieData(data['value'], data['mode']);
        //         case 'revision': return _setRevision(data['value'], data['prompt_consent'], data['message']);   //[WARNING] Will be removed in v3
        //         default: return false;
        //     }
        // }

        /**
         * Retrieve data from existing cookie
         * @param {string} field
         * @param {string} [c_name]
         * @returns {any}
         */
        _cookieconsent.get = function(field, c_name){
            var cookie = JSON.parse(_getCookie(c_name || _config.c_name, 'one', true) || "{}");

            return cookie[field];
        }

        /**
         * Read current configuration value
         * @returns {any}
         */
        _cookieconsent.getConfig = function(field){
            return _config[field] || u_config[field];
        }

        /**
         * Obtain accepted and rejected categories
         * @returns {{accepted: string[], rejected: string[]}}
         */
        var _getCurrentCategoriesState = function(){

            // // get accepted categories
            // accepted_cats = saved_cc['level'] || [];

            // // calculate rejected categories (all_cats - accepted_cats)
            // rejected_cats = all_cats.filter(function(category){
            //     return (_inArray(accepted_cats, category) === -1);
            // });

            // return {
            //     accepted: accepted_cats,
            //     rejected: rejected_cats
            // }

            return {
                accepted: 'all',
                rejected: 'none'
            }
        }

        /**
         * Calculate "accept type" given current categories state
         * @param {{accepted: string[], rejected: string[]}} currentCategoriesState
         * @returns {string}
         */
        var _getAcceptType = function(currentCategoriesState){

            // var type = 'custom';

            // // number of categories marked as necessary/readonly
            // var necessary_categories_length = readonly_cats.filter(function(readonly){
            //     return readonly === true;
            // }).length;

            // // calculate accept type based on accepted/rejected categories
            // if(currentCategoriesState.accepted.length === all_cats.length)
            //     type = 'all';
            // else if(currentCategoriesState.accepted.length === necessary_categories_length)
            //     type = 'necessary'

            return 'all'; // type;
        }

        /**
         * @typedef {object} userPreferences
         * @property {string} accept_type
         * @property {string[]} accepted_cats
         * @property {string[]} rejected_cats
         */

        /**
         * Retrieve current user preferences (summary)
         * @returns {userPreferences}
         */
        // _cookieconsent.getUserPreferences = function(){
        //     var currentCategoriesState = _getCurrentCategoriesState();
        //     var accept_type = _getAcceptType(currentCategoriesState);

        //     return {
        //         'accept_type': accept_type,
        //         'accepted_cats': currentCategoriesState.accepted,
        //         'rejected_cats': currentCategoriesState.rejected
        //     }
        // }

        /**
         * Function which will run after script load
         * @callback scriptLoaded
         */

        /**
         * Dynamically load script (append to head)
         * @param {string} src
         * @param {scriptLoaded} callback
         * @param {string[]} attrs
         */
        // _cookieconsent.loadScript = function(src, callback, attrs){

        //     var function_defined = typeof callback === 'function';

        //     // Load script only if not already loaded
        //     if(!document.querySelector('script[src="' + src + '"]')){

        //         var script = _newElm('script');

        //         // if an array is provided => add custom attributes
        //         if(attrs && attrs.length > 0){
        //             for(var i=0; i<attrs.length; ++i){
        //                 attrs[i] && script.setAttribute(attrs[i]['name'], attrs[i]['value']);
        //             }
        //         }

        //         // if callback function defined => run callback onload
        //         if(function_defined){
        //             if(script.readyState) {  // only required for IE <9
        //                 script.onreadystatechange = function() {
        //                     if ( script.readyState === "loaded" || script.readyState === "complete" ) {
        //                         script.onreadystatechange = null;
        //                         callback();
        //                     }
        //                 };
        //             }else{  //Others
        //                 script.onload = callback;
        //             }
        //         }

        //         script.src = src;

        //         /**
        //          * Append script to head
        //          */
        //         (document.head ? document.head : document.getElementsByTagName('head')[0]).appendChild(script);
        //     }else{
        //         function_defined && callback();
        //     }
        // }

        /**
         * Manage dynamically loaded scripts: https://github.com/orestbida/cookieconsent/issues/101
         * If plugin has already run, call this method to enable
         * the newly added scripts based on currently selected preferences
         */
        // _cookieconsent.updateScripts = function(){
        //     _manageExistingScripts();
        // }

        /**
         * Show cookie consent modal (with delay parameter)
         * @param {number} [delay]
         * @param {boolean} [create_modal] create modal if it doesn't exist
         */
        _cookieconsent.show = function(delay, create_modal){

            if(create_modal === true)
                // _createConsentModal(_config.current_lang);
                _createConsentModal();

            if(dialog_exists){
                setTimeout(function() {
                    _addClass(html_dom, "show--consent");

                    /**
                     * Update attributes/internal statuses
                     */
                    dialog.setAttribute('aria-hidden', 'false');
                    dialog_visible = true;

                    setTimeout(function(){
                        last_elem_before_modal = document.activeElement;
                        focusable = dialog_focusable;
                    }, 200);

                    // _log("CookieConsent [MODAL]: show dialog");
                }, delay > 0 ? delay : (create_modal ? 30 : 0));
            }
        }

        /**
         * Hide consent modal
         */
        _cookieconsent.hide = function(){
            if(dialog_exists){
                _removeClass(html_dom, "show--consent");
                dialog.setAttribute('aria-hidden', 'true');
                dialog_visible = false;

                setTimeout(function(){
                    //restore focus to the last page element which had focus before modal opening
                    last_elem_before_modal.focus();
                    focusable = null;
                }, 200);

                // _log("CookieConsent [MODAL]: hide");
            }
        }

        /**
         * Hide settings modal
         */
        _cookieconsent.hideSettings = function(){
            _removeClass(html_dom, "show--settings");
            modal_visible = false;
            settings_ctnr.setAttribute('aria-hidden', 'true');


            setTimeout(function(){
                /**
                 * If consent modal is visible, focus him (instead of page document)
                 */
                if(dialog_visible){
                    last_dialog_btn_focus && last_dialog_btn_focus.focus();
                    focusable = dialog_focusable;
                }else{
                    /**
                     * Restore focus to last page element which had focus before modal opening
                     */
                    last_elem_before_modal && last_elem_before_modal.focus();
                    focusable = null;
                }

                clicked_in = false;
            }, 200);

            // _log("CookieConsent [SETTINGS]: hide modal");
        }

        /**
         * Accept cookieconsent function API
         * @param {string[]|string} _categories - Categories to accept
         * @param {string[]} [_exclusions] - Excluded categories [optional]
         */
        _cookieconsent.accept = function(_categories, _exclusions){
            // var categories = _categories || undefined;
            // var exclusions = _exclusions || [];
            // var to_accept = [];

            // /**
            //  * Get all accepted categories
            //  * @returns {string[]}
            //  */
            // var _getCurrentPreferences = function(){
            //     var toggles = document.querySelectorAll('.c-tgl') || [];
            //     var states = [];

            //     for(var i=0; i<toggles.length; i++){
            //         if(toggles[i].checked){
            //             states.push(toggles[i].value);
            //         }
            //     }
            //     return states;
            // }

            // if(!categories){
            //     to_accept = _getCurrentPreferences();
            // }else{
            //     if(
            //         typeof categories === "object" &&
            //         typeof categories.length === "number"
            //     ){
            //         for(var i=0; i<categories.length; i++){
            //             if(_inArray(all_cats, categories[i]) !== -1)
            //                 to_accept.push(categories[i]);
            //         }
            //     }else if(typeof categories === "string"){
            //         if(categories === 'all')
            //             to_accept = all_cats.slice();
            //         else{
            //             if(_inArray(all_cats, categories) !== -1)
            //                 to_accept.push(categories);
            //         }
            //     }
            // }

            // // Remove excluded categories
            // if(exclusions.length >= 1){
            //     for(i=0; i<exclusions.length; i++){
            //         to_accept = to_accept.filter(function(item) {
            //             return item !== exclusions[i]
            //         })
            //     }
            // }

            // // Add back all the categories set as "readonly/required"
            // for(i=0; i<all_cats.length; i++){
            //     if(
            //         readonly_cats[i] === true &&
            //         _inArray(to_accept, all_cats[i]) === -1
            //     ){
            //         to_accept.push(all_cats[i]);
            //     }
            // }

            // _saveCookiePreferences(to_accept);
            _saveCookiePreferences();
        }

        /**
         * API function to easily erase cookies
         * @param {(string|string[])} _cookies
         * @param {string} [_path] - optional
         * @param {string} [_domain] - optional
         */
        // _cookieconsent.eraseCookies = function(_cookies, _path, _domain){
        //     var cookies = [];
        //     var domains = _domain
        //         ? [_domain, "."+_domain]
        //         : [_config.c_domain, "."+_config.c_domain];

        //     if(typeof _cookies === "object" && _cookies.length > 0){
        //         for(var i=0; i<_cookies.length; i++){
        //             this.validCookie(_cookies[i]) && cookies.push(_cookies[i]);
        //         }
        //     }else{
        //         this.validCookie(_cookies) && cookies.push(_cookies);
        //     }

        //     _eraseCookies(cookies, _path, domains);
        // }

        /**
         * Set cookie, by specifying name and value
         * @param {string} name
         * @param {string} value
         */
        var _setCookie = function(name, value) {

            var c_exp = _config.c_exp;

            // if(typeof _config.cookie_necessary_only_exp === 'number' && accept_type === 'necessary')
            //     c_exp = _config.cookie_necessary_only_exp;

            value = _config.use_rfc ? encodeURIComponent(value) : value;

            var date = new Date();
            date.setTime(date.getTime() + (1000 * (c_exp * 24 * 60 * 60)));
            var expires = "; expires=" + date.toUTCString();

            var cookieStr = name + "=" + (value || "") + expires + "; Path=" + _config.c_path + ";";
            cookieStr += " SameSite=" + _config.c_samesite + ";";

            // assures cookie works with localhost (=> don't specify domain if on localhost)
            if(window.location.hostname.indexOf(".") > -1){
                cookieStr += " Domain=" + _config.c_domain + ";";
            }

            if(window.location.protocol === "https:") {
                cookieStr += " Secure;";
            }

            document.cookie = cookieStr;

            // _log("CookieConsent [SET_COOKIE]: cookie "+ name + "='" + value + "' was set! Expires after " + c_exp + " days");
        }

        /**
         * Get cookie value by name,
         * returns the cookie value if found (or an array
         * of cookies if filter provided), otherwise empty string: ""
         * @param {string} name
         * @param {string} filter - 'one' or 'all'
         * @param {boolean} get_value - set to true to obtain its value
         * @returns {string|string[]}
         */
        var _getCookie = function(name, filter, get_value) {
            var found;

            if(filter === 'one'){
                found = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
                found = found ? (get_value ? found.pop() : name) : "";

                if(found && name === _config.c_name){
                    try{
                        found = JSON.parse(found)
                    }catch(e){
                        try {
                            found = JSON.parse(decodeURIComponent(found))
                        } catch (e) {
                            // if I got here => cookie value is not a valid json string
                            found = {};
                        }
                    }
                    found = JSON.stringify(found);
                }
            }else if(filter === 'all'){
                // array of names of all existing cookies
                var cookies = document.cookie.split(/;\s*/); found = [];
                for(var i=0; i<cookies.length; i++){
                    found.push(cookies[i].split("=")[0]);
                }
            }

            return found;
        }

        /**
         * Delete cookie by name & path
         * @param {string[]} cookies
         * @param {string} [custom_path] - optional
         * @param {string[]} domains - example: ['domain.com', '.domain.com']
         */
        // var _eraseCookies = function(cookies, custom_path, domains) {
        //     var path = custom_path ? custom_path : '/';
        //     var expires = 'Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

        //     for(var i=0; i<cookies.length; i++){
        //         for(var j=0; j<domains.length; j++){
        //             document.cookie = cookies[i] + '=; path=' + path +
        //             (domains[j].indexOf('.') > -1 ? '; domain=' + domains[j] : "") + '; ' + expires;
        //         }
        //         // _log("CookieConsent [AUTOCLEAR]: deleting cookie: '" + cookies[i] + "' path: '" + path + "' domain:", domains);
        //     }
        // }

        /**
         * Returns true if cookie was found and has valid value (not empty string)
         * @param {string} c_name
         * @returns {boolean}
         */
        _cookieconsent.validCookie = function(c_name){
            return _getCookie(c_name, 'one', true) !== "";
        }

        /**
         * Function to run when event is fired
         * @callback eventFired
         */

        /**
         * Add event listener to dom object (cross browser function)
         * @param {Element} elem
         * @param {string} event
         * @param {eventFired} fn
         * @param {boolean} passive
         */
        var _addEvent = function(elem, event, fn, _passive) {
            var passive = _passive === true;

            if (elem.addEventListener) {
                passive ? elem.addEventListener(event, fn , { passive: true }) : elem.addEventListener(event, fn, false);
            } else {
                /**
                 * For old browser, add 'on' before event:
                 * 'click':=> 'onclick'
                 */
                elem.attachEvent("on" + event, fn);
            }
        }

        /**
         * Get all prop. keys defined inside object
         * @param {Object} obj
         */
        var _getKeys = function(obj){
            if(typeof obj === "object"){
                var keys = [], i = 0;
                for (var key in obj)
                    keys[i++] = key;
                return keys;
            }
        }

        /**
         * Append class to the specified dom element
         * @param {HTMLElement} elem
         * @param {string} classname
         */
        var _addClass = function (elem, classname){
            if(elem.classList)
                elem.classList.add(classname)
            else{
                if(!_hasClass(elem, classname))
                    elem.className += ' '+classname;
            }
        }

        /**
         * Remove specified class from dom element
         * @param {HTMLElement} elem
         * @param {string} classname
         */
        var _removeClass = function (el, className) {
            el.classList ? el.classList.remove(className) : el.className = el.className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), ' ');
        }

        /**
         * Check if html element has class
         * @param {HTMLElement} el
         * @param {string} className
         */
        var _hasClass = function(el, className) {
            if (el.classList) {
                return el.classList.contains(className);
            }
            return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
        }

        return _cookieconsent;
    };

    var init = 'initCookieConsent';
    /**
     * Make CookieConsent object accessible globally
     */
    if(typeof window[init] !== 'function'){
        window[init] = CookieConsent
    }
})();



// Init cookieconsent plugin
var cc = initCookieConsent();

// NF logo
var logo = '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="314.16" style="max-width:100%;width:112px;height:auto;margin-top:26px;vertical-align:bottom;" viewBox="0 0 700 314.16"><path d="M516.5,315A111.38,111.38,0,0,0,458.78,221c-94.15-52-218-52.64-315.61-1.3-36.95,19.44-58.5,53.72-59.71,95.35Z" transform="translate(0 -0.84)" fill="#fff"></path><path d="M85.44,315c1.19-41.25,22.55-75,59.16-94.25,96.69-50.87,219.44-50.68,312.74.83A110.75,110.75,0,0,1,514.53,315h85.28c.09,0,.15-5.67.15-8.76A297.88,297.88,0,0,0,571.83,179.6a152.76,152.76,0,0,0-11.1-22.26c35.87-12.06,71-18.81,97-24.11,31.68-6.45,49.84-10.62,39.21-19.32C673.84,95,644.43,74.52,644.43,74.52s118.18-97.67,0-68.1a230.64,230.64,0,0,0-59,23.74c-33,18.88-56.92,43.29-73.28,64.58A299,299,0,0,0,300,6.72C134.31,6.72,0,140.57,0,306.24c0,3.09.06,8.76.15,8.76Z" transform="translate(0 -0.84)" fill="#414242"></path><path d="M216.79,315c-.35-23.49-13.69-42.39-30.14-42.39s-29.79,18.9-30.13,42.39Z" transform="translate(0 -0.84)" fill="#414242"></path><path d="M443.58,315c-.34-23.49-13.69-42.39-30.14-42.39s-29.78,18.9-30.13,42.39Z" transform="translate(0 -0.84)" fill="#414242"></path></svg>';
var cookie = '🍪 ';

// run plugin with config object
cc.run({
    gui_options: {
        dialog: {
            layout: 'cloud',                       // box,cloud,bar
            position: 'bottom left',               // bottom,middle,top + left,right,center
            transition: 'slide'                    // zoom,slide
        },
        modal: {
            layout: 'box',                         // box,bar
            // position: 'left',                   // right,left (available only if bar layout selected)
            transition: 'slide'                    // zoom,slide
        }
    },

    // onFirstAction: function(){
    //     console.log('onFirstAction fired');
    // },

    // onAccept: function (cookie) {
    //     console.log('onAccept fired ...');
    // },

    // onChange: function (cookie, changed_preferences) {
    //     console.log('onChange fired ...');
    // },

    content: {
        // 'en': {
            dialog: {
                title: cookie + 'Mmmm cookies! ',
                desc: 'This website uses cookies. By continuing you agree to the terms described in our cookie policy. <button type="button" data-cc="c-settings" class="cc-link">Learn more</button>',
                primary_btn: {
                    text: 'Okay', // 'Accept all',
                    role: 'accept_all'              // 'accept_selected' or 'accept_all'
                },
                // secondary_btn: {
                //     text: 'Reject all',
                //     role: 'accept_necessary'        // 'settings' or 'accept_necessary'
                // }
            },
            modal: {
                title: logo,
                save_settings_btn: false, // 'Save settings',
                accept_all_btn: 'Okay', // 'Accept all',
                reject_all_btn: false, // 'Reject all',
                close_btn_label: 'Close',
                // cookie_table_headers: [
                //     {col1: 'Name'},
                //     {col2: 'Domain'},
                //     {col3: 'Expiration'},
                //     {col4: 'Description'}
                // ],
                blocks: [
                    {
                        title: 'How we use cookies',
                        desc: 'This site makes use of cookies so we can improve your experience, analyze traffic and for general advertising purposes. No personal information about you is shared or stored. You can view our cookie policy anytime to learn more and change your settings.<br /><br />For more details about how we use cookies you can read our full <a href="/cookie-policy/" class="cc-link">cookie policy</a>.'
                    },
                    // {
                    //     title: 'Strictly necessary cookies',
                    //     desc: 'These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly',
                    //     toggle: {
                    //         value: 'necessary',
                    //         enabled: true,
                    //         readonly: true          // cookie categories with readonly=true are all treated as "necessary cookies"
                    //     }
                    // },
                    // {
                    //     title: 'Performance and Analytics cookies',
                    //     desc: 'These cookies allow the website to remember the choices you have made in the past',
                    //     toggle: {
                    //         value: 'analytics',     // there are no default categories => you specify them
                    //         enabled: false,
                    //         readonly: false
                    //     },
                    //     cookie_table: [
                    //         {
                    //             col1: '^_ga',
                    //             col2: 'google.com',
                    //             col3: '2 years',
                    //             col4: 'description ...',
                    //             is_regex: true
                    //         },
                    //         {
                    //             col1: '_gid',
                    //             col2: 'google.com',
                    //             col3: '1 day',
                    //             col4: 'description ...',
                    //         }
                    //     ]
                    // },
                    // {
                    //     title: 'Advertisement and Targeting cookies',
                    //     desc: 'These cookies collect information about how you use the website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you',
                    //     toggle: {
                    //         value: 'targeting',
                    //         enabled: false,
                    //         readonly: false
                    //     }
                    // },
                    {
                        title: 'More information 💼',
                        desc: 'For even more details you can also read our <a class="cc-link" href="/privacy-policy/">privacy policy</a>.',
                    }
                ]
            }
        // }
    }

});
