# views.py

import json
import requests
from django.http import HttpResponse
from django.shortcuts import render

BASE_URL = "http://localhost:11434"


def index(request):
    """Render the index page with a list of models"""
    models = get_model_list()
    return render(request, "index.html", {"model_list": models})


def get_model_list():
    """Get a list of models from the API"""
    try:
        response = requests.get(f"{BASE_URL}/api/tags")
        response.raise_for_status()
        models = response.json()["models"]
        return [
            dict(
                model,
                **{
                    "showInfoPage": True,
                    "showModelPage": False,
                    "confirmRename": False,
                    "confirmCopy": False,
                    "confirmDelete": False,
                },
            )
            for model in models
        ]

    except requests.exceptions.RequestException as e:
        return [{"error": str(e)}]


def get_model_file(model_name):
    """Get a modelfile from the API"""
    try:
        response = requests.get(f"{BASE_URL}/api/show")
        response.raise_for_status()
        modelfile = response.json()["modelfile"]
        return modelfile
    except requests.exceptions.RequestException as e:
        return [{"error": str(e)}]


def copy_model(request, model_name: str, new_model_name: str):
    """Copy a model from the API"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/copy",
            json={"source": model_name, "destination": new_model_name},
        )
        response.raise_for_status()
        return HttpResponse(
            json.dumps({"status": response.status_code}),
            content_type="application/json",
        )
    except requests.exceptions.RequestException as e:
        return HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            content_type="application/json",
        )


def delete_model(request, model_name: str):
    """Delete a model from the API"""
    try:
        response = requests.delete(f"{BASE_URL}/api/delete", json={"name": model_name})
        response.raise_for_status()
        return HttpResponse(
            json.dumps({"status": "Model deleted successfully"}),
            content_type="application/json",
        )
    except requests.exceptions.RequestException as e:
        return HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            content_type="application/json",
        )


def rename_model(request, model_name: str, new_model_name: str):
    """Rename a model from the API"""
    try:
        copy_model(request, model_name, new_model_name)
        delete_model(request, model_name)
        return HttpResponse(
            json.dumps({"status": "Model renamed successfully"}),
            content_type="application/json",
        )
    except Exception as e:
        return HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            content_type="application/json",
        )


def duplicate_model(request, model_name: str, new_model_name: str):
    """Duplicate a model from the API"""
    try:
        copy_model(request, model_name, new_model_name)
        return HttpResponse(
            json.dumps({"status": "Model duplicated successfully"}),
            content_type="application/json",
        )
    except Exception as e:
        return HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            content_type="application/json",
        )
