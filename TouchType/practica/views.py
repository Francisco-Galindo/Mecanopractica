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
from datetime import datetime

from .util import *
from .models import *

def main_page(request):
    return render(request, "practica/landing_page.html")


def game_page(request):
    tips = Tip.objects.all()
    tip_id = random.randint(1, tips.count())
    tip = Tip.objects.get(pk=tip_id)

    modes = []
    glosarios = []
    for mode in Text_Mode.objects.all():
        if "Glosario" in getattr(mode, "mode"):
            glosarios.append(mode)
        else:
            modes.append(mode)


    worst_finger = "No hay suficiente información"
    if request.user.is_authenticated:
        user = User.objects.get(username=request.user)

        fingers = finger_list_to_ints(getattr(user, "fingers"))
        fingers_added = fingers_proportions(fingers)

        worst_finger = fingers_added.index(min(fingers_added))
        worst_finger = get_worst_finger_string(worst_finger)
    

        return render(request, 'practica/practice.html', {
            "tip": tip,
            "finger": worst_finger,
            "modes": modes,
            "glosarios": glosarios
        })

    else:
        return HttpResponseRedirect(reverse("main_page"))


def top_page(request):
    modes = []
    glosarios = []
    for mode in Text_Mode.objects.all():
        if "Glosario" in getattr(mode, "mode"):
            glosarios.append(mode)
        else:
            modes.append(mode)
    return render(request, 'practica/leaderboard.html', {
        "modes": modes,
        "glosarios": glosarios
    })

def user_page(request):
    if request.user.is_authenticated:
        modes = []
        glosarios = []
        for mode in Text_Mode.objects.all():
            if "Glosario" in getattr(mode, "mode"):
                glosarios.append(mode)
            else:
                modes.append(mode)
        return render(request, 'practica/user_stats.html', {
            "modes": modes,
            "glosarios": glosarios
        })


    else:
        return HttpResponseRedirect(reverse("main_page"))


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
        # Si no son validos, avisar de ello y volver a cargar la forma
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
        try:
            group = request.POST["group"]
            chosen_group = Group.objects.get(group = group)
        except:
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
        sent_fingers = finger_list_to_ints(data.get("fingers"))

        user_fingers = finger_list_to_ints(getattr(user, "fingers"))
        
        fingers_new_int = list(map(operator.add, sent_fingers, user_fingers))

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

            fingers = finger_list_to_ints(getattr(user, "fingers"))
            fingers_added = fingers_proportions(fingers)
            worst_finger = fingers_added.index(min(fingers_added))

            finger_letters = [['q', 'a', 'á', 'z', '1', '!'], 
                                ['w', 's', 'x', '2', '\"'], 
                                ['e', 'é', 'd', 'c', '3', '#'], 
                                ['r', 'f', 'v', '4', '$', 't', 'g', 'b'], 
                                ['u', 'ú', 'j', 'm', '7', '/', 'y', 'h', 'n'], 
                                ['i', 'í', 'k', ',', '(', '8'], 
                                ['o', 'ó', 'l', '.', '9', ')'], 
                                ['p', 'ñ', '-', '=', '0']]
                    
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
                            weight *= 2

                weights.append(weight)

            words_to_send = random.choices(
                population = words,
                weights = weights,
                k = 40
            )
            return JsonResponse([word.serialize() for word in words_to_send], safe=False)
            
        elif 'Glosario' in mode or 'Texto' in mode:
            concept_mode = Text_Mode.objects.get(mode=mode)
            try:
                text = random.choice(Concept.objects.filter(mode=concept_mode))
            except:
                text = random.choice(Text.objects.filter(mode=concept_mode))
            string = getattr(text, 'text')
            words = string.split(' ')
            words_to_send = []
            for word in words:
                word_dict = {}
                word_dict["word"] = word
                words_to_send.append(word_dict)

            return JsonResponse([json.dumps(word) for word in words_to_send], safe=False)


def get_all_user_stats(request, mode):
    if request.method == "GET" and request.user.is_authenticated:
        user = User.objects.get(username=request.user)
        fingers = finger_list_to_ints(getattr(user, "fingers"))
        fingers_added = fingers_proportions(fingers)
        worst_finger = fingers_added.index(min(fingers_added))
        worst_finger = get_worst_finger_string(worst_finger)

        actual_mode = Text_Mode.objects.get(mode=mode)
        sessions = user.players_that_played.filter(mode=actual_mode)
        json_sessions = []
        for session in sessions:
            json_session = json.dumps(convert_session_to_dict(session, mode), ensure_ascii=False)
            json_sessions.append(json_session)

        dict_to_send = {}
        dict_to_send["sessions"] = json_sessions
        dict_to_send["fingers"] = fingers_added
        dict_to_send["worst_finger"] = worst_finger

        return JsonResponse(json.dumps(dict_to_send, ensure_ascii=False), safe=False)
