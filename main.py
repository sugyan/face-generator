import os

import numpy as np
import tensorflow as tf

FLAGS = tf.app.flags.FLAGS
tf.app.flags.DEFINE_string('train_dir', 'train',
                           """Directory where to write event logs and checkpoint.""")

class Generator:
    def __init__(self):
        self.z_dim = 100
        self.batch_size = 128

        self.z = tf.placeholder(tf.float32, [None, self.z_dim], name='z')
        self.output = self.inference(self.z)

    def inference(self, z):
        with tf.variable_scope('conv1'):
            w1 = tf.get_variable('weight', [self.z_dim, 1024 * 4 * 4], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
            dc1 = tf.reshape(tf.matmul(self.z, w1), [-1, 4, 4, 1024])
            mean1, variance1 = tf.nn.moments(dc1, [0, 1, 2])
            bn1 = tf.nn.batch_normalization(dc1, mean1, variance1, None, None, 1e-5)
            relu1 = tf.nn.relu(bn1)
            tf.scalar_summary(relu1.op.name + '/sparsity', tf.nn.zero_fraction(relu1))

        with tf.variable_scope('conv2'):
            w2 = tf.get_variable('weight', [5, 5, 512, 1024], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
            dc2 = tf.nn.conv2d_transpose(relu1, w2, [self.batch_size, 8, 8, 512], [1, 2, 2, 1])
            mean2, variance2 = tf.nn.moments(dc2, [0, 1, 2])
            bn2 = tf.nn.batch_normalization(dc2, mean2, variance2, None, None, 1e-5)
            relu2 = tf.nn.relu(bn2)
            tf.scalar_summary(relu2.op.name + '/sparsity', tf.nn.zero_fraction(relu2))

        with tf.variable_scope('conv3'):
            w3 = tf.get_variable('weight', [5, 5, 256, 512], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
            dc3 = tf.nn.conv2d_transpose(relu2, w3, [self.batch_size, 16, 16, 256], [1, 2, 2, 1])
            mean3, variance3 = tf.nn.moments(dc3, [0, 1, 2])
            bn3 = tf.nn.batch_normalization(dc3, mean3, variance3, None, None, 1e-5)
            relu3 = tf.nn.relu(bn3)
            tf.scalar_summary(relu3.op.name + '/sparsity', tf.nn.zero_fraction(relu3))

        with tf.variable_scope('conv4'):
            w4 = tf.get_variable('weight', [5, 5, 128, 256], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
            dc4 = tf.nn.conv2d_transpose(relu3, w4, [self.batch_size, 32, 32, 128], [1, 2, 2, 1])
            mean4, variance4 = tf.nn.moments(dc4, [0, 1, 2])
            bn4 = tf.nn.batch_normalization(dc4, mean4, variance4, None, None, 1e-5)
            relu4 = tf.nn.relu(bn4)
            tf.scalar_summary(relu4.op.name + '/sparsity', tf.nn.zero_fraction(relu4))

        with tf.variable_scope('output'):
            w5 = tf.get_variable('weight', [5, 5, 3, 128], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
            dc5 = tf.nn.conv2d_transpose(relu4, w5, [self.batch_size, 64, 64, 3], [1, 2, 2, 1])
            out = tf.nn.tanh(dc5)

        return out

class Discriminator:
    def __init__(self):
        self.images = tf.placeholder(tf.float32, [None, 64, 64, 3], name='images')
        self.inference(self.images)

    def inference(self, images):
        with tf.variable_scope('conv1'):
            w = tf.get_variable('w', [5, 5, 3, 64], initializer=tf.truncated_normal_initializer(stddev=0.02))
            conv = tf.nn.conv2d(images, w, [1, 2, 2, 1], padding='SAME')

def main(argv=None):
    g = Generator()
    d = Discriminator()
    saver = tf.train.Saver(tf.all_variables())
    summary_op = tf.merge_all_summaries()
    z = np.random.uniform(-1, 1, size=(g.batch_size, g.z_dim))

    with tf.Session() as sess:
        sess.run(tf.initialize_all_variables())
        checkpoint_path = os.path.join(FLAGS.train_dir, 'model.ckpt')
        saver.save(sess, checkpoint_path, global_step=0)
        output = sess.run(g.output, feed_dict={g.z: z})
        print output

if __name__ == '__main__':
    tf.app.run()
