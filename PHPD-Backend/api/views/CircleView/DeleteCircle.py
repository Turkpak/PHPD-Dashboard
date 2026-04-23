from ..common_imports import *

class CircleDeleteView(viewsets.ViewSet):
    queryset = Circle.objects.all()
    serializer_class = CircleSerializer
    permission_classes = [AllowAny]

    def destroy(self, request, *args, **kwargs):
        circle_id = kwargs.get('pk')

        try:
            mycircle = Circle.objects.get(id=circle_id)
        except Circle.DoesNotExist:
            return ApiResponse(
                status=status.HTTP_404_NOT_FOUND,
                message="Circle not found.",
                http_status=status.HTTP_404_NOT_FOUND
            ).create_response()       
        try:
            mycircle.delete()
            return ApiResponse(
                status=status.HTTP_200_OK,
                message="Circle deleted successfully.",
                http_status=status.HTTP_200_OK
            ).create_response()
        except ProtectedError:
            return ApiResponse(
                status=status.HTTP_400_BAD_REQUEST,
                message="Cannot delete this Circle because it is linked to other records.",
                http_status=status.HTTP_400_BAD_REQUEST
            ).create_response()
        except IntegrityError:
            return ApiResponse(
                status=status.HTTP_400_BAD_REQUEST,
                message="Cannot delete this Circle because it is linked to other records.",
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
                message="Something went wrong.",
                data=str(e),
                http_status=status.HTTP_400_BAD_REQUEST
            ).create_response()
