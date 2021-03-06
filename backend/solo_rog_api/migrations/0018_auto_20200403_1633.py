# Generated by Django 3.0.4 on 2020-04-03 16:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('solo_rog_api', '0017_auto_20200402_1808'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='address',
            name='address_type',
        ),
        migrations.RemoveField(
            model_name='address',
            name='document',
        ),
        migrations.AddField(
            model_name='document',
            name='holder',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='holding_documents', to='solo_rog_api.Address'),
        ),
        migrations.AddField(
            model_name='document',
            name='ship_to',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='solo_rog_api.Address'),
        ),
        migrations.AlterField(
            model_name='document',
            name='part',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='solo_rog_api.Part'),
        ),
        migrations.AlterField(
            model_name='document',
            name='sdn',
            field=models.CharField(default='', max_length=50, unique=True),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='document',
            name='service_request',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='document',
            name='suppadd',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='solo_rog_api.SuppAdd'),
        ),
        migrations.AlterField(
            model_name='status',
            name='dic',
            field=models.CharField(default='', max_length=20),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='status',
            name='esd',
            field=models.DateField(null=True),
        ),
        migrations.AlterField(
            model_name='status',
            name='key_and_transmit_date',
            field=models.DateTimeField(null=True),
        ),
        migrations.AlterField(
            model_name='status',
            name='projected_qty',
            field=models.IntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='status',
            name='received_by',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='status',
            name='received_qty',
            field=models.IntegerField(null=True),
        ),
        migrations.AlterUniqueTogether(
            name='document',
            unique_together={('service_request', 'sdn')},
        ),
        migrations.DeleteModel(
            name='AddressType',
        ),
        migrations.DeleteModel(
            name='Dic',
        ),
        migrations.DeleteModel(
            name='ServiceRequest',
        ),
    ]
