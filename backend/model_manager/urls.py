# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('copy-model/<str:model_name>/<str:new_model_name>/', views.copy_model, name='copy-model'),
    path('delete-model/<str:model_name>/', views.delete_model, name='delete-model'),
    path('get-model-file/<str:model_name>/', views.get_model_file, name='get-model-file'),
]
