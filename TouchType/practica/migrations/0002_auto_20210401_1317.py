# Generated by Django 3.1.4 on 2021-04-01 19:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('practica', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='session',
            name='text',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='sessions_in_text', to='practica.text'),
        ),
    ]
