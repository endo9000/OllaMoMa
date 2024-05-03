# filters.py

from django import template

register = template.Library()

@register.filter
def format_size(size):
    size = int(size)
    mb_size = size / (1024 * 1024)  # Convert bytes to megabytes
    gb_size = mb_size / 1024  # Convert megabytes to gigabytes
    if gb_size >= 1:
        return f"{gb_size:.2f} GB"
    else:
        return f"{mb_size:.2f} MB"
