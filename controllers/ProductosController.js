/* Inputs */
const productosList = document.querySelector('#productos-list');
const searchProducto = document.querySelector('#search-producto');
const codigoProducto = document.querySelector('#codigo_producto');
const iva = document.querySelector('#iva');
const proveedor = document.querySelector('#proveedor');
const nombreProducto = document.querySelector('#nombre_producto');
const precioCompra = document.querySelector('#precio_compra');
const precioVenta = document.querySelector('#precio_venta');

/* Constants */
const PRODUCTO_ROW_ID = "producto-row";
const UPDATE_PRODUCTO_PATH = "./ActualizarProducto.html";
const DELETE_PRODUCTO_FUNCTIONAME = "deleteProducto()";

verifySession();

const getProductos = async () => {

    try {
        //Petición HTTP al servidor.
        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/productos/`, configureAxiosHeaders(token));

        if (data.length <= 0) {

            productosList.innerHTML = getErrorMessage("No existen productos registrados");

        } else {

            productosList.innerHTML =
                getGenericTable(["Código", "Iva", "Proveedor", "Nombre del producto", "Precio de compra", "Precio de Venta", "Acciones"], PRODUCTO_ROW_ID);

            console.log(data);

            let rows = ``;

            for (producto of data) {
                rows +=
                    `
                <tr>
                    <td>${producto.codigo_producto}</td>
                    <td>${producto.ivacompra}</td>
                    <td>${producto.nitproveedor}</td>
                    <td>${producto.nombre_producto}</td>
                    <td>${producto.precio_compra}</td>
                    <td>${producto.precio_venta}</td>
                    <td>
                        <a href="./${UPDATE_PRODUCTO_PATH}?id=${producto.codigo_producto}">
                            <div class="action-buttons">  
                                <i class="bi bi-pen-fill"></i>
                                <p>Editar</p>
                            </div>
                        </a>
                        <div class="action-buttons">
                            <i class="bi bi-archive-fill" onclick="deleteProducto(${producto.codigo_producto})"></i>
                            <p>Eliminar</p>
                        </div>
                    </td>
                </tr>
                `
            }
            document.querySelector(`#${PRODUCTO_ROW_ID}`).innerHTML = rows;

        }

    } catch (error) {
        console.log(error.response);
        if (error.message === "Network Error") {
            userList.innerHTML = getErrorMessage("Ha ocurrido un error de conexión con el servidor")
        } else {
            userList.innerHTML = getErrorMessage("Ha ocurrido un error desconocido, intente de nuevo")
        }
    }
}

const getProductoById = async (e) => {

    e.preventDefault();

    const codigoProducto = searchProducto.value;

    if (codigoProducto.trim().length == 0) {
        return alert("Debe ingresar el código del producto para poder realizar una búsqueda.")
    }
    try {

        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/productos/${codigoProducto}`, configureAxiosHeaders(token));

        if (!data) {
            return alert("No se encuentra un producto registrado con ese código.")
        }

        productosList.innerHTML =
            getGenericTable(["Código", "Iva", "Proveedor", "Nombre del producto", "Precio de compra", "Precio de Venta", "Acciones"], PRODUCTO_ROW_ID);

        let row =
            `
                <tr>
                    <td>${data.codigo_producto}</td>
                    <td>${data.ivacompra}</td>
                    <td>${data.nitproveedor}</td>
                    <td>${data.nombre_producto}</td>
                    <td>${data.precio_compra}</td>
                    <td>${data.precio_venta}</td>
                    <td>
                        <a href="./${UPDATE_PRODUCTO_PATH}?id=${data.codigo_producto}">
                            <div class="action-buttons">  
                                <i class="bi bi-pen-fill"></i>
                                <p>Editar</p>
                            </div>
                        </a>
                        <div class="action-buttons">
                            <i class="bi bi-archive-fill" onclick="deleteProducto(${data.codigo_producto})"></i>
                            <p>Eliminar</p>
                        </div>
                    </td>
                </tr>
                `
        return document.querySelector(`#${PRODUCTO_ROW_ID}`).innerHTML = row;


    } catch (error) {
        console.log(error);
        if (error.message === "Network Error") {
            alert("Ha ocurrido un error de conexión con el servidor, intente de nuevo mas tarde")
        } else {
            alert("Ha ocurrido un error desconocido, intente de nuevo mas tarde")
        }
    }
}

const createProducto = async (e) => {

    e.preventDefault();

    const productoData = {
        "codigo_producto": codigoProducto.value,
        "ivacompra": iva.value,
        "nitproveedor": proveedor.value,
        "nombre_producto": nombreProducto.value,
        "precio_compra": precioCompra.value,
        "precio_venta": precioVenta.value,
    }

    try {
        const token = getSessionToken();
        const { data } = await axios.post(`${BACKEND_URI}/productos/`, productoData, configureAxiosHeaders(token));

        if (data) {
            alert("El producto se ha creado.");
            return setTimeout(() => { window.location.href = "./ConsultarProductos.html" }, 1000);
        }
    } catch (error) {
        if (error.message === "Network Error") {
            alert("Ha ocurrido un error de conexión con el servidor, intente de nuevo.")
        } else if (error.response.status === 400 || error.respose.status === 409) {
            alert(error.response.data.message);
        } else {
            alert("Ha ocurrido un error desconocido, intente de nuevo.")
        }
    }
}

//Obtener los proveedores para insertarlos en el input "Seleccionar proveedor"
const getProveedores = async () => {
    try {

        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/proveedores/`, configureAxiosHeaders(token));

        let options =
            `
            <option selected value="">-- Seleccione un proveedor --</option>
        `;

        for (prov of data) {
            options +=
                `
                <option value="${prov.nitproveedor}">${prov.nombre_proveedor}</option>
            `
        }

        document.querySelector('#proveedor').innerHTML = options;

    } catch (error) {
        console.log(error);
    }
}

const deleteProducto = async (id) => {

    try {

        const token = getSessionToken();
        const { data } = await axios.delete(`${BACKEND_URI}/productos/${id}`, configureAxiosHeaders(token));

        if (data) {
            return getProductos();
        }

    } catch (error) {
        console.log(error);
        if (error.message === "Network Error") {
            alert("Ha ocurrido un error de conexión con el servidor, intente de nuevo.")
        } else if (error.response.status === 404) {
            alert(error.response.data.message);
        } else {
            alert("Ha ocurrido un error desconocido, intente de nuevo");
        }
    }
}

const getProductoInfo = async () => {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codigoProductoinURI = urlParams.get("id").trim();

    if (isNaN(codigoProductoinURI)) {
        alert("El Código de producto a buscar contiene una sintaxis inválida");
        return setTimeout(() => { window.location.href = "./ConsultarProductos.html" }, 1000);
    }
    try {
        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/productos/${codigoProductoinURI}`, configureAxiosHeaders(token));

        if (data == null) {
            alert("El producto al que hacer referencia no está disponible.");
            return setTimeout(() => { window.location.href = "./ConsultarProductos.html"; }, 0);
        }

        const request = await axios.get(`${BACKEND_URI}/proveedores/`, configureAxiosHeaders(token));
        const proveedores = request.data;

        codigoProducto.value = data.codigo_producto;
        iva.value = data.ivacompra;
        for (prov of proveedores) {

            proveedor.innerHTML += `<option value="${prov.nitproveedor}">${prov.nombre_proveedor}</option>`

            if (proveedor.nitproveedor === data.nitproveedor) {
                proveedor.innerHTML += `<option selected value="${prov.nitproveedor}">${prov.nombre_proveedor}</option>`
            }
        }
        proveedor.value = data.nitproveedor;
        nombreProducto.value = data.nombre_producto;
        precioCompra.value = data.precio_compra;
        precioVenta.value = data.precio_venta;
    } catch (error) {
        console.log(error);
        if (error.message === "Network Error") {
            alert("Ha ocurrido un error de conexión con el servidor")
        } else {
            alert("Ha ocurrido un error desconocido");
        }
        return setTimeout(() => { window.location.href = "./ConsultarProductos.html"; }, 0);
    }
}

const updateProducto = async (e) => {
    e.preventDefault();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codigoProductoinURI = urlParams.get("id").trim();

    const productoData = {
        "ivacompra": iva.value,
        "nitproveedor": proveedor.value,
        "nombre_producto": nombreProducto.value,
        "precio_compra": precioCompra.value,
        "precio_venta": precioVenta.value,
    }
    try {
        const token = getSessionToken();
        const { data } = await axios.put(`${BACKEND_URI}/productos/${codigoProductoinURI}`, productoData, configureAxiosHeaders(token));

        if (data) {
            alert("Producto actualizado");
            return setTimeout(() => { window.location.href = "./ConsultarProductos.html" }, 1000);
        }
    } catch (error) {
        console.log(error);
        if (error.message === "Network Error") {
            alert("Ha ocurrido un error de conexión con el servidor, intente de nuevo.")
        } else if (error.response.status === 400) {
            alert(error.response.data.message);
        } else {
            alert("Ha ocurrido un error desconocido, intente de nuevo");
        }
    }
}