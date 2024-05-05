# views.py
import json
import urllib.request
from django.http import JsonResponse
from django.shortcuts import render

def index(request):
    model_list = get_model_list()
    return render(request, 'index.html', {'model_list': model_list})

BASE_URL = 'http://localhost:11434'

def get_model_list():
    url = f'{BASE_URL}/api/tags'
    response = urllib.request.urlopen(url)
    return [model for model in json.loads(response.read())['models']]

def copy_model(request, model_name: str, new_model_name: str):
    url = f'{BASE_URL}/api/copy'
    data = {'source': model_name, 'destination': new_model_name}
    req = urllib.request.Request(url, json.dumps(data).encode(), method='POST')
    response = urllib.request.urlopen(req)
    return JsonResponse({'status': response.getcode()})

def delete_model(request, model_name: str):
    url = f'{BASE_URL}/api/delete'
    data = {'name': model_name}
    req = urllib.request.Request(url, json.dumps(data).encode(), method='DELETE')
    response = urllib.request.urlopen(req)
    return JsonResponse({'status': response.getcode()})

def rename_model(request, model_name: str, new_model_name: str):
    copy_model(request, model_name, new_model_name)
    delete_model(request, model_name)

def duplicate_model(request, model_name: str):
    copy_model(request, model_name, model_name + '_copy')

