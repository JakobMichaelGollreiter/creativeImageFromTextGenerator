from pathlib import Path
from vqgan.wodone_mod_words import wodone_adjectives
import os

databasepath = "./images"

def get_image(prompt, modifiers):
    imgname = prompt.replace(' ','') #TODO maybe regular expression
    imgpath = databasepath + "/" + imgname
    for wordindex in modifiers: 
        imgpath = imgpath + "/" + wodone_adjectives[int(wordindex)]

    imgfilepath = Path(imgpath + "/image.png")
    if imgfilepath.exists():
        if Path(imgpath + "/unfinished").exists():
            print("Image is currently being generated, please be patient")
            status = 1
        else:
            print("Found image")
            status = 0
    else:
        print("Not found, generating new image")
        status = 1
        modifierstring = ""
        for mod in modifiers:
            modifierstring = modifierstring + " " + str(mod)
        os.system("python3 generate_image.py \"" + str(prompt) + "\"" + modifierstring + " &")        
        
    return imgfilepath, status
