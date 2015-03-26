(function () {
    "use strict";

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;
    var utils = WinJS.Utilities;

    // The 'ui' variable is set to WinJS.UI.
    ui.Pages.define("/pages/groupDetail/groupDetail.html", {

        items: null,
        // This function updates the ListView with new layouts
        _initializeLayout: function (listView, viewState) {
            if (viewState === appViewState.snapped) {
                listView.layout = new ui.ListLayout();
            } else {
                listView.layout = new ui.GridLayout({ groupHeaderPosition: "left" });
            }
        },
        // This function to be executed when the item has been clicked.
        _itemInvoked: function (args) {
            var item = this.items.getAt(args.detail.itemIndex);
            nav.navigate("/pages/itemDetail/itemDetail.html", { item: Data.getItemReference(item) });
        },
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            var listView = element.querySelector(".itemslist").winControl;
            var group = (options && options.groupKey) ? Data.resolveGroupReference(options.groupKey) : this.resolveGroupReference(options);
            this.items = Data.getItemsFromGroup(group);
            var pageList = this.items.createGrouped(
                function groupKeySelector(item) { return group.key; },
                function groupDataSelector(item) { return group; }
            );

            element.querySelector("header[role=banner] .pagetitle").textContent = group.title;
            listView.itemDataSource = pageList.dataSource;
            //listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.itemTemplate = this.itemtemplate;
            listView.oniteminvoked = this._itemInvoked.bind(this);
            this._initializeLayout(listView, Windows.UI.ViewManagement.ApplicationView.value);
            listView.element.focus();
        },
        unload: function () {
            // TODO: Respond to navigations away from this page.
            this.items.dispose();
        },
        // Get group object by groupKey
        resolveGroupReference: function (options) {
            for (var i = 0; i < Data.groups.length; i++) {
                if (Data.groups.getAt(i).title == options.group.grouptitle) {
                    return Data.groups.getAt(i);
                }
            }
        },
        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />
            /// <param name="viewState" value="Windows.UI.ViewManagement.ApplicationViewState" />
            /// <param name="lastViewState" value="Windows.UI.ViewManagement.ApplicationViewState" />

            // TODO: Respond to changes in viewState.
            var listView = element.querySelector(".itemslist").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    listView.addEventListener("contentanimating", handler, false);
                    var firstVisible = listView.indexOfFirstVisible;
                    this._initializeLayout(listView, viewState);
                    listView.indexOfFirstVisible = firstVisible;
                }
            }
        },
        // Template for the items in the zoomed in ListView
        itemtemplate: function (itemPromise) {
            var that = this;
            return itemPromise.then(function (currentItem) {

                var result = document.createElement("div");
                result.className = "listitem-back";
                result.style.overflow = "hidden";

                var imageWicket = document.createElement("div");
                imageWicket.className = "listitem-imageWicket-back";
                result.appendChild(imageWicket);

                var image = document.createElement("img");
                image.className = "listitem-image-back";
                image.src = currentItem.data.backgroundImage;
                imageWicket.appendChild(image);

                var naturalWidth;
                while (naturalWidth == 0 || naturalWidth == undefined) {
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
                var itemOverlay = document.createElement("div");
                itemOverlay.className = "listitem-overlay-back";
                result.appendChild(itemOverlay);
                var title = document.createElement("h4");
                title.className = "listitem-title-back";
                title.textContent = deleteFileSuffix(currentItem.data.title);
                itemOverlay.appendChild(title);

                return result;
            });
        }
    });
    // delete suffix of file name
    function deleteFileSuffix(str) {
        if (str.toString().indexOf(".") == -1) {
            return str
        } else {
            return str.substring(0, str.toString().indexOf("."));
        }
    };
})();
