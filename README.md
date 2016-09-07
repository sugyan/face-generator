# face-generator

generate faces by DCGAN.

[![](http://img.youtube.com/vi/Svk0SxyNdr8/0.jpg)](https://www.youtube.com/watch?v=Svk0SxyNdr8)


### Prerequisits ###

- Python >= 2.7 or 3.5
- TensorFlow >= 0.9


### Dependencies ###

- https://github.com/sugyan/tf-dcgan (DCGAN implementation)


### Setup ###

    $ git clone https://github.com/sugyan/face-generator.git
    $ cd face-generator
    $ git submodule update --init
    $ pip install --upgrade -r requirements.txt


### Usage ###

training:

    $ python main.py

generating faces:

    $ python main.py --is_train False
