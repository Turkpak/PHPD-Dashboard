from django.db.models import Exists, OuterRef
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import ActivityDelayLog, Project, ProjectActivity


class GISProjectStatusView(APIView):
    """
    Return only the project status information required by the GIS page.

    Status rules intentionally match the existing GIS frontend behavior:
    1. in_delay: at least one delay log exists for the project;
    2. in_progress: otherwise, at least one activity has progress > 0;
    3. pending: otherwise (including projects with no activities).

    This is an additive read-only endpoint. It does not modify CRUD, models,
    authentication, the existing Gantt endpoints, or stored project data.
    """

    def get(self, request):
        delayed_activity = ActivityDelayLog.objects.filter(
            project_id=OuterRef("pk")
        )
        progressed_activity = ProjectActivity.objects.filter(
            project_id=OuterRef("pk"),
            progress__gt=0,
        )

        projects = (
            Project.objects.annotate(
                has_delay=Exists(delayed_activity),
                has_progress=Exists(progressed_activity),
            )
            .values("id", "has_delay", "has_progress")
            .order_by("id")
        )

        statuses = []
        counts = {
            "total": 0,
            "pending": 0,
            "in_progress": 0,
            "in_delay": 0,
        }

        for project in projects:
            if project["has_delay"]:
                status = "in_delay"
            elif project["has_progress"]:
                status = "in_progress"
            else:
                status = "pending"

            statuses.append({
                "project_id": project["id"],
                "status": status,
                "has_delay": bool(project["has_delay"]),
            })
            counts["total"] += 1
            counts[status] += 1

        return Response({
            "success": True,
            "counts": counts,
            "statuses": statuses,
        })
