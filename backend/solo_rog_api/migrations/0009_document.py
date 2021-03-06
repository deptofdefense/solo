# Generated by Django 3.0.4 on 2020-03-11 20:34

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('solo_rog_api', '0008_locator'),
    ]

    operations = [
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sdn', models.CharField(blank=True, max_length=50, null=True)),
                ('part', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='solo_rog_api.Part')),
                ('service_request', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='solo_rog_api.ServiceRequest')),
                ('suppadd', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='solo_rog_api.SuppAdd')),
            ],
        ),
    ]
