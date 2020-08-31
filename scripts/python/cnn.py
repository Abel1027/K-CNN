from keras import Input
from keras.models import Model, load_model
from keras.preprocessing.image import ImageDataGenerator
from keras.callbacks import ModelCheckpoint, ReduceLROnPlateau, LearningRateScheduler, EarlyStopping
from time import localtime
import os
from keras.callbacks import Callback
import numpy as np
import matplotlib.pyplot as plt
dirPath = os.getcwd().replace('\\', '/')

def saveToFile(line):
	print(line)
	file = open(dirPath + '/scripts/python/output/output.log', 'a')
	file.write(line)
	file.close()

class Models:

	def __init__(self, model_name = 'Model'):
		self.model_name = model_name

	def saveModel(self, dst = None):
		if dst == None: dst = self.model_name + ' modelo.kras'
		self.model.save(filepath = dst)

	def saveWeights(self, dst = None):
		if dst == None: dst = self.model_name + ' weights.kras'
		self.model.save_weights(dst)

	def loadModel(self, src):
		self.model = load_model(filepath = src)

	def loadWeights(self, src):
		self.model.load_weights(filepath = src)

	def train(self, x, y, epochs, val_data=None, batch_size=32, check='val_loss', dataset_folder='default'):
		saveToFile('\nTraining...\n')

		self.path = dirPath + '/models'

		#If there is validation data it creates a file with .kras extension with the specified shape below.
		if val_data != None:
			path = self.path + '/' + self.model_name + ' epoch({epoch:02d})-acc({acc:.2f})-val_acc({val_acc:.2f})-loss({loss:.2f})-val_loss({val_loss:.2f}).kras'
			val = True
		else:
			#If there is not validation data it creates a file with .kras extension with the specified shape below.
			path = self.path + '/' + self.model_name + ' epoch({epoch:02d})-acc({acc:.2f})-loss({loss:.2f}).kras'
			check = 'acc' #Cipher that will be monitored.
			val = False

		#It saves the model after every epoch in dependence of the monitored parameter ("check").
		checkpoint = ModelCheckpoint(filepath=path, monitor=check, verbose=0, save_weights_only=True,
									 save_best_only=False, mode='auto', period=1)

		Hist = Log(self.path, val=val) #It creates a file with name "history.log" inside date folder on trained model
							  #directories.

		#It adapts the input and output datasets to the current model to train in a static way. It establishes extra
		#parameters.
		self.hist = self.model.fit(x=x, y=y, epochs=epochs,
										batch_size=batch_size,
										validation_data=val_data, callbacks=[checkpoint, Hist])

		date = localtime() #It obtains the local date and time.
		file = self.path + '/model_logs/' + str(date.tm_min) + '.log' #It will creates a file with .log extension on trained model
		#directories.
		write = open(file, 'w') #It opens the new created file and it establishes write mode.

		epoch = 1 #First epoch.
		try:
		#If there is a validation dataset -> In every iteration (every epoch) where it was saved the next parameters...
			for (acc,val_acc,loss,val_loss) in zip(self.hist.history['acc'],
				self.hist.history['val_acc'], self.hist.history['loss'],
				self.hist.history['val_loss']):
					write.writelines('Epoch:' + str(epoch)+ '\n') #It writes the current data epoch in the file with
																  #.log extension.
					write.writelines('acc:' + str(acc) + ' val_acc:' + str(val_acc) + ' loss:' + str(loss) + ' val_loss:' + str(val_loss) + '\n')
					epoch += 1 #Next epoch.

		except KeyError:
		#If there is not a validation dataset -> In every iteration (every epoch) where it was saved the next parameters...
			for (acc, loss) in zip(self.hist.history['acc'],
				self.hist.history['loss']):
					write.writelines('Epoch:' + str(epoch) + '\n') #It writes the current data epoch in the file with .log
															   #extension.
					write.writelines('acc:' + str(acc) + ' loss:' + str(loss) + '\n')
					epoch += 1
		write.close() #It closes the file with .log extension where were saved all data parameters of every training epoch.

	def trainGenerator(self, x, y, epochs, batch_size = 32,
						  val_data = None, check = 'val_loss',
						  save_better = False, folder_name = None, dataset_folder = 'default'):

		self.path = tree(self.model_name, folder_name, dataset_folder = dataset_folder) #It gets the path to the folder with name related to date inside
													   #the trained model folder.
		if val_data != None:
			#If there is validation data it creates a file with .kras extension with the specified shape below.
			path = self.path + '/' + self.model_name + ' epoch({epoch:02d})-acc({acc:.2f})-val_acc({val_acc:.2f})-loss({loss:.2f})-val_loss({val_loss:.2f}).kras'
			is_val = True #"is_val" is 'True' when there is a validation dataset.
		else:
			#If there is not validation data it creates a file with .kras extension with the specified shape below.
			path = self.path + '/' + self.model_name + ' epoch({epoch:02d})-acc({acc:.2f})-loss({loss:.2f}).kras'
			if 'val' in check: check = 'loss' #If "check" is asigned with "val" parameter then "check" is reassigned
			#"lost" cipher to be monitored.
			is_val = False #"is_val" is 'False' when there is not a validation dataset.

		#It reduces the model learning ratio in dependence of the parameter to monitor ("check").
		RLR = ReduceLROnPlateau(monitor = check, factor = 0.5, patience = 5, verbose = 0, mode = 'auto',
										epsilon = 0.0001, cooldown = 0, min_lr = 0.0001)

		#It saves the model after every epoch in dependence of the parameter to monitor ("check").
		CP =  ModelCheckpoint(filepath = path, monitor = check, verbose = 0, save_weights_only = True,
									 save_best_only = save_better, mode = 'auto', period = 1)

		#It stops training when the monitored parameter ("check") has left get better.
		Early = EarlyStopping(monitor = 'loss', patience = 100, verbose = True)

		#Model learning ratio scheduler.
		LR = LearningRateScheduler(setLr)

		BM = Best_mean2(cycles = 100, check = 'val_loss')

		LRR = Lr_reset()

		Mine = Best_with_lr_reset(10)

		Hist = Log(self.path, is_val) #It creates a file with name "history.log" inside date folder on trained model
									  #directories.

		#Mod = SaveWeights(self,self.path,2)

		Graph = Graphics(self.path, epochs, is_val)

		if 'callbacks' not in dir(self): self.callbacks = [CP, Hist, Graph, LR, Early] #"callbacks" that will be used
																					   #during dynamically training.

		#It adapts the input and output datasets to the current model to train in a dynamical way. It establishes extra
		#parameters.
		self.hist = self.model.fit_generator(self.generator.flow(x, y, batch_size),
								  steps_per_epoch = len(x) / batch_size,
								  epochs = epochs, validation_data = val_data, callbacks = self.callbacks)

	def evaluateModel(self, x, y):
		print('')
		print('Evaluating...')
		print('--------------------')

		write_eval = open('media/evaluation.eval', 'w') #GUI.

		self.evaluation = self.model.evaluate(x = x, y = y)
		for (name, value) in zip(self.model.metrics_names, self.evaluation):
			print(name, value)
			write_eval.writelines(name + ": " + str(value) + '\n')

	def predictData(self,x):
		print('')
		print('Predicting...')
		print('--------------------')
		self.prediction = self.model.predict(x)

		write_pred = open('media/prediction.pred', 'w') #GUI.

		for c,pred in enumerate(self.prediction):
			diagnostic, probability = translate_output(pred)
			print('Case: #' + str(c + 1))
			write_pred.writelines('Case: #'+ str(c + 1) + '\n')
			print ('Diagnostic: ' + str(diagnostic) + '\nProbabilidad: %.2f' %(probability) + '\n')
			write_pred.writelines('Diagnostic: ' + str(diagnostic) + '\nProbability: %.2f' %(probability) + '\n\n')

		return self.prediction

	#Change to two simultaneous graphics, not just one.
	def graphic(self):
		plt.figure(0)
		plt.plot(self.hist.history['acc'])
		plt.plot(self.hist.history['val_acc'])
		plt.title('Model precision')
		plt.ylabel('Precision')
		plt.xlabel('epoch')
		plt.legend(['Training', 'Validation'], loc = 'lower right')
		plt.show()
		print('Training precision: ' + str(self.hist.history['acc'][-1]))
		print('Validation precision: ' + str(self.hist.history['val_acc'][-1]))

		plt.figure(1)
		plt.plot(self.hist.history['loss'])
		plt.plot(self.hist.history['val_loss'])
		plt.title('Loss function')
		plt.ylabel('Loss')
		plt.xlabel('epoch')
		plt.legend(['Training', 'Validation'], loc = 'lower right')
		plt.show()
		print('Training loss: ' + str(self.hist.history['loss'][-1]))
		print('Validation loss: '+ str(self.hist.history['val_loss'][-1]))

def tree(model, folder_name = None, base = 'trained_models', dataset_folder = 'default'):
	#It builds the directories tree to stores the training weights.

	date = localtime() #It obtains the local date and time.
	start = ''
	if folder_name != None: start = str(folder_name)+' ' #If "folder_name" is not 'None' the "start" variable will get
														 #the value passed as parameter to "folder_name".

	#"date" will has this shape: 'start'-minute-hour-day-month.
	date = start + str(date.tm_min) + '-' + str(date.tm_hour) + '-' + str(date.tm_mday) + '-' + str(date.tm_mon)

	if exist(base):
		if exist(model, base):
			if exist(dataset_folder, base + '/' + model):
				if exist(date, base + '/' + model + '/' + dataset_folder):
					pass
				else:
					os.mkdir(base + '/' + model + '/' + dataset_folder + '/' + date)
			else:
				os.mkdir(base + '/' + model + '/' + dataset_folder)
				os.mkdir(base + '/' + model + '/' + dataset_folder + '/' + date) #If there is not the folder with the
																				  #name stored in "date" it creates the
																				  #folder with that name in that path
																				  #(Inside the current trained model
																				  #folder).
		else:
			os.mkdir(base + '/' + model) #If there is not the folder with the current model name inside "trained_models"
										 #folder it creates that folder in that path.
			os.mkdir(base + '/' + model + '/' + dataset_folder)
			os.mkdir(base + '/' + model + '/' + dataset_folder + '/' + date) #It creates the folder with the name stored
																			 #in the date folder
																			 #(Inside the current trained model folder).
	else:
		#If there is not the "trained_models" folder in the project folder...
		os.mkdir(base) #It creates the "trained_models" folder in the project folder.
		os.mkdir(base + '/' + model) #It creates the folder with the current model name inside "trained_models" folder.
		os.mkdir(base + '/' + model + '/' + dataset_folder)
		os.mkdir(base + '/' + model + '/' + dataset_folder + '/' + date) #It creates the folder with the associated date
																		 #name inside the current trained model.
	return base + '/' + model + '/' + dataset_folder + '/' + date #It returns the path to the folder with the associated
																  #date name that is in the current trained model.

def exist(dst, src = None):
	files = os.listdir(src) #In "files" are listed the directories contained in the source folder ('models/current model').
	existFolder = [True for i in files if i == dst] #"existFolder" is 'True' if exist the folder with 'trained_models/
													#(Squeezenet, LeNet, etc.)/dateFolder' name.
	if True in existFolder: return True #If the folder exist it returns 'True'.
	else: return False #If the folder doesn't exist it returns 'False'.

def setLr(epoch):
	if epoch < 400: return 0.001
	elif epoch >= 400 and epoch < 700: return 0.0005
	elif epoch >= 700 and epoch < 900: return 0.0001
	elif epoch >= 900 and epoch < 1000: return 0.00001
	else: return 0.000001

class Best_mean2(Callback):
	def __init__(self, cycles = 50,
				 check = 'val_loss'):
		self.cycles = cycles
		self.check = check
		self.h = []
		self.weights = None
		self.counter = 0
		self.m1 = 0
		self.m2 = 0

class Lr_reset(Callback):
	def __init__(self, cycles = 10, decay = 0.95,
				 max_lr = 0.01, min_lr = 0.00001):
		self.cycles = cycles
		self.counter = 0
		self.decay = decay
		self.max_lr = max_lr
		self.min_lr = min_lr

class Best_with_lr_reset(Callback):
	def __init__(self, cycles = 50,
				 max_lr = 0.01, min_lr = 0.00001, check = 'val_loss'):
		self.cycles = cycles
		self.counter = cycles
		self.check = check
		self.best_value = 20
		self.best_weights = None
		self.max_lr = max_lr
		self.min_lr = min_lr

class Log(Callback):
	def __init__(self, dst, val = False):
		self.dst = dst
		if val: self.labels = ('loss', 'acc', 'val_loss', 'val_acc') #If it exists a validation dataset it considers the
																	 #specified parameters.
		else: self.labels = ('loss', 'acc') #If it doesn't exist a validation dataset it considers the specified parameters.

	def on_epoch_end(self, epoch, logs = {}):
		hist = 'epoch:' + str(epoch)
		for label in self.labels: hist += ' ' + label + ':' + str(logs.get(label))

		save = open(self.dst + '/history.log', 'a') #It creates a file with .log extension and in it is established a
													#data appendix, in the end of the file, corresponding to each
													#training iteration (epoch).
		save.writelines(hist + '\n') #It writes the data of every epoch in that file.

class Graphics(Callback):
	def __init__(self, dst, epochs = 0, val = False):
		self.dst = dst
		self.val = val
		self.epochs = epochs

def translate_output(output):
	#This method interprets the model output.
	#It returns the diagnostic and its probability.

	diagnostic = {0:'Negative', 1:'Positive'}
	#"output" is an array that stores probabilities as elements (the probability of belong to a specific class).
	out = diagnostic[np.argmax(output)] #'out = diagnostic[major "output" array element index]'. Ex: output = [0.4, 0.6]
										#-> out = diagnostic [1] = 'Positive'.
	prob = np.max(output) #It chooses the major value element in "output" (The major probability of belong to a specific
						  #class).
	return out, prob