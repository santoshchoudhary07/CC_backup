//to be included AFTER jquery (note: require.js would be good here!)
(function () {

    //************************************************************************************
    //************************************************************************************
    // To extend the capabilities of IE...
    // yes, i know this is WRONG (to mess with DOM objects)
    // but we only have to deal with IE for a limited time...
    //
    // "Bless me Father, for I have Sinned!
    //
    //************************************************************************************
    $(document).ready(function () {
        if (!NodeList.prototype.forEach) {
            NodeList.prototype.forEach = Array.prototype.forEach;
        }
    })
    //******************************************
    //******************************************




    //auto run when page loads
    $(document).ready(function () {

        //set the document body's classes to identify browser info
        //usefull for css overrides
        var browserInfo = getBrowserInfo();
        $(document.body)
            .addClass("browser-" + browserInfo.type)
            .addClass("browser-os-" + browserInfo.os)
        if (browserInfo.mobile) {
            $(document.body).addClass("mobile")
        }
    });


    //=================================
    //private functions
    //=================================

    function getBrowserInfo() {
        var agentInfo = navigator.userAgent.toLowerCase();
        console.log(agentInfo);
        return {
            type: parseBrowserType(agentInfo),
            os: parseBrowserOS(agentInfo),
            mobile: parseBrowserIsMobile(agentInfo)
        }
    }

    function parseBrowserType(data) {
        //need to do this in order (some browser claim "others" as well)
        if (data.indexOf('msie') >= 0) return 'ie';
        //check for IE11
        if (data.indexOf('trident/7.0') >= 0) return 'ie11';
        //check for firefox
        if (data.indexOf('firefox') >= 0) return 'firefox';
        //check for ms Edge
        if (data.indexOf('edge') >= 0) return 'edge';
        //check for ms chrome
        if (data.indexOf('chrome') >= 0) return 'chrome';
        //check for ms safari
        if (data.indexOf('safari') >= 0) return 'safari';
        //anything else is shit
        return 'unknown';
    }
    function parseBrowserOS(data) {
        //windows
        if (data.indexOf('windows') >= 0) return 'win'
        //android
        if (data.indexOf('android') >= 0) return 'android'
        //mac
        if (data.indexOf('macintosh') >= 0) return 'mac'
        //ios
        if (data.indexOf('ipad') >= 0 || data.indexOf('iphone') >= 0) return 'ios'
        //chromebook (why not?)
        if (data.indexOf('cros') >= 0) return 'cros'
        //anything else
        return 'unknown';
    }
    function parseBrowserIsMobile(data) {
        return (data.indexOf('mobile') >= 0 || data.indexOf('android')>=0);
    }


})();