import tensorflow as tf

class Generator:
    def __init__(self):
        self.z_dim = 100
        self.inference()

    def inference(self):
        z = tf.placeholder(tf.float32, [None, self.z_dim], name='z')
        w1 = tf.get_variable('weight', [100, 1024], tf.float32, tf.truncated_normal_initializer(stddev=0.1))
        b1 = tf.get_variable('bias', [1024], tf.float32, tf.constant_initializer(0.0))
        self.conv1 = tf.reshape(tf.matmul(z, w1) + b1, [-1, 6, 6, 1024])

class Discriminator:
    def __init__(self):
        None

def main(argv=None):
    print Generator().conv1

if __name__ == '__main__':
    tf.app.run()
