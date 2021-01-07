from django.contrib.auth.models import Group, AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Words_es(models.Model):
    word = models.CharField(max_length=33)
    weight = models.FloatField()

    def serialze(self):
        return {
            "word": self.word,
            "weight": self.weight
        }