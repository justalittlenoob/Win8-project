(function () {
    "use strict";

    var ui = WinJS.UI;
    var utils = WinJS.Utilities;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;

    ui.Pages.define("/pages/image/image.html", {

        ready: function (element, options) {

            element.querySelector(".imagepagetitle").textContent = options.title+"（原图查看）";
            var image = element.querySelector(".image");
            image.src = options.args.href;

            // Adjust the picture size to adapt to the screen size.
            if (Windows.UI.ViewManagement.ApplicationView.value != Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                this.adaptImage(image);
            }
            else {
                this.adaptSnapImage(image);
            }
            // Performs an animation that shows a new page of content.
            WinJS.UI.Animation.enterPage([image], null);
            // Causes the element to receive the focus
            element.querySelector(".content").focus();
        },
        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            var image = element.querySelector(".image");
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    this.adaptSnapImage(image);
                }
            }
            if (lastViewState === appViewState.snapped) {
                this.adaptImage(image);
            }
        },
        adaptImage: function (image) {
            var naturalWidth = image.naturalWidth;
            var naturalHeight = image.naturalHeight;
            var naturalRate = naturalWidth / naturalHeight;
            var scrRate = screen.availWidth / screen.availHeight;

            if (naturalRate <= scrRate) {
                image.style.width = "auto";
                image.style.height = (screen.availHeight - 120)+"px";
            }
            else {
                image.style.width = (screen.availWidth)+"px";
                image.style.height = "auto";
            }
        },
        adaptSnapImage: function (image) {
            var naturalWidth = image.naturalWidth;
            var naturalHeight = image.naturalHeight;
            var naturalRate = naturalWidth / naturalHeight;
            var scrRate = 270 / 270;

            if (naturalRate <= scrRate) {
                image.style.width = "auto";
                image.style.height = "270px";
            }
            else {
                image.style.width = "270px";
                image.style.height = "auto";
            }
        }
    });
})();