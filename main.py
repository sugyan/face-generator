import os
import time
from datetime import datetime

import tensorflow as tf

from dcgan import DCGAN

FLAGS = tf.app.flags.FLAGS

tf.app.flags.DEFINE_string('train_dir', 'train',
                           """Directory where to write event logs and checkpoint.""")
tf.app.flags.DEFINE_string('images_dir', 'images',
                           """Directory where to write generated images.""")
tf.app.flags.DEFINE_string('data_dir', 'data',
                           """Path to the TFRecord data directory.""")
tf.app.flags.DEFINE_integer('num_examples_per_epoch_for_train', 5000,
                            """number of examples for train""")
tf.app.flags.DEFINE_integer('max_steps', 5000,
                            """Number of batches to run.""")
tf.app.flags.DEFINE_boolean('is_train', True,
                            """True for training, False for generate only""")

INPUT_IMAGE_SIZE = 112
CROP_IMAGE_SIZE = 96

def inputs(batch_size, f_size):
    files = [os.path.join(FLAGS.data_dir, f) for f in os.listdir(FLAGS.data_dir) if f.endswith('.tfrecords')]
    fqueue = tf.train.string_input_producer(files)
    reader = tf.TFRecordReader()
    _, value = reader.read(fqueue)
    features = tf.parse_single_example(value, features={'image_raw': tf.FixedLenFeature([], tf.string)})
    image = tf.image.convert_image_dtype(tf.image.decode_jpeg(features['image_raw'], channels=3), tf.float32)
    image.set_shape([INPUT_IMAGE_SIZE, INPUT_IMAGE_SIZE, 3])
    image = tf.image.resize_image_with_crop_or_pad(image, CROP_IMAGE_SIZE, CROP_IMAGE_SIZE)
    image = tf.image.random_flip_left_right(image)

    min_queue_examples = FLAGS.num_examples_per_epoch_for_train
    images = tf.train.shuffle_batch(
        [image],
        batch_size=batch_size,
        capacity=min_queue_examples + 3 * batch_size,
        min_after_dequeue=min_queue_examples)
    return tf.sub(tf.div(tf.image.resize_images(images, f_size * 2 ** 4, f_size * 2 ** 4), 127.5), 1.0)

def main(argv=None):
    dcgan = DCGAN(
        batch_size=96, f_size=6, z_dim=40,
        gdepth1=512, gdepth2=256, gdepth3=128,  gdepth4=64,
        ddepth1=54,  ddepth2=90,  ddepth3=150, ddepth4=250)
    input_images = inputs(dcgan.batch_size, dcgan.f_size)
    train_op, g_loss, d_loss = dcgan.train(input_images, learning_rate=0.0001)
    images = dcgan.generate_images(4, 4)

    g_variables = tf.get_collection(tf.GraphKeys.TRAINABLE_VARIABLES, scope='g')
    g_saver = tf.train.Saver(g_variables)
    g_checkpoint_path = os.path.join(FLAGS.train_dir, 'g.ckpt')
    with tf.Session() as sess:
        # restore or initialize
        sess.run(tf.initialize_all_variables())
        if os.path.exists(g_checkpoint_path):
            print('restore variables:')
            for v in g_variables:
                print('  ' + v.name)
            g_saver.restore(sess, g_checkpoint_path)

        if FLAGS.is_train:
            d_variables = tf.get_collection(tf.GraphKeys.TRAINABLE_VARIABLES, scope='d')
            d_saver = tf.train.Saver(d_variables)
            d_checkpoint_path = os.path.join(FLAGS.train_dir, 'd.ckpt')
            if os.path.exists(d_checkpoint_path):
                print('restore variables:')
                for v in d_variables:
                    print('  ' + v.name)
                d_saver.restore(sess, d_checkpoint_path)

            # start training
            tf.train.start_queue_runners(sess=sess)

            for step in range(FLAGS.max_steps):
                start_time = time.time()
                _, g_loss_value, d_loss_value = sess.run([train_op, g_loss, d_loss])
                duration = time.time() - start_time
                format_str = '%s: step %d, loss = (G: %.8f, D: %.8f) (%.3f sec/batch)'
                print(format_str % (datetime.now(), step, g_loss_value, d_loss_value, duration))

                # save generated images
                if step % 100 == 0:
                    filename = os.path.join(FLAGS.images_dir, '%04d.png' % step)
                    with open(filename, 'wb') as f:
                        f.write(sess.run(images))
                # save variables
                if step % 100 == 0:
                    g_saver.save(sess, g_checkpoint_path, global_step=step)
                    d_saver.save(sess, d_checkpoint_path, global_step=step)
        else:
            generated = sess.run(images)
            filename = os.path.join(FLAGS.images_dir, 'out.png')
            with open(filename, 'wb') as f:
                f.write(generated)

if __name__ == '__main__':
    tf.app.run()
