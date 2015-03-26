// For an introduction to the Grid template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=232446
(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    // Variable to hold the splash screen object.
    var splash = null;
    // Variable to track splash screen dismissal status.
    var dismissed = false;
    // Object to store splash screen image coordinates. It will be initialized during activation.
    var coordinates = { x: 0, y: 0, width: 0, height: 0 };

    WinJS.strictProcessing();

    // Test internet connection.
    isInternetConnect();
    window.setInterval(isInternetConnect_commen, 2000);
    window.setTimeout(hideTitleProcess, 15000);


    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            // Retrieve splash screen object.
            splash = args.detail.splashScreen;
            // Retrieve the window coordinates of the splash screen image.
            SplashScreen.coordinates = splash.imageLocation;
            // Register an event handler to be executed when the splash screen has been dismissed.
            splash.addEventListener("dismissed", onSplashScreenDismissed, false);
            // Create and display the extended splash screen using the splash screen object.
            ExtendedSplash.show(splash);
            // Listen for window resize events to reposition the extended splash screen image accordingly.
            // This is important to ensure that the extended splash screen is formatted properly in 
            // response to snapping, unsnapping, rotation, etc...
            window.addEventListener("resize", onResize, false);

            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }
        // add search contracts
        else if (detail.kind === Windows.ApplicationModel.Activation.ActivationKind.search) {
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    function onSplashScreenDismissed() {
        // Include code to be executed when the system has transitioned from the splash screen to 
        // the extended splash screen (application's first view).
        SplashScreen.dismissed = true;
        // Tear down the app's extended splash screen after completing setup operations here.
        setTimeout(function () {
            ExtendedSplash.remove();
        }, 5000);
    }

    function onResize() {
        // Safely update the extended splash screen image coordinates. This function will be fired in
        // response to snapping, unsnapping, rotation, etc...
        if (splash) {
            // Update the coordinates of the splash screen image.
            SplashScreen.coordinates = splash.imageLocation;
            ExtendedSplash.updateImageLocation(splash);
        }
    }
    // When you create a type or other element inside a namespace, you reference it from outside the 
    // namespace by using its qualified name: Namespace.Type
    WinJS.Namespace.define("SplashScreen", {
        dismissed: dismissed,
        coordinates: coordinates
    });

    // Populate settings pane and tie commands to settings flyouts.
    WinJS.Application.onsettings = function (e) {
        e.detail.applicationcommands = {
            "Privacy_SettingsFlyout": { title: "隐私策略", href: "/pages/settingsAccountUI/privacy.html" },
            "UserAgreement_SettingsFlyout": { title: "使用协议", href: "/pages/settingsAccountUI/userAgreement.html" }
        };
        WinJS.UI.SettingsFlyout.populateSettings(e);
    };

    function isInternetConnect() {
        WinJS.xhr({ url: "http://www.baidu.com" }).done(function complete(result) {
            // Report download.
            if (result.status === 200) {
                var InternetConnectionImage = document.getElementById("InternetConnectionImage");
                InternetConnectionImage.style.visibility = "hidden";
            }
        }, function error(error) {
            // Create the message dialog and set its content
            var msg = new Windows.UI.Popups.MessageDialog("  Warning:   No internet connection has been found ！");
            // Add commands and set their command handlers
            msg.commands.append(new Windows.UI.Popups.UICommand("Try again", commandInvokedHandler));
            msg.commands.append(new Windows.UI.Popups.UICommand("Close", commandInvokedHandler));
            // Set the command that will be invoked by default
            msg.defaultCommandIndex = 1;
            // Set the command to be invoked when escape is pressed
            msg.cancelCommandIndex = 0;
            // Show the message dialog
            msg.showAsync();

            var InternetConnectionImage = document.getElementById("InternetConnectionImage");
            InternetConnectionImage.style.visibility = "visible";
        });
    };
    function commandInvokedHandler(command) {
        // Display message
        if (command.label == "Try again") {
            setTimeout(function () {
                isInternetConnect();
            }, 10000);
        }
    }
    function isInternetConnect_commen() {
        WinJS.xhr({ url: "http://www.baidu.com" }).done(function complete(result) {
            // Report download.
            if (result.status === 200) {
                var InternetConnectionImage = document.getElementById("InternetConnectionImage");
                InternetConnectionImage.style.visibility = "hidden";
            }
        }, function error(error) {
            var InternetConnectionImage = document.getElementById("InternetConnectionImage");
            InternetConnectionImage.style.visibility = "visible";
        });
    };
    function hideTitleProcess() {
        var titleProcess = document.getElementById("titleProcess");
        titleProcess.style.visibility = "hidden";
    };
    // Define some default imformation about current appliction 
    WinJS.Namespace.define("stringResource", {
        appName: "Travel Journey",
        skyDrivePath: "/865665823C96A99C"
        //skyDrivePath: "/DB4E8583FFCB8D03"
    });

    app.start();
})();