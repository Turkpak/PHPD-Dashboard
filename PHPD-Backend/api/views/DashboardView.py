from datetime import datetime

from django.db.models import Prefetch
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Circle, District, Project, ProjectActivity, Tehsil
from api.serializers import CircleSerializer, DistrictSerializer, ProjectSerializer, TehsilSerializer


def _build_lightweight_gantt(projects):
    """Build only the nested fields consumed by the dashboard overview.

    This deliberately does not replace or modify the existing Gantt endpoints.
    Detailed activity data continues to come from project-gantt-nested/<id>/.
    """
    schedules = []

    for project in projects:
        activities = list(project.activities.all())
        children_map = {}
        for activity in activities:
            children_map.setdefault(activity.parent_id or 0, []).append(activity)

        def build_tree(parent_id=0, prefix=""):
            nodes = []
            for index, activity in enumerate(children_map.get(parent_id, []), start=1):
                node_id = f"{prefix}{index}" if prefix else str(index)
                subtasks = build_tree(activity.id, node_id)

                if subtasks:
                    weighted_sum = 0.0
                    total_weight = 0.0
                    for child in subtasks:
                        duration = float(child.get("duration") or 1)
                        progress = float(child.get("progress") or 0)
                        if progress <= 1:
                            progress *= 100
                        weighted_sum += progress * duration
                        total_weight += duration
                    progress = weighted_sum / total_weight if total_weight else 0
                    starts = [n.get("start_date") for n in subtasks if n.get("start_date")]
                    ends = [n.get("end_date") for n in subtasks if n.get("end_date")]
                    start_date = min(starts) if starts else None
                    end_date = max(ends) if ends else None
                    if start_date and end_date:
                        duration = (
                            datetime.fromisoformat(end_date) - datetime.fromisoformat(start_date)
                        ).days + 1
                    else:
                        duration = 0
                else:
                    progress = float(activity.progress or 0)
                    if progress <= 1:
                        progress *= 100
                    duration = float(activity.duration or 0)
                    start_date = activity.start_date.isoformat() if activity.start_date else None
                    end_date = activity.end_date.isoformat() if activity.end_date else None

                has_delay = activity.delay_logs.exists() or any(
                    bool(child.get("has_delay")) for child in subtasks
                )

                nodes.append({
                    "_id": node_id,
                    "id": activity.id,
                    "progress": round(progress, 2),
                    "progress_status": (
                        "Not Started" if progress <= 0 else
                        "Completed" if progress >= 100 else
                        "In Progress"
                    ),
                    "start_date": start_date,
                    "end_date": end_date,
                    "duration": duration,
                    "has_delay": has_delay,
                    "subtasks": subtasks,
                })
            return nodes

        schedules.append({
            "_id": project.id,
            "project_name": project.project_name,
            "tasks": build_tree(),
        })

    return schedules


class DashboardPageDataView(APIView):
    """Additive page-wise dashboard endpoint.

    Supported page values: zones, circles, tehsils, projects.
    The response intentionally mirrors the arrays already consumed by Dashboard.jsx,
    allowing the frontend to render every existing card/chart from one request.
    """

    permission_classes = [IsAuthenticated]

    VALID_PAGES = {"zones", "circles", "tehsils", "projects"}

    def get(self, request, page):
        if page not in self.VALID_PAGES:
            return Response({"detail": "Invalid dashboard page."}, status=404)

        circles = Circle.objects.select_related("zone").all()
        districts = District.objects.select_related("zone", "circle").all()
        tehsils = Tehsil.objects.select_related("zone", "circle", "district").all()

        activity_queryset = (
            ProjectActivity.objects
            .select_related("parent")
            .prefetch_related("delay_logs")
            .order_by("id")
        )
        projects = list(
            Project.objects
            .select_related("zone", "district", "district__circle", "tehsil", "tehsil__circle")
            .prefetch_related(
                "stakeholder",
                Prefetch("activities", queryset=activity_queryset),
            )
            .order_by("id")
        )

        return Response({
            "page": page,
            "divisions": CircleSerializer(circles, many=True).data,
            "districts": DistrictSerializer(districts, many=True).data,
            "tehsils": TehsilSerializer(tehsils, many=True).data,
            "projects": ProjectSerializer(projects, many=True, context={"request": request}).data,
            "project_gantt_all": _build_lightweight_gantt(projects),
        })
