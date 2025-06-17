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
RESPUESTAS NEGATIVAS: {"message" : f" El usuario ID {usuario_id} no pudo ser encontrado. "}, 404  /  {"message" : f"Request erroneo"}, 400 / {"message": "Petición incorrecta. Error en el id de usuario"}, 400 / {"message": "Error actualizando usuario"}, 500  


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

## 3) Endpoints de Boletos  
### /boletos-ocupados/<int:rifa_id>
DESCRIPCION: Devuelve un vector con los números reservados o comprados de una rifa  
TIPO: GET  
REQUIERE TOKEN: SI   
BODY:  N/A  

RESPUESTA POSITIVA: {"Rifa_id": rifa_id, "Numeros_ocupados": lista_numeros_ocupados}, 200 
RESPUESTAS NEGATIVAS:  {"message": "Error en la autentificación de usuario"}, 401 /   {"message": "La rifa no existe"}, 400 / {"message": "Error recuperando los boletos ocupados"}, 500  

### /boletos-usuario/<int:usuario_id>
DESCRIPCION: Devuelve un vector con los números reservados o comprados de un usuario  
TIPO: GET  
REQUIERE TOKEN: SI   
BODY:  N/A  

RESPUESTA POSITIVA: jsonify(boletos_usuario), 200  
RESPUESTAS NEGATIVAS:  {"message": "Petición incorrecta. Error en el id de usuario"}, 400 / {"message": "El usuario no existe"}, 400 /   {"message": "Error recuperando los boletos del usuario"}, 500  

### /boleto
DESCRIPCION: Añade un boleto  
TIPO: POST  
REQUIERE TOKEN: SI   
BODY:  
{  
    "usuario_id":22,  
    "rifa_id":2,  
    "numero": 16,  
    "confirmado": false  
}  

RESPUESTA POSITIVA: jsonify(boleto.serialize()), 200  
RESPUESTAS NEGATIVAS:  {"message": "Error en la autentificación de usuario"}, 401 / {"message" : "Petición errónea. Body incorrecto"}, 400 / {"message": "Petición incorrecta. Error en el id de usuario"}, 400 / {"message": "La rifa no exsite"}, 400 / {"message": "El número es mayor que el número máximo de boletos de la rifa"}, 400 / {"message":"El boleto ya existe"}, 404 / {"message":"Error reservando boleto"}, 500  

### /boleto
DESCRIPCION: Modifica el CAMPO "confirmado" del boleto. SOLO SE PUEDE MODIFICAR ESE CAMPO. Este endpoint servirá para confirmar la compra de un boleto reservado  
TIPO: PUT  
REQUIERE TOKEN: SI   
BODY:  
    {  
        "confirmado": true,  
        "numero": 4,  
        "rifa_id": 2,  
        "usuario_id": 22  
    }  

RESPUESTA POSITIVA: jsonify(boleto.serialize()), 200 
RESPUESTAS NEGATIVAS:  {"message": "Error en la autentificación de usuario"}, 401 / {"message" : "Petición errónea. Body incorrecto"}, 400 / {"message": "Petición incorrecta. Error en el id de usuario"}, 400 / {"message": "La rifa no exsite"}, 400 / {"message":"El boleto no existe"}, 400 / {"message":"Error modificando boleto"}, 500  

### /boleto
DESCRIPCION: Elimina un Boleto. SOLO SE PUEDEN ELIMINAR BOLETOS NO COMPRADOS ("confirmado" = False)  
TIPO: DELETE  
REQUIERE TOKEN: SI   
BODY:  
{  
    "numero":4,  
    "rifa_id": 2,  
    "usuario_id":22  
}  

RESPUESTA POSITIVA: {"message": "Boleto eliminado"}, 200  
RESPUESTAS NEGATIVAS:  {"message": "Error en la autentificación de usuario"}, 401 / {"message" : "Petición errónea. Body incorrecto"}, 400 / {"message": "Petición incorrecta. Error en el id de usuario"}, 400 / {"message": "La rifa no existe"}, 400 / {"message":"El boleto no existe"}, 400 / {"message": "El boleto está confirmado como comprado"}, 401 / {"message":"Error borrando boleto"}, 500  


### /boletos/<int:usuario_id>
DESCRIPCION: Elimina TODOS los boletos de un usuario cuyo "confirmado" sea False (limpieza de tabla
TIPO: DELETE  
REQUIERE TOKEN: SI   
BODY:  N/A  

RESPUESTA POSITIVA: jsonify(boletos_usuario), 200 (se retornan los boletos con "confirmado" =True que aún tiene el usuario
RESPUESTAS NEGATIVAS: {"message": "Error en la autentificación de usuario"}, 401 / {"message": "Petición incorrecta. Error en el id de usuario"}, 400 / {"message": "El usuario no tiene boletos"}, 401 / {"message":"Error borrando boletos"}, 500  
