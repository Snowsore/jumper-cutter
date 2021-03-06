#!/usr/bin/env python3

import sys
import eventlet
import socketio

HOST = sys.argv[1]
POST = int(sys.argv[2])

sio = socketio.Server()
app = socketio.WSGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'}
})

@sio.event
def connect(sid, environ):
    print('connect ', sid)

@sio.event
def my_message(sid, data):
    print('message ', data)

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

@sio.event
def my_message(sid, data):
    print('message received with ', data['msg'])
    sio.emit('my response', {'response': 'my response'})

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen((HOST, POST)), app)