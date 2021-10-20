/* Inputs */
const proveedoresList = document.querySelector('#proveedores-list');
const searchProveedor = document.querySelector('#search-proveedor')
const nitInput = document.querySelector('#nit');
const ciudadInput = document.querySelector('#ciudad');
const direccionInput = document.querySelector('#direccion');
const nombreInput = document.querySelector('#nombre');
const telefonoInput = document.querySelector('#telefono');

/* Constants */
const PROVEEDOR_ROW_ID = "proveedor-row";
const UPDATE_PROVEEDOR_PATH = "./ActualizarProveedor.html";
const DELETE_PROVEEDOR_FUNCTIONAME = "deleteProveedor()";

verifySession();

async function getProveedores() {
    try {

        proveedoresList.innerHTML = getSpinner();

        //Petición HTTP al servidor.
        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/proveedores/`, configureAxiosHeaders(token));

        if (data.length <= 0) {

            proveedoresList.innerHTML = getErrorMessage("No existen proveedores registrados");

        } else {

            proveedoresList.innerHTML =
                getGenericTable(["NIT", "Ciudad", "Dirección", "Nombre", "Teléfono", "Acciones"], PROVEEDOR_ROW_ID);

            let rows = ``;

            for (proveedor of data) {
                rows +=
                    `
                <tr>
                    <td>${proveedor.nitproveedor}</td>
                    <td>${proveedor.ciudad_proveedor}</td>
                    <td>${proveedor.direccion_proveedor}</td>
                    <td>${proveedor.nombre_proveedor}</td>
                    <td>${proveedor.telefono_proveedor}</td>
                    <td>
                        <a href="./${UPDATE_PROVEEDOR_PATH}?id=${proveedor.nitproveedor}">
                            <div class="action-buttons">  
                                <i class="bi bi-pen-fill"></i>
                                <p>Editar</p>
                            </div>
                        </a>
                        <div class="action-buttons">
                            <i class="bi bi-archive-fill" onclick="deleteProveedor(${proveedor.nitproveedor})"></i>
                            <p>Eliminar</p>
                        </div>
                    </td>
                </tr> 
                `
            }
            document.querySelector(`#${PROVEEDOR_ROW_ID}`).innerHTML = rows;
        }

    } catch (error) {
        axiosExceptionHandler(error);
    }
}

const getProveedorByNIT = async (e) => {
    e.preventDefault();

    const nit = searchProveedor.value;

    if (nit.trim().length == 0) {
        return getErrorPopupMessage("Debe ingresar el nit para poder realizar una búsqueda.")
    }

    try {

        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/proveedores/${nit}`, configureAxiosHeaders(token));

        if (data == null) {
            return getErrorPopupMessage("No se encuentra un proveedor registrado con el nit indicado.")
        } else {

            proveedoresList.innerHTML =
                getGenericTable(["NIT", "Ciudad", "Dirección", "Nombre", "Teléfono", "Acciones"], PROVEEDOR_ROW_ID);

            let row = `
            <tr>
                <td>${data.nitproveedor}</td>
                <td>${data.ciudad_proveedor}</td>
                <td>${data.direccion_proveedor}</td>
                <td>${data.nombre_proveedor}</td>
                <td>${data.telefono_proveedor}</td>
                <td>
                    <a href="./${UPDATE_PROVEEDOR_PATH}?id=${data.nitproveedor}">
                        <div class="action-buttons">  
                            <i class="bi bi-pen-fill"></i>
                            <p>Editar</p>
                        </div>
                    </a>
                    <div class="action-buttons">
                        <i class="bi bi-archive-fill" onclick="deleteProveedor(${data.nitproveedor})"></i>
                        <p>Eliminar</p>
                    </div>
                </td>
            </tr>    
            `
            return document.querySelector(`#${PROVEEDOR_ROW_ID}`).innerHTML = row;
        }
    } catch (error) {
        axiosExceptionHandler(error);
    }
}

const createProveedor = async (e) => {
    e.preventDefault();
    const proveedorData = {
        "nitProveedor": nitInput.value,
        "ciudad_proveedor": ciudadInput.value,
        "direccion_proveedor": direccionInput.value,
        "nombre_proveedor": nombreInput.value,
        "telefono_proveedor": telefonoInput.value
    };
    try {
        //Petición HTTP al servidor.
        const token = getSessionToken();
        const { data } = await axios.post(`${BACKEND_URI}/proveedores/`, proveedorData, configureAxiosHeaders(token));
        if (data) {
            getSuccessPopupMessage("El proveedor se ha creado.");
            return setTimeout(() => { window.location.href = "./ConsultarProveedores.html"; }, 1000);
        }
    } catch (error) {
        axiosExceptionHandler(error);
    }
}

const deleteProveedor = async (nit) => {
    try {
        const token = getSessionToken();
        const { data } = await axios.delete(`${BACKEND_URI}/proveedores/${nit}`, configureAxiosHeaders(token));

        if (data) {
            return getProveedores();
        }
    } catch (error) {
        axiosExceptionHandler(error);
    }
}

const getProveedorInfo = async () => {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let nit = urlParams.get("id").trim();

    if (isNaN(nit)) {
        getErrorPopupMessage("El nit que se está buscando tiene una sintaxis inválida");
        return setTimeout(() => { window.location.href = "./ConsultarProveedores.html"; }, 1000);
    }

    try {
        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/proveedores/${nit}`, configureAxiosHeaders(token));

        nitInput.value = data.nitproveedor;
        ciudadInput.value = data.ciudad_proveedor;
        direccionInput.value = data.direccion_proveedor;
        nombreInput.value = data.nombre_proveedor;
        telefonoInput.value = data.telefono_proveedor;
    } catch (error) {
        axiosExceptionHandler(error);
    }
}

const updateProveedor = async (e) => {
    e.preventDefault();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let nit = urlParams.get("id").trim();

    const proveedorData = {
        "ciudad_proveedor": ciudadInput.value,
        "direccion_proveedor": direccionInput.value,
        "nombre_proveedor": nombreInput.value,
        "telefono_proveedor": telefonoInput.value
    };
    try {
        const token = getSessionToken();
        const { data } = await axios.put(`${BACKEND_URI}/proveedores/${nit}`, proveedorData, configureAxiosHeaders(token));
        if (data) {
            getSuccessPopupMessage("El usuario se ha actualizado.");
            return setTimeout(() => { window.location.href = "./ConsultarProveedores.html"; }, 1000);
        }
    } catch (error) {
        axiosExceptionHandler(error);
    }
}

