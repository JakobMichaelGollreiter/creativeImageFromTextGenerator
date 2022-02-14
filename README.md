# g5-21

Requirements:

docker-compose v1.28.0+
cuda drivers of some sort (depends on your host system)
to get started: docker-compose up -d


backend readme:

Wich neural net are we using for the image generation?

For the actual image generation we use an already pre-trained network using VQGAN + CLIP, source code for image generation taken from
https://colab.research.google.com/drive/1wkF67ThUz37T2_oPIuSwuO4e_-0vjaLs?usp=sharing#scrollTo=ZdlpRFL8UAlW
This is a Google Colab notebook by Max Woolf, however the original method was by Katherine Crowson.

The generative capabilities of this network are extremely impressive. The interaction of the two nets essentially consists of VQGAN generating the images, while CLIP judges how well an image matches our text input.


How does the like-algorithm work?
