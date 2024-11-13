from django.urls import path 
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('api/admin-boundaries/<int:level>/', views.get_admin_boundaries, name='admin_boundaries'),
    path('get-region-data/<int:region_id>/<int:level>/', views.get_region_data, name='get_region_data'),
    
    path('get-road-data/<int:road_id>/<int:is_pkha>/', views.get_road_data, name='get_road_data'),
    path('get-bridge-data/<int:bridge_id>/', views.get_bridge_data, name='get_bridge_data'),
    path('view-individual-road/<str:road_name>/<int:is_pkha>/', views.view_individual_road, name='view_individual_road'),
    path('view-individual-bridge/<str:bridge_name>/', views.view_individual_bridge, name='view_individual_bridge'),
]