from pathlib import Path
from wodone_mod_words import wodone_adjectives
import os

databasepath = "./images"

def get_image(prompt, modifiers):
    imgname = prompt.replace(' ','') #TODO maybe regular expression
    imgpath = databasepath + "/" + imgname
    for wordindex in modifiers: 
        imgpath = imgpath + "/" + wodone_adjectives[int(wordindex)]

    imgfilepath = Path(imgpath + "/image.png")
    if imgfilepath.exists():
        print("Image already generated")
    else:
        print("Not found, generating image")
        modifierstring = ""
        for mod in modifiers:
            modifierstring = modifierstring + " " + str(mod)
        os.system("python3 generate_image.py \"" + str(prompt) + "\"" + modifierstring + " &")        
        
    return imgfilepath
