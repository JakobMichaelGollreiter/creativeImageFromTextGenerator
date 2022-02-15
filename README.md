# g5-21


<!-- Requirements and Installation: -->
## Requirements and Installation:

Our project is divident into several microservices. Therefore one can use docker compose for the buildup. Because we need to get information about the hardware that is used, we need at least   docker-compose v1.28.0+

and 
cuda drivers of some sort (depends on your host system)
to get started use--> docker-compose up -d

<!-- Use -->
## Use

The Userinterface is pretty minimalistic and straightforward. 
In the center search field the user inputs a deliberate number of search terms, which he wants the output theme to focus on. These could literally include any words. Popular examples are landscapes (e.g. "castle", "mountain", "space"), themes (e.g. "medieval", "bloody", "apocalyptic") or characters (e.g. "trolls", "hound"), as well as going as far as simply entering colors.

Past searches and their output can be viewed in the search history, just below the searchbar, which also stores already generated images as well as the users reaction to them indicating a "like" with a yellow frame. The history page works just as the main image generation page. The user can still like the images, although these changes will only be visible at the end of the already generated output queue. If this is reached the site will go on generating images depending on the past output just as the main search site does.

The About and Settings pages are self explanatory while the settings have not been completed yet, as thus far they were not necessary for the image generation to work properly. (we by the way encourage to click the link at the bottom of any 404 error page)


<!-- backend readme -->
## backend readme

<!-- Which neural net are we using for the image generation? -->
### Which neural net are we using for the image generation?



For the actual image generation we use an already pre-trained network using VQGAN + CLIP, source code for image generation taken from
https://colab.research.google.com/drive/1wkF67ThUz37T2_oPIuSwuO4e_-0vjaLs?usp=sharing#scrollTo=ZdlpRFL8UAlW
This is a Google Colab notebook by Max Woolf, however the original method was by Katherine Crowson.

The generative capabilities of this network are extremely impressive. The interaction of the two nets essentially consists of VQGAN generating the images, while CLIP judges how well an image matches our text input.


<!-- How does the like-algorithm work? -->
### How does the like-algorithm work?

In order for the user to have a direct impact on the image generation, some form of feedback was required. 
By implementing a like algorithm, we wanted to substanciate the users idea.
If the user is given a rich pallete of styles to choose from, the fantasy world in the users mind becomes more fleshed out and concrete, even without a specific idea in mind beforehand.

For every image generated, an adjective from a set of hand-curated modificator words is added to the users search prompt.
These words have a strong stilistic impact and push the images overall appearance in a certain direction, without needing to modify the AIs code.

One benefit to this method is, that the images become more diverse. This way, the user gets more inspiration from our results.
Even if the users story isn't in any way fleshed out, our images can propose a general tone or setting for the user to choose.

Our like algorithm expands on this functionality. When the user likes an image by double tapping, the modificator word is permanently added to the search prompt. Hence, the direction the user has chosen is kept, but further explored with more modificator words.

The overall method can be visualized with a tree structure. Every branch is a different stylistic direction, and when the user likes an image, the tree is expanded from this branch on downwards.
The further down, the more specific and rich the generated images become.

<img src="/uploads/1f1d4625e32e172cddd64b644b3da527/like-algo.png"  width="666" height="535">

<!-- CONTACT -->
## Contact

August Wittgenstein - - august.wittgenstein@tum.de

Bernhard Stöffler - - bernhard.stöffler@tum.de

Tobias Höpp - - tobias.hoepp@tum.de

Jakob Gollreiter -  - jakob.gollreiter@tum.de




Project Link: [https://gitlab.ldv.ei.tum.de/komcrea/g5-21](https://gitlab.ldv.ei.tum.de/komcrea/g5-21)

<p align="right">(<a href="#top">back to top</a>)</p>



