#!/bin/sh
git clone https://github.com/openai/CLIP
git clone https://github.com/CompVis/taming-transformers.git
git clone https://github.com/minimaxir/icon-image.git
curl -L -o vqgan_imagenet_f16_16384.ckpt -C - 'https://heibox.uni-heidelberg.de/f/867b05fc8c4841768640/?dl=1'
curl -L -o vqgan_imagenet_f16_16384.yaml -C - 'https://heibox.uni-heidelberg.de/f/274fb24ed38341bfa753/?dl=1'
