$('#card-dataset').hide();
$('#card-show-dataset').hide();
$('#btn-remove-classes').hide();
$('#btn-create').hide();

$('#form-control-dataset-name').on('click', function() {
	document.getElementById('form-control-dataset-name').style['border'] = 'none';
});

var classInputCtMax = 0;
var currentImgIndex = 0;
var subdataset = '';
var img_array = new Array();
var allFilesUploaded = 0;

function colored(x) {
	x.style['border-radius'] = '5px';
	x.style['background-color'] = 'rgb(0, 201, 239)';
}

function noColored(x) {
	x.style['background-color'] = 'rgb(255, 255, 255)';
}

function loading() {
	// Get the modal
	var modalL = document.getElementById("myModalLoading");
	modalL.style.display = "block";
}

function closeLoading() {
	// Get the modal
	var modalL = document.getElementById("myModalLoading");
	modalL.style.display = "none";
}

function checkboxClicked() {
	var buttonRemoveAppear = false;
	var flagCheck = false;
	var flagCheckAll = false;
	var classElements = document.getElementsByClassName('dataset-tree');
	for (var i = 0; i < classElements.length; i++) {
		var idElemNumber = classElements[i].id.split('-')[classElements[i].id.split('-').length-1];
		if (document.getElementById('check-' + idElemNumber) != null) {flagCheck = document.getElementById('check-' + idElemNumber).checked;}
		if (document.getElementById('check-all-' + idElemNumber) != null) {flagCheckAll = document.getElementById('check-all-' + idElemNumber).checked;}
		if (flagCheck == true || flagCheckAll == true) {
			buttonRemoveAppear = true;
			$('#btn-remove-dataset').show(100);
			break;
		}
	}
	if (buttonRemoveAppear == false) {
		$('#btn-remove-dataset').hide(100);
	}
}

function selectAllSubfolders(x) {
	var idThisNumber = x.id.split('-')[2];
	x = 'my-div-dataset-label-' + idThisNumber;
	var classElements = document.getElementsByClassName('dataset-tree');
	for (var i = 0; i < classElements.length; i++) {
		if (x.replace('-div', '') == classElements[i].id) {
			for (var j = i+1; j < classElements.length; j++) {
				if (classElements[j].id.split('-')[1] == 'subdataset') {
					var flagSetCheck = document.getElementById('check-all-' + idThisNumber).checked;
					document.getElementById('check-' + classElements[j].id.split('-')[classElements[j].id.split('-').length-1]).checked = flagSetCheck;
				}
				else if (classElements[j].id.split('-')[1] == 'dataset') {
					break;
				}
			}
			break;
		}
	}

	checkboxClicked();
}

function selectAllFiles(x) {
	var idThisNumber = x.id.split('-')[2];
	x = 'my-div-subdataset-label-' + idThisNumber;
	var classElements = document.getElementsByClassName('dataset-tree');
	for (var i = 0; i < classElements.length; i++) {
		if (x.replace('-div', '') == classElements[i].id) {
			for (var j = i+1; j < classElements.length; j++) {
				if (classElements[j].id.split('-')[1] == 'file') {
					var flagSetCheck = document.getElementById('check-all-' + idThisNumber).checked;
					document.getElementById('check-' + classElements[j].id.split('-')[classElements[j].id.split('-').length-1]).checked = flagSetCheck;
				}
				else if (classElements[j].id.split('-')[1] == 'dataset' || classElements[j].id.split('-')[1] == 'subdataset') {
					break;
				}
			}
			break;
		}
	}

	checkboxClicked();
}

function clickedPathDataset(x) {
	$('body').loadingModal({
	  text: 'Loading classes...'
	});

	var idThisNumber = x.id.split('-')[1];
	x = 'my-div-dataset-label-' + idThisNumber;
	var classElements = document.getElementsByClassName('dataset-tree');
	for (var i = 0; i < classElements.length; i++) {
		if (x.replace('-div', '') == classElements[i].id) {
			for (var j = i+1; j < classElements.length; j++) {
				if (classElements[j].id.split('-')[1] == 'subdataset') {
					var idNumber = classElements[j].id.split('-')[classElements[j].id.split('-').length-1];
					if (document.getElementById('my-div-subdataset-label-' + idNumber).style.display === 'block') {
						var flagSetCheck = document.getElementById('check-' + idThisNumber).checked;
						var flagSetCheckAll = document.getElementById('check-all-' + idThisNumber).checked;
						var textPath = document.getElementById(x).innerHTML;
						$('#' + x).html(textPath.replace('fa-minus', 'fa-plus'));
						document.getElementById('check-' + idThisNumber).checked = flagSetCheck;
						document.getElementById('check-all-' + idThisNumber).checked = flagSetCheckAll;

						var flagSetCheck = document.getElementById('check-' + idNumber).checked;
						var flagSetCheckAll = document.getElementById('check-all-' + idNumber).checked;
						var textPath = document.getElementById('my-div-subdataset-label-' + idNumber).innerHTML;
						$('#' + 'my-div-subdataset-label-' + idNumber).html(textPath.replace('fa-minus', 'fa-plus'));
						document.getElementById('check-' + idNumber).checked = flagSetCheck;
						document.getElementById('check-all-' + idNumber).checked = flagSetCheckAll;

						document.getElementById('my-div-subdataset-label-' + idNumber).style['display'] = 'none';
						var flagEnd = false;
						for (var k = j+1; k < classElements.length; k++) {
							if (classElements[k].id.split('-')[1] == 'file' && flagEnd == false) {
								var idFileNumber = classElements[k].id.split('-')[classElements[k].id.split('-').length-1];
								var flagSetCheck = document.getElementById('check-' + idFileNumber).checked;
								document.getElementById('my-div-file-label-' + idFileNumber).style['display'] = 'none';
								document.getElementById('check-' + idFileNumber).checked = flagSetCheck;
							}
							else {
								flagEnd = true;
							}
						}
					}
					else {
						var flagSetCheck = document.getElementById('check-' + idThisNumber).checked;
						var flagSetCheckAll = document.getElementById('check-all-' + idThisNumber).checked;
						var textPath = document.getElementById(x).innerHTML;
						$('#' + x).html(textPath.replace('fa-plus', 'fa-minus'));
						document.getElementById('check-' + idThisNumber).checked = flagSetCheck;
						document.getElementById('check-all-' + idThisNumber).checked = flagSetCheckAll;

						document.getElementById('my-div-subdataset-label-' + idNumber).style['display'] = 'block';
					}
				}
				else if (classElements[j].id.split('-')[1] == 'dataset') {
					$('body').loadingModal('destroy');
					break;
				}
			}
			$('body').loadingModal('destroy');
			break;
		}
	}
	$('body').loadingModal('destroy');
}

function clickedPathSubdataset(x) {
	$('body').loadingModal({
	  text: 'Loading files...'
	});

	var idThisNumber = x.id.split('-')[1];
	x = 'my-div-subdataset-label-' + idThisNumber;
	var subdatasetPath = checkWhereItBelongs('my-subdataset-label-' + idThisNumber);
	var classElements = document.getElementsByClassName('dataset-tree');
	for (var i = 0; i < classElements.length; i++) {
		if (x.replace('-div', '') == classElements[i].id) {
			for (var j = i+1; j < classElements.length; j++) {
				if (classElements[j].id.split('-')[1] == 'file') {
					var idNumber = classElements[j].id.split('-')[classElements[j].id.split('-').length-1];
					if (document.getElementById('my-div-file-label-' + idNumber).style.display === 'block') {
						var flagSetCheck = document.getElementById('check-' + idThisNumber).checked;
						var flagSetCheckAll = document.getElementById('check-all-' + idThisNumber).checked;
						var textPath = document.getElementById(x).innerHTML;
						$('#' + x).html(textPath.replace('fa-minus', 'fa-plus'));
						document.getElementById('check-' + idThisNumber).checked = flagSetCheck;
						document.getElementById('check-all-' + idThisNumber).checked = flagSetCheckAll;
						
						var flagSetCheck = document.getElementById('check-' + idNumber).checked;
						document.getElementById('my-div-file-label-' + idNumber).style['display'] = 'none';
						document.getElementById('check-' + idNumber).checked = flagSetCheck;
					}
					else {
						var flagSetCheck = document.getElementById('check-' + idThisNumber).checked;
						var flagSetCheckAll = document.getElementById('check-all-' + idThisNumber).checked;
						var textPath = document.getElementById(x).innerHTML;
						$('#' + x).html(textPath.replace('fa-plus', 'fa-minus'));
						document.getElementById('check-' + idThisNumber).checked = flagSetCheck;
						document.getElementById('check-all-' + idThisNumber).checked = flagSetCheckAll;

						document.getElementById('my-div-file-label-' + idNumber).style['display'] = 'block';

						//dicom files
						if (document.getElementById('my-div-file-label1-' + idNumber) != null) {
							var fileName = document.getElementById('my-file-label-' + idNumber).innerText;
							var filePath = subdatasetPath + '/' + fileName;
							downloadAndView('my-div-file-label1-' + idNumber, filePath);
						}
					}
				}
				else if (classElements[j].id.split('-')[1] == 'dataset' || classElements[j].id.split('-')[1] == 'subdataset') {
					$('body').loadingModal('destroy');
					break;
				}
			}
			$('body').loadingModal('destroy');
			break;
		}
	}
	$('body').loadingModal('destroy');
}

function popupMetadata(x) {
	var imgIdNumber = x.id.split('-')[x.id.split('-').length-1]

	if (document.getElementById('my-div-file-label1-' + imgIdNumber) != null) {
		var subdatasetPath = checkWhereItBelongs('my-file-label-' + imgIdNumber);
		var imgName = document.getElementById('my-file-label-' + imgIdNumber).innerText;
		var filePath = subdatasetPath + '/' + imgName;
		getMetadata(filePath, imgName);
	}
	else {
		var img = document.getElementById('my-file-img-' + imgIdNumber);
		var imgName = img.src.split('/')[img.src.split('/').length-1];
		imgName = imgName.replace(/%20/g, ' ');
		var imgWidth = img.naturalWidth;
		var imgHeight = img.naturalHeight;
		var otherProperties = '';

		if (imgName.includes('image_') && imgName.includes('.png') && (imgName.split('_')).length == 8) {
				var lastPart = imgName.split(' ')[1];
				var multiplication_parameters = lastPart.split('.png')[0];
				// height = multiplication_parameters.split('_')[0];
				//var width = multiplication_parameters.split('_')[1];
				var mul_factor = multiplication_parameters.split('_')[2];
				var rr = multiplication_parameters.split('_')[3];
				var hsr = multiplication_parameters.split('_')[4];
				var wsr = multiplication_parameters.split('_')[5];
				var zr = multiplication_parameters.split('_')[6];
				otherProperties = '<div class="file_metadata2"><label>Multiplication factor:</label><label  class="file_metadata1"> ' + mul_factor + ' </label></div>\
				<div class="file_metadata2"><label>Rotation (degrees):</label><label  class="file_metadata1"> ' + rr + ' </label></div>\
				<div class="file_metadata2"><label>Height shift:</label><label  class="file_metadata1"> ' + hsr + ' </label></div>\
				<div class="file_metadata2"><label>Width shift:</label><label  class="file_metadata1"> ' + wsr + ' </label></div>\
				<div class="file_metadata2"><label>Zoom:</label><label  class="file_metadata1"> ' + zr + ' </label></div>'
			}

        swal({
		    title: 'File metadata',
		    html: '<div class="file_metadata2"><label>File Name:</label><label  class="file_metadata1"> ' + imgName + ' </label></div>\
		    	<div class="file_metadata2"><label>Height (px):</label><label  class="file_metadata1"> ' + imgHeight + ' </label></div>\
		    	<div class="file_metadata2"><label>Width (px):</label><label  class="file_metadata1"> ' + imgWidth + ' </label></div>' + otherProperties
		});
	}
}

var lastImgDisplayed = 'other';

function popupImg(x) {
	//clean DCM modal
	$('#myModal').empty();
	$('#myModal').append('\
		<span class="close">&times;</span>\
	  	<span id="next" class="next" onclick="next()"><i class="fa fa-chevron-right"></i></span>\
	  	<span id="previous" class="previous" onclick="previous()"><i class="fa fa-chevron-left"></i></span>\
	  	<div id="caption"></div>\
	');

	// Get the modal
	var modal = document.getElementById("myModal");

	// Get the image and insert it inside the modal - use its "alt" text as a caption
	var imgIdNumber = x.id.split('-')[x.id.split('-').length-1]

	var captionText = document.getElementById("caption");

	if (document.getElementById('my-div-file-label1-' + imgIdNumber) != null) {
		var subdatasetPath = checkWhereItBelongs('my-file-label-' + imgIdNumber);
		var imgName = document.getElementById('my-file-label-' + imgIdNumber).innerText;
		var filePath = subdatasetPath + '/' + imgName;
		if (document.getElementById('heatmaps').checked) {
			lastImgDisplayed = 'other';
			heatmaps(filePath);
		}
		else {
			modal.style.display = "block";
			lastImgDisplayed = 'dcm';

			$('#myModal').append('\
			  	<div class="imgDCM-content" id="imgDCM"></div>\
			');

			downloadAndView('imgDCM', filePath);
		}
		captionText.innerHTML = imgName;

		subdataset = subdatasetPath;
	}
	else {
		lastImgDisplayed = 'other';

		var img = document.getElementById('my-file-img-' + imgIdNumber);
		var imgName = img.src.split('/')[img.src.split('/').length-1];
		imgName = imgName.replace(/%20/g, ' ');
		if (document.getElementById('heatmaps').checked) {
			heatmaps(img.src);
		}
		else {
			modal.style.display = "block";
			$('#myModal').append('\
			  	<img class="modal-content" id="img01">\
			');

			var modalImg = document.getElementById("img01");

			modalImg.src = img.src;
		}
		captionText.innerHTML = imgName;

		subdataset = img.src.replace('/' + img.src.split('/')[img.src.split('/').length-1], '');
		subdataset = subdataset.replace(/ /g, '%20');
		subdataset = subdataset.split('/')[subdataset.split('/').length-3] + '/' + subdataset.split('/')[subdataset.split('/').length-2] + '/' + subdataset.split('/')[subdataset.split('/').length-1];
	}

	var request = { 
		method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'path': subdataset})
	};  

	fetch('get_dir_files.php', request).then(function(response) {
		if(response.ok) {
		  	response.json().then(function (r_json) {
		  		img_array = r_json;
		  		for (var i = 0; i < r_json.length; i++) {
		  			if (r_json[i].split('\\')[r_json[i].split('\\').length-1] == imgName) {
		  				currentImgIndex = i;
		  				break;
		  			}
		  		}
		  	});								  	 
		} else {
			swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Server error retrieving data'
			});
		}
	})
	.catch(function(error) {
		swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Network error'
			});
	});

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() { 
	    modal.style.display = "none";
	}
}

function next() {					
	if (subdataset != '') {
		if (currentImgIndex + 1 >= img_array.length) {
			currentImgIndex = 0;
		}
		else {
			currentImgIndex += 1;
		}

		var imageName = img_array[currentImgIndex].split('\\')[img_array[currentImgIndex].split('\\').length-1];
		var newImgToShowSrc = subdataset + '/' + imageName;

		// Get the modal
		var modal = document.getElementById("myModal");
		var captionText = document.getElementById("caption");

		if (imageName.split('.')[imageName.split('.').length-1] == 'dcm') {
			if (document.getElementById('heatmaps').checked) {
				if (lastImgDisplayed == 'dcm') {
					if (document.getElementById('imgDCM') != null) {document.getElementById('imgDCM').remove();}
				}
			
				lastImgDisplayed = 'other';

				heatmaps(newImgToShowSrc, imageName);
			}
			else {
				modal.style.display = "block";

				if (document.getElementById('imgDCM') != null) {document.getElementById('imgDCM').remove();}
				if (document.getElementById('img01') != null) {document.getElementById('img01').remove();}
				
				lastImgDisplayed = 'dcm';
				
				$('#myModal').append('\
				  	<div class="imgDCM-content" id="imgDCM"></div>\
				');

				downloadAndView('imgDCM', newImgToShowSrc);
				captionText.innerHTML = imageName;
			}
		}
		else {
			if (lastImgDisplayed == 'dcm') {
				if (document.getElementById('imgDCM') != null) {document.getElementById('imgDCM').remove();}
			}

			lastImgDisplayed = 'other';

			var modalImg = document.getElementById("img01");
			if (document.getElementById('heatmaps').checked) {
				heatmaps(newImgToShowSrc, imageName);
			}
			else {
				modal.style.display = "block";

				if (lastImgDisplayed == 'dcm') {
					$('#myModal').append('\
					  	<img class="modal-content" id="img01">\
					');
				}

				modalImg.src = newImgToShowSrc;
				captionText.innerHTML = imageName;
			}
		}

		// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("close")[0];

		// When the user clicks on <span> (x), close the modal
		span.onclick = function() { 
		    modal.style.display = "none";
		}
	}
}

function previous() {			
	if (subdataset != '') {
		if (currentImgIndex - 1 < 0) {
			currentImgIndex = img_array.length - 1;
		}
		else {
			currentImgIndex -= 1;
		}

		var imageName = img_array[currentImgIndex].split('\\')[img_array[currentImgIndex].split('\\').length-1];
		var newImgToShowSrc = subdataset + '/' + imageName;

		// Get the modal
		var modal = document.getElementById("myModal");
		var captionText = document.getElementById("caption");

		if (imageName.split('.')[imageName.split('.').length-1] == 'dcm') {
			if (document.getElementById('heatmaps').checked) {
				if (lastImgDisplayed == 'dcm') {
					if (document.getElementById('imgDCM') != null) {document.getElementById('imgDCM').remove();}
				}
			
				lastImgDisplayed = 'other';

				heatmaps(newImgToShowSrc, imageName);
			}
			else {
				modal.style.display = "block";

				if (document.getElementById('imgDCM') != null) {document.getElementById('imgDCM').remove();}
				if (document.getElementById('img01') != null) {document.getElementById('img01').remove();}
				
				lastImgDisplayed = 'dcm';
				
				$('#myModal').append('\
				  	<div class="imgDCM-content" id="imgDCM"></div>\
				');

				downloadAndView('imgDCM', newImgToShowSrc);
				captionText.innerHTML = imageName;
			}
		}
		else {
			if (lastImgDisplayed == 'dcm') {
				if (document.getElementById('imgDCM') != null) {document.getElementById('imgDCM').remove();}
			}

			lastImgDisplayed = 'other';

			var modalImg = document.getElementById("img01");
			if (document.getElementById('heatmaps').checked) {
				heatmaps(newImgToShowSrc, imageName);
			}
			else {
				modal.style.display = "block";

				if (lastImgDisplayed == 'dcm') {
					$('#myModal').append('\
					  	<img class="modal-content" id="img01">\
					');
				}

				modalImg.src = newImgToShowSrc;
				captionText.innerHTML = imageName;
			}
		}

		// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("close")[0];

		// When the user clicks on <span> (x), close the modal
		span.onclick = function() { 
		    modal.style.display = "none";
		}
	}
}

function downloadDataset(x) {
	var idNumber = x.id.split('-')[x.id.split('-').length-1];
	var dataset_name_to_download = document.getElementById('my-dataset-label-' + idNumber).innerText;
	var dataset_path_to_download = 'uploads/' + dataset_name_to_download;

	var request = {
		method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
        	'name': dataset_name_to_download,
        	'path': dataset_path_to_download
        })
	};

	$('body').loadingModal({
	  text: 'Zipping files...'
	});

	fetch('download.php', request).then(function(response) {
		if(response.ok) {
		  	response.json().then(function (r_json) {
		  		location.href = r_json['link'];
		  		$('body').loadingModal('destroy');
		  		swal({
				    type: 'success',
				    title: 'Ok!',
				    text: 'Downloading will begin soon'
				});
			});   
		} else {
			$('body').loadingModal('destroy');
			swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Server error downloading dataset'
			});
		}
	})
	.catch(function(error) {
		$('body').loadingModal('destroy');
	  	swal({
		    type: 'error',
		    title: 'Oops!',
		    text: 'Network error'
		});
	});
}

function datasetChanged() {
	if (document.getElementById('select2-search-dataset-container') != null && (document.getElementById('select2-search-dataset-container').innerText != 'Select training dataset ' || document.getElementById('select2-search-dataset-container').innerText != 'Select training dataset')) {
		document.getElementById('select2-search-dataset-container').style['color'] = 'black';
	}
}

function refresh() {
	$('body').loadingModal({
	  text: 'Loading...'
	});

	if ($('.tree-dataset').length) {
		$('.tree-dataset').remove();
	};
	if ($('.tree-subdataset').length) {
		$('.tree-subdataset').remove();
	};
	if ($('.tree-file').length) {
		$('.tree-file').remove();
	};

	$('#search-dataset').empty();
	$('#search-dataset').append('<option value="">Select training dataset </option>');
	document.getElementById('select2-search-dataset-container').innerText = 'Select training dataset ';
	document.getElementById('select2-search-dataset-container').style['color'] = 'gray';

	var request = {
		method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'path': 'uploads'})
	};  

	fetch('get_dir_files.php', request).then(function(response) {
		if(response.ok) {
		  	response.json().then(function (r_json) {
		  		var lastDataset = '';
		  		var lastClass = '';
		  		var lastFile = '';
		  		var counterId = 0;
		  		for (var i = 0; i < r_json.length; i++) {
		  			if (r_json[i].split('\\')[1] != lastDataset) {
		  				$('.my-files-path').append('<div onmouseover="colored(this)" onmouseout="noColored(this)" id="my-div-dataset-label-' + counterId + '" class="tree-dataset"><i onclick="clickedPathDataset(this)" id="fa-' + counterId + '" class="fas fa-plus plusminus"></i> <input onclick="checkboxClicked()" type="checkbox" class="form-check-input" id="check-' + counterId + '"><label id="my-dataset-label-' + counterId + '" class="dataset-tree my-dataset-path">' + r_json[i].split('\\')[1] + '</label><input onclick="selectAllSubfolders(this)" type="checkbox" class="form-check-input check-all" id="check-all-' + counterId + '" style="margin-left: 20px;"><label style="margin-left: 35px; font-size: 13px; font-style: italic;">Select all classes</label><i type="file" onclick="uploadNewClass(this)" id="fa-up-nimg-' + counterId + '" class="class-file-input fa fa-cloud-upload" name="files[]" multiple="" style="margin-left: 20px;" data-toggle="tooltip" data-placement="right" title="Upload a new class to this dataset"></i><i onclick="downloadDataset(this)" id="fa-download-dat-' + counterId + '" class="fa fa-cloud-download" style="margin-left: 20px;" data-toggle="tooltip" data-placement="right" title="Download this dataset"></i><i onclick="multiplyDataset(this)" id="fa-mul-dat-' + counterId + '" class="fa fa-level-up" style="margin-left: 20px;" data-toggle="tooltip" data-placement="right" title="Multiply this dataset by making rotating versions of the existing images"></i></div>');
		  				$('#search-dataset').append('<option id="search-dataset-option-' + counterId + '" value="' + counterId + '">' + r_json[i].split('\\')[1] + '</option>');
		  				counterId += 1;
		  				var lastDataset = r_json[i].split('\\')[1];
		  				var lastClass = '';
		  			}
		  			if (r_json[i].split('\\')[2] != lastClass) {
		  				$('.my-files-path').append('<div onmouseover="colored(this)" onmouseout="noColored(this)" id="my-div-subdataset-label-' + counterId + '" class="tree-subdataset"><i onclick="clickedPathSubdataset(this)" id="fa-' + counterId + '" class="fas fa-plus plusminus"></i> <input onclick="checkboxClicked()" type="checkbox" class="form-check-input" id="check-' + counterId + '"><label id="my-subdataset-label-' + counterId + '" class="dataset-tree my-subdataset-path">' + r_json[i].split('\\')[2] + '</label><input onclick="selectAllFiles(this)" type="checkbox" class="form-check-input check-all" id="check-all-' + counterId + '" style="margin-left: 20px;"><label style="margin-left: 35px; font-size: 13px; font-style: italic;">Select all files</label><i type="file" onclick="uploadNewImgs(this)" id="fa-up-nimg-' + counterId + '" class="class-file-input fa fa-cloud-upload" name="files[]" multiple="" style="margin-left: 20px;" data-toggle="tooltip" data-placement="right" title="Upload new images to this class"></i></div>');
		  				counterId += 1;
		  				var lastClass = r_json[i].split('\\')[2];
		  				var lastFile = '';
		  			}
		  			if (r_json[i].split('\\')[3] != lastFile) {
		  				var imageName = r_json[i].split('\\')[r_json[i].split('\\').length-1]
		  				if (imageName.includes('image_') && imageName.includes('.png') && (imageName.split('_')).length == 8) {
		  					var lastPart = imageName.split(' ')[1];
		  					var multiplication_parameters = lastPart.split('.png')[0];
		  					var height = multiplication_parameters.split('_')[0];
		  					var width = multiplication_parameters.split('_')[1];
		  					var mul_factor = multiplication_parameters.split('_')[2];
		  					var rr = multiplication_parameters.split('_')[3];
		  					var hsr = multiplication_parameters.split('_')[4];
		  					var wsr = multiplication_parameters.split('_')[5];
		  					var zr = multiplication_parameters.split('_')[6];
		  					var tooltip = 'data-toggle="tooltip" data-placement="right" title="height: ' + height + ' px\nwidth: ' + width + ' px\nmultiplication factor: ' + mul_factor + '\nrotation: ' + rr + ' degrees\nheight shift: ' + hsr + '\nwidth shift: ' + wsr + '\nzoom: ' + zr + '"'
		  				}
		  				else {
		  					var tooltip = '';
		  				}

		  				if (imageName.split('.')[imageName.split('.').length-1] == 'dcm') {
		  					var fileElement = '<div onmouseover="colored(this)" onmouseout="noColored(this)" id="my-div-file-label-' + counterId + '" class="tree-file" ' + tooltip + '><div id="my-div-file-label1-' + counterId + '" style="width:25px;height:25px;position:absolute;margin-left:68px"></div><input onclick="checkboxClicked()" type="checkbox" class="form-check-input" id="check-' + counterId + '"><label id="my-file-label-' + counterId + '" class="dataset-tree my-file-path"><i onclick="popupImg(this)" id="fa-' + counterId + '" class="fa fa-eye fa-eye-file-dcm"></i><i onclick="popupMetadata(this)" id="fa-info-' + counterId + '" class="fa fa-info-circle fa-info-file-dcm"></i>' + r_json[i].split('\\')[3] + '</label></div>';
		  				}
		  				else {
		  					var fileElement = '<div onmouseover="colored(this)" onmouseout="noColored(this)" id="my-div-file-label-' + counterId + '" class="tree-file" ' + tooltip + '><input onclick="checkboxClicked()" type="checkbox" class="form-check-input" id="check-' + counterId + '"><label id="my-file-label-' + counterId + '" class="dataset-tree my-file-path"><i onclick="popupImg(this)" id="fa-' + counterId + '" class="fa fa-eye fa-eye-file"></i><i onclick="popupMetadata(this)" id="fa-info-' + counterId + '" class="fa fa-info-circle fa-info-file-other"></i> <img id="my-file-img-' + counterId + '" src=' + r_json[i].replace(/ /g, '%20') + ' alt=" " width="25" height="25"> ' + r_json[i].split('\\')[3] + '</label></div>';
		  				}

		  				$('.my-files-path').append(fileElement);
		  				
		  				counterId += 1;
		  				var lastFile = r_json[i].split('\\')[3];
		  			}
		  		}
		  		if (r_json.length == 0) {
		  			$('#btn-remove-dataset').hide(100);
		  			swal({
					    type: 'info',
					    title: 'Oops!',
					    text: 'No dataset available'
					});
		  		}
		  	});								  	 
		} else {
			swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Server error retrieving dataset'
			});
			// destroy the plugin
			$('body').loadingModal('destroy');
		}
	})
	.catch(function(error) {
		swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Network error'

			});
		// destroy the plugin
		$('body').loadingModal('destroy');
	});
	// destroy the plugin
	$('body').loadingModal('destroy');
}

function uploadNewFiles(path) {
	var fd = new FormData();
	var totalfiles = document.getElementById('new-file').files.length;
	if (totalfiles > 0) {
		for (var index = 0; index < totalfiles; index++) {
			fd.append("files[]", document.getElementById('new-file').files[index]);
		}
		fd.append('path', path);

		if ($('#new-progress-bar-green').length) {
	    	$('#new-progress-bar-green').css('width', 0+'%').attr('aria-valuenow', 0);
	    }
	    else {
		    $('.myalert').append('\
				<div class="progress">\
				  <div id="new-progress-bar-green" class="progress-bar bg-success" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>\
				</div>');
		}

		$.ajax({
	        url: "upload_new_files.php",
            cache: false,
            contentType: false,
            processData: false,
            async: true,
            data: fd,
            type: 'POST',
            xhr: function() {
            	var xhr = $.ajaxSettings.xhr();
                if(xhr.upload){ 
	                xhr.upload.addEventListener('progress', function(event){
	                    var percent = 0;
	                    if (event.lengthComputable) {
	                        percent = Math.ceil(event.loaded / event.total * 100);
	                        if (percent == 100) {
	                        	document.getElementById('alert-done').style['display'] = 'block';
	                        	refresh();
	                    	}
	                    }
	                    $('#new-progress-bar-green').css('width', percent+'%').attr('aria-valuenow', percent);
	                }, false);
                }
                return xhr;
            },
            success: function (res, status) {
                if (status == 'success') {
                    //alert('Done');
                }
            },
            fail: function (res) {
                swal({
				    type: 'error',
				    title: 'Oops! Error uploading dataset',
				    text: 'Please check your files format'
				});
            },
        });
    }
}

function checkWhereItBelongs(myId) {
	var classElements = document.getElementsByClassName('dataset-tree');
	var datasetPath = '';
	var subdatasetPath = '';

	for (var i = 0; i < classElements.length; i++) {
		if (classElements[i].id.includes('-dataset-')) {
			datasetPath = 'uploads/' + document.getElementById(classElements[i].id).innerHTML;
			if (classElements[i].id == myId) {return datasetPath;}
		}
		else if (classElements[i].id.includes('-subdataset-')) {
			subdatasetPath = datasetPath + '/' + document.getElementById(classElements[i].id).innerHTML;
			if (classElements[i].id == myId) {return subdatasetPath;}
		}
		else if (classElements[i].id.includes('-file-')) {
			filePathWithoutFileNameAtTheEnd = subdatasetPath + '/';
			if (classElements[i].id == myId) {return filePathWithoutFileNameAtTheEnd;}
		}
	}
}

function multiplyFiles(path, dataset) {
	var newdataset = document.getElementById('new-form-control-dataset-name').value;
	var factor = document.getElementById('mul-factor').value;
	var height = document.getElementById('height').value;
	var width = document.getElementById('width').value;
	var rotation = document.getElementById('rr').value;
	var hsr = document.getElementById('hsr').value;
	var wsr = document.getElementById('wsr').value;
	var zr = document.getElementById('zr').value;
	var exist = false;
	var error = false;

	var request = { 
		method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'dataset_name': newdataset})
	};  

	fetch('check_dataset_exist.php', request).then(function(response) {
		if(response.ok) {
		  	response.text().then(function (text) {
			  	if (text.includes('yes')) {					  		
			  		exist = true;
				}
				if (newdataset == "" || newdataset.includes("\\") || newdataset.includes("/") || newdataset.includes(":")|| newdataset.includes("*") || newdataset.includes("?") || newdataset.includes('"') || newdataset.includes("<") || newdataset.includes(">") || newdataset.includes("|")) {
					document.getElementById('new-form-control-dataset-name').style['border'] = '2px solid';
	        		document.getElementById('new-form-control-dataset-name').style['border-color'] = 'rgb(220, 53, 69)';
					document.getElementById('alert-error-name').style['display'] = 'block';
					error = true;
		        }
		        if (exist == true) {
		        	document.getElementById('new-form-control-dataset-name').style['border'] = '2px solid';
	        		document.getElementById('new-form-control-dataset-name').style['border-color'] = 'rgb(220, 53, 69)';
					document.getElementById('alert-error-name-exist').style['display'] = 'block';
		        	error = true;
		        }
				if (parseInt(factor) < 0 || parseInt(factor) > 100) {
					document.getElementById('mul-factor').style['border-color'] = 'rgb(220, 53, 69)';
					document.getElementById('alert-error').style['display'] = 'block';
					error = true;
				}
				if (parseInt(height) < 5 || parseInt(height) > 1024) {
					document.getElementById('height').style['border-color'] = 'rgb(220, 53, 69)';
					document.getElementById('alert-error').style['display'] = 'block';
					error = true;
				}
				if (parseInt(width) < 5 || parseInt(width) > 1024) {
					document.getElementById('width').style['border-color'] = 'rgb(220, 53, 69)';
					document.getElementById('alert-error').style['display'] = 'block';
					error = true;
				}
				if (parseInt(rotation) < 0 || parseInt(rotation) > 90) {
					document.getElementById('rr').style['border-color'] = 'rgb(220, 53, 69)';
					document.getElementById('alert-error').style['display'] = 'block';
					error = true;
				}
				if (parseFloat(hsr) < 0 || parseFloat(hsr) > 1.0) {
					document.getElementById('hsr').style['border-color'] = 'rgb(220, 53, 69)';
					document.getElementById('alert-error').style['display'] = 'block';
					error = true;
				}
				if (parseFloat(wsr) < 0 || parseFloat(wsr) > 1.0) {
					document.getElementById('wsr').style['border-color'] = 'rgb(220, 53, 69)';
					document.getElementById('alert-error').style['display'] = 'block';
					error = true;
				}
				if (parseFloat(zr) < 0 || parseFloat(zr) > 1.0) {
					document.getElementById('zr').style['border-color'] = 'rgb(220, 53, 69)';
					document.getElementById('alert-error').style['display'] = 'block';
					error = true;
				}

				if (error == false) {
					//swal.close();
					$('body').loadingModal({
					  text: 'Creating dataset...'
					});
					//removing folders and files in server
					dataset = dataset.replace(/ /g, '%20');
					newdataset = newdataset.replace(/ /g, '%20');

					var request = { 
						method: 'POST',
			            headers: {'Content-Type': 'application/json'},
			            body: JSON.stringify({
			            	'path': dataset,
			            	'new_path': newdataset,
			            	'height': height,
			            	'width': width,
			            	'factor': factor,
			            	'rr': rotation,
			            	'wsr': wsr,
			            	'hsr': hsr,
			            	'zr': zr
			            })
		        	};

					fetch('execute_script.php', request).then(function(response) {
						if(response.ok) {
							// destroy the plugin
							$('body').loadingModal('destroy');
						  	swal({
							    type: 'success',
							    title: 'Done!',
							    text: 'Dataset created'
							});
							refresh();					  	 
						} else {
							// destroy the plugin
							$('body').loadingModal('destroy');
							swal({
							    type: 'error',
							    title: 'Oops!',
							    text: 'Server error creating dataset'
							});
						}
					})
					.catch(function(error) {
						// destroy the plugin
						$('body').loadingModal('destroy');
						swal({
							    type: 'error',
							    title: 'Oops!',
							    text: 'Network error'
							});
					});
				}
			});   
		} else {
			swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Server error gathering information'
			});
		}
	})
	.catch(function(error) {
	  swal({
		    type: 'error',
		    title: 'Oops!',
		    text: 'Network error'
		});
	  	// destroy the plugin
		$('body').loadingModal('destroy');
	});
}

function multiplyDataset(x) {
	var idNumber = x.id.split('-')[x.id.split('-').length-1];
	var dataset = document.getElementById('my-dataset-label-' + idNumber).innerHTML;
	var path = checkWhereItBelongs('my-dataset-label-' + idNumber);

	swal({
		    title: 'Adjust parameters for new dataset',
		    html: '<label>Reference dataset:</label><label id="dataset_name">' + path.split('/')[path.split('/').length-1] + '</label>\
		    <div id="new-dataset-name-input" class="input-group-prepend">\
		    	<span class="input-group-text" id="basic-addon2">Dataset name:</span>\
		    	<input type="text" id="new-form-control-dataset-name" class="form-control" aria-describedby="basic-addon2" required">\
		  	</div>\
		    <div class="myalertmul">Multiplication factor: <input id="mul-factor" class="input-mul" type="number" value="0" min="0" max="100" step="1" style="border-color: rgb(0, 0, 0);"/></div>\
		    <div class="myalertmul">Height: <input id="height" class="input-mul" type="number" value="5" min="5" max="1024" step="1" style="border-color: rgb(0, 0, 0);"/></div>\
		    <div class="myalertmul">Width: <input id="width" class="input-mul" type="number" value="5" min="5" max="1024" step="1" style="border-color: rgb(0, 0, 0);"/></div>\
		    <div class="myalertmul">Rotation range: <input id="rr" class="input-mul" type="number" value="0" min="0" max="90" step="5" style="border-color: rgb(0, 0, 0);"/></div>\
		    <div class="myalertmul">Height shift range: <input id="hsr" class="input-mul" type="number" value="0.1" min="0" max="1.0" step="0.1" style="border-color: rgb(0, 0, 0);"/></div>\
		    <div class="myalertmul">Width shift range: <input id="wsr" class="input-mul" type="number" value="0.1" min="0" max="1.0" step="0.1" style="border-color: rgb(0, 0, 0);"/></div>\
		    <div class="myalertmul">Zoom range: <input id="zr" class="input-mul" type="number" value="0.1" min="0" max="1.0" step="0.1" style="border-color: rgb(0, 0, 0);"/></div>\
				<button type="button" id="sa-upload" class="btn btn-primary" aria-label="" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214); padding: 10px 33px; font-size: 17px; font-weight: 600;">Create</button>\
				<button type="button" id="sa-cancel" class="btn btn-danger" aria-label="" style="display: inline-block; background-color: rgb(221, 51, 51); padding: 10px 33px;  font-size: 17px; font-weight: 600;">Close</button>\
				<div id="alert-error-name-exist" style="display: none; color: rgb(220, 53, 69); margin-top: 10px;"><i class="fa fa-exclamation-triangle"></i> The dataset already exist</div>\
				<div id="alert-error-name" style="display: none; color: rgb(220, 53, 69); margin-top: 10px;"><i class="fa fa-exclamation-triangle"></i> The dataset must have a name and it cannot contain any of the following characters: \\/:*?"<>|</div>\
				<div id="alert-error" style="display: none; color: rgb(220, 53, 69); margin-top: 10px;"><i class="fa fa-exclamation-triangle"></i> Error! Please check your input values</div>\
				<div id="alert-done" style="display: none; color: rgb(40, 167, 69); margin-top: 10px;"><i class="fa fa-check-circle-o"></i> Done</div>\
						',
			showCancelButton: false,
			showConfirmButton: false
			});

	$('#new-form-control-dataset-name').on('click', function() {
		document.getElementById('new-form-control-dataset-name').style['border'] = '1px solid';
		document.getElementById('new-form-control-dataset-name').style['border-color'] = 'rgb(206, 212, 218)';
		document.getElementById('alert-error-name').style['display'] = 'none';
		document.getElementById('alert-error-name-exist').style['display'] = 'none';
	});

	$('#mul-factor').on('click', function() {			
		document.getElementById('mul-factor').style['border-color'] = 'rgb(0, 0, 0)';
		document.getElementById('alert-error').style['display'] = 'none';
	})

	$('#height').on('click', function() {			
		document.getElementById('height').style['border-color'] = 'rgb(0, 0, 0)';
		document.getElementById('alert-error').style['display'] = 'none';
	})

	$('#width').on('click', function() {			
		document.getElementById('width').style['border-color'] = 'rgb(0, 0, 0)';
		document.getElementById('alert-error').style['display'] = 'none';
	})

	$('#rr').on('click', function() {			
		document.getElementById('rr').style['border-color'] = 'rgb(0, 0, 0)';
		document.getElementById('alert-error').style['display'] = 'none';
	})

	$('#hsr').on('click', function() {			
		document.getElementById('hsr').style['border-color'] = 'rgb(0, 0, 0)';
		document.getElementById('alert-error').style['display'] = 'none';
	})

	$('#wsr').on('click', function() {			
		document.getElementById('wsr').style['border-color'] = 'rgb(0, 0, 0)';
		document.getElementById('alert-error').style['display'] = 'none';
	})

	$('#zr').on('click', function() {			
		document.getElementById('zr').style['border-color'] = 'rgb(0, 0, 0)';
		document.getElementById('alert-error').style['display'] = 'none';
	})
	
	$('#sa-cancel').on('click', function() {			
		swal.close();
	})

	$('#sa-upload').on('click', function() {			
	    multiplyFiles(path, dataset);
	})
}

function uploadNewClass(x) {
	var idNumber = x.id.split('-')[x.id.split('-').length-1];
	var dataset = document.getElementById('my-dataset-label-' + idNumber).innerHTML;

	var request = { 
		method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
        	'dataset_name': dataset
        })
	};

	fetch('check_classes.php', request).then(function(response) {
		if(response.ok) {
		  	response.json().then(function (r_json) {
			  	var nextNumber = 0;
			  	for (var i=2; i < Object.keys(r_json).length+2; i++) {
			  		var number = r_json[i].split('class')[1];
			  		if (number != nextNumber) {
			  			break;
			  		}
			  		nextNumber += 1;
			  	}
			  	var className = 'class' + nextNumber;

			  	swal({
					    title: 'Select files',
					    html: '<label>Dataset to be created:</label><label id="dataset_name">' + className + '</label>\
					    	<div class="myalert">\
					    		<div class="input-group">\
					    			<label for="new-file" class="custom-file-upload" data-toggle="tooltip" data-placement="right" title="Browse"><i class="fas fa-ellipsis-h"></i></label>\
									<input id="new-file" type="file" class="new-class-file-input" name="files[]" multiple/>\
									<input type="text" class="form-control" id="new-custom-file-label" aria-describedby="new-file" placeholder="Choose files for this class">\
								</div>\
							</div>\
							<button type="button" id="sa-upload" class="btn btn-primary" aria-label="" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214); padding: 10px 33px; font-size: 17px; font-weight: 600;">Upload</button>\
							<button type="button" id="sa-cancel" class="btn btn-danger" aria-label="" style="display: inline-block; background-color: rgb(221, 51, 51); padding: 10px 33px;  font-size: 17px; font-weight: 600;">Close</button>\
							<div id="alert-done" style="display: none; color: rgb(40, 167, 69); margin-top: 10px;"><i class="fa fa-check-circle-o"></i> Done</div>\
									',
						showCancelButton: false,
						showConfirmButton: false
						})

				$('#sa-cancel').on('click', function() {			
					swal.close();
				})

				$('#sa-upload').on('click', function() {
					var path = 'uploads/' + dataset + '/' + className;	
				    uploadNewFiles(path);
				})
			});
		} else {
			swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Server error retrieving data'
			});
		}
	})
	.catch(function(error) {
	  swal({
		    type: 'error',
		    title: 'Oops!',
		    text: 'Network error'
		});
	});
}

function uploadNewImgs(x) {
	var idNumber = x.id.split('-')[x.id.split('-').length-1];
	var subdataset = document.getElementById('my-subdataset-label-' + idNumber).innerHTML;
	var path = checkWhereItBelongs('my-subdataset-label-' + idNumber);

	swal({
		    title: 'Select new files',
		    html: '<label>Upload to:</label><label id="dataset_name">' + path.split('/')[path.split('/').length-2] + '/' + path.split('/')[path.split('/').length-1] + '</label>\
		    	<div class="myalert">\
		    		<div class="input-group">\
		    			<label for="new-file" class="custom-file-upload" data-toggle="tooltip" data-placement="right" title="Browse"><i class="fas fa-ellipsis-h"></i></label>\
						<input id="new-file" type="file" class="new-class-file-input" name="files[]" multiple/>\
						<input type="text" class="form-control" id="new-custom-file-label" aria-describedby="new-file" placeholder="Choose files for this class">\
					</div>\
				</div>\
				<button type="button" id="sa-upload" class="btn btn-primary" aria-label="" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214); padding: 10px 33px; font-size: 17px; font-weight: 600;">Upload</button>\
				<button type="button" id="sa-cancel" class="btn btn-danger" aria-label="" style="display: inline-block; background-color: rgb(221, 51, 51); padding: 10px 33px;  font-size: 17px; font-weight: 600;">Close</button>\
				<div id="alert-done" style="display: none; color: rgb(40, 167, 69); margin-top: 10px;"><i class="fa fa-check-circle-o"></i> Done</div>\
						',
			showCancelButton: false,
			showConfirmButton: false
			})

	$('#sa-cancel').on('click', function() {			
		swal.close();
	})

	$('#sa-upload').on('click', function() {			
	    uploadNewFiles(path);
	})
}

function newDatasetCardClose() {
	var wasVisible = $("#card-dataset").is(":visible");
	if (wasVisible) {
		$('#card-dataset').slideUp(0);
		document.getElementById('btn-new-dataset').style['border-color'] = 'rgb(108, 117, 125)';
		document.getElementById('card-dataset').style['border-color'] = 'rgb(108, 117, 125)';
	}
}

function showDatasetCardClose() {
	var wasVisible = $("#card-show-dataset").is(":visible");
	if (wasVisible) {
		$('#card-show-dataset').slideUp(0);
		document.getElementById('btn-show-dataset').style['border-color'] = 'rgb(108, 117, 125)';
		document.getElementById('card-show-dataset').style['border-color'] = 'rgb(108, 117, 125)';					
	}
}

$(function() {

	$('#btn-new-dataset').on('click', function() {
		showDatasetCardClose();
		trainingCardClose();
		evaluationCardClose();
		predictionCardClose();

		var wasVisible = $("#card-dataset").is(":visible");
		if (wasVisible) {
			$('#card-dataset').slideUp(200);
			document.getElementById('btn-new-dataset').style['border-color'] = 'rgb(108, 117, 125)';
			document.getElementById('card-dataset').style['border-color'] = 'rgb(108, 117, 125)';
		}
		else {
			$('#card-dataset').slideDown(0); 
			document.getElementById('btn-new-dataset').style['border-color'] = 'rgb(255, 255, 255)';
			document.getElementById('card-dataset').style['border-color'] = 'rgb(255, 255, 255)';
		}
	})

	$('#btn-show-dataset').on('click', function() {
		newDatasetCardClose();
		trainingCardClose();
		evaluationCardClose();
		predictionCardClose();

		var wasVisible = $("#card-show-dataset").is(":visible");
		if (wasVisible) {
			$('#card-show-dataset').slideUp(200);
			document.getElementById('btn-show-dataset').style['border-color'] = 'rgb(108, 117, 125)';
			document.getElementById('card-show-dataset').style['border-color'] = 'rgb(108, 117, 125)';					
		}
		else {
			$('#card-show-dataset').slideDown(0); 
			document.getElementById('btn-show-dataset').style['border-color'] = 'rgb(255, 255, 255)';
			document.getElementById('card-show-dataset').style['border-color'] = 'rgb(255, 255, 255)';
		
			//refresh();
		}
	})

	$('#btn-refresh').on('click', function() {
		refresh();
	})

	function checkIfDatasetIsIsolated() {
		var classElements = document.getElementsByClassName('dataset-tree');

		for (var i = 0; i < classElements.length; i++) {
			if (classElements[i].id.includes('-dataset-')) {
				if ((classElements[i+1] != null && classElements[i+1].id.includes('-dataset-')) || i+1 == classElements.length) {
					document.getElementById($('#' + classElements[i].id).parent()[0].id).remove();
				}
			}
		}

		var classElements = document.getElementsByClassName('dataset-tree');
		if (classElements.length == 0) {
			$('#btn-remove-dataset').hide(100);
		}
	}

	$('#btn-remove-dataset').on('click', function() {
		swal({
		title: 'Remove selected files',
		text: 'Are you sure?',
		type: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Yes, remove them!'
		}).then((result) => {
		    if (result.value) {
		    	var classElements = document.getElementsByClassName('dataset-tree');
				var toRemoveArray = new Array();
				var toRemoveRequestArray = '';
				var datasetPath = '';
				var subdatasetPath = '';
				var filePath = '';

				for (var i = 0; i < classElements.length; i++) {
					if (classElements[i].id.includes('-dataset-')) {datasetPath = 'uploads/' + document.getElementById(classElements[i].id).innerHTML;}
					else if (classElements[i].id.includes('-subdataset-')) {subdatasetPath = datasetPath + '/' + document.getElementById(classElements[i].id).innerHTML;}

					if (document.getElementById('check-' + classElements[i].id.split('-')[classElements[i].id.split('-').length-1]) != null) {
						var flagCheck = document.getElementById('check-' + classElements[i].id.split('-')[classElements[i].id.split('-').length-1]).checked;
						if (flagCheck == true) {
							if (classElements[i].id.includes('-dataset-')) {
								if (document.getElementById('search-dataset-option-' + classElements[i].id.split('-')[classElements[i].id.split('-').length-1]) != null) {
									if (document.getElementById('search-dataset-option-' + classElements[i].id.split('-')[classElements[i].id.split('-').length-1]).innerHTML == document.getElementById('select2-search-dataset-container').innerText.substr(2)) {
										if (document.getElementById('search-dataset-option-' + classElements[i].id.split('-')[classElements[i].id.split('-').length-1]).innerText == document.getElementById('select2-search-dataset-container').innerText.substr(2)) {
											document.getElementById('select2-search-dataset-container').innerText = 'Select training dataset ';
											document.getElementById('select2-search-dataset-container').style['color'] = 'gray';
										}
									}
									document.getElementById('search-dataset-option-' + classElements[i].id.split('-')[classElements[i].id.split('-').length-1]).remove()
								}
								toRemoveRequestArray = toRemoveRequestArray + datasetPath + '|';
							}
							else if (classElements[i].id.includes('-subdataset-')) {toRemoveRequestArray = toRemoveRequestArray + subdatasetPath + '|';}
							else {
								if (document.getElementById(classElements[i].id.replace('label', 'img')) != null) {
									filePath = 'uploads' + document.getElementById(classElements[i].id.replace('label', 'img')).src.split('uploads')[1];
								}
								else {
									var dirPath = checkWhereItBelongs(classElements[i].id);
									filePath = dirPath + document.getElementById(classElements[i].id).innerText;
								}
								filePath = filePath.replace(/%20/g, ' ');
								toRemoveRequestArray = toRemoveRequestArray + filePath + '|';
							}

							toRemoveArray.push($('#' + classElements[i].id).parent()[0].id);

							if (classElements[i].id.includes('-dataset-')) {
								var flagNoMore = false;
								for (var j = i+1; j < classElements.length; j++) {
									if (flagNoMore == false && (classElements[j].id.includes('-subdataset-') || classElements[j].id.includes('-file-'))) {
										toRemoveArray.push($('#' + classElements[j].id).parent()[0].id);
									}
									else {
										flagNoMore = true;
									}
								}
							}
							else if (classElements[i].id.includes('-subdataset-')) {
								var flagNoMore = false;
								for (var j = i+1; j < classElements.length; j++) {
									if (flagNoMore == false && classElements[j].id.includes('-file-')) {
										toRemoveArray.push($('#' + classElements[j].id).parent()[0].id);
									}
									else {
										flagNoMore = true;
									}
								}
							}
						}
					}
				}
				for (var i = 0; i < toRemoveArray.length; i++) {
					if (document.getElementById(toRemoveArray[i]) != null) {
						document.getElementById(toRemoveArray[i]).remove();
					}
				}

				//updating +/- in the rest of folders
				for (var i = 0; i < classElements.length; i++) {
					if (classElements[i].id.includes('-dataset-') && ((classElements[i+1] != null && classElements[i+1].id.includes('-dataset-')) || classElements[i+1] == null)) {
						document.getElementById('fa-' + classElements[i].id.split('-')[classElements[i].id.split('-').length-1]).style['color'] = '#ffffff00';
					}
					else if (classElements[i].id.includes('-subdataset-') && ((classElements[i+1] != null && classElements[i+1].id.includes('-subdataset-')) || classElements[i+1] == null)) {
						document.getElementById('fa-' + classElements[i].id.split('-')[classElements[i].id.split('-').length-1]).style['color'] = '#ffffff00';
					}
				}

				checkIfDatasetIsIsolated();
				checkboxClicked();

				var request = { 
					method: 'POST',
		            headers: {'Content-Type': 'application/json'},
		            body: JSON.stringify({
		            	'path': toRemoveRequestArray
		            })
		    	};

				//removing folders and files in server
				fetch('remove.php', request).then(function(response) {
					if(response.ok) {
					  	swal({
						    type: 'success',
						    title: 'Done!',
						    text: 'All selected files have been removed'
						});							  	 
					} else {
						swal({
						    type: 'error',
						    title: 'Oops!',
						    text: 'Server error removing data'
						});
					}
				})
				.catch(function(error) {
					swal({
						    type: 'error',
						    title: 'Oops!',
						    text: 'Network error'
						});
				});
			}
		})
	})

	$('#btn-new-class').on('click', function() {
		var classInputCt = 0;

		while ($("#card-classes-" + classInputCt).length) {
			classInputCt += 1;
		}

		if (classInputCt > classInputCtMax) {classInputCtMax=classInputCt;}

		$('.new-class').append('\
			<div id="card-classes-' + classInputCt + '" class="card">\
				<div class="input-group">\
			    	<div class="custom-file">\
			    		<span class="input-group-text" id="class-tag-' + classInputCt + '">Class ' + classInputCt + '</span>\
					    <label for="file-' + classInputCt + '" class="custom-file-upload" data-toggle="tooltip" data-placement="right" title="Browse"><i class="fas fa-ellipsis-h"></i></label>\
						<input id="file-' + classInputCt + '" type="file" class="class-file-input" name="files[]" multiple/>\
						<input type="text" class="form-control" id="custom-file-label-' + classInputCt + '" aria-describedby="file-' + classInputCt + '" placeholder="Choose files for this class">\
						<button class="btn btn-outline-danger" type="button" data-toggle="tooltip" data-placement="right" title="Remove this class"><i class="fas fa-trash"></i></button>\
					</div>\
			  	</div>\
			</div>');

		$('#btn-remove-classes').show(100);
		$('#btn-create').show(100);
	})

	$(document).on("click", ".btn-outline-danger" , function(event) {
		var removeCardClassById = $(this).parent().parent().parent().attr('id');
		$('#' + removeCardClassById).remove();
		var flagThereAreClassPath = false;
		for (var i = 0; i <= classInputCtMax; i++) {
    		if ($("#card-classes-" + i).length) {
    			flagThereAreClassPath = true;
    		}
    	}
    	if (flagThereAreClassPath == false) {
    		classInputCtMax = 0;
			$('#btn-remove-classes').hide(100);
			$('#btn-create').hide(100);
    	}

    	var flagThereAreClassPath = false;
		for (var i = 0; i <= layerInputCtMax; i++) {
    		if ($("#card-layers-" + i).length) {
    			flagThereAreClassPath = true;
    		}
    	}
    	if (flagThereAreClassPath == false) {
    		layerInputCtMax = 0;
			$('#btn-remove-layers').hide(100);
			$('#btn-train').hide(100);
			$('#btn-stop').hide(100);
    	}
    });	

    $('#btn-remove-classes').on('click', function() {
    	for (var i = 0; i <= classInputCtMax; i++) {
    		$('#card-classes-' + i).remove();
    	}
    	classInputCtMax = 0;
		$('#btn-remove-classes').hide(100);
		$('#btn-create').hide(100);
    })

    $(document).on("change", ".class-file-input" , function(event) {
		var inputId = $(this).attr('id');
		var inputIdArray = inputId.split('-');
		inputId = inputIdArray[inputIdArray.length-1];
		var fd = new FormData();
		var totalfiles = document.getElementById('file-' + inputId).files.length;
	    for (var index = 0; index < totalfiles; index++) {
	       fd.append("files[]", document.getElementById('file-' + inputId).files[index]);
	    }
		
		var inputFileNamesArray = '';
		counter = 0
		for ([key, value] of fd.entries()) {
			if (counter == 0) {
				inputFileNamesArray = inputFileNamesArray.concat(value.name);
			}
			else {
				inputFileNamesArray = inputFileNamesArray.concat(', ' + value.name);
			}
			counter += 1
	    }
	    document.getElementById('custom-file-label-' + inputId).value = inputFileNamesArray;

	    if ($('#progress-bar-green-' + inputId).length) {
	    	var element = document.getElementById('progress-bar-green-' + inputId);
	    	var parent_element = element.parentNode;
			element.parentNode.removeChild(element);
			parent_element.remove();
		}
    });

    $(document).on("change", ".new-class-file-input" , function(event) {
		var fd = new FormData();
		var totalfiles = document.getElementById('new-file').files.length;
	    for (var index = 0; index < totalfiles; index++) {
	       fd.append("files[]", document.getElementById('new-file').files[index]);
	    }
		
		var inputFileNamesArray = '';
		counter = 0
		for ([key, value] of fd.entries()) {
			if (counter == 0) {
				inputFileNamesArray = inputFileNamesArray.concat(value.name);
			}
			else {
				inputFileNamesArray = inputFileNamesArray.concat(', ' + value.name);
			}
			counter += 1
	    }
	    document.getElementById('new-custom-file-label').value = inputFileNamesArray;

	    document.getElementById('alert-done').style['display'] = 'none';
    });	


    var lastClassIndex = 0;
    $('#btn-create').on('click', function() {
    	var datasetNameInput = document.getElementById('form-control-dataset-name');
    	if (datasetNameInput.value == "" || datasetNameInput.value.includes("\\") || datasetNameInput.value.includes("/") || datasetNameInput.value.includes(":")|| datasetNameInput.value.includes("*") || datasetNameInput.value.includes("?") || datasetNameInput.value.includes('"') || datasetNameInput.value.includes("<") || datasetNameInput.value.includes(">") || datasetNameInput.value.includes("|")) {
    		datasetNameInput.style['border'] = '2px solid';
    		datasetNameInput.style['border-color'] = 'rgb(220, 53, 69)';
    		swal({
			    type: 'error',
			    title: 'Error!',
			    text: 'The dataset must have a name and it cannot contain any of the following characters: \\/:*?"<>|'
			});
    	}
    	else {
    		var request = { 
				method: 'POST',
	            headers: {'Content-Type': 'application/json'},
	            body: JSON.stringify({
	            	'dataset_name': datasetNameInput.value
	            })
        	};

			fetch('check_dataset_exist.php', request).then(function(response) {
				if(response.ok) {
				  	response.text().then(function (text) {
					  	if (text.includes('yes')) {								  		
					  		swal({
							title: 'Dataset already exist',
							text: 'Do you want to override it?',
							type: 'warning',
							showCancelButton: true,
							confirmButtonColor: '#3085d6',
							cancelButtonColor: '#d33',
							confirmButtonText: 'Yes, override it!'
							}).then((result) => {
							    if (result.value) {
							    	for (var i = 0; i <= classInputCtMax; i++) {
					        			if ($("#card-classes-" + i).length) {
					        				uploadDataset(i);
					        				break;
					        			}
					        		}
								}
							})
						}
					  	else {
					  		for (var i = 0; i <= classInputCtMax; i++) {
			        			if ($("#card-classes-" + i).length) {
			        				uploadDataset(i);
			        				break;
			        			}
			        		}
					  	}
					});   
				} else {
					swal({
					    type: 'error',
					    title: 'Oops!',
					    text: 'Server error uploading dataset'
					});
				}
			})
			.catch(function(error) {
			  swal({
				    type: 'error',
				    title: 'Oops!',
				    text: 'Network error'
				});
			});
        }
	});

	$(document).ajaxStop(function() {
		for (var i = lastClassIndex+1; i <= classInputCtMax; i++) {
    		if ($("#card-classes-" + i).length) {
    			uploadDataset(i);
    			break;
    		}
    	}

    	allFilesUploaded += 1;
    	if (allFilesUploaded == classInputCtMax + 1) {
    		allFilesUploaded = 0;
			if ($('#sa-upload').is(':visible') == false) {
				swal({
				    type: 'success',
				    title: 'Done!',
				    text: 'All classes have been uploaded'
				});
				refresh();
			}
    	}
	});

	function uploadDataset(classIndex) {

		lastClassIndex = classIndex;
		var fd = new FormData();
		var totalfiles = document.getElementById('file-' + classIndex).files.length;
		if (totalfiles > 0) {
			for (var index = 0; index < totalfiles; index++) {
				fd.append("files[]", document.getElementById('file-' + classIndex).files[index]);
			}
			fd.append('name', document.getElementById('form-control-dataset-name').value);
			fd.append('dir', 'class' + classIndex);

			if ($('#progress-bar-green-' + classIndex).length) {
		    	$('#progress-bar-green-' + classIndex).css('width', 0+'%').attr('aria-valuenow', 0);
		    }
		    else {
			    $('#card-classes-' + classIndex).append('\
					<div class="progress">\
					  <div id="progress-bar-green-' + classIndex + '" class="progress-bar bg-success" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>\
					</div>');
			}

			$.ajax({
		        url: "upload.php",
	            cache: false,
	            contentType: false,
	            processData: false,
	            async: true,
	            data: fd,
	            type: 'POST',
	            xhr: function() {
	            	var xhr = $.ajaxSettings.xhr();
	                if(xhr.upload){ 
		                xhr.upload.addEventListener('progress', function(event){
		                    var percent = 0;
		                    if (event.lengthComputable) {
		                        percent = Math.ceil(event.loaded / event.total * 100);
		                    }
		                    $('#progress-bar-green-' + classIndex).css('width', percent+'%').attr('aria-valuenow', percent);
		                }, false);
	                }
	                return xhr;
	            },
	            success: function (res, status) {
	                if (status == 'success') {
	                    //alert('Done');
	                }
	            },
	            fail: function (res) {
	                swal({
					    type: 'error',
					    title: 'Oops! Error uploading dataset',
					    text: 'Please check your files format'
					});
	            },
            });
        }
	}
});