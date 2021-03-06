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

#from .models import Group, User, Substring, Words_es, Text_Author, Text_Mode, Text, Session, Tip
from .util import *
from .models import *


def main_page(request):
    tips = Tip.objects.all()
    tip_id = random.randint(1, tips.count())
    tip = Tip.objects.get(pk=tip_id)

    modes = Text_Mode.objects.all()


    worst_finger = "No hay suficiente información"
    if request.user.is_authenticated:
        user = User.objects.get(username=request.user)

        fingers = getattr(user, "fingers")
        split_user = fingers.split(',')

        # Obteniendo información sobre los dedos del jugador
        fingers_int = []
        for finger in split_user:
            if finger != '':
                fingers_int.append(int(finger))

        fingers_added = []
        # Sumando los tecleos correctos e incorrectos de cada dedo
        for i in range(int(len(fingers_int)/2)):
            try:
                propor_correctas = fingers_int[2*i]/(fingers_int[2*i] + fingers_int[2*i+1])
            except:
                propor_correctas = 0
            fingers_added.append(propor_correctas)

        worst_finger = fingers_added.index(min(fingers_added))

        if worst_finger == 0:
            worst_finger = "Meñique izquierdo"
        elif worst_finger == 1:
            worst_finger = "Anular izquierdo"
        elif worst_finger == 2:
            worst_finger = "Corazón izquierdo"
        elif worst_finger == 3:
            worst_finger = "Índice izquierdo"
        elif worst_finger == 4:
            worst_finger = "Índice derecho"
        elif worst_finger == 5:
            worst_finger = "Corazón derecho"
        elif worst_finger == 6:
            worst_finger = "Anular derecho"
        elif worst_finger == 7:
            worst_finger = "Meñique derecho"


    return render(request, 'practica/practice.html', {
        "tip": tip,
        "finger": worst_finger,
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
    user = User.objects.get(username=request.user)

    # Guardando las estadísticas del juego en la base de datos, en caso de que el método de solicitud sea "POST"
    if request.method == "POST":
        
        # Obteniendo la información del JSON que se ha recibido
        data = json.loads(request.body)
        
        wpm = data.get("wpm")
        acc = data.get("acc")
        time = data.get("time")

        # Obteniendo la información sobre las estadísticas de cada dedo, que nos llega como una cadena, convirtiéndolo a una lista de números para actualizar los valores, 
        # Finalmente regresamos al estado de cadena para ser guardado en la base de datos
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

    # Si el método de la soliditud es "GET", obtener la información de las partidas más rápidas, convertir esa información a JSON y enviarla al solicitante
    elif request.method == "GET":
        sessions = Session.objects.filter(mode=mode_name).order_by("-wpm")[:10]
        best_sessions = []
        current_mode = getattr(mode_name, 'mode')
        for session in sessions:
            best_sessions.append(convert_session_to_dict(session, current_mode))


        return JsonResponse([json.dumps(session) for session in best_sessions], safe=False)


#Entregando las palabras pedidas
def words(request, mode):

    if request.method == "GET":
        # Obteniendo el banco de palabras correcto dependiendo del modo de jueg

        if '10' in mode or 'Fácil' in mode:
            if '10' in mode:
                words = Words_es.objects.order_by("-weight")[:int(mode)]
            else:
                words = Substring.objects.order_by("-weight")[:1000]


            user = User.objects.get(username=request.user)
            fingers = getattr(user, "fingers")
            split_user = fingers.split(',')

            # Obteniendo información sobre los dedos del jugador
            fingers_int = []
            for finger in split_user:
                if finger != '':
                    fingers_int.append(int(finger))

            finger_letters = [['q', 'a', 'á', 'z', '1', '!'], 
                                ['w', 's', 'x', '2', '\"'], 
                                ['e', 'é', 'd', 'c', '3', '#'], 
                                ['r', 'f', 'v', '4', '$', 't', 'g', 'b'], 
                                ['u', 'ú', 'j', 'm', '7', '/', 'y', 'h', 'n'], 
                                ['i', 'í', 'k', ',', '(', '8'], 
                                ['o', 'ó', 'l', '.', '9', ')'], 
                                ['p', 'ñ', '-', '=', '0']]
            fingers_added = []
            # Sumando los tecleos correctos e incorrectos de cada dedo
            for i in range(int(len(fingers_int)/2)):
                try:
                    propor_correctas = fingers_int[2*i]/(fingers_int[2*i] + fingers_int[2*i+1])
                except:
                    propor_correctas = 0
                fingers_added.append(propor_correctas)

            worst_finger = fingers_added.index(min(fingers_added))
                    
            weights = []
            for word in words:
                weight = getattr(word, "weight")
                try:
                    string = getattr(word, "word")
                except AttributeError:
                    # Si se está en el modo de palabras fáciles, usar la información de los dedos más débiles
                    string = getattr(word, "substring")
                    for char in str.lower(string):
                        if char in finger_letters[worst_finger]:
                            weight *= 1.5

                weights.append(weight)

            words_to_send = random.choices(
                population = words,
                weights = weights,
                k = 40
            )
            return JsonResponse([word.serialize() for word in words_to_send], safe=False)
            
        elif 'Glosario' in mode:
            text = random.choice(Concept.objects.all())
            string = getattr(text, 'text')
            words = string.split(' ')
            words_to_send = []
            for word in words:
                word_dict = {}
                word_dict["word"] = word
                words_to_send.append(word_dict)

            return JsonResponse([json.dumps(word) for word in words_to_send], safe=False)

