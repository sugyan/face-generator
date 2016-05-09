import os
import time
from datetime import datetime

import numpy as np
import tensorflow as tf

FLAGS = tf.app.flags.FLAGS
tf.app.flags.DEFINE_string('train_dir', 'train',
                           """Directory where to write event logs and checkpoint.""")
tf.app.flags.DEFINE_string('data_dir', 'data',
                           """Path to the TFRecord data directory.""")
tf.app.flags.DEFINE_integer('num_examples_per_epoch_for_train', 1000,
                            """number of examples for train""")

IMAGE_SIZE = 112

class Generator:
    def __init__(self, batch_size):
        self.z_dim = 100
        self.batch_size = batch_size
        self.z = tf.placeholder(tf.float32, [None, self.z_dim], name='z')
        self.output = self.model(self.z, reuse=None)

    def model(self, z, reuse=True):
        with tf.variable_scope('g', reuse=reuse):
            with tf.variable_scope('conv1'):
                w1 = tf.get_variable('weights', [self.z_dim, 1024 * 4 * 4], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
                b1 = tf.get_variable('biases', [1024], tf.float32, tf.zeros_initializer)
                dc1 = tf.nn.bias_add(tf.reshape(tf.matmul(z, w1), [-1, 4, 4, 1024]), b1)
                mean1, variance1 = tf.nn.moments(dc1, [0, 1, 2])
                bn1 = tf.nn.batch_normalization(dc1, mean1, variance1, None, None, 1e-5)
                relu1 = tf.nn.relu(bn1)
                tf.scalar_summary(relu1.op.name + '/sparsity', tf.nn.zero_fraction(relu1))
                tf.add_to_collection('g_losses', tf.mul(tf.nn.l2_loss(w1), 0.00001))

            with tf.variable_scope('conv2'):
                w2 = tf.get_variable('weights', [5, 5, 512, 1024], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
                b2 = tf.get_variable('biases', [512], tf.float32, tf.zeros_initializer)
                dc2 = tf.nn.bias_add(tf.nn.conv2d_transpose(relu1, w2, [self.batch_size, 8, 8, 512], [1, 2, 2, 1]), b2)
                mean2, variance2 = tf.nn.moments(dc2, [0, 1, 2])
                bn2 = tf.nn.batch_normalization(dc2, mean2, variance2, None, None, 1e-5)
                relu2 = tf.nn.relu(bn2)
                tf.scalar_summary(relu2.op.name + '/sparsity', tf.nn.zero_fraction(relu2))
                tf.add_to_collection('g_losses', tf.mul(tf.nn.l2_loss(w2), 0.00001))

            with tf.variable_scope('conv3'):
                w3 = tf.get_variable('weights', [5, 5, 256, 512], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
                b3 = tf.get_variable('biases', [256], tf.float32, tf.zeros_initializer)
                dc3 = tf.nn.bias_add(tf.nn.conv2d_transpose(relu2, w3, [self.batch_size, 16, 16, 256], [1, 2, 2, 1]), b3)
                mean3, variance3 = tf.nn.moments(dc3, [0, 1, 2])
                bn3 = tf.nn.batch_normalization(dc3, mean3, variance3, None, None, 1e-5)
                relu3 = tf.nn.relu(bn3)
                tf.scalar_summary(relu3.op.name + '/sparsity', tf.nn.zero_fraction(relu3))
                tf.add_to_collection('g_losses', tf.mul(tf.nn.l2_loss(w3), 0.00001))

            with tf.variable_scope('conv4'):
                w4 = tf.get_variable('weights', [5, 5, 128, 256], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
                b4 = tf.get_variable('biases', [128], tf.float32, tf.zeros_initializer)
                dc4 = tf.nn.bias_add(tf.nn.conv2d_transpose(relu3, w4, [self.batch_size, 32, 32, 128], [1, 2, 2, 1]), b4)
                mean4, variance4 = tf.nn.moments(dc4, [0, 1, 2])
                bn4 = tf.nn.batch_normalization(dc4, mean4, variance4, None, None, 1e-5)
                relu4 = tf.nn.relu(bn4)
                tf.scalar_summary(relu4.op.name + '/sparsity', tf.nn.zero_fraction(relu4))
                tf.add_to_collection('g_losses', tf.mul(tf.nn.l2_loss(w4), 0.00001))

            with tf.variable_scope('output'):
                w5 = tf.get_variable('weights', [5, 5, 3, 128], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
                b5 = tf.get_variable('biases', [3], tf.float32, tf.zeros_initializer)
                dc5 = tf.nn.bias_add(tf.nn.conv2d_transpose(relu4, w5, [self.batch_size, 64, 64, 3], [1, 2, 2, 1]), b5)
                out = tf.nn.tanh(dc5)
                tf.add_to_collection('g_losses', tf.mul(tf.nn.l2_loss(w5), 0.00001))

        return out

class Discriminator:
    def __init__(self):
        self.model(tf.placeholder(tf.float32, [None, 64, 64, 3]), reuse=None)

    def model(self, images, reuse=True):
        with tf.variable_scope('d', reuse=reuse):
            with tf.variable_scope('conv1'):
                w1 = tf.get_variable('weights', [5, 5, 3, 64], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
                b1 = tf.get_variable('biases', [64], tf.float32, tf.zeros_initializer)
                c1 = tf.nn.bias_add(tf.nn.conv2d(images, w1, [1, 2, 2, 1], padding='SAME'), b1)
                lrelu1 = tf.maximum(0.2 * c1, c1)
                tf.add_to_collection('d_losses', tf.mul(tf.nn.l2_loss(w1), 0.00001))

            with tf.variable_scope('conv2'):
                w2 = tf.get_variable('weights', [5, 5, 64, 128], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
                b2 = tf.get_variable('biases', [128], tf.float32, tf.zeros_initializer)
                c2 = tf.nn.bias_add(tf.nn.conv2d(lrelu1, w2, [1, 2, 2, 1], padding='SAME'), b2)
                lrelu2 = tf.maximum(0.2 * c2, c2)
                tf.add_to_collection('d_losses', tf.mul(tf.nn.l2_loss(w2), 0.00001))

            with tf.variable_scope('conv3'):
                w3 = tf.get_variable('weights', [5, 5, 128, 256], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
                b3 = tf.get_variable('biases', [256], tf.float32, tf.zeros_initializer)
                c3 = tf.nn.bias_add(tf.nn.conv2d(lrelu2, w3, [1, 2, 2, 1], padding='SAME'), b3)
                lrelu3 = tf.maximum(0.2 * c3, c3)
                tf.add_to_collection('d_losses', tf.mul(tf.nn.l2_loss(w3), 0.00001))

            with tf.variable_scope('conv4'):
                w4 = tf.get_variable('weights', [5, 5, 256, 512], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
                b4 = tf.get_variable('biases', [512], tf.float32, tf.zeros_initializer)
                c4 = tf.nn.bias_add(tf.nn.conv2d(lrelu3, w4, [1, 2, 2, 1], padding='SAME'), b4)
                lrelu4 = tf.maximum(0.2 * c4, c4)
                tf.add_to_collection('d_losses', tf.mul(tf.nn.l2_loss(w4), 0.00001))

            with tf.variable_scope('output'):
                dim = 1
                for d in lrelu4.get_shape()[1:].as_list():
                    dim *= d
                w5 = tf.get_variable('weights', [dim, 1], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
                b5 = tf.get_variable('biases', [1], tf.float32, tf.zeros_initializer)
                l = tf.nn.bias_add(tf.matmul(tf.reshape(lrelu4, [-1, dim]), w5), b5)
                out = tf.sigmoid(l)
                tf.add_to_collection('d_losses', tf.mul(tf.nn.l2_loss(w5), 0.00001))

        return out

class DCGAN:
    def __init__(self):
        self.batch_size = 128
        self.g = Generator(self.batch_size)
        self.d = Discriminator()

    def train(self, inputs):
        logits_from_i = self.d.model(inputs)
        logits_from_g = self.d.model(self.g.output)
        tf.add_to_collection('g_losses', tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(logits_from_g, tf.ones_like(logits_from_g))))
        tf.add_to_collection('d_losses', tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(logits_from_i, tf.ones_like(logits_from_i))))
        tf.add_to_collection('d_losses', tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(logits_from_g, tf.zeros_like(logits_from_g))))
        g_loss = tf.add_n(tf.get_collection('g_losses'), name='total_g_loss')
        d_loss = tf.add_n(tf.get_collection('d_losses'), name='total_d_loss')
        g_vars = [v for v in tf.trainable_variables() if v.name.startswith('g')]
        d_vars = [v for v in tf.trainable_variables() if v.name.startswith('d')]
        g_optimizer = tf.train.AdamOptimizer(learning_rate=0.0002, beta1=0.5).minimize(g_loss, var_list=g_vars)
        d_optimizer = tf.train.AdamOptimizer(learning_rate=0.0002, beta1=0.5).minimize(d_loss, var_list=d_vars)
        with tf.control_dependencies([g_optimizer, d_optimizer]):
            train_op = tf.no_op(name='train')
        return train_op, g_loss, d_loss

    def inputs(self, files):
        fqueue = tf.train.string_input_producer(files)
        reader = tf.TFRecordReader()
        _, value = reader.read(fqueue)
        features = tf.parse_single_example(value, features={'image_raw': tf.FixedLenFeature([], tf.string)})
        image = tf.cast(tf.image.decode_jpeg(features['image_raw'], channels=3), tf.float32)
        image.set_shape([IMAGE_SIZE, IMAGE_SIZE, 3])

        min_queue_examples = FLAGS.num_examples_per_epoch_for_train
        images = tf.train.shuffle_batch(
            [image],
            batch_size=self.g.batch_size,
            capacity=min_queue_examples + 3 * self.batch_size,
            min_after_dequeue=min_queue_examples
        )
        return tf.sub(tf.div(tf.image.resize_images(images, 64, 64), 127.5), 1.0)

    def generate_images(self, num):
        images = tf.cast(tf.mul(tf.add(self.g.output, 1.0), 127.5), tf.uint8)
        return map(lambda image: tf.image.encode_png(tf.squeeze(image, [0])), tf.split(0, self.batch_size, images)[0:num])

def main(argv=None):
    dcgan = DCGAN()
    inputs = dcgan.inputs([os.path.join(FLAGS.data_dir, f) for f in os.listdir(FLAGS.data_dir) if f.endswith('.tfrecords')])
    train_op, g_loss, d_loss = dcgan.train(inputs)
    images = dcgan.generate_images(9)

    saver = tf.train.Saver(tf.all_variables())
    with tf.Session() as sess:
        sess.run(tf.initialize_all_variables())
        tf.train.start_queue_runners(sess=sess)

        for step in range(100):
            random = np.random.uniform(-1, 1, size=(dcgan.batch_size, dcgan.g.z_dim))
            start_time = time.time()
            _, g_loss_value, d_loss_value = sess.run([train_op, g_loss, d_loss], feed_dict={dcgan.g.z: random})
            duration = time.time() - start_time
            format_str = '%s: step %d, loss = (G: %.8f, D: %.8f) (%.3f sec/batch)'
            print format_str % (datetime.now(), step, g_loss_value, d_loss_value, duration)

            for i, image in enumerate(sess.run(images, feed_dict={dcgan.g.z: random})):
                with open('%i.png' % i, 'wb') as f:
                    f.write(image)

            if step % 10 == 0:
                checkpoint_path = os.path.join(FLAGS.train_dir, 'model.ckpt')
                saver.save(sess, checkpoint_path)

if __name__ == '__main__':
    tf.app.run()
