# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('delete-model/<str:model_name>/', views.delete_model, name='delete-model'),
    path('rename-model/<str:model_name>/<str:new_model_name>/', views.rename_model, name='rename-model'),
]
