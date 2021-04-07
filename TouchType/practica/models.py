from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.deletion import DO_NOTHING


############### Recuerda purgar la base de datos, de todas maneras la vamos a mover a Postgres


class Group(models.Model):
    group = models.IntegerField(default=0)
    def __str__(self):
        return f"{self.group}"

class User(AbstractUser):
    group = models.ForeignKey("Group", on_delete=models.PROTECT, null=True, blank=True)
    fingers = models.CharField(max_length=128, null=True, default='0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0')

    def __str__(self):
        return f"{self.username}"

class Substring_es(models.Model):
    substring = models.CharField(max_length=33)
    weight = models.FloatField()

    def __str__(self):
        return f"{self.substring}, hola"

    def serialize(self):
        return {
            "word": self.substring,
            "weight": self.weight
        }

class Words_es(models.Model):
    word = models.CharField(max_length=33)
    weight = models.FloatField()

    def __str__(self):
        return f"{self.word}"

    def serialize(self):
        return {
            "word": self.word,
            "weight": self.weight
        }

class Text_Author(models.Model):
    first_name = models.CharField(max_length=40)
    middle_name = models.CharField(max_length=40, null=True, blank=True)
    last_name = models.CharField(max_length=40)
    born_year = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.last_name}, {self.first_name}"

class Text_Mode(models.Model):
    mode = models.CharField(max_length=45)

    def __str__(self):
        return f"{self.mode}"

class Text(models.Model):   
    title = models.TextField()
    author = models.ForeignKey("Text_Author", on_delete=models.PROTECT, related_name="texts_written", null=False, default=1) 
    mode = models.ForeignKey("Text_Mode", on_delete=models.PROTECT, related_name="texts_in_mode", null=False, default=1)
    year = models.IntegerField(null=True)
    text = models.TextField()

    def serialize(self):
        return {
            "author": self.author,
            "mode": self.mode,
            "year": self.year,
            "text": self.text
        }
    def __str__(self):
        return f"{self.title}, {self.pk}"

class Session(models.Model):
    user = models.ForeignKey("User", on_delete=models.DO_NOTHING, related_name="players_that_played")
    mode = models.ForeignKey("Text_Mode", on_delete=models.DO_NOTHING, related_name="session_on_mode")
    text = models.ForeignKey("Text", on_delete=models.DO_NOTHING, related_name="sessions_in_text", blank=True, null=True)
    answered_correctly = models.BooleanField(null=True, blank=True)
    leitner_box = models.IntegerField(null=True, blank=True)
    wpm = models.FloatField()
    acc = models.FloatField()
    time = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "user": self.user,
            "mode": self.mode,
            "wpm": self.wpm,
            "acc": self.acc,
            "time": self.time,
            "timestamp": self.times.strftime("%b %#d %Y, %#I:%M %p")
        }

    def __str__(self):
        return f"Fecha: {self.timestamp} ||| Modo:{self.mode}"


class Tip(models.Model):
    tip = models.CharField(max_length=200, null=True, blank=True)  

    def __str__(self):
        return f"{self.tip}"