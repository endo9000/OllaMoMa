# views.py
import requests
from django.shortcuts import render

def get_model_list():
    base_url = "http://localhost:11434"
    response = requests.get(f"{base_url}/api/tags")
    return list([model for model in response.json()["models"]])

def index(request):
    model_list = get_model_list()
    return render(request, 'index.html', {'model_list': model_list})



