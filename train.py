import os
import time
from datetime import datetime

import tensorflow as tf

from dcgan import DCGAN

FLAGS = tf.app.flags.FLAGS

tf.app.flags.DEFINE_string('logdir', 'logdir',
                           """Directory where to write event logs and checkpoint.""")
tf.app.flags.DEFINE_string('images_dir', 'images',
                           """Directory where to write generated images.""")
tf.app.flags.DEFINE_string('data_dir', 'data',
                           """Path to the TFRecord data directory.""")
tf.app.flags.DEFINE_integer('num_examples_per_epoch_for_train', 5000,
                            """number of examples for train""")
tf.app.flags.DEFINE_integer('max_steps', 10001,
                            """Number of batches to run.""")

INPUT_IMAGE_SIZE = 112
CROP_IMAGE_SIZE = 96


def inputs(batch_size, s_size):
    files = [os.path.join(FLAGS.data_dir, f) for f in os.listdir(FLAGS.data_dir) if f.endswith('.tfrecords')]
    fqueue = tf.train.string_input_producer(files)
    reader = tf.TFRecordReader()
    _, value = reader.read(fqueue)
    features = tf.parse_single_example(value, features={'image_raw': tf.FixedLenFeature([], tf.string)})
    image = tf.cast(tf.image.decode_jpeg(features['image_raw'], channels=3), tf.float32)
    image = tf.image.resize_image_with_crop_or_pad(image, CROP_IMAGE_SIZE, CROP_IMAGE_SIZE)
    image = tf.image.random_flip_left_right(image)

    min_queue_examples = FLAGS.num_examples_per_epoch_for_train
    images = tf.train.shuffle_batch(
        [image],
        batch_size=batch_size,
        capacity=min_queue_examples + 3 * batch_size,
        min_after_dequeue=min_queue_examples)
    tf.summary.image('images', images)
    return tf.subtract(tf.div(tf.image.resize_images(images, [s_size * 2 ** 4, s_size * 2 ** 4]), 127.5), 1.0)


def main(argv=None):
    dcgan = DCGAN(s_size=6)
    traindata = inputs(dcgan.batch_size, dcgan.s_size)
    losses = dcgan.loss(traindata)
    # feature matching
    graph = tf.get_default_graph()
    features_g = tf.reduce_mean(graph.get_tensor_by_name('dg/d/conv4/outputs:0'), 0)
    features_t = tf.reduce_mean(graph.get_tensor_by_name('dt/d/conv4/outputs:0'), 0)
    losses[dcgan.g] += tf.multiply(tf.nn.l2_loss(features_g - features_t), 0.05)

    tf.summary.scalar('g loss', losses[dcgan.g])
    tf.summary.scalar('d loss', losses[dcgan.d])
    train_op = dcgan.train(losses, learning_rate=0.0001)
    summary_op = tf.summary.merge_all()

    g_saver = tf.train.Saver(dcgan.g.variables, max_to_keep=15)
    d_saver = tf.train.Saver(dcgan.d.variables, max_to_keep=15)
    g_checkpoint_path = os.path.join(FLAGS.logdir, 'g.ckpt')
    d_checkpoint_path = os.path.join(FLAGS.logdir, 'd.ckpt')

    with tf.Session() as sess:
        summary_writer = tf.summary.FileWriter(FLAGS.logdir, graph=sess.graph)
        # restore or initialize generator
        sess.run(tf.global_variables_initializer())
        if os.path.exists(g_checkpoint_path):
            print('restore variables:')
            for v in dcgan.g.variables:
                print('  ' + v.name)
            g_saver.restore(sess, g_checkpoint_path)
        if os.path.exists(d_checkpoint_path):
            print('restore variables:')
            for v in dcgan.d.variables:
                print('  ' + v.name)
            d_saver.restore(sess, d_checkpoint_path)

        # setup for monitoring
        sample_z = sess.run(tf.random_uniform([dcgan.batch_size, dcgan.z_dim], minval=-1.0, maxval=1.0))
        images = dcgan.sample_images(5, 5, inputs=sample_z)

        # start training
        tf.train.start_queue_runners(sess=sess)

        for step in range(FLAGS.max_steps):
            start_time = time.time()
            _, g_loss, d_loss = sess.run([train_op, losses[dcgan.g], losses[dcgan.d]])
            duration = time.time() - start_time
            print('{}: step {:5d}, loss = (G: {:.8f}, D: {:.8f}) ({:.3f} sec/batch)'.format(
                datetime.now(), step, g_loss, d_loss, duration))

            # save generated images
            if step % 100 == 0:
                # summary
                summary_str = sess.run(summary_op)
                summary_writer.add_summary(summary_str, step)
                # sample images
                filename = os.path.join(FLAGS.images_dir, '%05d.jpg' % step)
                with open(filename, 'wb') as f:
                    f.write(sess.run(images))
            # save variables
            if step % 500 == 0:
                g_saver.save(sess, g_checkpoint_path, global_step=step)
                d_saver.save(sess, d_checkpoint_path, global_step=step)


if __name__ == '__main__':
    tf.app.run()
