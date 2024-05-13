# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('rename-model/<str:model_name>/<str:new_model_name>/', views.rename_model, name='rename-model'),
    path('duplicate-model/<str:model_name>/<str:new_model_name>/', views.duplicate_model, name='duplicate-model'),
    path('delete-model/<str:model_name>/', views.delete_model, name='delete-model'),
    path('get-model-file/<str:model_name>/', views.get_model_file, name='get-model-file'),
]
