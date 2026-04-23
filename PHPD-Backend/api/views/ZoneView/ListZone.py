from ..common_imports import *

class ListZoneView(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        try:
            zone_id = request.query_params.get("id")

            # Case 1: Get single zone by ID
            if zone_id:
                zone = Zone.objects.filter(id=zone_id).first()
                if not zone:
                    return ApiResponse(
                        status=status.HTTP_404_NOT_FOUND,
                        message="Zone not found.",
                        http_status=status.HTTP_404_NOT_FOUND
                    ).create_response()

                serializer = ZoneSerializer(zone)
                return ApiResponse(
                    status=status.HTTP_200_OK,
                    message="Zone Found.",
                    data=serializer.data,
                    http_status=status.HTTP_200_OK
                ).create_response()


            # Case 3: Return all zones
            else:
                zones = Zone.objects.all()
                serializer = ZoneSerializer(zones, many=True)
                return ApiResponse(
                    status=status.HTTP_200_OK,
                    message="All Zones Found.",
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
