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
tf.app.flags.DEFINE_integer('num_examples_per_epoch_for_train', 10000,
                            """number of examples for train""")
tf.app.flags.DEFINE_integer('max_steps', 5000,
                            """Number of batches to run.""")

INPUT_IMAGE_SIZE = 112

class Generator:
    def __init__(self, batch_size, f_size, depth1=1024, depth2=512, depth3=256, depth4=128):
        self.batch_size = batch_size
        self.f_size = f_size
        self.depths = [depth1, depth2, depth3, depth4, 3]
        self.z_dim = 100
        self.z = tf.placeholder(tf.float32, [None, self.z_dim], name='z')
        self.output = self.model(self.z, reuse=None)

    def model(self, z, reuse=True):
        i_depth = self.depths[0:4]
        o_depth = self.depths[1:5]

        with tf.variable_scope('g', reuse=reuse):
            with tf.variable_scope('reshape'):
                w0 = tf.get_variable('weights', [self.z_dim, i_depth[0] * self.f_size * self.f_size], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
                b0 = tf.get_variable('biases', [i_depth[0]], tf.float32, tf.zeros_initializer)
                dc0 = tf.nn.bias_add(tf.reshape(tf.matmul(z, w0), [-1, self.f_size, self.f_size, i_depth[0]]), b0)
                mean0, variance0 = tf.nn.moments(dc0, [0, 1, 2])
                bn0 = tf.nn.batch_normalization(dc0, mean0, variance0, None, None, 1e-5)
                out = tf.nn.relu(bn0)

            # deconvolution layers
            for i in range(4):
                with tf.variable_scope('conv%d' % (i + 1)):
                    w = tf.get_variable('weights', [5, 5, o_depth[i], i_depth[i]], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
                    b = tf.get_variable('biases', [o_depth[i]], tf.float32, tf.zeros_initializer)
                    dc = tf.nn.conv2d_transpose(out, w, [self.batch_size, self.f_size * 2 ** (i + 1), self.f_size * 2 ** (i + 1), o_depth[i]], [1, 2, 2, 1])
                    out = tf.nn.bias_add(dc, b)
                    if i < 3:
                        mean, variance = tf.nn.moments(out, [0, 1, 2])
                        out = tf.nn.relu(tf.nn.batch_normalization(out, mean, variance, None, None, 1e-5))

        return tf.nn.tanh(out)

class Discriminator:
    def __init__(self, f_size, depth1=64, depth2=128, depth3=256, depth4=512):
        self.depths = [3, depth1, depth2, depth3, depth4]
        self.model(tf.placeholder(tf.float32, [None, f_size * 2 ** 4, f_size * 2 ** 4, 3]), reuse=None)

    def model(self, images, reuse=True):
        i_depth = self.depths[0:4]
        o_depth = self.depths[1:5]

        with tf.variable_scope('d', reuse=reuse):
            out = images
            for i in range(4):
                with tf.variable_scope('conv%d' % i):
                    w = tf.get_variable('weights', [5, 5, i_depth[i], o_depth[i]], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
                    b = tf.get_variable('biases', [o_depth[i]], tf.float32, tf.zeros_initializer)
                    c = tf.nn.bias_add(tf.nn.conv2d(out, w, [1, 2, 2, 1], padding='SAME'), b)
                    mean, variance = tf.nn.moments(c, [0, 1, 2])
                    bn = tf.nn.batch_normalization(c, mean, variance, None, None, 1e-5)
                    out = tf.maximum(0.2 * bn, bn)

            with tf.variable_scope('classify'):
                dim = 1
                for d in out.get_shape()[1:].as_list():
                    dim *= d
                w = tf.get_variable('weights', [dim, 2], tf.float32, tf.truncated_normal_initializer(stddev=0.02))
                b = tf.get_variable('biases', [2], tf.float32, tf.zeros_initializer)
                out = tf.nn.bias_add(tf.matmul(tf.reshape(out, [-1, dim]), w), b)

        return out

class DCGAN:
    def __init__(self, batch_size=128, f_size=4):
        self.batch_size = 64
        self.f_size = 6
        self.g = Generator(self.batch_size, self.f_size, *[250, 150, 90, 54])
        self.d = Discriminator(self.f_size, *[54, 90, 150, 250])

    def train(self, inputs):
        logits_from_i = self.d.model(inputs)
        logits_from_g = self.d.model(self.g.output)

        for v in tf.trainable_variables():
            if 'weights' in v.name:
                if v.name.startswith('g'):
                    tf.add_to_collection('g_losses', tf.mul(tf.nn.l2_loss(v), 1e-5))
                if v.name.startswith('d'):
                    tf.add_to_collection('d_losses', tf.mul(tf.nn.l2_loss(v), 1e-5))
        tf.add_to_collection('g_losses', tf.reduce_mean(tf.nn.sparse_softmax_cross_entropy_with_logits(logits_from_g, tf.ones([self.batch_size], dtype=tf.int64))))
        tf.add_to_collection('d_losses', tf.reduce_mean(tf.nn.sparse_softmax_cross_entropy_with_logits(logits_from_i, tf.ones([self.batch_size], dtype=tf.int64))))
        tf.add_to_collection('d_losses', tf.reduce_mean(tf.nn.sparse_softmax_cross_entropy_with_logits(logits_from_g, tf.zeros([self.batch_size], dtype=tf.int64))))
        g_loss = tf.add_n(tf.get_collection('g_losses'), name='total_g_loss')
        d_loss = tf.add_n(tf.get_collection('d_losses'), name='total_d_loss')
        g_vars = [v for v in tf.trainable_variables() if v.name.startswith('g')]
        d_vars = [v for v in tf.trainable_variables() if v.name.startswith('d')]
        g_optimizer = tf.train.AdamOptimizer(learning_rate=0.0001, beta1=0.5).minimize(g_loss, var_list=g_vars)
        d_optimizer = tf.train.AdamOptimizer(learning_rate=0.0001, beta1=0.5).minimize(d_loss, var_list=d_vars)
        with tf.control_dependencies([g_optimizer, d_optimizer]):
            train_op = tf.no_op(name='train')
        return train_op, g_loss, d_loss

    def inputs(self, files):
        fqueue = tf.train.string_input_producer(files)
        reader = tf.TFRecordReader()
        _, value = reader.read(fqueue)
        features = tf.parse_single_example(value, features={'image_raw': tf.FixedLenFeature([], tf.string)})
        image = tf.cast(tf.image.decode_jpeg(features['image_raw'], channels=3), tf.float32)
        image.set_shape([INPUT_IMAGE_SIZE, INPUT_IMAGE_SIZE, 3])
        image = tf.image.random_flip_left_right(image)

        min_queue_examples = FLAGS.num_examples_per_epoch_for_train
        images = tf.train.shuffle_batch(
            [image],
            batch_size=self.g.batch_size,
            capacity=min_queue_examples + 3 * self.batch_size,
            min_after_dequeue=min_queue_examples
        )
        return tf.sub(tf.div(tf.image.resize_images(images, self.f_size * 2 ** 4, self.f_size * 2 ** 4), 127.5), 1.0)

    def generate_images(self, num):
        images = tf.cast(tf.mul(tf.add(self.g.output, 1.0), 127.5), tf.uint8)
        return map(lambda image: tf.image.encode_png(tf.squeeze(image, [0])), tf.split(0, self.batch_size, images)[0:num])

def main(argv=None):
    dcgan = DCGAN(batch_size=64, f_size=6)
    inputs = dcgan.inputs([os.path.join(FLAGS.data_dir, f) for f in os.listdir(FLAGS.data_dir) if f.endswith('.tfrecords')])
    train_op, g_loss, d_loss = dcgan.train(inputs)
    images = dcgan.generate_images(9)

    g_saver = tf.train.Saver([v for v in tf.trainable_variables() if v.name.startswith('g')])
    d_saver = tf.train.Saver([v for v in tf.trainable_variables() if v.name.startswith('d')])
    g_checkpoint_path = os.path.join(FLAGS.train_dir, 'g.ckpt')
    d_checkpoint_path = os.path.join(FLAGS.train_dir, 'd.ckpt')
    with tf.Session() as sess:
        # restore or initialize
        if os.path.exists(g_checkpoint_path):
            g_saver.restore(sess, g_checkpoint_path)
        if os.path.exists(d_checkpoint_path):
            d_saver.restore(sess, d_checkpoint_path)
        for v in tf.all_variables():
            if not sess.run(tf.is_variable_initialized(v)):
                print 'initialize variable %s' % v.name
                sess.run(tf.initialize_variables([v]))

        tf.train.start_queue_runners(sess=sess)

        for step in range(FLAGS.max_steps):
            random = np.random.uniform(-1, 1, size=(dcgan.batch_size, dcgan.g.z_dim))
            start_time = time.time()
            _, g_loss_value, d_loss_value = sess.run([train_op, g_loss, d_loss], feed_dict={dcgan.g.z: random})
            duration = time.time() - start_time
            format_str = '%s: step %d, loss = (G: %.8f, D: %.8f) (%.3f sec/batch)'
            print format_str % (datetime.now(), step, g_loss_value, d_loss_value, duration)

            for i, image in enumerate(sess.run(images, feed_dict={dcgan.g.z: random})):
                with open('%02d.png' % i, 'wb') as f:
                    f.write(image)

            if step % 10 == 0:
                g_saver.save(sess, g_checkpoint_path)
            if step % 100 == 0:
                d_saver.save(sess, d_checkpoint_path)

if __name__ == '__main__':
    tf.app.run()
