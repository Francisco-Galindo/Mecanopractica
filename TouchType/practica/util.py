from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.urls import reverse
from django.core import serializers
import json
import random
import operator
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime

from .models import *

def convert_session_to_dict(session, mode):
    current_session = {}
    user = getattr(session, 'user')
    username = getattr(user, 'username')
    current_session["user"] = username

    current_session["mode"] = mode

    current_session["wpm"] = getattr(session, 'wpm')
    current_session["acc"] = getattr(session, 'acc')
    current_session["time"] = getattr(session, 'time')

    time = getattr(session, 'times')
    datetime = time.strftime("%m/%d/%Y, %H:%M:%S")
    current_session["timestamp"] = datetime

    return current_session

def finger_list_to_ints(fingers):
    split_fingers = fingers.split(',')

    # Obteniendo información sobre los dedos del jugador
    fingers_int = []
    for finger in split_fingers:
        if finger != '':
            fingers_int.append(int(finger))

    return fingers_int

def fingers_proportions(fingers_int):
    fingers_added = []
    # Sumando los tecleos correctos e incorrectos de cada dedo
    for i in range(int(len(fingers_int)/2)):
        try:
            propor_correctas = fingers_int[2*i]/(fingers_int[2*i] + fingers_int[2*i+1])
        except:
            propor_correctas = 0
        fingers_added.append(propor_correctas)

    return fingers_added

def get_worst_finger_string(worst_finger):
    
    if worst_finger == 0:
        worst_finger = "Menique izquierdo"
    elif worst_finger == 1:
        worst_finger = "Anular izquierdo"
    elif worst_finger == 2:
        worst_finger = "medio izquierdo"
    elif worst_finger == 3:
        worst_finger = "indice izquierdo"
    elif worst_finger == 4:
        worst_finger = "indice derecho"
    elif worst_finger == 5:
        worst_finger = "medio derecho"
    elif worst_finger == 6:
        worst_finger = "Anular derecho"
    elif worst_finger == 7:
        worst_finger = "Menique derecho"

    return worst_finger