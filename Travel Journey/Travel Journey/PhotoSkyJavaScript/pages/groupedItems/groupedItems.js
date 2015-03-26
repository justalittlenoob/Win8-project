/// <reference path="/LiveSDKHTML/js/wl.js" />
(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;
    var utils = WinJS.Utilities;

    ui.Pages.define("/pages/groupedItems/groupedItems.html", {

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            element.querySelector(".pagetitle").textContent = stringResource.appName;
            var zoomedInlistView = element.querySelector(".zoomedInitemslist").winControl;
            var zoomedOutlistView = element.querySelector(".zoomedOutitemslist").winControl;
            var semanticZoom = element.querySelector(".semanticZoomDiv").winControl;

            zoomedInlistView.groupHeaderTemplate = element.querySelector(".zoomedInheaderTemplate");
            zoomedInlistView.itemTemplate = this.zoomedInitemtemplate;
            //zoomedInlistView.itemTemplate = element.querySelector(".zoomedInitemtemplate");
            zoomedOutlistView.itemTemplate = element.querySelector(".zoomedOutitemtemplate");

            zoomedInlistView.oniteminvoked = this._itemInvoked.bind(this);
            this._initializeLayout(zoomedInlistView, zoomedOutlistView, semanticZoom, appView.value);
            zoomedInlistView.element.focus();

            var button = document.getElementById("button");
            button.addEventListener("click", function (args) {
                WL.logout();
            }, false);

            WL.Event.subscribe("auth.login", this.onLoginComplete);
            // Initializes the JavaScript library.
            WL.init();

            WL.login({
                scope: ["wl.signin", "wl.skydrive", "wl.photos", "wl.contacts_photos", "wl.contacts_skydrive"],
            });

            var button = document.getElementById("button");

            button.addEventListener("click", function (args) {
                WL.logout();
            }, false);
        },
        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {

            var zoomedInlistView = element.querySelector(".zoomedInitemslist").winControl;
            var zoomedOutlistView = element.querySelector(".zoomedOutitemslist").winControl;

            var semanticZoom = element.querySelector(".semanticZoomDiv").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        zoomedInlistView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    zoomedInlistView.addEventListener("contentanimating", handler, false);
                    this._createSnapDataSource();
                    this._initializeLayout(zoomedInlistView, zoomedOutlistView, semanticZoom, viewState);
                }
                if (lastViewState === appViewState.snapped) {
                    semanticZoom.forceLayout();
                    this._initializeLayout(zoomedInlistView, zoomedOutlistView, semanticZoom, viewState);
                }
            }
        },
        // This function updates the ListView with new layouts
        _initializeLayout: function (zoomedInlistView, zoomedOutlistView, semanticZoom, viewState) {
            var that = this;

            if (viewState === appViewState.snapped) {
                this._createSnapDataSource();

                zoomedInlistView.itemDataSource = snapData.items.dataSource;
                zoomedInlistView.groupDataSource = null;

                zoomedInlistView.layout = new ui.ListLayout();

                semanticZoom.zoomedOut = false;
                semanticZoom.forceLayout();
                semanticZoom.locked = true;
            } else {
                zoomedInlistView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
                zoomedInlistView.itemDataSource = Data.sub_items.dataSource;
                zoomedInlistView.groupDataSource = Data.sub_groups.dataSource;

                zoomedOutlistView.itemDataSource = Data.sub_groups.dataSource;
                zoomedOutlistView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
                semanticZoom.forceLayout();
                semanticZoom.locked = false;
            }
        },
        // This function to be executed when the item has been clicked.
        _itemInvoked: function (args) {
            if (appView.value === appViewState.snapped) {
                args.detail.itemPromise.then(function (invokedItem) {
                    if (invokedItem.data.tag == "groupTitle") {
                        nav.navigate("/pages/groupDetail/groupDetail.html", { group: invokedItem.data});
                    }else {
                        nav.navigate("/pages/itemDetail/itemDetail.html", { item: Data.getItemReference(invokedItem.data) });
                    }
                });
            } else {
                var item = Data.sub_items.getAt(args.detail.itemIndex);
                nav.navigate("/pages/itemDetail/itemDetail.html", { item: Data.getItemReference(item) });
            }
        },
        _createSnapDataSource: function () {
            var snapdataArray = new Array();
            for (var i = 0; i < Data.groups.length; i++) {
                var itemsArray = new Array();
                var group = Data.groups.getAt(i);
                // push a new groupitem
                var groupitem = new Object();
                groupitem.title = "";
                groupitem.tag = "groupTitle";
                groupitem.grouptitle = group.title;
                groupitem.backgroundImage = "../../images/snapTitlelogo.png";
                itemsArray.push(groupitem);

                var count=0;
                for (var j = 0; j < Data.items.length; j++) {
                    if (group.key == Data.items.getItem(j).groupKey && count < 3) {
                        var item = Data.items.getItem(j).data;
                        item.grouptitle = " ";
                        item.tag = "itemTitle";
                        itemsArray.push(item);
                        count++;
                    }
                }
                for (var k = 0; k < itemsArray.length; k++) {
                    snapdataArray.push(itemsArray[k]);
                }
            }
            var newdatalist = new WinJS.Binding.List(snapdataArray);
            WinJS.Namespace.define("snapData", {
                items: newdatalist
            });
        },
        // Template for the items in the zoomed in ListView
        zoomedInitemtemplate: function (itemPromise) {
            var that = this;
            return itemPromise.then(function (currentItem) {
                if (currentItem.data.tag) {
                    if (currentItem.data.tag == "groupTitle") {
                        var result = document.createElement("div");
                        result.className = "snapitemGrouptitle-back";
                        result.style.overflow = "hidden";

                        var grouptitle = document.createElement("h4");
                        grouptitle.className = "snapitemGrouptitle-title-back";
                        grouptitle.textContent = deleteFileSuffix(currentItem.data.grouptitle);
                        result.appendChild(grouptitle);
                    }
                    else if (currentItem.data.tag == "itemTitle") {
                        var result = document.createElement("div");
                        result.className = "snapitemitem-back";
                        result.style.overflow = "hidden";

                        var image = document.createElement("img");
                        image.className = "snapitemitem-image-back";
                        image.src = currentItem.data.backgroundImage;
                        result.appendChild(image);

                        var itemOverlay = document.createElement("div");
                        itemOverlay.className = "snapitemitem-overlay-back";
                        result.appendChild(itemOverlay);
                        var title = document.createElement("h4");
                        title.className = "snapitemitem-title-back";
                        title.textContent = deleteFileSuffix(currentItem.data.title);
                        itemOverlay.appendChild(title);
                    }
                } else {
                    var result = document.createElement("div");
                    result.className = "zoomedInitem-back";
                    result.style.overflow = "hidden";

                    var imageWicket = document.createElement("div");
                    imageWicket.className = "zoomedInitem-imageWicket-back";
                    result.appendChild(imageWicket);

                    var image = document.createElement("img");
                    image.className = "zoomedInitem-image-back";
                    image.src = currentItem.data.backgroundImage;
                    imageWicket.appendChild(image);
                     
                    var naturalWidth;
                    while (naturalWidth == 0 || naturalWidth==undefined) {
                        //
                        naturalWidth = image.naturalWidth;
                        var naturalHeight = image.naturalHeight;
                        var naturalRate = naturalHeight / naturalWidth;
                    }
                    var rate = 240 / 240;

                    if (naturalRate > rate) {
                        image.style.width = "100%";
                        image.style.height = "auto";
                        image.style.marginTop = "-10%";
                    }
                    else {
                        image.style.width = "auto";
                        image.style.height = "100%";
                        image.style.marginLeft = "-10%";
                    }
                    //
                    var itemOverlay = document.createElement("div");
                    itemOverlay.className = "zoomedInitem-overlay-back";
                    result.appendChild(itemOverlay);
                    var title = document.createElement("h4");
                    title.className = "zoomedInitem-title-back";
                    title.textContent = deleteFileSuffix(currentItem.data.title);
                    itemOverlay.appendChild(title);
                }
                return result;
            });
        },
        onLoginComplete: function () {
            var session = WL.getSession();
            if (!session.error) {
                signedInUser();
            }
        }
    });
    function signedInUser() {
        WL.api({
            path: "/me",
            method: "get"
        }
        ).then(
        function (result) {
        });
    };
    function getUserPicture() {
        WL.api
        ({
            path: "me/picture",
            method: "get"
        }).then(function (result) {
        });
    };
    // delete suffix of file name
    function deleteFileSuffix(str) {
        if (str.toString().indexOf(".") == -1) {
            return str
        } else {
            return str.substring(0, str.toString().indexOf("."));
        }
    }
})();
