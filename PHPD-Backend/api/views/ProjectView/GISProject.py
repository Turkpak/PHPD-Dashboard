from ..common_imports import *
from django.db.models import Prefetch

class GISProjectView(viewsets.ViewSet):
    permission_classes = [AllowAny]
    serializer_class = GISProjectSerializer

    def list(self, request, *args, **kwargs):
        try:
            project_id = request.query_params.get("id")
            zone_id = request.query_params.get("zone")
            circle_id = request.query_params.get("circle")
            district_id = request.query_params.get("district")
            tehsil_id = request.query_params.get("tehsil")

            queryset = (
                Project.objects
                .select_related(
                    "zone",
                    "district",
                    "tehsil",
                )
                .prefetch_related("stakeholder")
            )

            # ------------------------
            # Filters
            # ------------------------

            if project_id:
                queryset = queryset.filter(id=project_id)

            if zone_id:
                queryset = queryset.filter(zone_id=zone_id)

            if circle_id:
                queryset = queryset.filter(tehsil__circle_id=circle_id)

            if district_id:
                queryset = queryset.filter(district_id=district_id)

            if tehsil_id:
                queryset = queryset.filter(tehsil_id=tehsil_id)

            serializer = GISProjectSerializer(queryset, many=True)

            return ApiResponse(
                data=serializer.data,
                status=status.HTTP_200_OK,
                message="GIS Projects fetched successfully."
            )

        except Exception as e:
            return ApiResponse(
                data=str(e),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Server error.",
                error_traceback=traceback.format_exc()
            )