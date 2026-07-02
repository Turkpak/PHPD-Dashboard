from django.db.models import Sum

from ..common_imports import *

class ProjectSummaryView(APIView):

    def get(self, request):
        try:
            project_id = request.query_params.get("project_id")

            queryset = Project.objects.all()

            if project_id:
                queryset = queryset.filter(id=project_id)

                if not queryset.exists():
                    return ApiResponse(
                        status=404,
                        message="Project not found",
                        http_status=404
                    ).create_response()

            # ----------------------------------------
            # AGGREGATE (CORRECT FIELDS)
            # ----------------------------------------
            data = queryset.aggregate(
                total_budget=Sum('total_budget'),
                total_consumed=Sum('total_consume'),
                total_remaining=Sum('remaining_budget')
            )

            # ---------- SAFE VALUES ----------
            total_budget = float(data['total_budget'] or 0)
            total_consumed = float(data['total_consumed'] or 0)
            total_remaining = float(data['total_remaining'] or 0)

            # ---------- PERCENTAGE ----------
            utilization_percentage = (
                (total_consumed / total_budget) * 100
                if total_budget > 0 else 0
            )

            # ----------------------------------------
            # RESPONSE
            # ----------------------------------------
            response = {
                "project_id": project_id if project_id else "ALL",

                "total_budget": total_budget,
                "total_consumed": total_consumed,
                "total_remaining": total_remaining,

                "utilization_percentage": round(utilization_percentage, 2)
            }

            return ApiResponse(
                status=200,
                message="Project Summary",
                data=response,
                http_status=200
            ).create_response()

        except Exception as e:
            return ApiResponse(
                status=500,
                message="Error",
                data=str(e),
                http_status=500
            ).create_response()