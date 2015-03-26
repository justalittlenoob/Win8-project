(function () {
    "use strict";

    var ui = WinJS.UI;
    var utils = WinJS.Utilities;
    var nav = WinJS.Navigation;

    var indexfile = 0;
    var fileName;
    var floderName;

    ui.Pages.define("/pages/itemDetail/itemDetail.html", {

        ready: function (element, options) {
            var item = options && options.item ? Data.resolveItemReference(options.item) : Data.items.getAt(0);
            try {
                element.querySelector(".titlearea .pagetitle").textContent = deleteFileSuffix(item.title);

                var image = element.querySelector("article .item-image");
                image.src = item.backgroundImage;
                adaptpicture(image);

                // Performs an animation when a pointer is pressed on an object.
                // Performs an animation when a pointer is released.
                image.addEventListener("MSPointerDown", function (event) {
                    WinJS.UI.Animation.pointerDown(event.currentTarget);
                }, false);
                image.addEventListener("MSPointerUp", function (event) {
                    WinJS.UI.Animation.pointerUp(event.currentTarget);
                }, false);

                element.querySelector("article .item-content").textContent = "文件加载中,请稍后...";
                element.querySelector(".content").focus();
                getFiles(deleteFileSuffix(item.group.title), deleteFileSuffix(item.title));

                var detialImage = document.getElementById("detialImage");

                detialImage.addEventListener("click", function (args) {
                    nav.navigate("/pages/image/image.html", { args: args.srcElement, title: deleteFileSuffix(item.title) });
                }, false);
            } catch (e) {
                nav.back();
            }
            // Performs an animation that shows a new page of content, either when transitioning 
            // between pages in a running app or when displaying the first content in a newly launched app.
            WinJS.UI.Animation.enterPage([itemdetailpage], null);
        }
    });
    // Adjust the picture size to adapt to the stationary size.
    function adaptpicture(image) {
        var naturalWidth = image.naturalWidth;
        var naturalHeight = image.naturalHeight;
        var naturalRate = naturalHeight / naturalWidth;

        var rate = 300 / 460;

        if (naturalRate > rate) {
            if (naturalWidth <= 460 && naturalHeight > 300) {
                image.style.width = "100%";
                image.style.height = "auto";
                var offset = Math.floor((naturalHeight - 300) / (2 * 300) * 100).toString();
                image.style.marginTop = "-" + offset + "%";
            }
            else {
                var height = naturalHeight * (460 / naturalWidth);
                if (height > 300) {
                    image.style.width = "460px";
                    image.style.height = "auto";
                    var offset = Math.floor((height - 300) / (2 * 300) * 100).toString();
                    image.style.marginTop = "-" + offset + "%";
                } else {
                    image.style.width = "460px";
                    image.style.height = "auto";
                }
            }
        }
        else if (naturalRate < rate) {
            if (naturalHeight <= 300 && naturalWidth > 460) {
                image.style.width = "auto";
                image.style.height = "100%";
                var offset = Math.floor((naturalWidth - 460) / (2 * 460) * 100).toString();
                image.style.marginLeft = "-" + offset + "%";
            }
            else {
                var width = naturalWidth * (300 / naturalHeight);
                if (width > 460) {
                    image.style.width = "auto";
                    image.style.height = "300px";
                    var offset = Math.floor((width - 460) / (2 * 460) * 100).toString();
                    image.style.marginLeft = "-" + offset + "%";
                }
                else {
                    image.style.width = "auto";
                    image.style.height = "300px";
                }
            }
        }
    }
    // delete suffix of file name
    function deleteFileSuffix(str) {
        if (str.toString().indexOf(".") == -1) {
            return str
        } else {
            return str.substring(0, str.toString().indexOf("."));
        }
    }
    // Get files
    function getFiles(group_title,item_title) {
        floderName = group_title;
        fileName = item_title + ".txt";
        var files_path = stringResource.skyDrivePath + "/albums";
        WL.api({
            path: files_path,
            method: "GET"
        }).then(
            onGetFilesComplete,
            function (response) {
                log("Cannot get files and folders: " + JSON.stringify(response.error).replace(/,/g, ",\n"));
            });
    }
    function onGetFilesComplete(response) {
        var items = response.data;
        var foundFolder = 0;
        for (var i = 0; i < items.length; i++) {
            if (items[i].name == floderName) {
                WL.api({
                    path: items[i].id + "/files",
                    method: "GET"
                }).then(function (result) {
                    var txtInfloder = result.data;
                    for (var j = 0; j < txtInfloder.length; j++) {
                        if (txtInfloder[j].name == fileName) {
                            indexfile = txtInfloder[j].id + "/content";
                            downloadFile(indexfile);
                            foundFolder = 1;
                            break;
                        }
                    }
                });
            }
        }
        if (foundFolder == 0) {
            log("Unable to find any folders");
        }
    }
    // Download files
    function downloadFile(indexfile) {
        Windows.Storage.ApplicationData.current.localFolder.createFileAsync(fileName,
            Windows.Storage.CreationCollisionOption.replaceExisting).then(
            function (file) {
                if (file && (file instanceof Windows.Storage.StorageFile)) {
                    WL.login({
                        scope: ["wl.signin", "wl.skydrive", "wl.photos", "wl.contacts_photos", "wl.contacts_skydrive"],
                    }).then(function (response) {
                        WL.backgroundDownload({
                            path: indexfile,
                            file_output: file
                        }).then(function (response) {
                            var res = "Downloaded file.";
                            readFile();
                        }, function (responseFailed) {
                            var res = "Error calling API: " + responseFailed.error.message;
                        });
                    },
                    function (responseFailed) {
                        var res = "Error signing in: " + responseFailed.error.message;
                    });
                }
                else {
                    var res = "Cannot download file.";
                }
            }, function (responseFailed) {
                var res = responseFailed.error_description;
                readFile();
            });
    }
    // Read the contents of the file
    function readFile() {
        Windows.Storage.ApplicationData.current.localFolder.getFileAsync(fileName).then(function (sampleFile) {
            Windows.Storage.FileIO.readTextAsync(sampleFile).then(function (contents) {
                // Add code to process the text read from the file
                try {
                    document.getElementById("text-content").textContent = contents;
                    document.getElementById("ProcessBar").style.visibility = "hidden";

                    var screenWidth = window.innerWidth;
                    var actualWidth = document.getElementById("content").scrollWidth;
                    if (actualWidth > screenWidth)
                    {
                        document.getElementById("backgroundcolor").style.width = (actualWidth + 50) + "px";
                    }
                } catch (e) {
                }
            });
        });
    }
})();
