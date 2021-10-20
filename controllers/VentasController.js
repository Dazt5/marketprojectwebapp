/******** REALIZAR VENTA *********************************************************/

/* Inputs*/
const productosList = document.querySelector('#productos-list');
const carritoList = document.querySelector('#carrito-list');
const searchProducto = document.querySelector('#search-producto');
const cedulaCliente = document.querySelector('#cedula-cliente');

/* Constants */
const PRODUCTO_ROW_ID = "producto-row";
const PRODUCTO_CARRITO_ROW_ID = "producto-carrito-row";

/* CARRITO */
let carrito = [], compraTotalIva = 0, compraSubTotal = 0, compraTotal = 0;

/********************************************************************************/
/******** CONSULTAR VENTAS ******************************************************/

/* Inputs*/
const searchVenta = document.querySelector('#search-venta');
const ventasList = document.querySelector('#ventas-list');

/* Constants */
const VENTAS_ROW_ID = "ventas-row";

/*******************************************************************************/
/********* DETALLES VENTA ******************************************************/

/* Inputs*/
const detalleVentaList = document.querySelector('#detalle-venta');
const detalleVentaUsuario = document.querySelector('#detalle-venta-usuario');
const detalleVentaCliente = document.querySelector('#detalle-venta-cliente');
const detalleVentaProductos = document.querySelector('#detalle-venta-productos');

/* Constants */
const DETALLE_VENTAS_ROW_ID = "detalle-venta-row";
const DETALLE_VENTAS_USUARIO_ROW_ID = "detalle-venta-usuario-row";
const DETALLE_VENTAS_CLIENTE_ROW_ID = "detalle-venta-cliente-row";
const DETALLE_VENTAS_PRODUCTOS_ROW_ID = "detalle-ventas-productos-row";
/*******************************************************************************/


verifySession();

/*******  REALIZAR VENTAS ******/
const getProductos = async () => {
    try {

        //Petición HTTP al servidor.

        productosList.innerHTML = getSpinner();

        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/productos/`, configureAxiosHeaders(token));

        if (data.length <= 0) {

            productosList.innerHTML = getErrorMessage("No existen productos registrados");

        } else {

            productosList.innerHTML =
                getGenericTable(["Código", "Nombre del producto", "Precio", "IVA", "Agregar"], PRODUCTO_ROW_ID);

            let rows = ``;

            for (producto of data) {
                rows +=
                    `
                <tr>
                    <td>${producto.codigo_producto}</td>
                    <td>${producto.nombre_producto}</td>
                    <td>${producto.precio_venta}</td>
                    <td>${producto.ivacompra}</td>
                    <td>
                        <div class="quantity-product">
                            <input type="number" id="product-${producto.codigo_producto}" placeholder="Cantidad"/>
                            <i class="bi bi-bag-plus-fill green" onclick="agregarProducto(${producto.codigo_producto});"></i>
                        </div>
                    </td>
                </tr>
                `
            }
            document.querySelector(`#${PRODUCTO_ROW_ID}`).innerHTML = rows;

        }

    } catch (error) {
        console.log(error);
        if (error.message === "Network Error") {
            userList.innerHTML = getErrorMessage("Ha ocurrido un error de conexión con el servidor")
        } else {
            userList.innerHTML = getErrorMessage("Ha ocurrido un error desconocido, intente de nuevo")
        }
    }
}

const getProductosById = async (e) => {
    e.preventDefault();
    const codigo = searchProducto.value;
    if (codigo.trim().length == 0) {
        return getErrorPopupMessage("Debe ingresar el código para poder realizar una búsqueda.")
    }

    try {
        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/productos/${codigo}`, configureAxiosHeaders(token));

        if (data == null) {
            return getErrorPopupMessage("No se encuentra un producto registrado con el código indicado.")
        } else {
            productosList.innerHTML =
                getGenericTable(["Código", "Nombre del producto", "Precio", "IVA", "Agregar"], PRODUCTO_ROW_ID);

            let row =
                `
            <tr>
                <td>${data.codigo_producto}</td>
                <td>${data.nombre_producto}</td>
                <td>${producto.ivacompra}</td>
                <td>${data.precio_venta}</td>
                <td>
                    <div class="quantity-product">
                        <input type="number" id="product-${data.codigo_producto}" placeholder="Cantidad"/>
                        <i class="bi bi-bag-plus-fill green" onclick="agregarProducto(${data.codigo_producto});"></i>
                    </div>
                </td>
            </tr> 
            `
            return document.querySelector(`#${PRODUCTO_ROW_ID}`).innerHTML = row;
        }
    } catch (error) {
        axiosExceptionHandler(error);
    }
}

const getCarrito = () => {
    try {
        if (carrito.length > 0) {
            carritoList.innerHTML =
                getGenericTable(["Nombre del producto", "Precio unitario", "IVA", "Cantidad", "subTotal", "Total IVA", "Total", "Eliminar"], PRODUCTO_CARRITO_ROW_ID);

            let rows = ``;
            compraTotal = 0;
            compraSubTotal = 0;
            compraTotalIva = 0;
            carrito.forEach(producto => {
                compraSubTotal += producto.subTotal;
                console.log(producto.subTotal)
                compraTotalIva += producto.totalIva;
                compraTotal += producto.total;
                rows += `
                <tr>
                    <td>${producto.nombre_producto}</td>
                    <td>${producto.precio_venta}</td>
                    <td>${producto.ivacompra}</td>
                    <td>${producto.cantidad}</td>
                    <td>${producto.subTotal}</td>
                    <td>${producto.totalIva}</td>
                    <td>${producto.total}</td>
                    <td>
                        <i class="bi bi-bag-plus-fill red" onclick="eliminarDelCarrito(${producto.codigo_producto})"></i>
                    </td>
                </tr> 
            `
            });
            document.querySelector(`#subtotal`).innerHTML = `SubTotal:${compraSubTotal}`;
            document.querySelector(`#total-iva`).innerHTML = `Total IVA:${compraTotalIva}`;
            document.querySelector(`#total`).innerHTML = `Total de su compra:${compraTotal}`;
            return document.querySelector(`#${PRODUCTO_CARRITO_ROW_ID}`).innerHTML = rows;
        } else {
            compraTotal = 0;
            compraSubTotal = 0;
            compraTotalIva = 0;
            document.querySelector(`#subtotal`).innerHTML = ``;
            document.querySelector(`#total-iva`).innerHTML = ``;
            document.querySelector(`#total`).innerHTML = ``;
            let alert = `<p>No existen productos agregados al carrito</p>`;
            carritoList.innerHTML = alert;
        }
    } catch (error) {
        axiosExceptionHandler(error);
    }
}

const agregarProducto = async (codigoProducto) => {
    if (codigoProducto.length == 0) {
        return getErrorMessage("El producto que intentó agregar ya no se encuentra disponible, recargue la página y vuelva a intentarlo")
    }
    try {
        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/productos/${codigoProducto}`, configureAxiosHeaders(token));
        agregarAlCarrito(data)
        getCarrito();

    } catch (error) {
        axiosExceptionHandler(error);
    }
}

const agregarAlCarrito = (nuevoProducto) => {
    const cantidad = document.querySelector(`#product-${nuevoProducto.codigo_producto}`).value
    let nuevoProductoCarrito, total, subTotal, totalIva;

    if (cantidad.trim() <= 0 || !Number(cantidad)) {
        return getErrorMessage("debe ingresar una cantidad válida")
    }

    console.log(existeProducto(nuevoProducto.codigo_producto));

    if (existeProducto(nuevoProducto.codigo_producto) && carrito.length > 0) {
        carrito.forEach(producto => {
            if (producto.codigo_producto == nuevoProducto.codigo_producto) {
                producto.cantidad = Number(cantidad) + Number(producto.cantidad);
                console.log(producto.cantidad);
                producto.subTotal = producto.cantidad * producto.precio_venta;
                producto.totalIva = ((producto.precio_venta * producto.cantidad) * (producto.ivacompra / 100));
                producto.total = producto.subTotal + producto.totalIva;
            }
        });
    } else {
        subTotal = nuevoProducto.precio_venta * cantidad;
        totalIva = ((nuevoProducto.precio_venta * cantidad) * (nuevoProducto.ivacompra / 100));
        total = subTotal + totalIva;
        nuevoProductoCarrito = {
            "codigo_producto": nuevoProducto.codigo_producto,
            "nombre_producto": nuevoProducto.nombre_producto,
            "precio_venta": nuevoProducto.precio_venta,
            "ivacompra": nuevoProducto.ivacompra,
            "cantidad": Number(cantidad),
            subTotal,
            totalIva,
            total
        }
        carrito.push(nuevoProductoCarrito);
    }
    document.querySelector(`#product-${nuevoProducto.codigo_producto}`).value;
}

const eliminarDelCarrito = async (id) => {
    if (existeProducto(id)) {
        carrito.forEach((producto, index, object) => {
            if (producto.codigo_producto == id) {
                object.splice(index, 1);
                getCarrito();
            }
        });
    }
}

const existeProducto = (codigoProducto) => {
    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].codigo_producto == codigoProducto) {
            return true;
        }
    }
    return false;
}

const realizarCompra = async (e) => {
    e.preventDefault();
    const cedula = cedulaCliente.value;
    if (carrito.length > 0 && cedula.length > 0) {
        try {
            let productos = [], producto;

            carrito.forEach(carritoProducto => {
                producto = {
                    "codigoProducto": carritoProducto.codigo_producto,
                    "cantidadProducto": carritoProducto.cantidad,
                    "valorTotal": carritoProducto.total,
                    "valorVenta": carritoProducto.subTotal,
                    "valorIva": carritoProducto.totalIva
                }
                productos.push(producto);
            });
            const venta = {
                "cedulaCliente": cedula,
                "subTotal": compraSubTotal,
                "totalIva": compraTotalIva,
                "totalVenta": compraTotal,
                productos
            }
            //Petición HTTP al servidor.
            const token = getSessionToken();
            const { data } = await axios.post(`${BACKEND_URI}/ventas/`, venta, configureAxiosHeaders(token));

            if (data) {
                getSuccessPopupMessage("Compra realizada exitosamente.")
                return setTimeout(() => { window.location.href = "./ConsultarVentas.html"; }, 400);
            }
        } catch (error) {
            getErrorPopupMessage("Ha ocurrido un error al realizar su compra.")
        }

    } else if (cedula.length <= 0) {
        getErrorMessage("Debe digitar la cédula del cliente")
    } else {
        getErrorMessage("No ha seleccionado ningún producto, el carrito está vacio.")
    }
}

/*******  CONSULTAR VENTAS ******/

const consultarVentas = async () => {

    ventasList.innerHTML = getSpinner();

    try {
        //Petición HTTP al servidor.
        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/ventas/`, configureAxiosHeaders(token));

        if (data.length <= 0) {

            ventasList.innerHTML = getErrorMessage("No existen productos registrados");

        } else {

            ventasList.innerHTML =
                getGenericTable(["Código", "Cliente", "Usuario", "SubTotal", "Iva", "Total"], VENTAS_ROW_ID);

            let rows = ``;
            for (venta of data) {
                rows +=
                    `
                    <tr>
                        <td>
                            <div class="venta-icono">
                                <p>${venta.codigo_venta}</p>
                                <a href="./DetallesVenta.html?id=${venta.codigo_venta}"><i class="bi bi-info-circle-fill"></i></a>
                            </div>
                        </td>
                        <td>${venta.clientes.nombre_cliente}</td>
                        <td>${venta.usuario.nombreUsuario}</td>
                        <td>${venta.valorVenta}</td>
                        <td>${venta.ivaVenta}</td>
                        <td>${venta.totalVenta}</td>
                    </tr>
                `
            }
            document.querySelector(`#${VENTAS_ROW_ID}`).innerHTML = rows;

        }

    } catch (error) {
        axiosExceptionHandler(error);
    }
}

const consultarVentaByCodigo = async (e) => {
    e.preventDefault();

    const cedulaCliente = searchVenta.value;
    if (cedulaCliente.trim().length == 0) {
        return getErrorPopupMessage("Debe ingresar el código para poder realizar una búsqueda.")
    }

    try {
        //Petición HTTP al servidor.
        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/ventas/${cedulaCliente}`, configureAxiosHeaders(token));

        if (data.length <= 0) {
            return getErrorPopupMessage("La cédula ingresada no tiene compras registradas")
        } else {

            ventasList.innerHTML =
                getGenericTable(["Código", "Cliente", "Usuario", "SubTotal", "Iva", "Total"], VENTAS_ROW_ID);
            let rows = ``;
            for (venta of data) {
                rows +=
                    `
                        <tr>
                            <td>
                                <div class="venta-icono">
                                    <p>${venta.codigo_venta}</p>
                                    <i class="bi bi-info-circle-fill"></i>
                                </div>
                            </td>
                            <td>${venta.clientes.nombre_cliente}</td>
                            <td>${venta.usuario.nombreUsuario}</td>
                            <td>${venta.valorVenta}</td>
                            <td>${venta.ivaVenta}</td>
                            <td>${venta.totalVenta}</td>
                        </tr>
                    `
            }
            document.querySelector(`#${VENTAS_ROW_ID}`).innerHTML = rows;
        }
    } catch (error) {
        axiosExceptionHandler(error);
    }
}

const obtenerDetallesVenta = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codigoVenta = urlParams.get("id").trim();

    if (codigoVenta.length <= 0) {
        getErrorMessage("Ha ocurrido un error, intente de nuevo mas tarde.");
        return setTimeout(() => { window.location.href = "./ConsultarVentas.html" }, 1000);
    }

    try {
        const token = getSessionToken();

        const ventaResponse = await axios.get(`${BACKEND_URI}/ventas/venta/${codigoVenta}`, configureAxiosHeaders(token));
        const detallesResponse = await axios.get(`${BACKEND_URI}/ventas/detalles/${codigoVenta}`, configureAxiosHeaders(token));

        const detalles = detallesResponse.data;
        const venta = ventaResponse.data;

        detalleVentaList.innerHTML =
            getGenericTable(["Código", "SubTotal", "IVA", "Total"], DETALLE_VENTAS_ROW_ID);

        let detalleRow = `
        <tr>
            <td>${venta.codigo_venta}</td>
            <td>${venta.valorVenta}</td>
            <td>${venta.ivaVenta}</td>
            <td>${venta.totalVenta}</td>
        </tr>
        `;
        document.querySelector(`#${DETALLE_VENTAS_ROW_ID}`).innerHTML = detalleRow;

        detalleVentaUsuario.innerHTML =
            getGenericTable(["Cedula", "Email", "Nombre", "usuario"], DETALLE_VENTAS_USUARIO_ROW_ID);

        let detalleUsuarioRow = `
            <tr>
                <td>${venta.usuario.cedulaUsuario}</td>
                <td>${venta.usuario.emailUsuario}</td>
                <td>${venta.usuario.nombreUsuario}</td>
                <td>${venta.usuario.usuario}</td>
            </tr>
            `;
        document.querySelector(`#${DETALLE_VENTAS_USUARIO_ROW_ID}`).innerHTML = detalleUsuarioRow

        detalleVentaCliente.innerHTML =
            getGenericTable(["Cedula", "Nombre", "Teléfono", "Dirección"], DETALLE_VENTAS_CLIENTE_ROW_ID);

        let detalleClienteRow = `
            <tr>
                <td>${venta.clientes.cedula_cliente}</td>
                <td>${venta.clientes.nombre_cliente}</td>
                <td>${venta.clientes.telefono_cliente}</td>
                <td>${venta.clientes.direccion_cliente}</td>
            </tr>
            `;
        document.querySelector(`#${DETALLE_VENTAS_CLIENTE_ROW_ID}`).innerHTML = detalleClienteRow

        detalleVentaProductos.innerHTML =
            getGenericTable(["Nombre", "Precio C/U", "IVA", "Cantidad Comprada", "SubTotal", "Total IVA", "Total"], DETALLE_VENTAS_PRODUCTOS_ROW_ID);

        let detalleProductosRows = ``
        for (productoVendido of detalles) {
            detalleProductosRows +=
                `
                <tr>
                    <td>${productoVendido.producto.nombre_producto}</td>
                    <td>${productoVendido.producto.precio_venta}</td>
                    <td>${productoVendido.producto.ivacompra}</td>
                    <td>${productoVendido.cantidadProducto}</td>
                    <td>${productoVendido.valorVenta}</td>
                    <td>${productoVendido.valorIva}</td>
                    <td>${productoVendido.valorTotal}</td>
                </tr>
                `
        }
        document.querySelector(`#${DETALLE_VENTAS_PRODUCTOS_ROW_ID}`).innerHTML = detalleProductosRows;

    } catch (error) {
        axiosExceptionHandler(error);
        return setTimeout(() => { window.location.href = "./ConsultarProductos.html"; }, 0);
    }

}