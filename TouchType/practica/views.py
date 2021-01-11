from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.urls import reverse
import random

from .models import User, Words_es

def main_page(request):
    return render(request, 'practica/practice.html')

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
        if password != confirmation:
            return render(request, "practica/register.html", {
                "warning": "Las contraseñas deben coincidir."
            })

        # Trata de crear un nuevo usuario
        try:
            user = User.objects.create_user(username, password)
            user.save()
        except IntegrityError:
            return render(request, "practica/register.html", {
                "warning": "Ese nombre de usuario ya está en uso."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("main_page"))

    else:
        return render(request, "practica/register.html")




# A P I

#Entregando las palabras pedidas
def words(request, mode):

    words = Words_es.objects.order_by("-weight")[:int(mode)]
    weights = []
    for word in words:
      weight = getattr(word, "weight")
      weights.append(weight)

    words_to_send = random.choices(
        population = words,
        weights = weights,
        k = 70
    )  

    return JsonResponse([word.serialize() for word in words_to_send], safe=False)

def texts(request):
    #text = random.choice(Texts.objects.all())
    #return JsonResponse(text.serialize(), safe=False)
    pass