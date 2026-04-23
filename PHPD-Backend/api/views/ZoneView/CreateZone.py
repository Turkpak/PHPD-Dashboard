from ..common_imports import *

class ZoneCreateView(viewsets.ViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            serializer = ZoneSerializer(data=data)
            serializer.is_valid(raise_exception=True)

            myzone = Zone(
                zone_name=serializer.validated_data['zone_name'],
            )
            myzone.save()

            return ApiResponse(
                status=status.HTTP_201_CREATED,
                message="Zone created successfully.",
                data=ZoneSerializer(myzone).data,
                http_status=status.HTTP_201_CREATED
            ).create_response()

        except IntegrityError as e:
            error_msg = str(e)
            if 'zone_name' in error_msg:
                duplicate_detail = {'zone_name': ['This Zone already exists.']}
            else:
                duplicate_detail = {'detail': ['Duplicate entry error.']}

            return ApiResponse(
                status=status.HTTP_400_BAD_REQUEST,
                message="Duplicate entry error.",
                data=duplicate_detail,
                http_status=status.HTTP_400_BAD_REQUEST
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
                status=status.HTTP_400_BAD_REQUEST,
                message="Exception error.",
                data=str(e),
                http_status=status.HTTP_400_BAD_REQUEST
            ).create_response()
