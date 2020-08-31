import os
import sys
import cv2
import dicom
import pydicom
import PIL
import numpy as np
from keras import Input
from keras.models import load_model, Model
from keras.layers import Activation, BatchNormalization, Conv2D, Dense, Dropout, Flatten, GlobalAveragePooling2D, MaxPool2D, concatenate
from keras.applications.inception_v3 import InceptionV3
from keras.applications import MobileNet
from keras.applications.vgg16 import VGG16
from training import getClasses
from sklearn.metrics import confusion_matrix, roc_curve, auc, classification_report
import matplotlib.pyplot as plt
import seaborn as sns
path = os.getcwd().replace('\\', '/')

def saveToFile(line):
	print(line)
	#file = open(path + '/output/output.log', 'a') # from cmd
	#file = open(path + '/scripts/python/output/output.log', 'a') # from php
	#file.write(line)
	#file.close()

def fire_module(x, layer_name='', squeeze=16, expand=64, activation='relu', kernel_height=1, kernel_width=1, stride_height=1, stride_width=1, padding='valid'):
	sq1x1 = "squeeze1x1"
	exp1x1 = "expand1x1"
	exp3x3 = "expand3x3"
	s_id = 'fire_' + str(layer_name) + '/'

	# x = Conv2D(squeeze, (kernel_height, kernel_width), strides=(stride_height, stride_width), padding=padding, name = s_id + sq1x1, activation=activation)(x)
	# left = Conv2D(expand, (kernel_height, kernel_width), strides=(stride_height, stride_width), padding=padding, name = s_id + exp1x1, activation=activation)(x)
	# right = Conv2D(expand, (3, 3), strides=(stride_height, stride_width), padding='same', name = s_id + exp3x3, activation=activation)(x)
	x = Conv2D(squeeze, (kernel_height, kernel_width), padding=padding, name = s_id + sq1x1, activation=activation)(x)
	left = Conv2D(expand, (kernel_height, kernel_width), padding=padding, name = s_id + exp1x1, activation=activation)(x)
	right = Conv2D(expand, (3, 3), padding='same', name = s_id + exp3x3, activation=activation)(x)
	x = concatenate([left, right], name = s_id + 'concat')
	return x

def create(layers, optimizer, dataset):
	model_name = layers.split('#')[0]
	layers_list = layers.split('#')[1].split('--')

	classPath = path.replace('/scripts/python', '') + '/uploads/' + dataset
	classes = os.listdir(classPath)
	number_of_classes = len(classes)
	imgs = os.listdir(classPath + '/' + classes[0])
	if imgs[0].split('.')[-1] == 'dcm': im = parse(classPath + '/' + classes[0] + '/' + imgs[0])
	else: im = cv2.imread(classPath + '/' + classes[0] + '/' + imgs[0], 0)
	imshape0 = im.shape[0]
	imshape1 = im.shape[1]
	input_format=(imshape0, imshape1, 1)

	inputs = Input(shape=input_format, name='Input')

	try:
		if dataset != '':
			# checking the last layer that provides the number of classes
			last_layer_index = len(layers_list)-1
			for i in range(len(layers_list)):
				if layers_list[i].split('-')[0] == 'Conv2D' or layers_list[i].split('-')[0] == 'Dense':
					last_layer_index = i

			if model_name == 'InceptionV3':
				model = InceptionV3(weights=None, classes=number_of_classes, input_shape=input_format)
				saveToFile('Using predefined model: InceptionV3\n')
			elif model_name == 'MobileNet':
				model = MobileNet(weights=None, classes=number_of_classes, input_shape=input_format, dropout = 0.3)
				saveToFile('Using predefined model: MobileNet\n')
			elif model_name == 'VGG16':
				model = VGG16(weights=None, classes=number_of_classes, input_shape=input_format)
				saveToFile('Using predefined model: VGG16\n')
			else:
				saveToFile('Layers:\n')
				counter = 0
				for layer in layers_list:
					if layer.split('-')[0] == 'Activation':
						act_func = layer.split('-')[1].lower()
						layer_name = layer.split('-')[2].lower()
						if counter == 0:
							x = Activation(act_func, name=layer_name)(inputs)
						else:
							x = Activation(act_func, name=layer_name)(x)
						saveToFile('    x = Activation(' + act_func + ', name=' + layer_name + ')(x)\n')
					elif layer.split('-')[0] == 'BatchNormalization':
						axis = int(layer.split('-')[1])
						layer_name = layer.split('-')[2].lower()
						if counter == 0:
							x = BatchNormalization(axis=axis)(inputs)
						else:
							x = BatchNormalization(axis=axis)(x)
						saveToFile('    x = BatchNormalization(axis=' + str(axis) + ')(x)\n')
					elif layer.split('-')[0] == 'Conv2D':
						act_func = layer.split('-')[1].lower()
						filters = int(layer.split('-')[2])
						kernel_height = int(layer.split('-')[3])
						kernel_width = int(layer.split('-')[4])
						stride_height = int(layer.split('-')[5])
						stride_width = int(layer.split('-')[6])
						padding = layer.split('-')[7].lower()
						layer_name = layer.split('-')[8].lower()
						if counter == 0:
							x = Conv2D(filters, (kernel_height, kernel_width), strides=(stride_height, stride_width), padding=padding, name=layer_name, activation=act_func)(inputs)
						else:
							if counter == last_layer_index:
								filters = number_of_classes
							x = Conv2D(filters, (kernel_height, kernel_width), strides=(stride_height, stride_width), padding=padding, name=layer_name, activation=act_func)(x)
						saveToFile('    x = Conv2D(' + str(filters) + ', (' + str(kernel_height) + ', ' + str(kernel_width) + '), strides=(' + str(stride_height) + ', ' + str(stride_width) + '), padding=' + padding + ', name=' + layer_name + ', activation=' + act_func + ')(x)\n')
					elif layer.split('-')[0] == 'Dense':
						act_func = layer.split('-')[1].lower()
						units = int(layer.split('-')[2])
						layer_name = layer.split('-')[3].lower()
						if counter == 0:
							x = Dense(units, activation=act_func, name=layer_name)(inputs)
						else:
							if counter == last_layer_index:
								units = number_of_classes
							x = Dense(units, activation=act_func, name=layer_name)(x)
						saveToFile('    x = Dense(' + str(units) + ', activation=' + act_func + ', name=' + layer_name + ')(x)\n')
					elif layer.split('-')[0] == 'Dropout':
						rate = float(layer.split('-')[1])
						seed = layer.split('-')[2]
						layer_name = layer.split('-')[3].lower()
						if seed != 'None':
							if counter == 0:
								x = Dropout(rate=rate, seed=int(seed))(inputs)
							else:
								x = Dropout(rate=rate, seed=int(seed))(x)
							saveToFile('    x = Dropout(' + str(rate) + ', seed=' + seed + ')(x)\n')
						else:
							if counter == 0:
								x = Dropout(rate=rate)(inputs)
							else:
								x = Dropout(rate=rate)(x)
							saveToFile('    x = Dropout(' + str(rate) + ')(x)\n')
					elif layer.split('-')[0] == 'Fire_function':
						act_func = layer.split('-')[1].lower()
						filters_squeezed = int(layer.split('-')[2])
						filters_expanded = int(layer.split('-')[3])
						kernel_height = int(layer.split('-')[4])
						kernel_width = int(layer.split('-')[5])
						stride_height = int(layer.split('-')[6])
						stride_width = int(layer.split('-')[7])
						padding = layer.split('-')[8].lower()
						layer_name = layer.split('-')[9].lower()
						if counter == 0:
							x = fire_module(inputs, layer_name, squeeze=filters_squeezed, expand=filters_expanded, activation=act_func, kernel_height=kernel_height, kernel_width=kernel_width, stride_height=stride_height, stride_width=stride_width, padding=padding)
						else:
							x = fire_module(x, layer_name, squeeze=filters_squeezed, expand=filters_expanded, activation=act_func, kernel_height=kernel_height, kernel_width=kernel_width, stride_height=stride_height, stride_width=stride_width, padding=padding)
						saveToFile('    fire_module(x, ' + layer_name + ', squeeze=' + str(filters_squeezed) + ', expand=' + str(filters_expanded) + ', activation=' + act_func + ', kernel_height=' + str(kernel_height) + ', kernel_width=' + str(kernel_width) + ', stride_height=' + str(stride_height) + ', stride_width=' + str(stride_width) + ', padding=' + padding + ')\n')
					elif layer.split('-')[0] == 'Flatten':
						layer_name = layer.split('-')[1].lower()              
						if counter == 0:
							x = Flatten()(inputs)
						else:
							x = Flatten()(x)
						saveToFile('    x = Flatten()(x)\n')
					elif layer.split('-')[0] == 'GlobalAveragePooling2D':
						layer_name = layer.split('-')[1].lower()              
						if counter == 0:
							x = GlobalAveragePooling2D()(inputs)
						else:
							x = GlobalAveragePooling2D()(x)
						saveToFile('    x = GlobalAveragePooling2D()(x)\n')
					elif layer.split('-')[0] == 'MaxPool2D':
						pool_height = int(layer.split('-')[1])
						pool_width = int(layer.split('-')[2])
						stride_height = int(layer.split('-')[3])
						stride_width = int(layer.split('-')[4])
						padding = layer.split('-')[5].lower()
						layer_name = layer.split('-')[6].lower()               
						if counter == 0:
							x = MaxPool2D(pool_size=(pool_height, pool_width), strides=(stride_height, stride_width), padding=padding, name=layer_name)(inputs)
						else:
							x = MaxPool2D(pool_size=(pool_height, pool_width), strides=(stride_height, stride_width), padding=padding, name=layer_name)(x)
						saveToFile('    x = MaxPool2D(pool_size=(' + str(pool_height) + ', ' + str(pool_width) + '), strides=(' + str(stride_height) + ', ' + str(stride_width) + '), padding=' + padding + ', name=' + layer_name + ')(x)\n')

					counter += 1

				model = Model(inputs=inputs, outputs=x)
			model.compile(optimizer=optimizer, loss='binary_crossentropy', metrics=['accuracy'])

			saveToFile('Model built successfully\n')

			data, labels = getClasses(path.replace('/scripts/python', '') + '/uploads/' + dataset) # from cmd
			print(data.shape)
			print(labels.shape)
			return model, data, labels

	except Exception as e:
		saveToFile(str(e) + '\n')

def loadWeights(model, src):
	model.load_weights(filepath=src)
	return model

def predictData(model_weights, x):
	prediction = model_weights.predict(x)
	return prediction

def translate_output(output):
	#This method interprets the model output.
	#It returns the diagnostic and its probability.

	for i in range(output.shape[0]):
		index_max_prob = np.argmax(output[i])
		for j in range(output.shape[1]):
			if j != index_max_prob:
				output[i][j] = 0
			else:
				output[i][j] = 1
	return output

def one_hot_decode_labels(array):
	list_of_different_rows = []
	output = []
	for i in range(array.shape[0]):
		if array[i].tolist() not in list_of_different_rows:
			list_of_different_rows.append(array[i].tolist())
		output.append(list_of_different_rows.index(array[i].tolist()))
	return output, list_of_different_rows

def one_hot_decode_prediction(array, decode_list):
	output = []
	for i in range(array.shape[0]):
		output.append(decode_list.index(array[i].tolist()))
	return output

if __name__ == '__main__':
	try:
		#layers = 'LeNet#Conv2D-ReLU-64-3-3-1-1-Same-l1--MaxPool2D-3-3-2-2-Same-l2--Conv2D-ReLU-128-3-3-1-1-Same-l3--MaxPool2D-3-3-2-2-Same-l4--Dropout-0.1-None-l5--Flatten-l6--Dense-ReLU-256-l7--Dense-ReLU-256-l8--Dropout-0.5-None-l9--Dense-Softmax-2-l10--';
		#optimizer = 'Adam'
		#dataset = 'dataset1'
		#weights_name = '2020-07-29 12-44-12 LeNet/ epoch(05)-acc(1.00)-val_acc(0.50)-loss(0.43)-val_loss(0.79).kras'

		layers = sys.argv[1]
		optimizer = sys.argv[2]
		dataset = sys.argv[3]
		weights_name = sys.argv[4].split('.data-')[0]

		model, data, labels = create(layers, optimizer, dataset)	
		model_weights = loadWeights(model, path.replace('/scripts/python', '') + '/models/' + weights_name)
		prediction = predictData(model_weights, data)
		pred_one_hot = translate_output(prediction)
		#print(prediction)
		print(pred_one_hot)
		print()
		print(labels)
		labels_decode, decode_list = one_hot_decode_labels(labels)
		pred_one_hot_decode = one_hot_decode_prediction(pred_one_hot, decode_list)
		print('Prediction: ', pred_one_hot_decode)
		print('Real label: ', labels_decode)

		mat = confusion_matrix(labels_decode, pred_one_hot_decode)
		#mat = np.round(mat / mat.astype(np.float).sum(axis=0) *100)
		#mat = mat.astype(int)
		fig = plt.figure(figsize=(6, 6))
		rect = fig.patch
		rect.set_facecolor("#6c757d")
		sns.set()
		sns.heatmap(mat.T, square=True, annot=True, fmt='', cbar=False, xticklabels='auto', cmap="Blues")
		x_label = plt.xlabel('True classes')
		x_label.set_color('white')
		y_label = plt.ylabel('Predicted classes')
		y_label.set_color('white')
		#print('Figure: ', path.replace('/scripts/python', '') + '/c_matrix/' + 'confusion_matrix.png')
		fig.savefig(path.replace('/scripts/python', '') + '/c_matrix/' + 'confusion_matrix.png', facecolor=fig.get_facecolor())
		#plt.show()

		mat = confusion_matrix(labels_decode, pred_one_hot_decode)
		mat = np.round(mat / mat.astype(np.float).sum(axis=1)[:,None] *100)
		mat = mat.astype(int)
		fig = plt.figure(figsize=(6, 6))
		rect = fig.patch
		rect.set_facecolor("#6c757d")
		sns.set()
		sns.heatmap(mat.T, square=True, annot=True, fmt='', cbar=False, xticklabels='auto', cmap="Blues")
		x_label = plt.xlabel('True classes (%)')
		x_label.set_color('white')
		y_label = plt.ylabel('Predicted classes (%)')
		y_label.set_color('white')
		#print('Figure: ', path.replace('/scripts/python', '') + '/c_matrix/' + 'confusion_matrix.png')
		fig.savefig(path.replace('/scripts/python', '') + '/c_matrix/' + 'confusion_matrix_percentage.png', facecolor=fig.get_facecolor())
		#plt.show()

		# # Calculating ROC curve and ROC AUC.
		# false_positive_rate, true_positive_rate, thresholds = roc_curve(labels_decode, pred_one_hot_decode)
		# roc_auc = auc(false_positive_rate, true_positive_rate)
		# # Plotting ROC curve.
		# fig = plt.figure(figsize=(6, 6))
		# rect = fig.patch
		# rect.set_facecolor("#6c757d")
		# lw = 2
		# plt.plot(false_positive_rate, true_positive_rate, color='blue', lw=lw, label='ROC curve (area = {:.4f})'.format(roc_auc))
		# plt.plot([0, 1], [0, 1], color='red', lw=lw, linestyle='--', label='Random classifier')
		# plt.xlabel('False positive rate')
		# plt.ylabel('True positive rate')
		# x_label = plt.xlabel('False positive rate')
		# x_label.set_color('white')
		# y_label = plt.ylabel('True positive rate')
		# y_label.set_color('white')
		# plt.title('ROC')
		# plt.legend(loc="best")
		# #plt.show()
		# fig.savefig(path.replace('/scripts/python', '') + '/c_matrix/' + 'roc.png', facecolor=fig.get_facecolor())
		# #plt.show()

		file = open(path.replace('/scripts/python', '') + '/c_matrix/report.log', 'w')
		report = classification_report(labels_decode, pred_one_hot_decode, output_dict=True)
		print(report)
		print()
		table = ''
		for row in report:
			row_str = str(row)
			for column in report[row]:
				#print(report[row][column])
				row_str = row_str + '|' + str(report[row][column])
			table = table + row_str + '\n'
		file.write(str(table))
		file.close()

	except Exception as e:
		print(str(e))