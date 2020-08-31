$('#card-prediction').hide();
$('#model-weight-pred').hide();
$('#btn-pred').hide();
$('#btn-logs').hide();
$('#num-classes').hide();

$('#btn-prediction').on('click', function() {
	newDatasetCardClose();
	showDatasetCardClose();
	trainingCardClose();
	evaluationCardClose();

	var wasVisible = $("#card-prediction").is(":visible");
	if (wasVisible) {
		$('#card-prediction').slideUp(200);
		document.getElementById('btn-prediction').style['border-color'] = 'rgb(108, 117, 125)';
		document.getElementById('card-prediction').style['border-color'] = 'rgb(108, 117, 125)';					
	}
	else {
		$('#card-prediction').slideDown(0); 
		document.getElementById('btn-prediction').style['border-color'] = 'rgb(255, 255, 255)';
		document.getElementById('card-prediction').style['border-color'] = 'rgb(255, 255, 255)';
	}
})

function predictionCardClose() {
	var wasVisible = $("#card-prediction").is(":visible");
	if (wasVisible) {
		$('#card-prediction').slideUp(0);
		document.getElementById('btn-prediction').style['border-color'] = 'rgb(108, 117, 125)';
		document.getElementById('card-prediction').style['border-color'] = 'rgb(108, 117, 125)';					
	}
}

var startHide = '';
function modelDirChangedPred(x) {
	if (document.getElementById('search-model-weight-pred') != null) {
		$('#search-model-weight-pred').empty();
		$('#search-model-weight-pred').append('<option value="">Select trained model for prediction </option>');
		document.getElementById('select2-search-model-weight-pred-container').innerText = 'Select trained model for prediction ';
		document.getElementById('select2-search-model-weight-pred-container').style['color'] = 'gray';
		$('#btn-pred').hide(100);
	}

	if (document.getElementById(x.id).value == '') {
		startHide = new Date();
		$('#model-weight-pred').hide(100);
		$('#num-classes').hide(100);
		document.getElementById('select2-search-model-dir-pred-container').innerText = 'Select directory for prediction ';
		document.getElementById('select2-search-model-dir-pred-container').style['color'] = 'gray';
	}
	else if (document.getElementById(x.id).value.length > 0) {
		document.getElementById('select2-search-model-dir-pred-container').style['color'] = 'black';
		
		setTimeout(function(){ 
			if (startHide == '') {
				$('#model-weight-pred').show(100);
				$('#num-classes').show(100);
			}
			else {
				var endHide = new Date();
				if (endHide - startHide > 50) {
					startHide == '';
					$('#model-weight-pred').show(100);
					$('#num-classes').show(100);
				}
			}
		}, 50);

		getWeightDataPred(document.getElementById('select2-search-model-dir-pred-container').innerText.substr(2));
	}
}

function getWeightDataPred(weight_name) {
	var request = { 
		method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
        	'model': weight_name
        })
	};

	fetch('trained_model_weights.php', request).then(function(response) {
		if(response.ok) {
			response.text().then(function (text) {
			  	var savedModelWeight = text.split('|');
			  	for (var i = 0; i < savedModelWeight.length-1; i++) {
			  		$('#search-model-weight-pred').append('<option id="' + savedModelWeight[i] + '" value="' + savedModelWeight[i] + '">' + savedModelWeight[i] + '</option>');
			  	}
			});
		} else {
			swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Error retrieving trained models'
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

function modelWeightChangedPred(x) {
	if (document.getElementById(x.id).value.length == 0) {
		$('#btn-pred').hide(100);
	}
	else if (document.getElementById(x.id).value.length > 0) {
		document.getElementById('select2-search-model-weight-pred-container').style['color'] = 'black';
		$('#btn-pred').show(100);
	}
}

$('#btn-refresh-pred').on('click', function() {
	refreshPred();
})

$('#btn-upload-pred').on('click', function() {
  	swal({
		    title: 'Select files',
		    html: '<div id="dataset-name-input" class="input-group-prepend">\
			    	<span class="input-group-text" id="basic-addon1">Folder name:</span>\
			    	<input type="text" id="form-control-folder-name" class="form-control" aria-describedby="basic-addon1" required">\
			  	</div>\
		    	<div class="myalert">\
		    		<div class="input-group">\
		    			<label for="new-file" class="custom-file-upload" data-toggle="tooltip" data-placement="right" title="Browse"><i class="fas fa-ellipsis-h"></i></label>\
						<input id="new-file" type="file" class="new-class-file-input" name="files[]" multiple/>\
						<input type="text" class="form-control" id="new-custom-file-label" aria-describedby="new-file" placeholder="Choose files for the new folder">\
					</div>\
				</div>\
				<button type="button" id="sa-upload" class="btn btn-primary" aria-label="" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214); padding: 10px 33px; font-size: 17px; font-weight: 600;">Upload</button>\
				<button type="button" id="sa-cancel" class="btn btn-danger" aria-label="" style="display: inline-block; background-color: rgb(221, 51, 51); padding: 10px 33px;  font-size: 17px; font-weight: 600;">Close</button>\
				<div id="alert-error-name-exist" style="display: none; color: rgb(220, 53, 69); margin-top: 10px;"><i class="fa fa-exclamation-triangle"></i> The dataset already exist</div>\
				<div id="alert-error-name" style="display: none; color: rgb(220, 53, 69); margin-top: 10px;"><i class="fa fa-exclamation-triangle"></i> The dataset must have a name and it cannot contain any of the following characters: \\/:*?"<>|</div>\
				<div id="alert-done" style="display: none; color: rgb(40, 167, 69); margin-top: 10px;"><i class="fa fa-check-circle-o"></i> Done</div>\
						',
			showCancelButton: false,
			showConfirmButton: false
			})

  	$('#form-control-folder-name').on('click', function() {
		document.getElementById('form-control-folder-name').style['border'] = '1px solid';
		document.getElementById('form-control-folder-name').style['border-color'] = 'rgb(206, 212, 218)';
		document.getElementById('alert-error-name').style['display'] = 'none';
		document.getElementById('alert-error-name-exist').style['display'] = 'none';
	});

	$('#sa-cancel').on('click', function() {			
		swal.close();
	})

	$('#sa-upload').on('click', function() {
		document.getElementById('alert-error-name-exist').style['display'] = 'none';
		var folderNameInput = document.getElementById('form-control-folder-name');

	    if (folderNameInput.value == "" || folderNameInput.value.includes("\\") || folderNameInput.value.includes("/") || folderNameInput.value.includes(":")|| folderNameInput.value.includes("*") || folderNameInput.value.includes("?") || folderNameInput.value.includes('"') || folderNameInput.value.includes("<") || folderNameInput.value.includes(">") || folderNameInput.value.includes("|")) {
    		folderNameInput.style['border'] = '2px solid';
    		folderNameInput.style['border-color'] = 'rgb(220, 53, 69)';
    		document.getElementById('alert-error-name').style['display'] = 'block';
    	}
    	else {
    		var request = { 
				method: 'POST',
	            headers: {'Content-Type': 'application/json'},
	            body: JSON.stringify({
	            	'folder_name': folderNameInput.value
	            })
        	};

			fetch('check_prediction_exist.php', request).then(function(response) {
				if(response.ok) {
				  	response.text().then(function (text) {
					  	if (text.includes('yes')) {								  		
					  		document.getElementById('alert-error-name-exist').style['display'] = 'block';
						}
					  	else {
					  		var request = { 
								method: 'POST',
					            headers: {'Content-Type': 'application/json'},
					            body: JSON.stringify({
					            	'folder_path': 'prediction/' + folderNameInput.value
					            })
				        	};

					  		fetch('create_folder.php', request).then(function(response) {
								if(response.ok) {
								  	var path = 'prediction/' + folderNameInput.value;
	    							uploadNewFilesPred(path);
								} else {
									swal({
									    type: 'error',
									    title: 'Oops!',
									    text: 'Server error uploading folder'
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
				} else {
					swal({
					    type: 'error',
					    title: 'Oops!',
					    text: 'Server error uploading folder'
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

function refreshPred() {
	$('body').loadingModal({
	  text: 'Loading...'
	});

	if ($('.tree-dataset-pred').length) {
		$('.tree-dataset-pred').remove();
	};
	if ($('.tree-file-pred').length) {
		$('.tree-file-pred').remove();
	};

	var request = {
		method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'path': 'prediction'})
	};  

	fetch('get_dir_files.php', request).then(function(response) {
		if(response.ok) {
		  	response.json().then(function (r_json) {
		  		var lastDataset = '';
		  		var lastFile = '';
		  		var counterId = 0;
		  		for (var i = 0; i < r_json.length; i++) {
		  			if (r_json[i].split('\\')[1] != lastDataset) {
		  				$('.my-files-path-pred').append('<div onmouseover="colored(this)" onmouseout="noColored(this)" id="pred-my-div-dataset-label-' + counterId + '" class="tree-dataset-pred"><i onclick="clickedPathDatasetPred(this)" id="pred-fa-' + counterId + '" class="fas fa-plus plusminus"></i> <input onclick="checkboxClickedPred()" type="checkbox" class="form-check-input" id="pred-check-' + counterId + '"><label id="pred-my-dataset-label-' + counterId + '" class="pred-dataset-tree my-dataset-path">' + r_json[i].split('\\')[1] + '</label><input onclick="selectAllFilesPred(this)" type="checkbox" class="form-check-input check-all" id="pred-check-all-' + counterId + '" style="margin-left: 20px;"><label style="margin-left: 35px; font-size: 13px; font-style: italic;">Select all files</label><i type="file" onclick="uploadNewImgsPred(this)" id="pred-fa-up-nimg-' + counterId + '" class="class-file-input fa fa-cloud-upload" name="files[]" multiple="" style="margin-left: 20px;" data-toggle="tooltip" data-placement="right" title="Upload a new files to this folder"></i><i onclick="downloadDatasetPred(this)" id="pred-fa-download-dat-' + counterId + '" class="fa fa-cloud-download" style="margin-left: 20px;" data-toggle="tooltip" data-placement="right" title="Download this folder"></i></div>');
		  				counterId += 1;
		  				var lastDataset = r_json[i].split('\\')[1];
		  				var lastFile = '';
		  			}
		  			if (r_json[i].split('\\')[2] != lastFile) {
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
		  					var fileElement = '<div onmouseover="colored(this)" onmouseout="noColored(this)" id="pred-my-div-file-label-' + counterId + '" class="tree-file-pred" ' + tooltip + '><div id="pred-my-div-file-label1-' + counterId + '" style="width:25px;height:25px;position:absolute;margin-left:68px"></div><input onclick="checkboxClickedPred()" type="checkbox" class="form-check-input" id="pred-check-' + counterId + '"><label id="pred-my-file-label-' + counterId + '" class="pred-dataset-tree my-file-path"><i onclick="popupImgPred(this)" id="pred-fa-' + counterId + '" class="fa fa-eye fa-eye-file-dcm"></i><i onclick="popupMetadataPred(this)" id="fa-info-' + counterId + '" class="fa fa-info-circle fa-info-file-dcm"></i>' + r_json[i].split('\\')[2] + '</label><label id="class-pred-label-' + counterId + '" style="margin-left:20px; font-weight:bold;"></label></div>';
		  				}
		  				else {
		  					var fileElement = '<div onmouseover="colored(this)" onmouseout="noColored(this)" id="pred-my-div-file-label-' + counterId + '" class="tree-file-pred" ' + tooltip + '><input onclick="checkboxClickedPred()" type="checkbox" class="form-check-input" id="pred-check-' + counterId + '"><label id="pred-my-file-label-' + counterId + '" class="pred-dataset-tree my-file-path"><i onclick="popupImgPred(this)" id="pred-fa-' + counterId + '" class="fa fa-eye fa-eye-file"></i><i onclick="popupMetadataPred(this)" id="pred-fa-info-' + counterId + '" class="fa fa-info-circle fa-info-file-other"></i> <img id="pred-my-file-img-' + counterId + '" src=' + r_json[i].replace(/ /g, '%20') + ' alt=" " width="25" height="25"> ' + r_json[i].split('\\')[2] + '</label><label id="class-pred-label-' + counterId + '" style="margin-left:20px; font-weight:bold;"></label></div>';
		  				}

		  				$('.my-files-path-pred').append(fileElement);
		  				
		  				counterId += 1;
		  				var lastFile = r_json[i].split('\\')[2];
		  			}
		  		}
		  		if (r_json.length == 0) {
		  			$('#btn-remove-dataset-pred').hide(100);
		  			swal({
					    type: 'info',
					    title: 'Oops!',
					    text: 'No data available'
					});
		  		}
		  	});								  	 
		} else {
			swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Server error retrieving data'
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

function clickedPathDatasetPred(x) {
	$('body').loadingModal({
	  text: 'Loading files...'
	});

	var idThisNumber = x.id.split('-')[x.id.split('-').length-1];
	x = 'pred-my-div-dataset-label-' + idThisNumber;
	var datasetPath = checkWhereItBelongsPred('pred-my-dataset-label-' + idThisNumber);
	var classElements = document.getElementsByClassName('pred-dataset-tree');
	for (var i = 0; i < classElements.length; i++) {
		if (x.replace('-div', '') == classElements[i].id) {
			for (var j = i+1; j < classElements.length; j++) {
				if (classElements[j].id.split('-')[2] == 'file') {
					var idNumber = classElements[j].id.split('-')[classElements[j].id.split('-').length-1];
					if (document.getElementById('pred-my-div-file-label-' + idNumber).style.display === 'block') {
						var flagSetCheck = document.getElementById('pred-check-' + idThisNumber).checked;
						var flagSetCheckAll = document.getElementById('pred-check-all-' + idThisNumber).checked;
						var textPath = document.getElementById(x).innerHTML;
						$('#' + x).html(textPath.replace('fa-minus', 'fa-plus'));
						document.getElementById('pred-check-' + idThisNumber).checked = flagSetCheck;
						document.getElementById('pred-check-all-' + idThisNumber).checked = flagSetCheckAll;
						
						var flagSetCheck = document.getElementById('pred-check-' + idNumber).checked;
						document.getElementById('pred-my-div-file-label-' + idNumber).style['display'] = 'none';
						document.getElementById('pred-check-' + idNumber).checked = flagSetCheck;
					}
					else {
						var flagSetCheck = document.getElementById('pred-check-' + idThisNumber).checked;
						var flagSetCheckAll = document.getElementById('pred-check-all-' + idThisNumber).checked;
						var textPath = document.getElementById(x).innerHTML;
						$('#' + x).html(textPath.replace('fa-plus', 'fa-minus'));
						document.getElementById('pred-check-' + idThisNumber).checked = flagSetCheck;
						document.getElementById('pred-check-all-' + idThisNumber).checked = flagSetCheckAll;

						document.getElementById('pred-my-div-file-label-' + idNumber).style['display'] = 'block';

						//dicom files
						if (document.getElementById('pred-my-div-file-label1-' + idNumber) != null) {
							var fileName = document.getElementById('pred-my-file-label-' + idNumber).innerText;
							var filePath = datasetPath + '/' + fileName;
							downloadAndView('pred-my-div-file-label1-' + idNumber, filePath);
						}
					}
				}
				else if (classElements[j].id.split('-')[2] == 'dataset') {
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

function checkWhereItBelongsPred(myId) {
	var classElements = document.getElementsByClassName('pred-dataset-tree');
	var datasetPath = '';
	for (var i = 0; i < classElements.length; i++) {
		if (classElements[i].id.includes('-dataset-')) {
			datasetPath = 'prediction/' + document.getElementById(classElements[i].id).innerHTML;
			if (classElements[i].id == myId) {return datasetPath;}
		}
		else if (classElements[i].id.includes('-file-')) {
			filePathWithoutFileNameAtTheEnd = datasetPath + '/';
			if (classElements[i].id == myId) {return filePathWithoutFileNameAtTheEnd;}
		}
	}
}

function selectAllFilesPred(x) {
	var idThisNumber = x.id.split('-')[3];
	x = 'pred-my-div-dataset-label-' + idThisNumber;
	var classElements = document.getElementsByClassName('pred-dataset-tree');
	for (var i = 0; i < classElements.length; i++) {
		if (x.replace('-div', '') == classElements[i].id) {
			for (var j = i+1; j < classElements.length; j++) {
				if (classElements[j].id.split('-')[2] == 'file') {
					var flagSetCheck = document.getElementById('pred-check-all-' + idThisNumber).checked;
					document.getElementById('pred-check-' + classElements[j].id.split('-')[classElements[j].id.split('-').length-1]).checked = flagSetCheck;
				}
				else if (classElements[j].id.split('-')[2] == 'dataset') {
					break;
				}
			}
			break;
		}
	}

	checkboxClickedPred();
}

function checkboxClickedPred() {
	var buttonRemoveAppear = false;
	var flagCheck = false;
	var flagCheckAll = false;
	var classElements = document.getElementsByClassName('pred-dataset-tree');
	for (var i = 0; i < classElements.length; i++) {
		var idElemNumber = classElements[i].id.split('-')[classElements[i].id.split('-').length-1];
		if (document.getElementById('pred-check-' + idElemNumber) != null) {flagCheck = document.getElementById('pred-check-' + idElemNumber).checked;}
		if (document.getElementById('pred-check-all-' + idElemNumber) != null) {flagCheckAll = document.getElementById('pred-check-all-' + idElemNumber).checked;}
		if (flagCheck == true || flagCheckAll == true) {
			buttonRemoveAppear = true;
			$('#btn-remove-dataset-pred').show(100);
			break;
		}
	}
	if (buttonRemoveAppear == false) {
		$('#btn-remove-dataset-pred').hide(100);
	}
}

$('#btn-remove-dataset-pred').on('click', function() {
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
	    	var classElements = document.getElementsByClassName('pred-dataset-tree');
			var toRemoveArray = new Array();
			var toRemoveRequestArray = '';
			var datasetPath = '';
			var filePath = '';

			for (var i = 0; i < classElements.length; i++) {
				if (classElements[i].id.includes('-dataset-')) {datasetPath = 'prediction/' + document.getElementById(classElements[i].id).innerHTML;}

				if (document.getElementById('pred-check-' + classElements[i].id.split('-')[classElements[i].id.split('-').length-1]) != null) {
					var flagCheck = document.getElementById('pred-check-' + classElements[i].id.split('-')[classElements[i].id.split('-').length-1]).checked;
					if (flagCheck == true) {
						if (classElements[i].id.includes('-dataset-')) {
							toRemoveRequestArray = toRemoveRequestArray + datasetPath + '|';
						}
						else {
							if (document.getElementById(classElements[i].id.replace('label', 'img')) != null) {
								filePath = 'prediction' + document.getElementById(classElements[i].id.replace('label', 'img')).src.split('prediction')[1];
							}
							else {
								var dirPath = checkWhereItBelongsPred(classElements[i].id);
								filePath = dirPath + document.getElementById(classElements[i].id).innerText;
							}
							filePath = filePath.replace(/%20/g, ' ');
							toRemoveRequestArray = toRemoveRequestArray + filePath + '|';
						}

						toRemoveArray.push($('#' + classElements[i].id).parent()[0].id);

						if (classElements[i].id.includes('-dataset-')) {
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
					document.getElementById('pred-fa-' + classElements[i].id.split('-')[classElements[i].id.split('-').length-1]).style['color'] = '#ffffff00';
				}
			}

			checkIfDatasetIsIsolatedPred();
			checkboxClickedPred();

			var request = {
				method: 'POST',
	            headers: {'Content-Type': 'application/json'},
	            body: JSON.stringify({
	            	'path': toRemoveRequestArray
	            })
	    	};

			//removing folders and files in server
			fetch('remove_pred.php', request).then(function(response) {
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

function checkIfDatasetIsIsolatedPred() {
	var classElements = document.getElementsByClassName('pred-dataset-tree');

	for (var i = 0; i < classElements.length; i++) {
		if (classElements[i].id.includes('-dataset-')) {
			if ((classElements[i+1] != null && classElements[i+1].id.includes('-dataset-')) || i+1 == classElements.length) {
				document.getElementById($('#' + classElements[i].id).parent()[0].id).remove();
			}
		}
	}

	var classElements = document.getElementsByClassName('pred-dataset-tree');
	if (classElements.length == 0) {
		$('#btn-remove-dataset-pred').hide(100);
	}
}

function uploadNewImgsPred(x) {
	var idNumber = x.id.split('-')[x.id.split('-').length-1];
	var subdataset = document.getElementById('pred-my-dataset-label-' + idNumber).innerHTML;
	var path = checkWhereItBelongsPred('pred-my-dataset-label-' + idNumber);

	swal({
		    title: 'Select new files',
		    html: '<label>Upload to:</label><label id="dataset_name">' + path.split('/')[path.split('/').length-1] + '</label>\
		    	<div class="myalert">\
		    		<div class="input-group">\
		    			<label for="new-file" class="custom-file-upload" data-toggle="tooltip" data-placement="right" title="Browse"><i class="fas fa-ellipsis-h"></i></label>\
						<input id="new-file" type="file" class="new-class-file-input" name="files[]" multiple/>\
						<input type="text" class="form-control" id="new-custom-file-label" aria-describedby="new-file" placeholder="Choose files for this folder">\
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
	    uploadNewFilesPred(path);
	})
}

function uploadNewFilesPred(path) {
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
	                        	refreshPred();
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

function downloadDatasetPred(x) {
	var idNumber = x.id.split('-')[x.id.split('-').length-1];
	var dataset_name_to_download = document.getElementById('pred-my-dataset-label-' + idNumber).innerText;
	var dataset_path_to_download = 'prediction/' + dataset_name_to_download;

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
			    text: 'Server error downloading data'
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

function popupImgPred(x) {
	//clean DCM modal
	$('#myModal').empty();
	$('#myModal').append('\
		<span class="close">&times;</span>\
	  	<span id="next-pred" class="next" onclick="nextPred()"><i class="fa fa-chevron-right"></i></span>\
	  	<span id="previous-pred" class="previous" onclick="previousPred()"><i class="fa fa-chevron-left"></i></span>\
	  	<div id="caption"></div>\
	');

	// Get the modal
	var modal = document.getElementById("myModal");

	// Get the image and insert it inside the modal - use its "alt" text as a caption
	var imgIdNumber = x.id.split('-')[x.id.split('-').length-1]

	var captionText = document.getElementById("caption");

	if (document.getElementById('pred-my-div-file-label1-' + imgIdNumber) != null) {
		var datasetPath = checkWhereItBelongsPred('pred-my-file-label-' + imgIdNumber);
		var imgName = document.getElementById('pred-my-file-label-' + imgIdNumber).innerText;
		var filePath = datasetPath + '/' + imgName;

		modal.style.display = "block";
		lastImgDisplayed = 'dcm';

		$('#myModal').append('\
		  	<div class="imgDCM-content" id="imgDCM"></div>\
		');

		downloadAndView('imgDCM', filePath);

		captionText.innerHTML = imgName;

		dataset = datasetPath;
	}
	else {
		lastImgDisplayed = 'other';

		var img = document.getElementById('pred-my-file-img-' + imgIdNumber);
		var imgName = img.src.split('/')[img.src.split('/').length-1];
		imgName = imgName.replace(/%20/g, ' ');

		modal.style.display = "block";
		$('#myModal').append('\
		  	<img class="modal-content" id="img01">\
		');

		var modalImg = document.getElementById("img01");

		modalImg.src = img.src;

		captionText.innerHTML = imgName;

		dataset = img.src.replace('/' + img.src.split('/')[img.src.split('/').length-1], '');
		dataset = dataset.replace(/ /g, '%20');
		dataset = dataset.split('/')[dataset.split('/').length-2] + '/' + dataset.split('/')[dataset.split('/').length-1];
	}

	var request = { 
		method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'path': dataset})
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

function nextPred() {					
	if (dataset != '') {
		if (currentImgIndex + 1 >= img_array.length) {
			currentImgIndex = 0;
		}
		else {
			currentImgIndex += 1;
		}

		var imageName = img_array[currentImgIndex].split('\\')[img_array[currentImgIndex].split('\\').length-1];
		var newImgToShowSrc = dataset + '/' + imageName;
		newImgToShowSrc = newImgToShowSrc.replace('//', '/');

		// Get the modal
		var modal = document.getElementById("myModal");
		var captionText = document.getElementById("caption");

		if (imageName.split('.')[imageName.split('.').length-1] == 'dcm') {
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
		else {
			if (lastImgDisplayed == 'dcm') {
				if (document.getElementById('imgDCM') != null) {document.getElementById('imgDCM').remove();}
			}

			if (lastImgDisplayed == 'dcm') {
				$('#myModal').append('\
				  	<img class="modal-content" id="img01">\
				');
			}

			lastImgDisplayed = 'other';

			var modalImg = document.getElementById("img01");

			modal.style.display = "block";

			modalImg.src = newImgToShowSrc;
			captionText.innerHTML = imageName;
		}

		// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("close")[0];

		// When the user clicks on <span> (x), close the modal
		span.onclick = function() { 
		    modal.style.display = "none";
		}
	}
}

function previousPred() {			
	if (dataset != '') {
		if (currentImgIndex - 1 < 0) {
			currentImgIndex = img_array.length - 1;
		}
		else {
			currentImgIndex -= 1;
		}

		var imageName = img_array[currentImgIndex].split('\\')[img_array[currentImgIndex].split('\\').length-1];
		var newImgToShowSrc = dataset + '/' + imageName;
		newImgToShowSrc = newImgToShowSrc.replace('//', '/');

		// Get the modal
		var modal = document.getElementById("myModal");
		var captionText = document.getElementById("caption");

		if (imageName.split('.')[imageName.split('.').length-1] == 'dcm') {
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
		else {
			if (lastImgDisplayed == 'dcm') {
				if (document.getElementById('imgDCM') != null) {document.getElementById('imgDCM').remove();}
			}

			if (lastImgDisplayed == 'dcm') {
				$('#myModal').append('\
				  	<img class="modal-content" id="img01">\
				');
			}

			lastImgDisplayed = 'other';

			var modalImg = document.getElementById("img01");

			modal.style.display = "block";

			modalImg.src = newImgToShowSrc;
			captionText.innerHTML = imageName;
		}

		// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("close")[0];

		// When the user clicks on <span> (x), close the modal
		span.onclick = function() { 
		    modal.style.display = "none";
		}
	}
}

function popupMetadataPred(x) {
	var imgIdNumber = x.id.split('-')[x.id.split('-').length-1]

	if (document.getElementById('pred-my-div-file-label1-' + imgIdNumber) != null) {
		var datasetPath = checkWhereItBelongsPred('pred-my-file-label-' + imgIdNumber);
		var imgName = document.getElementById('pred-my-file-label-' + imgIdNumber).innerText;
		var filePath = datasetPath + '/' + imgName;
		getMetadata(filePath, imgName);
	}
	else {
		var img = document.getElementById('pred-my-file-img-' + imgIdNumber);
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

var layers2 = false;
$('#btn-pred').on('click', function() {
	var imgPath = getSelectedFiles();
	if (imgPath != '') {
		$('#btn-logs').hide(100);
		cleanPredictedLabels();

		var modelChecking = false;
		layers2 = getLayers2(modelChecking, false, imgPath);
	}
	else {
		swal({
		    type: 'info',
		    title: 'Oops!',
		    text: 'No files selected'
		});
	}
})

function predO(layers2, imgPath) {
	var optimizer = document.getElementById('search-optimizer').value;
	optimizer = valueToTextInOptimizer(optimizer);
	optimizer = optimizer.replace(/ /g, '');
	var weights_path = document.getElementById('select2-search-model-dir-pred-container').innerText.substr(2) + '/' + ' ' + document.getElementById('select2-search-model-weight-pred-container').innerText.substr(2);
	var number_classes = document.getElementById('n-classes').value;

	var request = { 
		method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
        	'layers': layers2,
        	'optimizer': optimizer,
        	'weights_name': weights_path,
        	'path': imgPath,
        	'classes': number_classes
        })
	};

	$('body').loadingModal({
	  text: 'Loading...'
	});

	fetch('prediction_script.php', request).then(function(response) {
		if(response.ok) {
			response.text().then(function (text) {
		  		$('body').loadingModal('destroy');
		  		if (text != '') {
		  			var predictions = text.split('\n');
		  			predictions.shift();
		  			predictions.shift();
		  			predictions.shift();
		  			predictions.shift();
		  			predictions.pop();

		  			if (predictions.length > 0) {
		  				$('#btn-logs').show(100);
			  			for (var i = 0; i < predictions.length; i++) {
			  				var filePredicted = predictions[i].split(' => ')[0];
			  				var prediction = predictions[i].split(' => ')[1];
			  				var classElements = document.getElementsByClassName('pred-dataset-tree');
							for (var j = 0; j < classElements.length; j++) {
								var dirPath = checkWhereItBelongsPred(classElements[j].id);
								filePath = dirPath + document.getElementById(classElements[j].id).innerText.substr(2);
								if (filePath == filePredicted) {
									//console.log(classElements[j].id + ' | ' + filePredicted + ' | ' + prediction);
									var idNumber = classElements[j].id.split('-')[classElements[j].id.split('-').length-1];
									document.getElementById('class-pred-label-' + idNumber).innerText = prediction;
								}
							}

			  			}
			  		}
			  		else {
			  			swal({
						    type: 'error',
						    title: 'Oops!',
						    text: 'Something is wrong, check images and model dimensions'
						});
			  		}
		  		}
		  		else {
		  			swal({
					    type: 'error',
					    title: 'Oops!',
					    text: 'Something is wrong, check images and model dimensions'
					});
		  		}
		  });
		} else {
			$('body').loadingModal('destroy');
			swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Server error predicting data'
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

function cleanPredictedLabels() {
	var classElements = document.getElementsByClassName('pred-dataset-tree');

	for (var i = 0; i < classElements.length; i++) {
		var idNumber = classElements[i].id.split('-')[classElements[i].id.split('-').length-1];
		if (document.getElementById('class-pred-label-' + idNumber) != null) {
			document.getElementById('class-pred-label-' + idNumber).innerText = '';
		}
	}
}

function getSelectedFiles() {
	var classElements = document.getElementsByClassName('pred-dataset-tree');
	var toPredictArray = '';
	var datasetPath = '';
	var filePath = '';

	for (var i = 0; i < classElements.length; i++) {
		if (classElements[i].id.includes('-dataset-')) {datasetPath = 'prediction/' + document.getElementById(classElements[i].id).innerHTML;}

		if (document.getElementById('pred-check-' + classElements[i].id.split('-')[classElements[i].id.split('-').length-1]) != null) {
			var flagCheck = document.getElementById('pred-check-' + classElements[i].id.split('-')[classElements[i].id.split('-').length-1]).checked;
			if (flagCheck == true) {
				if (document.getElementById(classElements[i].id.replace('label', 'img')) != null) {
					filePath = 'prediction' + document.getElementById(classElements[i].id.replace('label', 'img')).src.split('prediction')[1];
				}
				else {
					var dirPath = checkWhereItBelongsPred(classElements[i].id);
					filePath = dirPath + document.getElementById(classElements[i].id).innerText;
				}
				filePath = filePath.replace(/%20/g, ' ');
				toPredictArray = toPredictArray + filePath + '|';
			}
		}
	}

	return toPredictArray;
}

function getLayers2(modelChecking=false, datasetChecking=true, imgPath='') {
	layers2 = false;
	var model_name_to_load = document.getElementById('select2-search-model-dir-pred-container').innerText.substr(22);

	if (datasetChecking == false || document.getElementById('search-dataset').value != null && document.getElementById('search-dataset').value != '') {
		if (model_name_to_load == '') {
			layers2 = checkModel();
			if (modelChecking == true) {modelChecked(layers2);}
			predO(layers2, imgPath);
		}
		else if (model_name_to_load == 'All-CNN') {
			// link: https://github.com/PAN001/All-CNN
			layers2 = 'All-CNN#Conv2D-ReLU-3-3-3-1-1-Same-l1--Conv2D-ReLU-96-3-3-1-1-Same-l2--Conv2D-ReLU-96-3-3-2-2-Same-l3--Dropout-0.5-None-l4--Conv2D-ReLU-192-3-3-1-1-Same-l5--Conv2D-ReLU-192-3-3-1-1-Same-l6--Conv2D-ReLU-192-3-3-2-2-Same-l7--Dropout-0.5-None-l8--Conv2D-ReLU-192-3-3-1-1-Valid-l9--Conv2D-ReLU-192-1-1-1-1-Same-l10--Conv2D-ReLU-192-1-1-1-1-Same-l11--GlobalAveragePooling2D-l12--Activation-Softmax-l13--';
			if (modelChecking == true) {modelChecked(layers2);}
			predO(layers2, imgPath);
		}
		else if (model_name_to_load == 'InceptionV3') {
			layers2 = 'InceptionV3#';
			if (modelChecking == true) {modelChecked(layers2);}
			predO(layers2, imgPath);
		}
		else if (model_name_to_load == 'LeNet') {
			// LeNet
			layers2 = 'LeNet#Conv2D-ReLU-64-3-3-1-1-Same-l1--MaxPool2D-3-3-2-2-Same-l2--Conv2D-ReLU-128-3-3-1-1-Same-l3--MaxPool2D-3-3-2-2-Same-l4--Dropout-0.1-None-l5--Flatten-l6--Dense-ReLU-256-l7--Dense-ReLU-256-l8--Dropout-0.5-None-l9--Dense-Softmax-2-l10--';
			if (modelChecking == true) {modelChecked(layers2);}
			predO(layers2, imgPath);
		}
		else if (model_name_to_load == 'MobileNet') {
			layers2 = 'MobileNet#';
			if (modelChecking == true) {modelChecked(layers2);}
			predO(layers2, imgPath);
		}
		else if (model_name_to_load == 'SqueezeNet') {
			// SqueezeNet
			layers2 = 'SqueezeNet#Conv2D-ReLU-64-3-3-2-2-Valid-l1--MaxPool2D-3-3-2-2-Same-l2--Dropout-0.1-None-l3--Fire_function-ReLU-16-64-1-1-1-1-Valid-l4--Fire_function-ReLU-16-64-1-1-1-1-Valid-l5--MaxPool2D-3-3-2-2-Same-l6--Dropout-0.1-None-l7--Fire_function-ReLU-32-128-1-1-1-1-Valid-l8--Fire_function-ReLU-32-128-1-1-1-1-Valid-l9--MaxPool2D-3-3-2-2-Same-l10--Dropout-0.1-None-l11--Fire_function-ReLU-48-192-1-1-1-1-Valid-l12--Fire_function-ReLU-48-192-1-1-1-1-Valid-l13--Fire_function-ReLU-64-256-1-1-1-1-Valid-l14--Fire_function-ReLU-64-256-1-1-1-1-Valid-l15--Conv2D-ReLU-2-1-1-1-1-Valid-l16--GlobalAveragePooling2D-l17--Activation-Softmax-l18--';
			if (modelChecking == true) {modelChecked(layers2);}
			predO(layers2, imgPath);
		}
		else if (model_name_to_load == 'VGG16') {
			layers2 = 'VGG16#';
			if (modelChecking == true) {modelChecked(layers2);}
			predO(layers2, imgPath);
		}
		else {
			// this is for all saved models

			var request = { 
				method: 'POST',
	            headers: {'Content-Type': 'application/json'},
	            body: JSON.stringify({
	            	'name': model_name_to_load
	            })
        	};

			fetch('get_model.php', request).then(function(response) {
				if(response.ok) {
					response.text().then(function (text) {
					  	layers2 = text;
					  	if (modelChecking == true) {modelChecked(layers2);}
					  	predO(layers2, imgPath);
					});
				} else {
					layers2 = false;
					if (modelChecking == true) {modelChecked(layers2);}
					swal({
					    type: 'error',
					    title: 'Oops!',
					    text: 'Error retrieving model'
					});
					return layers2
				}
			})
			.catch(function(error) {
				layers2 = false;
				if (modelChecking == true) {modelChecked(layers2);}
				swal({
					    type: 'error',
					    title: 'Oops!',
					    text: 'Network error'
					});
				return layers2
			});
		}
		return layers2
	}
	else {
		swal({
		    type: 'error',
		    title: 'Dataset error!',
		    text: 'Please select a valid dataset'
		});
		return layers2
	}
}

$('#btn-logs').on('click', function() {
	var request = {
		method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
        	'name': 'prediction',
        	'path': 'prediction_logs'
        })
	};

	$('body').loadingModal({
	  text: 'Zipping prediction log file...'
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
			    text: 'Server error downloading prediction logs'
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
})