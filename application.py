import os

from flask import Flask, render_template, redirect, request, jsonify
from flask_socketio import SocketIO, emit
from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

#ensure response aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


chats = {}
mesid = {}

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/channel", methods=["POST", "GET"])
def channel():
    if request.method == "POST":
        channel = request.form.get("channel")
        if channel not in list(chats.keys()):
            chats[channel] = []
            return jsonify({"answer": True})
        else:
            return jsonify({"answer": False})
    else:
        return jsonify(list(chats.keys()))



@app.route("/channels/<road>")
def channels(road):
    return render_template("channel.html", url=road, messages=chats[road])


@socketio.on('messaging')
def messaging(data):
    message = data['message']
    sender = data['sender']
    chat = data['chat']
    time = datetime.now().strftime('%H:%M')
    if chat not in mesid:
        mesid[chat] = 0
    else:
        mesid[chat] += 1
    if mesid[chat] > 99: mesid[chat] = 0
    idmes = mesid[chat]
    chats[chat].append([idmes, time, sender, message])
    emit("showing message", {'id': idmes, 'time': time, 'message': message, 'sender': sender}, broadcast=True)
    if len(chats[chat]) > 100:
        del(chats[chat][0])
    
@socketio.on('removing message')
def remove(data):
    chat = data['chat']
    print(chat)
    idmes = data['id']
    print(idmes)
    for i in range(len(chats[chat])):
        print(chats[chat][i])
        print(chats[chat][i][0])
        if int(idmes) == int(chats[chat][i][0]):
            del chats[chat][i]
            print(chats[chat])
            break
    emit('rem message', {'id': data['id']},  broadcast=True)
    return True