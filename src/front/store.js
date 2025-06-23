import { json } from "react-router-dom";

export const initialStore=()=>{
  return{
    isLogged: sessionStorage.getItem("isLogged") === "true",
    usuario:{},
    rifas: [],
    carrito:[]
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'logIn':
      return {
        ...store,
        isLogged: true
      };
    case 'logOut': //eliminamos usuario del store y vaciamos carrito
      return {
        ...store, isLogged:false, usuario: {}, carrito:[]
      };
    
    case 'setUser':
      return{...store,
        usuario: {id:action.payload.id, usuario:action.payload.usuario, nombre:action.payload.nombre, apellidos:action.payload.apellidos, email:action.payload.email, direccion_envio:action.payload.direccion_envio, dni:action.payload.dni, telefono:action.payload.telefono, stripe_customer_id: action.payload.stripe_customer_id}
      }
      
    case 'add_rifa':
      // Añade una rifa
      return {
        ...store,
        rifas: [...store.rifas, {id:action.payload.id, nombre_rifa:action.payload.nombre_rifa, vendedor_id:action.payload.vendedor_id, premio_rifa:action.payload.premio_rifa, numero_max_boletos:action.payload.numero_max_boletos, precio_boleto:action.payload.precio_boleto, fecha_de_sorteo:action.payload.fecha_de_sorteo, hora_de_sorteo:action.payload.hora_de_sorteo, url_premio:action.payload.hora_de_sorteo, boleto_ganador:action.payload.boleto_ganador, status_sorteo: action.payload.status_sorteo}]
      };

    case 'dump_rifas':
      // Sobreescribe todo el vector de rifas
      return{ ...store,
        rifas: (action.payload)
      }
    case 'add_number_to_cart': {
      const existingItem = store.carrito.find(item => item.rifa_id === action.payload.rifa_id);

        if (existingItem) {
          return {
            ...store,
            carrito: store.carrito.map(item =>
              item.rifa_id === action.payload.rifa_id
                ? { ...item, numeros: [...item.numeros, action.payload.numero] }
                : item
            )
          };
        } else {
          return {
            ...store,
            carrito: [...store.carrito, { rifa_id: action.payload.rifa_id, numeros: [action.payload.numero] }]
          };
        }
      }

    case 'delete_number_from_cart': {
        return {
          ...store,
          carrito: store.carrito
            .map(item =>
              item.rifa_id === action.payload.rifa_id
                ? { ...item, numeros: item.numeros.filter(num => num !== action.payload.numero) }
                : item
            )
            .filter(item => item.numeros.length > 0) // Elimina rifa vacía si no quedan números
        };
      }

    case 'delete_rifa_from_cart':{
        return{
          ...store,
          carrito: store.carrito.filter(item => item.rifa_id != action.payload.rifa_id)
        }
      }

    default: 
      console.warn(`Unknown action: ${action.type}`);
      return store;
  }    
}
