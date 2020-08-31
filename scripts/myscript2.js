// helper function to see if a string only has ascii characters in it
function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

// This function iterates through dataSet recursively and adds new HTML strings
// to the output array passed into it
function dumpDataSet(dataSet, output)
{
    function getTag(tag)
    {
        var group = tag.substring(1,5);
        var element = tag.substring(5,9);
        var tagIndex = ("("+group+","+element+")").toUpperCase();
        var attr = TAG_DICT[tagIndex];
        return attr;
    }


    // the dataSet.elements object contains properties for each element parsed.  The name of the property
    // is based on the elements tag and looks like 'xGGGGEEEE' where GGGG is the group number and EEEE is the
    // element number both with lowercase hexadecimal letters.  For example, the Series Description DICOM element 0008,103E would
    // be named 'x0008103e'.  Here we iterate over each property (element) so we can build a string describing its
    // contents to add to the output array
    for(var propertyName in dataSet.elements) {
        var element = dataSet.elements[propertyName];

        var text = "";

        var color = 'black';

        var tag = getTag(element.tag);
        // The output string begins with the element name (or tag if not in data dictionary), length and VR (if present).  VR is undefined for
        // implicit transfer syntaxes
        if(tag === undefined)
        {
            text += element.tag;
            text += "; length=" + element.length;

            if(element.hadUndefinedLength) {
                text += " <strong>(-1)</strong>";
            }

            if(element.vr) {
                text += " VR=" + element.vr +"; ";
            }

            // make text lighter since this is an unknown attribute
            color = '#C8C8C8';
        }
        else
        {
            text += tag.name;
            text += ": ";
        }



        // Here we check for Sequence items and iterate over them if present.  items will not be set in the
        // element object for elements that don't have SQ VR type.  Note that implicit little endian
        // sequences will are currently not parsed.
        if(element.items)
        {
            output.push('<li>'+ text + '</li>');
            output.push('<ul>');

            // each item contains its own data set so we iterate over the items
            // and recursively call this function
            var itemNumber = 0;
            element.items.forEach(function(item)
            {
                output.push('<li>Item #' + itemNumber++ + '</li>')
                output.push('<ul>');
                dumpDataSet(item.dataSet, output);
                output.push('</ul>');
            });
            output.push('</ul>');
        }
        else {
            // use VR to display the right value
            var vr;
            if(element.vr !== undefined)
            {
                vr = element.vr;
            }
            else {
                if(tag !== undefined)
                {
                    vr = tag.vr;
                }
            }

            // if the length of the element is less than 128 we try to show it.  We put this check in
            // to avoid displaying large strings which makes it harder to use.
            if(element.length < 128) {
                // Since the dataset might be encoded using implicit transfer syntax and we aren't using
                // a data dictionary, we need some simple logic to figure out what data types these
                // elements might be.  Since the dataset might also be explicit we could be switch on the
                // VR and do a better job on this, perhaps we can do that in another example

                // First we check to see if the element's length is appropriate for a UI or US VR.
                // US is an important type because it is used for the
                // image Rows and Columns so that is why those are assumed over other VR types.
                if(element.vr === undefined && tag === undefined) {
                    if(element.length === 2)
                    {
                        text += " (" + dataSet.uint16(propertyName) + ")";
                    }
                    else if(element.length === 4)
                    {
                        text += " (" + dataSet.uint32(propertyName) + ")";
                    }


                    // Next we ask the dataset to give us the element's data in string form.  Most elements are
                    // strings but some aren't so we do a quick check to make sure it actually has all ascii
                    // characters so we know it is reasonable to display it.
                    var str = dataSet.string(propertyName);
                    var stringIsAscii = isASCII(str);

                    if(stringIsAscii)
                    {
                        // the string will be undefined if the element is present but has no data
                        // (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
                        // data.  Note that the length of the element will be 0 to indicate "no data"
                        // so we don't put anything here for the value in that case.
                        if(str !== undefined) {
                            text += '"' + str + '"';
                        }
                    }
                    else
                    {
                        if(element.length !== 2 && element.length !== 4)
                        {
                            color = '#C8C8C8';
                            // If it is some other length and we have no string
                            text += "<i>binary data</i>";
                        }
                    }
                }
                else
                {
                    function isStringVr(vr)
                    {
                        if(vr === 'AT'
                                || vr === 'FL'
                                || vr === 'FD'
                                || vr === 'OB'
                                || vr === 'OF'
                                || vr === 'OW'
                                || vr === 'SI'
                                || vr === 'SQ'
                                || vr === 'SS'
                                || vr === 'UL'
                                || vr === 'US'
                                )
                        {
                            return false;
                        }
                        return true;
                    }

                    if(isStringVr(vr))
                    {
                        // Next we ask the dataset to give us the element's data in string form.  Most elements are
                        // strings but some aren't so we do a quick check to make sure it actually has all ascii
                        // characters so we know it is reasonable to display it.
                        var str = dataSet.string(propertyName);
                        var stringIsAscii = isASCII(str);

                        if(stringIsAscii)
                        {
                            // the string will be undefined if the element is present but has no data
                            // (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
                            // data.  Note that the length of the element will be 0 to indicate "no data"
                            // so we don't put anything here for the value in that case.
                            if(str !== undefined) {
                                text += str;
                            }
                        }
                        else
                        {
                            if(element.length !== 2 && element.length !== 4)
                            {
                                color = '#C8C8C8';
                                // If it is some other length and we have no string
                                text += "<i>binary data</i>";
                            }
                        }
                    }
                    else if (vr == 'US')
                    {
                        text += dataSet.uint16(propertyName);
                    }
                    else if(vr === 'SS')
                    {
                        text += dataSet.int16(propertyName);
                    }
                    else if (vr == 'UL')
                    {
                        text += dataSet.uint32(propertyName);
                    }
                    else if(vr === 'SL')
                    {
                        text += dataSet.int32(propertyName);
                    }
                    else if(vr == 'FD')
                    {
                        text += dataSet.double(propertyName);
                    }
                    else if(vr == 'FL')
                    {
                        text += dataSet.float(propertyName);
                    }
                    else if(vr === 'OB' || vr === 'OW' || vr === 'UN' || vr === 'OF' || vr ==='UT')
                    {
                        color = '#C8C8C8';
                        // If it is some other length and we have no string
                        text += "<i>binary data of length " + element.length + " and VR " + vr + "</i>";
                    }
                    else {
                        // If it is some other length and we have no string
                        text += "<i>no display code for VR " + vr + " yet, sorry!</i>";
                    }
                }

                if(element.length ===0) {
                    color = '#C8C8C8';
                }
            }
            else {
                color = '#C8C8C8';

                // Add text saying the data is too long to show...
                text += "<i>data of length " + element.length + " for VR + " + vr + " too long to show</i>";
            }
        }
        // finally we add the string to our output array surrounded by li elements so it shows up in the
        // DOM as a list
        output.push(text);
    }
}

function isTransferSyntaxEncapsulated(transferSyntax) {
    if(transferSyntax === "1.2.840.10008.1.2.4.50") // jpeg baseline
    {
        return true;
    }
    return false;
}
function dumpEncapsulatedInfo(dataSet)
{
    var transferSyntax = dataSet.string('x00020010');
    if(transferSyntax === undefined) {
        return;
    }
    if(isTransferSyntaxEncapsulated(transferSyntax) === false)
    {
        return;
    }
    var numFrames = dataSet.intString('x00280008');
    if(numFrames === undefined) {
        numFrames = 1;
    }
    for(var frame=0; frame < numFrames; frame++) {
        var pixelData = dicomParser.readEncapsulatedPixelData(dataSet, frame);
    }
}

function dumpByteArray(byteArray, imgName)
{
    // set a short timeout to do the parse so the DOM has time to update itself with the above message
    setTimeout(function() {

        // Invoke the paresDicom function and get back a DataSet object with the contents
        var dataSet;
        try {
            var start = new Date().getTime();
            dataSet = dicomParser.parseDicom(byteArray);
            // Here we call dumpDataSet to recursively iterate through the DataSet and create an array
            // of strings of the contents.
            var output = [];
            dumpDataSet(dataSet, output);

            var tagsArray = new Array('Patient Name', 'Patient ID', 'Patient Birth Date', 'Patient Sex', 'Study Description', 'Protocol Name', 'Accession Number', 'Study ID', 'Study Date', 'Study Time', 'Series Description', 'Series Number', 'Modality', 'Body Part', 'Series Date', 'Series Time', 'Instance Number', 'Acquisition Number', 'Acquisition Date', 'Acquisition Time', 'Content Date', 'Content Time', 'Rows', 'Columns', 'Photometric Interpretation', 'Image Type', 'Bits Allocated', 'Bits Stored', 'HighBit', 'Pixel Representation', 'Rescale Slope', 'Rescale Intercept', 'Image Position Patient', 'Image Orientation Patient', 'Pixel Spacing', 'Samples Per Pixel', 'Manufacturer', 'Model', 'Station Name', 'Application Entity Title', 'Institution Name', 'Software Version', 'Implementation Version Name', 'Study Instance UID', 'Series Instance UID', 'Instance UID', 'SOP Class UID', 'Transfer Syntax UID', 'Frame of Reference UID');

            var imgDetails = new Array();
            for (var i = 0; i < tagsArray.length; i++) {
                for (var j = 0; j < output.length; j++) {
                    if (output[j].includes(tagsArray[i].replace(/ /g, ''))) {
                        imgDetails.push(tagsArray[i] + ':' + output[j].split(':')[1].replace(/\^/g, ' '));
                        break;
                    }
                }
            }

            var htmlElems = '<div class="file_metadata"><label>File Name:</label><label  class="file_metadata1"> ' + imgName + ' </label></div>';
            for (var i = 0; i < imgDetails.length; i++) {
            	if (imgDetails[i].split(':')[1] != '' && imgDetails[i].split(':')[1] != ' ') {
                    /*if (imgDetails[i].split(':')[0] == 'Patient Name') {
                        htmlElems = htmlElems + '<div class="file_metadata"><label>' + imgDetails[i].split(':')[0] + ':</label><label class="file_metadata1"> ' + imgDetails[i].split(':')[1].split(' ')[1] + '</label></div>';
                    }
                    else if (imgDetails[i].split(':')[0] == 'Patient ID') {
                        htmlElems = htmlElems + '<div class="file_metadata"><label>' + imgDetails[i].split(':')[0] + ':</label><label class="file_metadata1"> ' + '0123456789' + '</label></div>';
                    }
                    else if (imgDetails[i].split(':')[0] == 'Patient Birth Date') {
                        htmlElems = htmlElems + '<div class="file_metadata"><label>' + imgDetails[i].split(':')[0] + ':</label><label class="file_metadata1"> ' + '20000101' + '</label></div>';
                    }
                    else if (imgDetails[i].split(':')[0] == 'Institution Name') {
                        htmlElems = htmlElems + '<div class="file_metadata"><label>' + imgDetails[i].split(':')[0] + ':</label><label class="file_metadata1"> ' + 'XXXXXXXXXX' + '</label></div>';
                    }
                    else {
                        htmlElems = htmlElems + '<div class="file_metadata"><label>' + imgDetails[i].split(':')[0] + ':</label><label class="file_metadata1"> ' + imgDetails[i].split(':')[1] + '</label></div>';
                    }*/
                    htmlElems = htmlElems + '<div class="file_metadata"><label>' + imgDetails[i].split(':')[0] + ':</label><label class="file_metadata1"> ' + imgDetails[i].split(':')[1] + '</label></div>';
            	}
            }

            swal({
			    title: 'File metadata',
			    html: htmlElems
			})

            //console.log(imgDetails);
        }
        catch(err)
        {
            swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Error retrieving file metadata'
			});
        }
    },10);

}

function getMetadata(filePath, imgName) {
	let url = 'https://' + window.location.hostname + '/K-CNN/' + filePath;

    var oReq = new XMLHttpRequest();
    try {
        oReq.open("get", url, true);
    }
    catch(err)
    {
        swal({
		    type: 'error',
		    title: 'Oops!',
		    text: 'Error retrieving file metadata'
		});
    }
    oReq.responseType = "arraybuffer";
    oReq.onreadystatechange = function(oEvent)
    {
        if(oReq.readyState == 4)
        {
            if(oReq.status == 200)
            {
                var byteArray = new Uint8Array(oReq.response);
                dumpByteArray(byteArray, imgName);
            }
            else
            {
                swal({
				    type: 'error',
				    title: 'Oops!',
				    text: 'Error retrieving file metadata'
				});
            }
        }
    };
    oReq.send();

    return false;
};