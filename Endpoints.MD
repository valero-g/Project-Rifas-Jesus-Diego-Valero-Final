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
RESPUESTAS NEGATIVAS: {"message": "El request_body está vacio"}, 400  / {"message": "Request body erroneo"}, 400 / {"message": "El usuario ya existe"}, 400  / return {"message": "No se pudo añadir usuario"}, 500  

### /api/user/<int:usuario_id>
DESCRIPCION: Edita los datos de un usuario excepto email y contraseña  
TIPO: PUT  
REQUIERE TOKEN: SI  
BODY:  
{  
                "usuario": "xxxx",  
                "nombre": "xxxx",  
                "apellidos": "xxxx",  
                "direccion_envio": "xxxxx",  
                "dni":"xxxx",  
                "telefono": "xxxx"  
}  

RESPUESTA POSITIVA: user.serialize(),200 
RESPUESTAS NEGATIVAS: {"message" : f" El usuario ID {usuario_id} no pudo ser encontrado. "}, 404  /  {"message" : f"Request erroneo"}, 400 / {"message": "Error actualizando usuario"}, 500  


### /api/new-password
DESCRIPCION: Edita la contraseña de un usuario  
TIPO: PUT  
REQUIERE TOKEN: SI  
BODY:  
{  
                "contraseña_actual": "xxxx",  
                "contraseña_nueva": "xxxx"  
}  

RESPUESTA POSITIVA: {"message": "contraseña actualizada"},200  
RESPUESTAS NEGATIVAS: {"message" : f" El usuario ID {current_id} no pudo ser encontrado. "}, 404 / {"message" : f"Petición erronea"}, 400  /  {"message" : f"Contraseña actual erronea"}, 401 / {"message": "Error actualizando usuario"}, 500

### /api/user  
DESCRIPCION: Retorna el usuario contenido en el token  
TIPO: GET  
REQUIERE TOKEN: SI  
BODY:  N/A  
RESPUESTA POSITIVA: user.serialize(), 200  
RESPUESTAS NEGATIVAS: {"message" : f" El usuario ID {current_id} no pudo ser encontrado. "}, 404 / {"message" : f"Petición erronea"}, 400  /  {"message" : f"Contraseña actual erronea"}, 401 / {"message": "Error actualizando usuario"}, 500

## 2) Endpoints de Login  
### /api/login  
DESCRIPCION: Hace login del usuario o contraseña   
TIPO: POST  
REQUIERE TOKEN: NO  
BODY:  
{  
                "usuario": "xxxx",    
                "email": "xxxx",  
                "contraseña": "xxxx"    
}  

RESPUESTA POSITIVA: {jsonify({"token": access_token, "user_id": user.id}), 200  
RESPUESTAS NEGATIVAS: {"message": "User cannot be found"}, 401  / {"message": "Cuenta inactiva. Verifique mail para activarla"}, 401  /  {"message": "Usuario, Email o contraseña erroneos"}, 400 / {"message":"No se puede completar la operacion"}, 500  

### api/generate-password
DESCRIPCION: Envia un email a la cuenta de usuario con un password random  
TIPO: POST  
REQUIERE TOKEN: NO  
BODY:  
{  
                "email": "xxxx",  
}  

RESPUESTA POSITIVA: {"message":"Email enviado para resetear contraseña"}, 200  
RESPUESTAS NEGATIVAS: {"message": "No se encuentra el usuario"}, 401 /  {"message":"No se puede enviar mail para resetear password"}, 500  
