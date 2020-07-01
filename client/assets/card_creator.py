import numpy as np
import cv2 as cv
import os

images = os.listdir()

print(images)

for img_name in images:
    if 'png' not in img_name:
        continue
    if 'white' in img_name:
        continue
    img = cv.imread(img_name)
    img = cv.bitwise_not(img)
    cv.imwrite(img_name.replace('black','white'),img)
# img = np.zeros((270,200,3),np.uint8)

# font = cv.FONT_HERSHEY_PLAIN
# cv.putText(img,str(1),(50,200),font,10,(255,255,255),1)

# # cv.rectangle()
# cv.imshow("img",img)
# cv.waitKey()