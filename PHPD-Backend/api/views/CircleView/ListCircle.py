from ..common_imports import *

class ListCircleView(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        try:
            circle_id = request.query_params.get("id")
            zone_id = request.query_params.get("zone")

            # Case 1: Get single circle by ID
            if circle_id:
                circle = Circle.objects.filter(id=circle_id).first()
                if not circle:
                    return ApiResponse(
                        status=status.HTTP_404_NOT_FOUND,
                        message="Circle not found.",
                        http_status=status.HTTP_404_NOT_FOUND
                    ).create_response()

                serializer = CircleSerializer(circle)
                return ApiResponse(
                    status=status.HTTP_200_OK,
                    message="Circle Found.",
                    data=serializer.data,
                    http_status=status.HTTP_200_OK
                ).create_response()

            # Case 2: Filter by zone
            elif zone_id:
                circles = Circle.objects.filter(zone_id=zone_id)
                if not circles.exists():
                    return ApiResponse(
                        status=status.HTTP_404_NOT_FOUND,
                        message="No circles found for this zone.",
                        http_status=status.HTTP_404_NOT_FOUND
                    ).create_response()

                serializer = CircleSerializer(circles, many=True)
                return ApiResponse(
                    status=status.HTTP_200_OK,
                    message="Circles Found for the Province.",
                    data=serializer.data,
                    http_status=status.HTTP_200_OK
                ).create_response()

            # Case 3: Return all circles
            else:
                circles = Circle.objects.all()
                serializer = CircleSerializer(circles, many=True)
                return ApiResponse(
                    status=status.HTTP_200_OK,
                    message="All Circles Found.",
                    data=serializer.data,
                    http_status=status.HTTP_200_OK
                ).create_response()

        except serializers.ValidationError as e:
            return ApiResponse(
                status=status.HTTP_400_BAD_REQUEST,
                message="Serializer error.",
                data=e.detail,
                http_status=status.HTTP_400_BAD_REQUEST
            ).create_response()
        except Exception as e:
            return ApiResponse(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Server error.",
                data=str(e),
                http_status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ).create_response()
