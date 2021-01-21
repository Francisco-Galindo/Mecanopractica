from django.contrib import admin
from .models import Group, User, Words_es, Text_Author, Text_Mode, Text, Session
# Register your models here.
admin.site.register(User)
admin.site.register(Words_es)
admin.site.register(Text_Author)
admin.site.register(Text_Mode)
admin.site.register(Text)
admin.site.register(Session)
admin.site.register(Group)

