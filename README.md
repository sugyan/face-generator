# face-generator

generate faces by DCGAN.


### Prerequisits ###

- Python >= 3.5


### Dependencies ###

- https://github.com/sugyan/tf-dcgan


### Setup ###

    $ git clone https://github.com/sugyan/face-generator.git
    $ cd face-generator
    $ git submodule update --init
    $ pip3 install --upgrade -r requirements.txt


### Usage ###

training:

    $ python3 main.py

generating faces:

    $ python3 main.py --is_train False

generating animated GIF:

    $ convert -delay 15 images/*.jpg -gravity North -splice 0x20 -annotate +0+2 '%t' images/out.gif
