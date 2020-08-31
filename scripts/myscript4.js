$('#card-evaluation').hide();
$('#btn-remove-model-dir').hide();
$('#btn-remove-model-weight').hide();
$('#model-weight').hide();
$('#btn-graphs').hide();
$('#btn-matrix').hide();
//$('#btn-roc').hide();
$('#btn-metrics').hide();
$('#btn-graphs-clear').hide();
$('#btn-matrix-clear').hide();
//$('#btn-roc-clear').hide();
$('#btn-metrics-clear').hide();
$('#heatmaps-div').hide();

var validationExist = false;

var train_acc = new Array();
var val_acc = new Array();
var train_loss = new Array();
var val_loss = new Array();

var train_accA = new Array();
var val_accA = new Array();
var train_lossA = new Array();
var val_lossA = new Array();

var metrics = '';

$('#btn-evaluation').on('click', function() {
	newDatasetCardClose();
	showDatasetCardClose();
	trainingCardClose();
	predictionCardClose();

	document.getElementsByClassName('select2-search__field')[0].style['width'] = '215px';
	var wasVisible = $("#card-evaluation").is(":visible");
	if (wasVisible) {
		$('#card-evaluation').slideUp(200);
		document.getElementById('btn-evaluation').style['border-color'] = 'rgb(108, 117, 125)';
		document.getElementById('card-evaluation').style['border-color'] = 'rgb(108, 117, 125)';					
	}
	else {
		$('#card-evaluation').slideDown(0); 
		document.getElementById('btn-evaluation').style['border-color'] = 'rgb(255, 255, 255)';
		document.getElementById('card-evaluation').style['border-color'] = 'rgb(255, 255, 255)';
	}
})

function evaluationCardClose() {
	var wasVisible = $("#card-evaluation").is(":visible");
	if (wasVisible) {
		$('#card-evaluation').slideUp(0);
		document.getElementById('btn-evaluation').style['border-color'] = 'rgb(108, 117, 125)';
		document.getElementById('card-evaluation').style['border-color'] = 'rgb(108, 117, 125)';					
	}
}

var startHide = '';
function modelDirChanged(x) {
	
	if (document.getElementById(x.id).value == '') {
		startHide = new Date();
		$('#btn-remove-model-dir').hide(100);
		$('#model-weight').hide(100);
		$('#btn-graphs').hide(100);
		$('#btn-matrix').hide(100);
		//$('#btn-roc').hide(100);
		$('#btn-metrics').hide(100);
		$('#heatmaps-div').hide(100);
		document.getElementById('heatmaps').checked = false;
		document.getElementsByClassName('select2-search__field')[0].style['width'] = '215px';
	}
	else if (document.getElementById(x.id).value.length > 0) {
		$('#btn-remove-model-weight').hide(100);
		$('#btn-graphs').show(100);
		$('#btn-matrix').hide(100);
		//$('#btn-roc').hide(100);
		$('#btn-metrics').hide(100);
		$('#heatmaps-div').hide(100);
		document.getElementById('heatmaps').checked = false;

		if (document.getElementsByClassName('select2-selection__choice') != null && document.getElementsByClassName('select2-selection__choice').length == 1) {
			$('#btn-remove-model-dir').show(100);
			document.getElementById('select2-search-model-weight-container').innerText = 'Select trained model for evaluation ';
			document.getElementById('select2-search-model-weight-container').style['color'] = 'gray';
			$('#search-model-weight').empty();
			$('#search-model-weight').append('<option value="">Select trained model for evaluation </option>');
			
			setTimeout(function(){ 
				if (startHide == '') {
					$('#model-weight').show(100);
					//$('#btn-matrix').show(100);
					//$('#btn-metrics').show(100);
				}
				else {
					var endHide = new Date();
					if (endHide - startHide > 50) {
						startHide == '';
						$('#model-weight').show(100);
						//$('#btn-matrix').show(100);
						//$('#btn-metrics').show(100);
					}
				}
			}, 50);
			//document.getElementById('select2-search-model-dir-container').style['color'] = 'black';

			train_accA = new Array();
			val_accA = new Array();
			train_lossA = new Array();
			val_lossA = new Array();
			
			validationExist = false;
			getWeightData(document.getElementsByClassName('select2-selection__choice')[0].innerText.substr(1), document.getElementsByClassName('select2-selection__choice').length, 0, train_accA, train_lossA, val_accA, val_lossA);
		}
		else {
			//$('#btn-remove-model-dir').hide(100);
			$('#model-weight').hide(100);
			//$('#btn-matrix').hide(100);
			//$('#btn-metrics').hide(100);

			train_accA = new Array();
			val_accA = new Array();
			train_lossA = new Array();
			val_lossA = new Array();

			validationExist = false;
			getWeightData(document.getElementsByClassName('select2-selection__choice')[0].innerText.substr(1), document.getElementsByClassName('select2-selection__choice').length, 0, train_accA, train_lossA, val_accA, val_lossA);
		}
	}
}

function getWeightData(weight_name, len, ind, train_accA, train_lossA, val_accA, val_lossA) {
	//console.log(document.getElementsByClassName('select2-selection__choice')[ind].innerText.substr(1));
	var request = { 
		method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
        	'model': weight_name
        })
	};

	fetch('trained_model_weights.php', request).then(function(response) {
		train_acc = new Array();
	  	val_acc = new Array();
	  	train_loss = new Array();
	  	val_loss = new Array();
		if(response.ok) {
			response.text().then(function (text) {
			  	var savedModelWeight = text.split('|');
			  	train_acc = new Array(savedModelWeight.length);
			  	val_acc = new Array(savedModelWeight.length);
			  	train_loss = new Array(savedModelWeight.length);
			  	val_loss = new Array(savedModelWeight.length);
			  	train_acc[0] = weight_name;
			  	val_acc[0] = weight_name;
			  	train_loss[0] = weight_name;
			  	val_loss[0] = weight_name;
			  	for (var i = 0; i < savedModelWeight.length-1; i++) {
			  		$('#search-model-weight').append('<option id="' + savedModelWeight[i] + '" value="' + savedModelWeight[i] + '">' + savedModelWeight[i] + '</option>');
			  		//console.log(savedModelWeight[i]);
			  		var index = parseInt(savedModelWeight[i].split('epoch(')[1].split(')')[0]);
			  		var t_acc = parseFloat(savedModelWeight[i].split('-acc(')[1].split(')')[0]);
			  		var t_loss = parseFloat(savedModelWeight[i].split('-loss(')[1].split(')')[0]);
			  		train_acc[index] = t_acc;
			  		train_loss[index] = t_loss;
			  		if (savedModelWeight[i].includes('-val_acc') && savedModelWeight[i].includes('-val_loss')) {
			  			validationExist = true;
			  			var v_acc = parseFloat(savedModelWeight[i].split('-val_acc(')[1].split(')')[0]);
			  			var v_loss = parseFloat(savedModelWeight[i].split('-val_loss(')[1].split(')')[0]);
			  			val_acc[index] = v_acc;
			  			val_loss[index] = v_loss;
			  		}
			  	}
			  	train_accA.push(train_acc);
				train_lossA.push(train_loss);
				val_accA.push(val_acc);
				val_lossA.push(val_loss);
				len -= 1;
				ind += 1;
				if (len > 0) {
					getWeightData(document.getElementsByClassName('select2-selection__choice')[ind].innerText.substr(1), len, ind, train_accA, train_lossA, val_accA, val_lossA);
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

function modelWeightChanged(x) {
	if (document.getElementById(x.id).value == '') {
		$('#btn-remove-model-weight').hide(100);
		//$('#btn-graphs').hide(100);
		$('#btn-matrix').hide(100);
		//$('#btn-roc').hide(100);
		$('#btn-metrics').hide(100);
		$('#heatmaps-div').hide(100);
		document.getElementById('heatmaps').checked = false;
		//$('#btn-matrix-clear').hide(100);
		//if (document.getElementById('matrix_img') != null) {document.getElementById('matrix_img').remove();}
		//if (document.getElementById('matrix_img_p') != null) {document.getElementById('matrix_img_p').remove();}
	}
	else if (document.getElementById(x.id).value.length > 0) {
		$('#btn-remove-model-weight').show(100);
		$('#btn-graphs').show(100);
		$('#btn-matrix').show(100);
		//$('#btn-roc').show(100);
		$('#btn-metrics').show(100);
		$('#heatmaps-div').show(100);
		document.getElementById('heatmaps').checked = false;
		document.getElementById('select2-search-model-weight-container').style['color'] = 'black';
	}
}

function getGraphData(list, name, id) {
	var listLength = 0;
	var longerListIndex = 0;
	var myData = [];
	for (var i = 0; i < list.length; i++) {
		if (list[i][1] != null) {
			if (list[i].length > listLength) {listLength = list[i].length; longerListIndex = i;}
			var myDataPoints = [];
			for (var j = 1; j < list[i].length; j++) {
				myDataPoints.push({ x: j, y: list[i][j]});
			}
			myData.push({type:"line", name: list[i][0], showInLegend: true, markerSize: 0, dataPoints: myDataPoints});
		}
	}

	var stockChart = new CanvasJS.StockChart(id,{
		theme: 'dark2',
	    title:{
	      text: name
	    },
	    animationEnabled: true,
	    exportEnabled: true,
	    charts: [{
	      axisX: {
	      	title: "Epochs",
	      	interval: 1,
	        crosshair: {
	          enabled: true,
	          snapToDataPoint: true
	        }
	      },
	      axisY: {
	        crosshair: {
	          enabled: true,
	          //snapToDataPoint: true
	        }
	      },
	      legend: {
				cursor: "pointer",
				itemmouseover: function(e) {
					e.dataSeries.lineThickness = e.chart.data[e.dataSeriesIndex].lineThickness * 2;
					e.dataSeries.markerSize = e.chart.data[e.dataSeriesIndex].markerSize + 2;
					e.chart.render();
				},
				itemmouseout: function(e) {
					e.dataSeries.lineThickness = e.chart.data[e.dataSeriesIndex].lineThickness / 2;
					e.dataSeries.markerSize = e.chart.data[e.dataSeriesIndex].markerSize - 2;
					e.chart.render();
				},
				itemclick: function (e) {
					if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
						e.dataSeries.visible = false;
					} else {
						e.dataSeries.visible = true;
					}
					e.chart.render();
				}
			},
	      toolTip: {
			  shared: true
		  },
	      data: myData
	    }],    
	    rangeSelector: {
	      inputFields: {
	        startValue: 1,
	        endValue: list[longerListIndex].length-1,
	        valueFormatString: "###0"
	      },
	      
	      buttons: [{
	        label: parseInt(list[longerListIndex].length/4),
	        range: parseInt(list[longerListIndex].length/4),
	        rangeType: "number"
	      },{
	        label: parseInt(list[longerListIndex].length*2/4),
	        range: parseInt(list[longerListIndex].length*2/4),
	        rangeType: "number"
	      },{
	        label: parseInt(list[longerListIndex].length*3/4),
	        range: parseInt(list[longerListIndex].length),
	        rangeType: "number"
	      },{
	        label: "All",        
	        rangeType: "all"
	      }]
	    }
	  });

	  stockChart.render();
}

function checkList(list) {
	for (var i = 0; i < list.length; i++) {
		if (list[i].length <= 1) {
			return true;
		}
	}
	return false;
}

$('#btn-graphs').on('click', function() {
	if (document.getElementById('train-acc-char') != null) {document.getElementById('train-acc-char').remove();}
	if (document.getElementById('train-loss-char') != null) {document.getElementById('train-loss-char').remove();}
	if (document.getElementById('val-acc-char') != null) {document.getElementById('val-acc-char').remove();}
	if (document.getElementById('val-loss-char') != null) {document.getElementById('val-loss-char').remove();}
	
	var ok = false;

	train_acc_error = checkList(train_accA);
	train_loss_error = checkList(train_lossA);
	val_acc_error = checkList(val_accA);
	val_loss_error = checkList(val_lossA);

	if (train_acc_error == false && train_loss_error == false) {
		$('#chars').append('\
			<div id="train-acc-char" style="height: 450px; width: 100%; margin-top: 10px;"></div>\
			<div id="train-loss-char" style="height: 450px; width: 100%; margin-top: 10px;"></div>');
		getGraphData(train_accA, 'Train accuracy', 'train-acc-char');
		getGraphData(train_lossA, 'Train loss', 'train-loss-char');
		ok = true;
	}
	else {
		swal({
		    type: 'error',
		    title: 'Oops!',
		    text: 'Some trained model directories are empty'
		});
	}

	if (validationExist == true) {
		if (val_acc_error == false && val_loss_error == false) {
			$('#chars').append('\
				<div id="val-acc-char" style="height: 450px; width: 100%; margin-top: 10px;"></div>\
				<div id="val-loss-char" style="height: 450px; width: 100%; margin-top: 10px;"></div>');
			getGraphData(val_accA, 'Validation accuracy', 'val-acc-char');
			getGraphData(val_lossA, 'Validation loss', 'val-loss-char');
			ok = true;
		}
		else {
			swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Some trained model directories are empty'
			});
		}
	}
	if (ok == true) {$('#btn-graphs-clear').show(100);}
});

$('#btn-graphs-clear').on('click', function() {
	if (document.getElementById('train-acc-char') != null) {document.getElementById('train-acc-char').remove();}
	if (document.getElementById('train-loss-char') != null) {document.getElementById('train-loss-char').remove();}
	if (document.getElementById('val-acc-char') != null) {document.getElementById('val-acc-char').remove();}
	if (document.getElementById('val-loss-char') != null) {document.getElementById('val-loss-char').remove();}
	$('#btn-graphs-clear').hide(100);
});

$('#btn-remove-model-dir').on('click', function() {
	swal({
	title: 'Remove selected directories',
	text: 'Are you sure?',
	type: 'warning',
	showCancelButton: true,
	confirmButtonColor: '#3085d6',
	cancelButtonColor: '#d33',
	confirmButtonText: 'Yes, remove them!'
	}).then((result) => {
	    if (result.value) {
	    	$('#model-weight').hide(100);
			$('#btn-remove-model-weight').hide(100);
			$('#btn-matrix').hide(100);
			//$('#btn-roc').hide(100);
			$('#btn-metrics').hide(100);
			$('#heatmaps-div').hide(100);
			document.getElementById('heatmaps').checked = false;

			var model_dir_names = '';

			for (var i = 0; i < document.getElementsByClassName('select2-selection__choice').length; i++) {
				model_dir_names = model_dir_names + document.getElementsByClassName('select2-selection__choice')[i].innerText.substr(1) + '|';
				if (document.getElementsByClassName('select2-selection__choice')[i].innerText.substr(1) == document.getElementById('select2-search-model-dir-pred-container').innerText.substr(2)) {
				}
			}

			var request = { 
				method: 'POST',
		        headers: {'Content-Type': 'application/json'},
		        body: JSON.stringify({
		        	'models': model_dir_names
		        })
			};

			fetch('remove_model_dirs.php', request).then(function(response) {
				if(response.ok) {
					$('#search-model-dir').empty();
					//$('#search-model-dir').append('<option value="">Select directory for evaluation </option>');
					//document.getElementById('select2-selection__choice')[0].innerText = 'Select directory for evaluation ';
					//document.getElementById('select2-selection__choice')[0].style['color'] = 'gray';

		  			document.getElementById('select2-search-model-dir-pred-container').innerText = 'Select directory for prediction ';
					document.getElementById('select2-search-model-dir-pred-container').style['color'] = 'gray';
					$('#search-model-dir-pred').empty();
					$('#search-model-dir-pred').append('<option value="">Select directory for prediction </option>');
					$('#btn-pred').hide(100);

					document.getElementById('select2-search-model-weight-pred-container').innerText = 'Select trained model for prediction ';
					document.getElementById('select2-search-model-weight-pred-container').style['color'] = 'gray';
					$('#search-model-weight-pred').empty();
					$('#search-model-weight-pred').append('<option value="">Select trained model for prediction </option>');

					fetch('trained_model_dirs.php').then(function(response) {
						if(response.ok) {
							response.text().then(function (text) {
							  	var savedModelDirs = text.split('|');
							  	for (var i = 0; i < savedModelDirs.length-1; i++) {
							  		$('#search-model-dir').append('<option id="' + savedModelDirs[i] + '" value="' + savedModelDirs[i] + '">' + savedModelDirs[i] + '</option>');
							  		$('#search-model-dir-pred').append('<option id="' + savedModelDirs[i] + '" value="' + savedModelDirs[i] + '">' + savedModelDirs[i] + '</option>');
							  	}
							});
						} else {
						}
					})
					.catch(function(error) {
					});

					swal({
					    type: 'success',
					    title: 'Done!',
					    text: 'Model directories removed successfully'
					});
				} else {
					swal({
					    type: 'error',
					    title: 'Oops!',
					    text: 'Error removing trained model directories'
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
});

$('#btn-remove-model-weight').on('click', function() {
	swal({
	title: 'Remove selected trained model',
	text: 'Are you sure?',
	type: 'warning',
	showCancelButton: true,
	confirmButtonColor: '#3085d6',
	cancelButtonColor: '#d33',
	confirmButtonText: 'Yes, remove it!'
	}).then((result) => {
	    if (result.value) {
	    	$('#btn-remove-model-weight').hide(100);
			$('#btn-matrix').hide(100);
			//$('#btn-roc').hide(100);
			$('#btn-metrics').hide(100);
			$('#heatmaps-div').hide(100);
			document.getElementById('heatmaps').checked = false;

			var weight = ' ' + document.getElementById('select2-search-model-weight-container').innerText.substr(2);
			var model_dir_name = document.getElementsByClassName('select2-selection__choice')[0].innerText.substr(1);

			var request = {
				method: 'POST',
		        headers: {'Content-Type': 'application/json'},
		        body: JSON.stringify({
		        	'weight': weight,
		        	'model_dir': model_dir_name
		        })
			};

			fetch('remove_weight.php', request).then(function(response) {
				if(response.ok) {
					if (document.getElementsByClassName('select2-selection__choice') != null && document.getElementsByClassName('select2-selection__choice').length == 1) {
						$('#btn-remove-model-dir').show(100);
						document.getElementById('select2-search-model-weight-container').innerText = 'Select trained model for evaluation ';
						document.getElementById('select2-search-model-weight-container').style['color'] = 'gray';
						$('#search-model-weight').empty();
						$('#search-model-weight').append('<option value="">Select trained model for evaluation </option>');

						document.getElementById('select2-search-model-weight-pred-container').innerText = 'Select trained model for prediction ';
						document.getElementById('select2-search-model-weight-pred-container').style['color'] = 'gray';
						$('#search-model-weight-pred').empty();
						$('#search-model-weight-pred').append('<option value="">Select trained model for prediction </option>');
						
						setTimeout(function(){ 
							if (startHide == '') {
								$('#model-weight').show(100);
								//$('#btn-matrix').show(100);
								//$('#btn-metrics').show(100);
							}
							else {
								var endHide = new Date();
								if (endHide - startHide > 50) {
									startHide == '';
									$('#model-weight').show(100);
									//$('#btn-matrix').show(100);
									//$('#btn-metrics').show(100);
								}
							}
						}, 50);
						//document.getElementById('select2-search-model-dir-container').style['color'] = 'black';

						getWeightDataPred(document.getElementById('select2-search-model-dir-pred-container').innerText.substr(2));

						train_accA = new Array();
						val_accA = new Array();
						train_lossA = new Array();
						val_lossA = new Array();
						
						validationExist = false;
						getWeightData(document.getElementsByClassName('select2-selection__choice')[0].innerText.substr(1), document.getElementsByClassName('select2-selection__choice').length, 0, train_accA, train_lossA, val_accA, val_lossA);
					}

					swal({
					    type: 'success',
					    title: 'Done!',
					    text: 'Trained model removed successfully'
					});
				} else {
					swal({
					    type: 'error',
					    title: 'Oops!',
					    text: 'Error removing trained model'
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
});

var matrix = false;
var metrics = false;
var heatmapsVar = false;

$('#btn-matrix').on('click', function() {
	var modelChecking = false;
	matrix = true;
	layers = getLayers1(modelChecking);

	// if (layers != false) {
		
	// }
	// else {
	// 	swal({
	// 	    type: 'error',
	// 	    title: 'Oops!',
	// 	    text: 'Please select a valid dataset in the "show dataset" section'
	// 	});
	// }
});

function matrixO(layers) {
	$('body').loadingModal({
	  text: 'Loading...'
	});

	var optimizer = document.getElementById('search-optimizer').value;
	optimizer = valueToTextInOptimizer(optimizer);
	optimizer = optimizer.replace(/ /g, '');
	var dataset = document.getElementById('select2-search-dataset-container').innerText.substr(1);
	var weights_path = document.getElementsByClassName('select2-selection__choice')[0].innerText.substr(1) + '/' + ' ' + document.getElementById('select2-search-model-weight-container').innerText.substr(2);

	var request = {
		method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
        	'layers': layers,
        	'optimizer': optimizer,
        	'dataset': dataset,
        	'weights_name': weights_path
        })
	};

	fetch('evaluation_script.php', request).then(function(response) {
		if(response.ok) {
			response.text().then(function (text) {
				$('body').loadingModal('destroy');
				if (document.getElementById('matrix_img') != null) {document.getElementById('matrix_img').remove();}
				if (document.getElementById('matrix_img_p') != null) {document.getElementById('matrix_img_p').remove();}
				$('#matrix').append('<img id="matrix_img" src="c_matrix/confusion_matrix.png" alt="matrix" style="width:50%;">');
				$('#matrix').append('<img id="matrix_img_p" src="c_matrix/confusion_matrix_percentage.png" alt="matrix_p" style="width:50%;">');
				$('#btn-matrix-clear').show(100);
			});
		} else {
			$('body').loadingModal('destroy');
			swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Server error building confusion matrix'
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

$('#btn-matrix-clear').on('click', function() {
	if (document.getElementById('matrix_img') != null) {document.getElementById('matrix_img').remove();}
	if (document.getElementById('matrix_img_p') != null) {document.getElementById('matrix_img_p').remove();}
	$('#btn-matrix-clear').hide(100);
});

$('#btn-metrics').on('click', function() {
	var modelChecking = false;
	metrics = true;
	layers = getLayers1(modelChecking);

	// if (layers != false) {
		
	// }
	// else {
	// 	swal({
	// 	    type: 'error',
	// 	    title: 'Oops!',
	// 	    text: 'Please select a valid dataset in the "show dataset" section'
	// 	});
	// }
});

function metricsO(layers) {
	$('body').loadingModal({
	  text: 'Loading...'
	});

	var optimizer = document.getElementById('search-optimizer').value;
	optimizer = valueToTextInOptimizer(optimizer);
	optimizer = optimizer.replace(/ /g, '');
	var dataset = document.getElementById('select2-search-dataset-container').innerText.substr(1);
	var weights_path = document.getElementsByClassName('select2-selection__choice')[0].innerText.substr(1) + '/' + ' ' + document.getElementById('select2-search-model-weight-container').innerText.substr(2);

	var request = { 
		method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
        	'layers': layers,
        	'optimizer': optimizer,
        	'dataset': dataset,
        	'weights_name': weights_path
        })
	};

	fetch('evaluation_script.php', request).then(function(response) {
		if(response.ok) {
			response.text().then(function (text) {
				$('body').loadingModal('destroy');
				if (document.getElementById('metrics-table') != null) {document.getElementById('metrics-table').remove();}
				metrics = text;
				var rows = metrics.split('\n');
				html_rows = '';
				for (var i = 0; i < rows.length; i++) {
					elements = rows[i].split('|');
					if (elements.length > 1) {
						for (var j = 0; j < elements.length; j++) {
							if (j == 0) {
								html_rows = html_rows + '<tr><th scope="row">' + elements[j] + '</th>';
							}
							else {
								html_rows = html_rows + '<td>' + elements[j] + '</td>';
							}
						}
						html_rows = html_rows + '</tr>';
					}
				}

				$('#metrics').append('\
					<table id="metrics-table" class="table table-dark">\
					  <thead class="thead-dark">\
					    <tr>\
					      <th scope="col"></th>\
					      <th scope="col">Precision</th>\
					      <th scope="col">Recall</th>\
					      <th scope="col">F1-score</th>\
					      <th scope="col">Support</th>\
					    </tr>\
					  </thead>\
					  <tbody>' + html_rows + '</tbody>\
					</table>\
				');
				$('#btn-metrics-clear').show(100);
			});
		} else {
			$('body').loadingModal('destroy');
			swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Server error retrieving metrics'
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

$('#btn-metrics-clear').on('click', function() {
	if (document.getElementById('metrics-table') != null) {document.getElementById('metrics-table').remove();}
	$('#btn-metrics-clear').hide(100);
});

// $('#btn-roc').on('click', function() {
// 	var modelChecking = false;
// 	layers = getLayers1(modelChecking);

// 	if (layers != false) {
// 		$('body').loadingModal({
// 		  text: 'Loading...'
// 		});

// 		var optimizer = document.getElementById('search-optimizer').value;
// 		optimizer = valueToTextInOptimizer(optimizer);
//		optimizer = optimizer.replace(/ /g, '');
// 		var dataset = document.getElementById('select2-search-dataset-container').innerText.substr(1);
// 		var weights_path = document.getElementsByClassName('select2-selection__choice')[0].innerText.substr(1) + '/' + ' ' + document.getElementById('select2-search-model-weight-container').innerText.substr(2);

// 		var request = { 
// 			method: 'POST',
// 	        headers: {'Content-Type': 'application/json'},
// 	        body: JSON.stringify({
// 	        	'layers': layers,
// 	        	'optimizer': optimizer,
// 	        	'dataset': dataset,
// 	        	'weights_name': weights_path
// 	        })
// 		};

// 		fetch('evaluation_script.php', request).then(function(response) {
// 			if(response.ok) {
// 				response.text().then(function (text) {
// 					$('body').loadingModal('destroy');
// 					if (document.getElementById('roc_img') != null) {document.getElementById('roc_img').remove();}
// 					$('#roc').append('<img id="roc_img" src="c_matrix/roc.png" alt="roc" style="width:50%;">');
// 					$('#btn-roc-clear').show(100);
// 				});
// 			} else {
// 				$('body').loadingModal('destroy');
// 				swal({
// 				    type: 'error',
// 				    title: 'Oops!',
// 				    text: 'Server error building roc curve'
// 				});
// 			}
// 		})
// 		.catch(function(error) {
// 			$('body').loadingModal('destroy');
// 			swal({
// 				    type: 'error',
// 				    title: 'Oops!',
// 				    text: 'Network error'
// 				});
// 		});
// 	}
// 	else {
// 		swal({
// 		    type: 'error',
// 		    title: 'Oops!',
// 		    text: 'Please select a valid dataset in the "show dataset" section'
// 		});
// 	}
// });

// $('#btn-roc-clear').on('click', function() {
// 	if (document.getElementById('roc_img') != null) {document.getElementById('roc_img').remove();}
// 	$('#btn-roc-clear').hide(100);
// });

function heatmaps(imgPath='', imageName='') {
	var modelChecking = false;
	heatmapsVar = true;
	layers = getLayers1(modelChecking, false, imgPath, imageName);
}

function heatmapsO(layers, imgPath, imageName) {
	var optimizer = document.getElementById('search-optimizer').value;
	optimizer = valueToTextInOptimizer(optimizer);
	optimizer = optimizer.replace(/ /g, '');
	var dataset = imgPath.split('/')[imgPath.split('/').length-3];
	var weights_path = document.getElementsByClassName('select2-selection__choice')[0].innerText.substr(1) + '/' + ' ' + document.getElementById('select2-search-model-weight-container').innerText.substr(2);

	var request = { 
		method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
        	'layers': layers,
        	'optimizer': optimizer,
        	'dataset': dataset,
        	'weights_name': weights_path,
        	'path': imgPath
        })
	};

	$('body').loadingModal({
	  text: 'Creating heatmaps...'
	});

	fetch('heatmaps_script.php', request).then(function(response) {
		if(response.ok) {
		  	$('body').loadingModal('destroy');

		  	var modal = document.getElementById("myModal");
		  	modal.style.display = "block";

		  	if (document.getElementById('caption1') != null) {
		  		document.getElementById('caption1').remove();
		  	}
		  	if (document.getElementById('img01') != null) {
		  		document.getElementById('img01').remove();
		  	}

		  	if (document.getElementById('caption2') != null) {
		  		document.getElementById('caption2').remove();
		  	}
		  	if (document.getElementById('img02') != null) {
		  		document.getElementById('img02').remove();
		  	}

		  	if (document.getElementById('caption3') != null) {
		  		document.getElementById('caption3').remove();
		  	}
		  	if (document.getElementById('img03') != null) {
		  		document.getElementById('img03').remove();
		  	}

		  	if (document.getElementById('caption4') != null) {
		  		document.getElementById('caption4').remove();
		  	}
		  	if (document.getElementById('img04') != null) {
		  		document.getElementById('img04').remove();
		  	}

		  	if (document.getElementById('caption5') != null) {
		  		document.getElementById('caption5').remove();
		  	}
		  	if (document.getElementById('img05') != null) {
		  		document.getElementById('img05').remove();
		  	}

		  	if (imageName != '') {
		  		var captionText = document.getElementById("caption"); 
		  		captionText.innerHTML = imageName;
		  	}

		  	$('#myModal').append('\
		  		<div class="caption-for-modal" id="caption1"></div>\
			  	<img class="modal-content" id="img01" style="margin-bottom: 20px;">\
			');

			document.getElementById("caption1").innerText = 'Activation';

			$('#myModal').append('\
				<div class="caption-for-modal" id="caption2"></div>\
			  	<img class="modal-content" id="img02" style="margin-bottom: 20px;">\
			');

			document.getElementById("caption2").innerText = 'Saliency vanilla';

			$('#myModal').append('\
				<div class="caption-for-modal" id="caption3"></div>\
			  	<img class="modal-content" id="img03" style="margin-bottom: 20px;">\
			');

			document.getElementById("caption3").innerText = 'Saliency guided';

			$('#myModal').append('\
				<div class="caption-for-modal" id="caption4"></div>\
			  	<img class="modal-content" id="img04" style="margin-bottom: 20px;">\
			');

			document.getElementById("caption4").innerText = 'Saliency relu';

			$('#myModal').append('\
				<div class="caption-for-modal" id="caption5"></div>\
			  	<img class="modal-content" id="img05">\
			');

			document.getElementById("caption5").innerText = 'Cam';

		  	var modalImg1 = document.getElementById("img01");
		  	var modalImg2 = document.getElementById("img02");
		  	var modalImg3 = document.getElementById("img03");
		  	var modalImg4 = document.getElementById("img04");
		  	var modalImg5 = document.getElementById("img05");
		  	
		  	var timestamp = new Date();
		  	modalImg1.src = 'heatmaps/activation.png?dummy=' + timestamp;
		  	modalImg2.src = 'heatmaps/saliency.png?dummy=' + timestamp;
		  	modalImg3.src = 'heatmaps/saliency_guided.png?dummy=' + timestamp;
		  	modalImg4.src = 'heatmaps/saliency_relu.png?dummy=' + timestamp;
		  	modalImg5.src = 'heatmaps/cam.png?dummy=' + timestamp;
		} else {
			$('body').loadingModal('destroy');
			swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Server error creating heatmaps'
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

function getLayers1(modelChecking=false, datasetChecking=true, imgPath='', imageName='') {
	layers = false;
	model_name_to_load = document.getElementsByClassName('select2-selection__choice')[0].innerText.substr(21);

	if (datasetChecking == false || document.getElementById('search-dataset').value != null && document.getElementById('search-dataset').value != '') {
		if (model_name_to_load == '') {
			layers = checkModel();
			if (modelChecking == true) {modelChecked(layers);}
			if (matrix == true) {
		  		matrix = false;
				matrixO(layers);
			}
			else if (metrics == true) {
				metrics = false;
				metricsO(layers);
			}
			else if (heatmapsVar == true) {
				heatmapsVar = false;
				heatmapsO(layers, imgPath, imageName);
			}
		}
		else if (model_name_to_load == 'All-CNN') {
			// link: https://github.com/PAN001/All-CNN
			layers = 'All-CNN#Conv2D-ReLU-3-3-3-1-1-Same-l1--Conv2D-ReLU-96-3-3-1-1-Same-l2--Conv2D-ReLU-96-3-3-2-2-Same-l3--Dropout-0.5-None-l4--Conv2D-ReLU-192-3-3-1-1-Same-l5--Conv2D-ReLU-192-3-3-1-1-Same-l6--Conv2D-ReLU-192-3-3-2-2-Same-l7--Dropout-0.5-None-l8--Conv2D-ReLU-192-3-3-1-1-Valid-l9--Conv2D-ReLU-192-1-1-1-1-Same-l10--Conv2D-ReLU-192-1-1-1-1-Same-l11--GlobalAveragePooling2D-l12--Activation-Softmax-l13--';
			if (modelChecking == true) {modelChecked(layers);}
			if (matrix == true) {
		  		matrix = false;
				matrixO(layers);
			}
			else if (metrics == true) {
				metrics = false;
				metricsO(layers);
			}
			else if (heatmapsVar == true) {
				heatmapsVar = false;
				heatmapsO(layers, imgPath, imageName);
			}
		}
		else if (model_name_to_load == 'InceptionV3') {
			layers = 'InceptionV3#';
			if (modelChecking == true) {modelChecked(layers);}
			if (matrix == true) {
		  		matrix = false;
				matrixO(layers);
			}
			else if (metrics == true) {
				metrics = false;
				metricsO(layers);
			}
			else if (heatmapsVar == true) {
				heatmapsVar = false;
				heatmapsO(layers, imgPath, imageName);
			}
		}
		else if (model_name_to_load == 'LeNet') {
			// LeNet
			layers = 'LeNet#Conv2D-ReLU-64-3-3-1-1-Same-l1--MaxPool2D-3-3-2-2-Same-l2--Conv2D-ReLU-128-3-3-1-1-Same-l3--MaxPool2D-3-3-2-2-Same-l4--Dropout-0.1-None-l5--Flatten-l6--Dense-ReLU-256-l7--Dense-ReLU-256-l8--Dropout-0.5-None-l9--Dense-Softmax-2-l10--';
			if (modelChecking == true) {modelChecked(layers);}
			if (matrix == true) {
		  		matrix = false;
				matrixO(layers);
			}
			else if (metrics == true) {
				metrics = false;
				metricsO(layers);
			}
			else if (heatmapsVar == true) {
				heatmapsVar = false;
				heatmapsO(layers, imgPath, imageName);
			}
		}
		else if (model_name_to_load == 'MobileNet') {
			layers = 'MobileNet#';
			if (modelChecking == true) {modelChecked(layers);}
			if (matrix == true) {
		  		matrix = false;
				matrixO(layers);
			}
			else if (metrics == true) {
				metrics = false;
				metricsO(layers);
			}
			else if (heatmapsVar == true) {
				heatmapsVar = false;
				heatmapsO(layers, imgPath, imageName);
			}
		}
		else if (model_name_to_load == 'SqueezeNet') {
			// SqueezeNet
			layers = 'SqueezeNet#Conv2D-ReLU-64-3-3-2-2-Valid-l1--MaxPool2D-3-3-2-2-Same-l2--Dropout-0.1-None-l3--Fire_function-ReLU-16-64-1-1-1-1-Valid-l4--Fire_function-ReLU-16-64-1-1-1-1-Valid-l5--MaxPool2D-3-3-2-2-Same-l6--Dropout-0.1-None-l7--Fire_function-ReLU-32-128-1-1-1-1-Valid-l8--Fire_function-ReLU-32-128-1-1-1-1-Valid-l9--MaxPool2D-3-3-2-2-Same-l10--Dropout-0.1-None-l11--Fire_function-ReLU-48-192-1-1-1-1-Valid-l12--Fire_function-ReLU-48-192-1-1-1-1-Valid-l13--Fire_function-ReLU-64-256-1-1-1-1-Valid-l14--Fire_function-ReLU-64-256-1-1-1-1-Valid-l15--Conv2D-ReLU-2-1-1-1-1-Valid-l16--GlobalAveragePooling2D-l17--Activation-Softmax-l18--';
			if (modelChecking == true) {modelChecked(layers);}
			if (matrix == true) {
		  		matrix = false;
				matrixO(layers);
			}
			else if (metrics == true) {
				metrics = false;
				metricsO(layers);
			}
			else if (heatmapsVar == true) {
				heatmapsVar = false;
				heatmapsO(layers, imgPath, imageName);
			}
		}
		else if (model_name_to_load == 'VGG16') {
			layers = 'VGG16#';
			if (modelChecking == true) {modelChecked(layers);}
			if (matrix == true) {
		  		matrix = false;
				matrixO(layers);
			}
			else if (metrics == true) {
				metrics = false;
				metricsO(layers);
			}
			else if (heatmapsVar == true) {
				heatmapsVar = false;
				heatmapsO(layers, imgPath, imageName);
			}
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
					  	layers = text;
					  	if (modelChecking == true) {modelChecked(layers);}

					  	$('body').loadingModal({
						  text: 'Loading...'
						});

					  	if (matrix == true) {
					  		matrix = false;
							matrixO(layers);
						}
						else if (metrics == true) {
							metrics = false;
							metricsO(layers);
						}
						else if (heatmapsVar == true) {
							heatmapsVar = false;
							heatmapsO(layers, imgPath, imageName);
						}
					});
				} else {
					layers = false;
					if (modelChecking == true) {modelChecked(layers);}
					swal({
					    type: 'error',
					    title: 'Oops!',
					    text: 'Error retrieving model'
					});
					return layers
				}
			})
			.catch(function(error) {
				layers = false;
				if (modelChecking == true) {modelChecked(layers);}
				swal({
					    type: 'error',
					    title: 'Oops!',
					    text: 'Network error'
					});
				return layers
			});
		}
		return layers
	}
	else {
		swal({
		    type: 'error',
		    title: 'Dataset error!',
		    text: 'Please select a valid dataset in the "show dataset" section'
		});
		return layers
	}
}