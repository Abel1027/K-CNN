cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

cornerstoneWADOImageLoader.configure({
    beforeSend: function(xhr) {
        // Add custom headers here (e.g. auth tokens)
        //xhr.setRequestHeader('APIKEY', 'my auth token');
    }
});

function loadAndViewImage(imageId, elemId) {
    var element = document.getElementById(elemId);
    cornerstone.enable(element);

    try {
        var start = new Date().getTime();
        cornerstone.loadAndCacheImage(imageId).then(function(image) {
            //console.log(image);
            var viewport = cornerstone.getDefaultViewportForImage(element, image);

            cornerstone.displayImage(element, image, viewport);

        }, function(err) {
            alert(err);
        });
    }
    catch(err) {
        alert(err);
    }
}

function downloadAndView(elemId, filePath) {
    let url = 'https://' + window.location.hostname + '/K-CNN/' + filePath;

    // prefix the url with wadouri: so cornerstone can find the image loader
    url = "wadouri:" + url;

    // image enable the dicomImage element and activate a few tools
    loadAndViewImage(url, elemId);
}

//var element = document.getElementById('dicomImage');
//cornerstone.enable(element);