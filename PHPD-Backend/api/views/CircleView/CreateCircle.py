from ..common_imports import *

class CircleCreateView(viewsets.ViewSet):
    queryset = Circle.objects.all()
    serializer_class = CircleSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            serializer = CircleSerializer(data=data)
            serializer.is_valid(raise_exception=True)

            mycircle = Circle(
                province=serializer.validated_data['province'],
                circle_name=serializer.validated_data['circle_name'],
            )
            mycircle.save()

            return ApiResponse(
                status=status.HTTP_201_CREATED,
                message="Circle created successfully.",
                data=CircleSerializer(mycircle).data,
                http_status=status.HTTP_201_CREATED
            ).create_response()

        except IntegrityError as e:
            error_msg = str(e)
            if 'circle_name' in error_msg:
                duplicate_detail = {'circle_name': ['This circle already exists.']}
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
