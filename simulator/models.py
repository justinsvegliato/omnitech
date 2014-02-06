from django.db import models

class EngineType(models.Model):
    type = models.CharField(max_length=30)
    fixed_engine_cost = models.DecimalField(max_digits=19, decimal_places=10)
    linear_engine_cost = models.DecimalField(max_digits=19, decimal_places=10)
    fixed_energy_output = models.DecimalField(max_digits=19, decimal_places=10)
    linear_energy_output = models.DecimalField(max_digits=19, decimal_places=10)
    minimum_rpm = models.IntegerField()
    maximum_rpm = models.IntegerField()
    
    def __unicode__(self):
        return self.type