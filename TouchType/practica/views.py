from hashlib import new
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.http import request
from django.urls import reverse
from django.core import serializers
import json
import random
import operator
from datetime import datetime

from .util import *
from .models import *

def main_page(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("landing_page"))

    modes = []
    glosarios = []
    for mode in Text_Mode.objects.all().order_by('mode'):
        if "Glosario" in getattr(mode, "mode"):
            glosarios.append(mode)
        else:
            modes.append(mode)

    return render(request, "practica/main_page.html", {
        "modes": modes,
        "glosarios": glosarios       
    })

def landing_page(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse("main_page"))

    return render(request, "practica/landing_page.html")


def game_page(request):
    tips = Tip.objects.all()
    tip_id = random.randint(1, tips.count())
    tip = Tip.objects.get(pk=tip_id)

    modes = []
    glosarios = []
    for mode in Text_Mode.objects.all().order_by('mode'):
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
    for mode in Text_Mode.objects.all().order_by('mode'):
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
        for mode in Text_Mode.objects.all().order_by('mode'):
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

#Hola
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
    

    # Guardando las estadísticas del juego en la base de datos, en caso de que el método de solicitud sea "POST"
    if request.method == "POST" and request.user.is_authenticated:
        
        user = User.objects.get(username=request.user)
        # Obteniendo la información del JSON que se ha recibido
        data = json.loads(request.body)
        
        wpm = data.get("wpm")
        acc = data.get("acc")
        time = data.get("time")

        text_id = data.get('text_id')

        try:
            text = Text.objects.get(pk=int(text_id))
        except:
            text = None

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

        
        # Guardando la partida del jugador
        if text and ('Glosario' in mode or 'Texto' in mode):

            answered_correctly = data.get('answered_correctly')
            leitner_box = data.get('leitner')
            print(f"\n\n\n\n\n\n{leitner_box}\n{leitner_box == None}\n\n\n\n\n")
            if answered_correctly != None and leitner_box != None and 'Glosario' in mode:
                session = Session(user=user, mode=mode_name, wpm=wpm, acc=acc, time=time, text=text, answered_correctly=answered_correctly, leitner_box=leitner_box)
            else:
                session = Session(user=user, mode=mode_name, wpm=wpm, acc=acc, time=time, text=text)
        else:
            session = Session(user=user, mode=mode_name, wpm=wpm, acc=acc, time=time)
        print('lolololololololol')
        session.save()

        return JsonResponse({"message": "Session saved."}, status=201)

    # Si el método de la soliditud es "GET", obtener la información de las partidas más rápidas, convertir esa información a JSON y enviarla al solicitante
    elif request.method == "GET":
        sessions = Session.objects.filter(mode=mode_name).order_by("-wpm")[:13]
        best_sessions = []
        current_mode = getattr(mode_name, 'mode')
        for session in sessions:
            best_sessions.append(convert_session_to_dict(session, current_mode))


        return JsonResponse([json.dumps(session) for session in best_sessions], safe=False)


#Entregando las palabras pedidas
def words(request, mode):

    if request.method == "GET" and request.user.is_authenticated:
        # Obteniendo el banco de palabras correcto dependiendo del modo de juego
        user = User.objects.get(username=request.user)
        fingers = finger_list_to_ints(getattr(user, "fingers"))
        fingers_added = fingers_proportions(fingers)
        worst_finger = fingers_added.index(min(fingers_added))


        if '10' in mode or 'Fácil' in mode:
            if '10' in mode:
                mode_split = mode.split(' ')
                words = Words_es.objects.order_by("-weight")[:int(mode_split[0])]
            else:
                words = Substring_es.objects.order_by("-weight")[:1000]

            finger_letters =    [['q', 'a', 'á', 'z', '1', '!'], 
                                ['w', 's', 'x', '2', '\"'], 
                                ['e', 'é', 'd', 'c', '3', '#'], 
                                ['r', 'f', 'v', '4', '$', 't', 'g', 'b'], 
                                ['u', 'ú', 'j', 'm', '7', '/', 'y', 'h', 'n'], 
                                ['i', 'í', 'k', ',', '(', '8'], 
                                ['o', 'ó', 'l', '.', '9', ')'], 
                                ['p', 'ñ', '-', '=', '0']]
                    
            weight_list = []
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

                weight_list.append(weight)

            words_to_send = random.choices(
                population = words,
                weights = weight_list,
                k = 50
            )
            return JsonResponse([word.serialize() for word in words_to_send], safe=False)
            
        elif 'Glosario' in mode or 'Texto' in mode:
            mode_split = mode.split(',')
            mode = mode_split[0]
            concept_mode = Text_Mode.objects.get(mode=mode)
            
            info_dict = {}
            if 'Glosario' in mode and mode_split[1] == 'true':

                
                total_text_list = concept_mode.texts_in_mode.all()
                sessions = user.players_that_played.filter(mode=concept_mode).order_by('-timestamp')
                sessions_with_answers = []
                for session in sessions:
                    if getattr(session, 'answered_correctly') != None:
                        sessions_with_answers.append(session)

                box_weight_list = [16, 8, 4, 2, 1]


                list_of_possible_texts = []
                list_of_weights = []
                for text in total_text_list:
                    has_sessions_with_anwers = False
                    for session in sessions_with_answers:
                        if getattr(session, 'text') == text:
                            previous_leitner = getattr(session, 'leitner_box')
                            answer = getattr(session, 'answered_correctly')
                            if previous_leitner == None or answer == False:
                                new_leitner = 0
                            else:
                                new_leitner = previous_leitner + 1

                            if new_leitner > 4:
                                new_leitner = 4

                            list_of_weights.append(box_weight_list[4-new_leitner])
                            list_of_possible_texts.append((text, new_leitner))
                            has_sessions_with_anwers = True
                            break

                    if has_sessions_with_anwers == False:
                        sessions_in_text = list(user.players_that_played.filter(text=text))
                        if sessions_in_text:
                            list_of_weights.append(box_weight_list[0])
                            list_of_possible_texts.append((text, 0))   
                    
                
                try:
                    text_to_send = random.choices(
                        population = list_of_possible_texts,
                        weights = list_of_weights,
                        k = 1
                    )

                    text_tuple = text_to_send[0]
                except:
                    text_tuple = (random.choice(Text.objects.all()), 0)
                    info_dict['error'] = 'No hay suficientes partidas en este glosario como para repasar, juega con más conceptos con el modo de repaso desactivado para poder ativar el modo repaso.'

                
                text = text_tuple[0]
                leitner = text_tuple[1]
                info_dict['leitner'] = leitner
                string = getattr(text, 'text')

                options = []
                for i in range(3):
                    if i == 2:
                        option_text = string
                    else:
                        while True:
                            option_to_add = random.choice(Text.objects.filter(mode=concept_mode))

                            if getattr(option_to_add, 'text') != string:
                                break
                        option_text = getattr(option_to_add, 'text')

                    option_string = ''
                    j = 0
                    while option_text[j] != ':' and option_text[j] != '.':
                        option_string += option_text[j]
                        j += 1
                    options.append(option_string)


                print(options)
                info_dict['answer'] = options[-1]
                random.shuffle(options)

                info_dict['options'] = options

                new_string = ''
                start_copying = False
                for i in range(len(string)):
                    if start_copying == True:
                        new_string += string[i]
                    if string[i] == ' ' and (string[i-1] == ':' or string[i-1] == '.'):
                         start_copying = True


                words = new_string.split(' ')
                        
            else:

                
                text = random.choice(Text.objects.filter(mode=concept_mode))

                string = getattr(text, 'text')
                words = string.split(' ')
                

            words_to_send = []
            author = getattr(text, 'author')
            info_dict['author'] = f"{getattr(author, 'first_name')[0]}. {getattr(author, 'last_name')}, \"{getattr(text, 'title')}\", {getattr(text, 'year')}"

            info_dict['id'] = f"{getattr(text, 'pk')}"

            words_to_send.append(info_dict)

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