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

#from .models import Group, User, Easy, Words_es, Text_Author, Text_Mode, Text, Session, Tip
from .models import *
 
def main_page(request):
    tips = Tip.objects.all()
    tip_id = random.randint(1, tips.count())
    tip = Tip.objects.get(pk=tip_id)

    modes = Text_Mode.objects.all()

    return render(request, 'practica/practice.html', {
        "tip": tip,
        #"best_scores": best_scores,
        "modes": modes
    })

def login_view(request):
    #Cuando la forma sea enviada
    if request.method == "POST":

        username = request.POST["username"]
        password = request.POST["password"]
        #Checar si la contrasena y usuario son validos
        user = authenticate(request, username=username, password=password)

        # Si son validos, iniciar sesion y cargar la pagina principal
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("main_page"))
        # Si no sn validos, avisar de ello y volver a cargar la forma
        else:
            return render(request, "practica/login.html", {
                "warning": "Usuario o contraseña incorrectos, intenta de nuevo"
            })
    #Si la request no es post, es porque solo se esta cargando la forma, mostrar dicha pagina
    else:
           return render(request, "practica/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("main_page"))

def register_view(request):
    if request.method == "POST":

        username = request.POST["username"]

        # Asegurarse de que la confirmacion de contrasena es igual
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        group = request.POST["group"]
        try:
            chosen_group = Group.objects.get(group = group)
        except  ValueError:
            chosen_group = 0

        if password != confirmation:
            return render(request, "practica/register.html", {
                "warning": "Las contraseñas deben coincidir."
            })

        # Trata de crear un nuevo usuario
        if chosen_group != 0:
            try:
                user = User.objects.create_user(username=username, password=password, group=chosen_group)
                user.save()
            except IntegrityError:
                return render(request, "practica/register.html", {
                    "warning": "Ese nombre de usuario ya está en uso."
                })
            login(request, user)
            return HttpResponseRedirect(reverse("main_page"))
        else:
            try:
                user = User.objects.create_user(username=username, password=password)
                user.save()
            except IntegrityError:
                return render(request, "practica/register.html", {
                    "warning": "Ese nombre de usuario ya está en uso."
                })
            login(request, user)
            return HttpResponseRedirect(reverse("main_page"))

    else:
        return render(request, "practica/register.html", {
            "groups": Group.objects.all()
        })



# A P I


def sessions(request, mode):

    mode_name = Text_Mode.objects.get(mode=mode)
    if request.method == "POST":
        user = User.objects.get(username=request.user)
        data = json.loads(request.body)
        
        wpm = data.get("wpm")
        acc = data.get("acc")
        time = data.get("time")

        sent_fingers = data.get("fingers")
        split_sent = sent_fingers.split(',')
        
        fingers_adder = []
        for finger in split_sent:
            if finger != '':
                fingers_adder.append(int(finger))

        user_fingers = getattr(user, "fingers")
        split_user = user_fingers.split(',')

        fingers_current = []
        for finger in split_user:
            if finger != '':
                fingers_current.append(int(finger))
        
        fingers_new_int = list(map(operator.add, fingers_adder, fingers_current))

        fingers_new = ''
        for number in fingers_new_int:
            fingers_new += str(number)
            fingers_new += ','

        user.fingers = fingers_new
        user.save()

        session = Session(user=user, mode=mode_name, wpm=wpm, acc=acc, time=time)
        session.save()

        return JsonResponse({"message": "Session saved."}, status=201)

    # Subiendo resultados de una sesion si el metodo es POST
    elif request.method == "GET":
        sessions = Session.objects.filter(mode=mode_name).order_by("-wpm")[:10]
        best_sessions = []
        current_mode = getattr(mode_name, 'mode')
        for session in sessions:
            current_session = {}
            user = getattr(session, 'user')
            username = getattr(user, 'username')
            current_session["user"] = username

            current_session["mode"] = current_mode

            current_session["wpm"] = getattr(session, 'wpm')
            current_session["acc"] = getattr(session, 'acc')
            current_session["time"] = getattr(session, 'time')

            time = getattr(session, 'times')
            datetime = time.strftime("%m/%d/%Y, %H:%M:%S")
            current_session["timestamp"] = datetime

            best_sessions.append(current_session)


        return JsonResponse([json.dumps(session) for session in best_sessions], safe=False)


#Entregando las palabras pedidas
def words(request, mode):

    if request.method == "GET":
        try:
            words = Words_es.objects.order_by("-weight")[:int(mode)]
        except ValueError:
            if mode[0: 1] == 'F':
                words = Easy.objects.order_by("-weight")[:1000]
            else:
                words = Easy.objects.order_by("-weight")[:1]

        weights = []
        for word in words:
            weight = getattr(word, "weight")
            try:
                string = getattr(word, "word")
            except AttributeError:
                string = getattr(word, "substring")
                for char in str.lower(string):
                    if char == 'a':
                        weight *= 1.5

            weights.append(weight)

        words_to_send = random.choices(
            population = words,
            weights = weights,
            k = 40
        )  


        return JsonResponse([word.serialize() for word in words_to_send], safe=False)

def texts(request):
    #text = random.choice(Texts.objects.all())
    #return JsonResponse(text.serialize(), safe=False)
    pass
