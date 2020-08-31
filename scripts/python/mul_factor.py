import sys
from data import Data

dataset_path = str(sys.argv[1])
dataset_path = dataset_path.replace("*", " ")
new_dataset_path = str(sys.argv[2])
new_dataset_path = new_dataset_path.replace("*", " ")
height = int(sys.argv[4])
width = int(sys.argv[3])
factor = int(sys.argv[5])
rr = int(sys.argv[6])
wsr = float(sys.argv[7])
hs = float(sys.argv[8])
zr = float(sys.argv[9])

data = Data()
try:
	data.createDataset(src=dataset_path, dst=new_dataset_path, format=(height, width), aug=factor, rr=rr, wsr=wsr, hs=hs, zr=zr) # It creates a dataset ready to train.
except Exception as e:
	print(str(e))