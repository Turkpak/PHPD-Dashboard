from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from ..common_imports import *


class UserLoginDashboardCreateView(viewsets.ViewSet):
    queryset = MyUser.objects.all()
    serializer_class = MyUserLoginDashboardSerializer
    permission_classes = [AllowAny]

    def create(self, request):

        try:
            email = request.data.get("email")
            password = request.data.get("password")

            if not email or not password:
                return ApiResponse(
                    message="Credentials missing",
                    status=status.HTTP_400_BAD_REQUEST,
                    http_status=status.HTTP_400_BAD_REQUEST,
                ).create_response()

            user = get_user_model().objects.filter(email=email).first()

            if user and user.check_password(password) and user.is_active:

                login(request, user)
                auth_data = utils.get_tokens_for_user(user)

                verified = user.is_verified

                # Fetch permissions of the logged-in user
                permissions = UserPermission.objects.filter(user=user)
                permission_data = UserPermissionSerializer(
                    permissions, many=True
                ).data

                res = {
                    "msg": {
                        "login": "Login Success",
                        "verified": verified,
                    },
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "id": user.id,
                    "role": user.role,
                    "is_active": user.is_active,
                    "permissions": permission_data,
                    **auth_data,
                }

                return ApiResponse(
                    status=status.HTTP_200_OK,
                    message="Login Success",
                    data=res,
                    http_status=status.HTTP_200_OK,
                ).create_response()

            return ApiResponse(
                message="Invalid Credentials",
                status=status.HTTP_401_UNAUTHORIZED,
                http_status=status.HTTP_401_UNAUTHORIZED,
            ).create_response()

        except serializers.ValidationError as e:
            return ApiResponse(
                status=status.HTTP_400_BAD_REQUEST,
                message="Serializer error.",
                data=e.detail,
                http_status=status.HTTP_400_BAD_REQUEST,
            ).create_response()

        except Exception as e:
            return ApiResponse(
                status=status.HTTP_400_BAD_REQUEST,
                message="Exception error.",
                data=str(e),
                http_status=status.HTTP_400_BAD_REQUEST,
            ).create_response()