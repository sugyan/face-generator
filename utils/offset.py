# fetch offsets
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import sessionmaker

Base = declarative_base()
class Offsets(Base):
    __tablename__ = 'offsets'
    id = Column(Integer, primary_key=True)
    name = Column(String())
    values = Column(JSON)

    def __init__(self, name, values):
        self.name = name
        self.values = values

    def __repr__(self):
        return '<Offsets %r>' % self.name

    def serialize(self):
        return {
            'id'    : self.id,
            'name'  : self.name,
            'values': self.values,
        }

engine = create_engine(os.environ['DATABASE_URL'])
Session = sessionmaker(bind=engine)
session = Session()

default_offsets = session.query(Offsets).order_by(Offsets.id).first().values


# create inputs
import numpy as np

size = 128
inputs = []
for offset in default_offsets:
    low, high = -1.0, 1.0
    if offset > 0.0:
        high -= offset
    else:
        low -= offset
    inputs.append(np.expand_dims(np.random.uniform(low, high, 128) + offset, 0))
inputs = np.concatenate(inputs).T


# generate images
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import tensorflow as tf
from dcgan import DCGAN
dcgan = DCGAN(
    batch_size=128, f_size=6, z_dim=16,
    gdepth1=216, gdepth2=144, gdepth3=96, gdepth4=64,
    ddepth1=0,   ddepth2=0,   ddepth3=0,  ddepth4=0)
placeholder = tf.placeholder(tf.float32, shape=(128, 16))
generate = dcgan.g(placeholder)[-1]
g_saver = tf.train.Saver(dcgan.g.variables)
g_checkpoint_path = os.path.join(os.path.dirname(__file__), '..', 'train', 'g.ckpt')

with tf.Graph().as_default() as g:
    with tf.Session() as sess:
        tmp = DCGAN(
            batch_size=128, f_size=6, z_dim=16,
            gdepth1=216, gdepth2=144, gdepth3=96, gdepth4=64,
            ddepth1=0,   ddepth2=0,   ddepth3=0,  ddepth4=0)
        tmp.g(tmp.z)
        saver = tf.train.Saver(tmp.g.variables)
        saver.restore(sess, g_checkpoint_path)
        # get each means and variances
        outputs = []
        for op in g.get_operations():
            if not (op.name.endswith('normalize/mean') or op.name.endswith('normalize/variance')):
                continue
            outputs.extend(op.outputs)
        values = sess.run(outputs)
        moments = {outputs[i].name: values[i] for i in range(len(outputs))}

with tf.Session() as sess:
    # restore or initialize generator
    sess.run(tf.initialize_all_variables())
    if os.path.exists(g_checkpoint_path):
        print('restore variables:')
        for v in dcgan.g.variables:
            print('  ' + v.name)
        g_saver.restore(sess, g_checkpoint_path)
    # setup feed dict
    feed_dict = { placeholder: inputs }
    for op in sess.graph.get_operations():
        for output in op.outputs:
            if output.name in moments:
                feed_dict[output] = moments[output.name]
    # run
    results = sess.run(generate, feed_dict=feed_dict)[0:36]
    rows = []
    for row in range(6):
        cols = results[row * 6:(row + 1) * 6]
        rows.append(tf.concat(1, [tf.convert_to_tensor(x) for x in cols]))
    img = tf.image.encode_jpeg(tf.image.convert_image_dtype((tf.concat(0, rows) + 1.0) / 2.0, tf.uint8))

    filename = os.path.join(os.path.dirname(__file__), '..', 'images', 'out.jpg')
    with open(filename, 'wb') as f:
        print('write to %s' % filename)
        f.write(sess.run(img))
