import tensorflow as tf

class Generator:
    def __init__(self):
        self.z_dim = 100
        self.batch_size = 128
        self.inference()

    def inference(self):
        z = tf.placeholder(tf.float32, [None, self.z_dim], name='z')

        with tf.variable_scope('conv1'):
            w1 = tf.get_variable('weight', [100, 1024], tf.float32, tf.truncated_normal_initializer(stddev=0.1))
            b1 = tf.get_variable('bias', [1024], tf.float32, tf.constant_initializer(0.0))
            dc1 = tf.reshape(tf.matmul(z, w1) + b1, [-1, 6, 6, 1024])
            mean1, variance1 = tf.nn.moments(dc1, [0, 1, 2])
            bn1 = tf.nn.batch_normalization(dc1, mean1, variance1, None, None, 1e-5)
            relu1 = tf.nn.relu(bn1)
        with tf.variable_scope('conv2'):
            w2 = tf.get_variable('weight', [1, 1, 512, 1024])
            dc2 = tf.nn.conv2d_transpose(relu1, w2, [self.batch_size, 12, 12, 512], [1, 2, 2, 1])
            mean2, variance2 = tf.nn.moments(dc2, [0, 1, 2])
            bn2 = tf.nn.batch_normalization(dc2, mean2, variance2, None, None, 1e-5)
            relu2 = tf.nn.relu(bn2)
        with tf.variable_scope('conv3'):
            w3 = tf.get_variable('weight', [5, 5, 256, 512])
            dc3 = tf.nn.conv2d_transpose(relu2, w3, [self.batch_size, 24, 24, 256], [1, 2, 2, 1])
            mean3, variance3 = tf.nn.moments(dc3, [0, 1, 2])
            bn3 = tf.nn.batch_normalization(dc3, mean3, variance3, None, None, 1e-5)
            relu3 = tf.nn.relu(bn3)
        with tf.variable_scope('conv4'):
            w4 = tf.get_variable('weight', [5, 5, 128, 256])
            dc4 = tf.nn.conv2d_transpose(relu3, w4, [self.batch_size, 48, 48, 128], [1, 2, 2, 1])
            mean4, variance4 = tf.nn.moments(dc4, [0, 1, 2])
            bn4 = tf.nn.batch_normalization(dc4, mean4, variance4, None, None, 1e-5)
            relu4 = tf.nn.relu(bn4)
        with tf.variable_scope('output'):
            w5 = tf.get_variable('weight', [5, 5, 3, 128])
            dc5 = tf.nn.conv2d_transpose(relu4, w5, [self.batch_size, 96, 96, 3], [1, 2, 2, 1])
            out = tf.nn.tanh(dc5)
        return out

class Discriminator:
    def __init__(self):
        None

def main(argv=None):
    print Generator()

if __name__ == '__main__':
    tf.app.run()
