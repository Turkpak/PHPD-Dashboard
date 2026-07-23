from rest_framework.views import APIView
from rest_framework.response import Response

from api.models import Project


class GISProjectStatusView(APIView):
    """
    Returns lightweight project statuses for the GIS page.

    Response:
    [
        {
            "project_id": 1,
            "status": "pending"
        },
        {
            "project_id": 2,
            "status": "in_progress"
        },
        {
            "project_id": 3,
            "status": "in_delay"
        }
    ]
    """

    permission_classes = []

    def get(self, request):
        projects = Project.objects.prefetch_related(
            "activities__delay_logs"
        )

        data = []

        for project in projects:
            activities = list(project.activities.all())

            # No activities
            if not activities:
                status = "pending"

            else:
                has_delay = False
                has_progress = False

                for activity in activities:

                    # Delay exists
                    if activity.delay_logs.exists():
                        has_delay = True
                        break

                    # Progress started
                    if (activity.progress or 0) > 0:
                        has_progress = True

                if has_delay:
                    status = "in_delay"
                elif has_progress:
                    status = "in_progress"
                else:
                    status = "pending"

            data.append({
                "project_id": project.id,
                "status": status,
            })

        return Response(data)