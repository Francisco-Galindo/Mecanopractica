from django.contrib.auth.models import Group, AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Words_es(models.Model):
    word = models.CharField(max_length=33)
    weight = models.FloatField()

    def serialize(self):
        return {
            "word": self.word,
            "weight": self.weight
        }

class Text_Author(models.Model):
    first_name = models.CharField(max_length=40)
    middle_name = models.CharField(max_length=40, null=True)
    last_name = models.CharField(max_length=40)
    born_year = models.IntegerField(null=True)

class Text_Mode(models.Model):
    mode = models.CharField(max_length=30)

class Text(models.Model):   
    author = models.ForeignKey("Text_Author", on_delete=PROTECT, related_name="texts_written")
    mode = models.ForeignKey("Text_Mode", on_delete=PROTECT, related_name="texts_in_mode")
    year = models.IntegerField(null=True)
    text = models.TextField()

class Session(models.Model):
    pass
    