#!/usr/bin/env python3

# Python youtube downloader

from pytube import YouTube
import sys

yt = YouTube(url= sys.argv[1], proxies= {
    "http": "http://localhost:10809",
    "https": "http://localhost:10809",
});

file_path = yt.streams[0].download(output_path='./uploads')
sys.stdout.write(file_path)
sys.stdout.flush()
sys.exit(0)