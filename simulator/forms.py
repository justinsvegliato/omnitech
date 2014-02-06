from django.forms import (
    ModelForm, TextInput, IntegerField, Select, ModelChoiceField, 
)
from models import EngineType

class AddEngineForm(ModelForm):  

    type = ModelChoiceField(
        widget = Select(
            attrs = {
            'id': 'type-input',
            'class': 'form-control',
        }),
        queryset = EngineType.objects.all(),
        empty_label = "Select an engine type...",
        label = '',
    )
    
    class Meta:
        model = EngineType
        fields = ('type',)
    