#!/usr/bin/env python3
# Inspire by carykh
# Rewrite By Snowsore

# jc2mp4

# Imports
from scipy.io.wavfile import read
import numpy as np
import sys
import io
import ffmpeg
import progressbar
from moviepy.editor import *

#
# Voice detection
#

# Prepare
ifile = sys.argv[1]
ofile = sys.argv[2]
sensitivity = 300

out, _ = (ffmpeg
    .input(ifile)
    .output('pipe:', format='wav', loglevel='panic')
    .run(capture_stdout=True)
)

# Get data
q = len(out) - 8
b = []
for i in range(4):
    q, r = divmod(q, 256)
    b.append(r)

sample_rate, data = read(io.BytesIO(out[:4] + bytes(b) + out[8:]))

# Sensetive
mask = (data[:,0] > sensitivity) | (data[:,0] < -sensitivity)

# Dumb filtering
dynamic = 0
release = 0
for i in range(100):
    if dynamic > sample_rate / 60:
        for l in range(i):
            mask = np.logical_or(mask, np.roll(mask, -2 ** l))
        break
    dynamic += 2 ** i;

for i in range(100):
    if release > sample_rate / 60:
        for l in range(i):
            mask = np.logical_or(mask, np.roll(mask, 2 ** l))
        break
    release += 2 ** i;

# Output list
mask = np.insert(mask, 0, 0)
mask = np.append(mask, 0)
flat = np.flatnonzero(np.diff(mask)) / sample_rate

audio_start = flat[0::2]
audio_stop = flat[1::2]
duration_mask = (audio_stop - audio_start) > 0.2

audio_start = audio_start[duration_mask]
audio_stop = audio_stop[duration_mask]

#
# Render video
#

clip = VideoFileClip(ifile)

clips = []
for i in progressbar.progressbar(range(len(audio_start))):
    clips.append(clip.subclip(audio_start[i], audio_stop[i]))

concatenate_videoclips(clips).write_videofile(ofile, codec='mp4', ffmpeg_params=['-c:v', 'h264_nvenc', '-c:a', 'aac', '-vf', 'setpts=0.666*PTS', '-af', 'atempo=1.5', '-f', 'mp4'])
