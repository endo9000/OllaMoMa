# views.py
import requests
from django.shortcuts import render

def get_model_list():
    base_url = "http://localhost:11434"
    response = requests.get(f"{base_url}/api/tags")

    model_list = []
    for model in response.json()["models"]:
        model_list.append(model)
    return model_list

def index(request):
    model_list = get_model_list()
    return render(request, 'index.html', {'model_list': model_list})



