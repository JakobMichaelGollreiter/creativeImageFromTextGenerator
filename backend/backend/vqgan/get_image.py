from pathlib import Path
from wodone_mod_words import wodone_adjectives
import os

databasepath = "./images"

def get_image(prompt, modifiers):
    imgname = prompt.replace(' ','') #TODO maybe regular expression
    imgpath = databasepath + "/" + imgname
    for wordindex in modifiers: 
        imgpath = imgpath + "/" + wodone_adjectives[int(wordindex)]

    if Path(imgpath + "/image.png").exists() and not Path(imgpath + "/unfinished").exists():
        print("Found image")
        imgfilepath = Path(imgpath + "/image.png")
        status = 0
    elif Path(imgpath + "/unfinished").exists():
        print("Image is currently being generated, please be patient")
        num_steps = len(next(os.walk(imgpath + "/steps"))[2]) - 1
        imgfilepath = Path(imgpath + f"/steps/{num_steps:03d}.png")
        status = 1
    else:
        print("Not found, generating new image")
        status = 1
        imgfilepath = Path(imgpath + "/steps/000.png")
        modifierstring = ""
        for mod in modifiers:
            modifierstring = modifierstring + " " + str(mod)
        os.system("python3 generate_image.py \"" + str(prompt) + "\"" + modifierstring + " &")        
        
    return imgfilepath, status
