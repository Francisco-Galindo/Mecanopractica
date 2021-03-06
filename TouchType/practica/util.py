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