# Documentación de Endpoints del Backend

En este fichero se describen los endpoints del backend: tipo de request, ruta, si necesita token, body requerido y retorno

## 1) Endpoints de usuario

### /api/registro

DESCRIPCION: Añade un usuario a la base de datos
TIPO: POST
REQUIERE TOKEN: NO
BODY:
{
                "usuario": "xxxx",
                "nombre": "xxxx",
                "apellidos": "xxxx",
                "email": "xxxx@xxxx",
                "contraseña": "xxxx",
                "direccion_envio": "xxxxx",
                "dni":"xxxx",
                "telefono": "xxxx"
}

RESPUESTA POSITIVA: {"message": "User created successfully, pending email confirmation"}, 200
RESPUESTAS NEGATIVAS: {"message": "El request_body está vacio"}, 400  / {"message": "Request body erroneo"}, 400 / {"message": "El usuario ya existe"}, 400

### /api/registro


## ) Endpoints de boletos
