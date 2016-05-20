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

if not os.path.isfile(FLAGS.checkpoint_path):
    print('No checkpoint file found')
    urllib.request.urlretrieve(os.environ['CHECKPOINT_DOWNLOAD_URL'], FLAGS.checkpoint_path)

sess = tf.Session()

# setup ops
dcgan = DCGAN(
    batch_size=128, f_size=6,
    gdepth1=250, gdepth2=150, gdepth3=90, gdepth4=54,
    ddepth1=0,   ddepth2=0,   ddepth3=0,  ddepth4=0)
inputs = tf.placeholder(tf.float32, (dcgan.batch_size, dcgan.z_dim))
generate_image = dcgan.generate_images(1, 1, inputs)

# restore variables
variables = tf.get_collection(tf.GraphKeys.TRAINABLE_VARIABLES, scope='g')
saver = tf.train.Saver(variables)
saver.restore(sess, FLAGS.checkpoint_path)

# Flask setup
app = Flask(__name__)
app.debug = True

@app.route('/api/generate', methods=['POST'])
def image():
    z = np.random.uniform(-1.0, 1.0, size=(dcgan.batch_size, dcgan.z_dim))
    result = sess.run(generate_image, feed_dict={inputs: z})
    return jsonify(results=['data:image/png;base64,' + base64.b64encode(result).decode()])

@app.route('/')
def root():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=FLAGS.port)
