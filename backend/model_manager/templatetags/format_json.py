import json

from django.template import Library

register = Library()

@register.filter
def format_json(value):
    return json.dumps(value)
