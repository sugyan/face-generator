import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import tensorflow as tf

from dcgan import DCGAN

FLAGS = tf.app.flags.FLAGS

tf.app.flags.DEFINE_string('train_dir', 'train',
                           """Directory where to write event logs and checkpoint.""")
tf.app.flags.DEFINE_string('images_dir', 'images',
                           """Directory where to write generated images.""")

def main(argv=None):
    dcgan = DCGAN(
        batch_size=96, f_size=6, z_dim=40,
        gdepth1=512, gdepth2=256, gdepth3=128,  gdepth4=64,
        ddepth1=54,  ddepth2=90,  ddepth3=150, ddepth4=250)
    dcgan.d(dcgan.g(dcgan.z))
    g_saver = tf.train.Saver(tf.get_collection(tf.GraphKeys.TRAINABLE_VARIABLES, scope='g'))
    d_saver = tf.train.Saver(tf.get_collection(tf.GraphKeys.TRAINABLE_VARIABLES, scope='d'))


    with tf.Session() as sess:
        sess.run(tf.initialize_all_variables())

        g_checkpoint_path = os.path.join(os.path.dirname(__file__), '..', FLAGS.train_dir, 'g.ckpt')
        d_checkpoint_path = os.path.join(os.path.dirname(__file__), '..', FLAGS.train_dir, 'd.ckpt')
        if os.path.exists(g_checkpoint_path):
            g_saver.restore(sess, g_checkpoint_path)
        if os.path.exists(d_checkpoint_path):
            d_saver.restore(sess, d_checkpoint_path)

        ops = []
        targets = [
            {'name': 'g/conv1/Relu:0',    'row': 8, 'col': 32},
            {'name': 'g/conv2/Relu:0',    'row': 8, 'col': 16},
            {'name': 'g/conv3/Relu:0',    'row': 8, 'col': 8 },
            {'name': 'Tanh:0',            'row': 1, 'col': 3 },
            {'name': 'd/conv0/Maximum:0', 'row': 6, 'col': 9 },
            {'name': 'd/conv1/Maximum:0', 'row': 6, 'col': 15},
            {'name': 'd/conv2/Maximum:0', 'row': 6, 'col': 25},
        ]
        for target in targets:
            t = sess.graph.get_tensor_by_name(target['name'])
            batch_outputs = tf.split(0, dcgan.batch_size, t)
            for i in range(3):
                maps = tf.split(3, t.get_shape()[3], batch_outputs[i])
                rows = []
                cols = target['col']
                for row in range(target['row']):
                    rows.append(tf.concat(2, maps[cols * row: cols * row + cols]))
                montaged = tf.concat(1, rows)
                out = tf.image.convert_image_dtype(tf.squeeze(montaged, [0]), tf.uint8, saturate=True)
                ops.append(tf.image.encode_png(out, name=t.op.name.replace('/', '-') + '-%02d' % i))

        results = sess.run(ops)
        for i in range(len(ops)):
            filename = ops[i].op.name + '.png'
            print('write %s' % filename)
            with open(os.path.join(os.path.dirname(__file__), '..', FLAGS.images_dir, filename), 'wb') as f:
                f.write(results[i])

if __name__ == '__main__':
    tf.app.run()
