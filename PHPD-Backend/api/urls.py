from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import *
from api.views.DashboardView import DashboardPageDataView
router = DefaultRouter()

#--------------------------------- User View ---------------------------------
router.register(r'create-user', UserCreateView, basename='create-user')
router.register(r'login-user', UserLoginDashboardCreateView, basename='login-user')
router.register(r'get-user', GetUserView, basename='get-user')
router.register(r'update-user', UserUpdateView, basename='update-user')
router.register(r'user-permissions', UserPermissionViewSet, basename='user-permissions')

#--------------------------------- Zone View ---------------------------------
router.register(r'create-zone', ZoneCreateView, basename='create-zone')
router.register(r'list-zone', ListZoneView, basename='list-zone')
router.register(r'update-zone', ZoneUpdateView, basename='update-zone') 
router.register(r'delete-zone', ZoneDeleteView, basename='delete-zone')

#--------------------------------- Circle View ---------------------------------
router.register(r'create-circle', CircleCreateView, basename='create-circle')
router.register(r'list-circle', ListCircleView, basename='list-circle')
router.register(r'update-circle', CircleUpdateView, basename='update-circle') 
router.register(r'delete-circle', CircleDeleteView, basename='delete-circle')

#--------------------------------- District View ---------------------------------
router.register(r'create-district', DistrictCreateView, basename='create-district')
router.register(r'list-district', ListDistrictView, basename='list-district')
router.register(r'update-district', DistrictUpdateView, basename='update-district') 
router.register(r'delete-district', DistrictDeleteView, basename='delete-district')

#---------------------------------- Tehsil View ----------------------------------
router.register(r'create-tehsil', TehsilCreateView, basename='create-tehsil')
router.register(r'list-tehsil', ListTehsilView, basename='list-tehsil')
router.register(r'update-tehsil', TehsilUpdateView, basename='update-tehsil') 
router.register(r'delete-tehsil', TehsilDeleteView, basename='delete-tehsil')

#---------------------------------- Stakeholder View ----------------------------------
router.register(r'create-stakeholder', StakeholderCreateView, basename='create-stakeholder')
router.register(r'list-stakeholder', ListStakeholderView, basename='list-stakeholder')
router.register(r'update-stakeholder', StakeholderUpdateView, basename='update-stakeholder')
router.register(r'delete-stakeholder', StakeholderDeleteView, basename='delete-stakeholder')

#---------------------------------- Project View ----------------------------------
router.register(r'create-project', ProjectCreateView, basename='create-project')
router.register(r'list-project', ListProjectView, basename='list-project')
router.register(r'update-project', ProjectUpdateView, basename='update-project') 
router.register(r'delete-project', ProjectDeleteView, basename='delete-project')
router.register(r'top-projects', TopProjectsView, basename='top-projects')

#---------------------------------- Project Activity View ----------------------------------
router.register(r'create-project-activity', ProjectActivityCreateView, basename='create-project-activity')
router.register(r'list-project-activity', ListProjectActivityView, basename='list-project-activity')
router.register(r'update-project-activity', ProjectActivityUpdateView, basename='update-project-activity')
router.register(r'delete-project-activity', ProjectActivityDeleteView, basename='delete-project-activity')
# router.register(r'project-gantt', ProjectGanttView, basename='project-gantt')

router.register(r'create-progress-image', ProgressImageCreateViewSet, basename='create-progress-image')
router.register(r'list-progress-image', ListProgressImageView, basename='list-progress-image')
router.register(r'update-progress-image', ProgressImageUpdateView, basename='update-progress-image')
router.register(r'delete-progress-image', DeleteProgressImageView, basename='delete-progress-image')

# ---------------------------------- Project Document View ----------------------------------

router.register(r'create-project-document', ProjectDocumentCreateView, basename='create-project-document')
router.register(r'list-project-document', ListProjectDocumentView, basename='list-project-document')
router.register(r'update-project-document', UpdateProjectDocumentView, basename='update-project-document')
router.register(
    r'gis-project',
    GISProjectView,
    basename='gis-project'
)

# Mounted under /api/ from server.urls — single include keeps routes at /api/<resource>/.
urlpatterns = [
    path('', include(router.urls)),

    # ✅ Gantt API
    path('project-gantt/<int:project_id>/', ProjectGanttView.as_view(), name='project-gantt'),

    # ✅ NEW: Update Actual Task Data
    path('update-task-actual/<int:task_id>/', UpdateTaskActualView.as_view(), name='update-task-actual'),

    # urls.py
    path('project-gantt-nested/<int:project_id>/', ProjectGanttNestedView.as_view(), name='project-gantt-nested'),

    path('project-gantt-all/', ProjectGanttAllView.as_view(), name='project-gantt-all'),
    # *
    path('project-summary/', ProjectSummaryView.as_view(), name='project-summary'),

    path("add-delay-log/", ActivityDelayLogCreateView.as_view()),
    path("list-delay-log/", ActivityDelayLogListView.as_view()),
    path("update-delay-log/<int:pk>/", ActivityDelayLogUpdateView.as_view()),
    path(
        "gis-project-status/",
        GISProjectStatusView.as_view(),
        name="gis-project-status",
    ),
    path(
        "dashboard/<str:page>/", DashboardPageDataView.as_view(),
        name="dashboard-page-data",
    ),
]

# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)