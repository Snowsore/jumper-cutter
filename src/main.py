#!/usr/bin/env python3

import jumpercutter

def start():
    jumpercutter.render(
        inputFile = './in/temp.mp4',
        outputFile = './out/temp.mp4',
        threshold = 1000
    )

start()
print("Have a nice day.")
