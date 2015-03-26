(function () {
    "use strict";

    var groups = [];

    // Creates a List object.
    var list = new WinJS.Binding.List();
    var sub_list = new WinJS.Binding.List();

    // Creates a live grouped projection over this list.
    var groupedItems = list.createGrouped(
        function groupKeySelector(item) { return item.group.key; },
        function groupDataSelector(item) { return item.group; }
    );
    var sub_groupedItems = sub_list.createGrouped(
        function groupKeySelector(_item) { return _item.group.key; },
        function groupDataSelector(_item) { return _item.group; }
    );

    // The user completes the sign-in process
    WL.Event.subscribe("auth.login", onLoginComplete);

    function onLoginComplete() {
        var session = WL.getSession();
        if (!session.error) {
            getData();
        }
    };

    function getData() {
        var albums_path = stringResource.skyDrivePath + "/albums";
        //  This method encapsulates a REST API request, and then calls a callback function to process the response.
        WL.api({
            path: albums_path,
            method: "GET"
        }).then(function (response) {
            if (response.error) {}
            else {
                var items = response.data
                for (var index in items) {
                    downloadPicture(items[index].id);
                    groups.push({
                        key: items[index].id,
                        title: items[index].name,
                        subtitle: items[index].name,
                        description: items[index].type
                    });
                }
                tileNotifications(groups);
            }
        });
    }

    function downloadPicture(folderId) {
        var path = folderId + "/files"
        // Submit request
        WL.api({
            path: path,
            method: "GET"
        }).then(function (response) {
            loadPhotos(response);
        });
    };

    function loadPhotos(result) {
        if (result.error) {}
        else {
            var screenHeight = window.innerHeight;
            // get items of each group
            var items = result.data;
            // define a sub-items of each group
            var current_items = [];

            if (screenHeight > 768) {
                for (var i = 0; i < result.data.length; i++) {
                    if (isPicture(result.data[i]) == true && current_items.length < 6) {
                        current_items.push(result.data[i]);
                    }
                }
            }
            else {
                for (var i = 0; i < result.data.length; i++) {
                    if (isPicture(result.data[i]) == true && current_items.length < 4) {
                        current_items.push(result.data[i]);
                    }
                }
            }
            // get a datalist
            for (var index in items) {
                if (isPicture(items[index]) == false) {
                }
                else {
                    var GroupFolder;
                    for (var g = 0; g < groups.length; g++) {
                        if (groups[g].key === items[index].parent_id) {
                            GroupFolder = groups[g];
                            break;
                        }
                    }
                    list.push({
                        group: GroupFolder,
                        key: items[index].id,
                        title: items[index].name,
                        subtitle: items[index].description,
                        backgroundImage: items[index].source,
                        content: '',
                        description: ''
                    });
                }
            }
            // get a sub-datalist
            for (var index in current_items) {
                if (isPicture(current_items[index]) == false) {
                }
                else {
                    var GroupFolder;
                    for (var g = 0; g < groups.length; g++) {
                        if (groups[g].key === current_items[index].parent_id) {
                            GroupFolder = groups[g];
                            break;
                        }
                    }
                    sub_list.push({
                        group: GroupFolder,
                        key: current_items[index].id,
                        title: current_items[index].name,
                        subtitle: current_items[index].description,
                        backgroundImage: current_items[index].source,
                        content: '',
                        description: ''
                    });
                }
            }
        }
    };

    function isPicture(indexInItems) {
        var position_zispf = indexInItems.name.toString().indexOf(".");
        var type = indexInItems.name.toString().substring(position_zispf, indexInItems.length);
        if (type == ".txt") {
            return false;
        } else {
            return true;
        }
    };

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.group.key, item.title];
    }
    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).key === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }
    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }
    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) {
            return item.group.key === group.key;
        });
    }

    WinJS.Namespace.define("Data", {
        items: groupedItems,
        sub_items: sub_groupedItems,
        groups: groupedItems.groups,
        sub_groups: sub_groupedItems.groups,
        getItemsFromGroup: getItemsFromGroup,
        getItemReference: getItemReference,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference
    });

    function tileNotifications(groups) {
        var notifications = Windows.UI.Notifications;
        notifications.TileUpdateManager.createTileUpdaterForApplication().enableNotificationQueue(true);
        // The getTemplateContent method returns a Windows.Data.Xml.Dom.XmlDocument object
        // that contains the toast notification XML content.
        var template = notifications.TileTemplateType.tileWideText03;
        var tileXml = notifications.TileUpdateManager.getTemplateContent(template);
        // You can use the methods from the XML document to specify the required elements for the toast.
        var tileTextAttributes = tileXml.getElementsByTagName("text");
        tileTextAttributes[0].appendChild(tileXml.createTextNode("Hi ~"+ " Welcome to " + stringResource.appName + " Application!"));
        var tileNotification = new notifications.TileNotification(tileXml);
        notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);


        var template2 = notifications.TileTemplateType.tileWideText01;
        var tileXml2 = notifications.TileUpdateManager.getTemplateContent(template2);
        // You can use the methods from the XML document to specify the required elements for the toast.
        var tileTextAttributes2 = tileXml2.getElementsByTagName("text");
        tileTextAttributes2[0].appendChild(tileXml2.createTextNode("最新更新："));
        var count = groups.length < 3 ? groups.length : 3;
        for (var i = 0; i < count; i++) {
            tileTextAttributes2[i + 1].appendChild(tileXml2.createTextNode(groups[groups.length-(i+1)].title));
        }
        var tileNotification2 = new notifications.TileNotification(tileXml2);
        var currentTime = new Date();
        tileNotification2.expirationTime = new Date(currentTime.getTime() + 3600 * 1000);
        notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification2);
    };
})();
