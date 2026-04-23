from ..common_imports import *

class CircleUpdateView(viewsets.ViewSet):
    queryset = Circle.objects.all()
    serializer_class = CircleSerializer
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        data = request.data
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
            serializer = CircleSerializer(mycircle, data=data, partial=True)  
            if serializer.is_valid():
                serializer.save()
                return ApiResponse(
                    status=status.HTTP_200_OK,
                    message="Circle updated successfully.",
                    data=serializer.data,
                    http_status=status.HTTP_200_OK
                ).create_response()
            
            return ApiResponse(
                status=status.HTTP_400_BAD_REQUEST,
                message="Validation error.",
                data=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST
            ).create_response()
        
        except Exception as e:
            return ApiResponse(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Exception error.",
                data=str(e),
                http_status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ).create_response()
