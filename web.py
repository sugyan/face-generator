import base64
import io
import os
import urllib.request

from flask import Flask, render_template, jsonify
import numpy as np
import tensorflow as tf

from dcgan import DCGAN

FLAGS = tf.app.flags.FLAGS
tf.app.flags.DEFINE_integer('port', 5000,
                           """Application port.""")
tf.app.flags.DEFINE_string('checkpoint_path', '/tmp/g.ckpt',
                           """Directory where to read model checkpoints.""")

# download checkpoint file
if not os.path.isfile(FLAGS.checkpoint_path):
    print('No checkpoint file found')
    urllib.request.urlretrieve(os.environ['CHECKPOINT_DOWNLOAD_URL'], FLAGS.checkpoint_path)

# DCGAN instance with specified batch size
def get_dcgan(batch_size):
    return DCGAN(
        batch_size=batch_size, f_size=6, z_dim=40,
        gdepth1=512, gdepth2=256, gdepth3=128, gdepth4=64,
        ddepth1=0,   ddepth2=0,   ddepth3=0,   ddepth4=0)

# moments dictionary { <Tensor.name>: <values> }
def get_moments():
    # graph for 128 batch
    with tf.Graph().as_default() as g:
        with tf.Session() as sess:
            dcgan = get_dcgan(128)
            dcgan.g(dcgan.z)
            variables = tf.get_collection(tf.GraphKeys.TRAINABLE_VARIABLES, scope='g')
            saver = tf.train.Saver(variables)
            saver.restore(sess, FLAGS.checkpoint_path)
            # get each means and variances
            outputs = []
            for op in g.get_operations():
                if not (op.name.endswith('normalize/mean') or op.name.endswith('normalize/variance')):
                    continue
                outputs.extend(op.outputs)
            values = sess.run(outputs)
            return {outputs[i].name: values[i] for i in range(len(outputs))}
# calculate once
moments = get_moments()


# start session for web app
sess = tf.Session()

# setup single image generator
dcgan = get_dcgan(1)
inputs = tf.placeholder(tf.float32, (dcgan.batch_size, dcgan.z_dim))
generate_image = dcgan.generate_images(1, 1, inputs)


# restore variables
variables = tf.get_collection(tf.GraphKeys.TRAINABLE_VARIABLES, scope='g')
saver = tf.train.Saver(variables)
saver.restore(sess, FLAGS.checkpoint_path)

# Flask setup
app = Flask(__name__)
app.debug = True
app.config['DEFAULT_FEED_DICT'] = {}
for op in sess.graph.get_operations():
    for output in op.outputs:
        if output.name in moments:
            app.config['DEFAULT_FEED_DICT'][output] = moments[output.name]

@app.route('/api/generate', methods=['POST'])
def image():
    feed_dict = {inputs: np.random.uniform(-1.0, 1.0, size=(dcgan.batch_size, dcgan.z_dim))}
    feed_dict.update(app.config['DEFAULT_FEED_DICT'])
    result = sess.run(generate_image, feed_dict=feed_dict)
    return jsonify(results=['data:image/png;base64,' + base64.b64encode(result).decode()])

@app.route('/')
def root():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=FLAGS.port)
