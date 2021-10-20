const clientList = document.querySelector('#client-list');
const searchUser = document.querySelector('#search-user');

/* Inputs */
const cedulaInput = document.querySelector('#cedula');
const direccionInput = document.querySelector('#direccion');
const emailInput = document.querySelector('#email');
const nombreInput = document.querySelector('#nombre');
const telefonoInput = document.querySelector('#telefono');

/* Constants */
const CLIENT_ROW_ID = "client-row";
const UPDATE_USER_PATH = "./ActualizarCliente.html";
const DELETE_USER_FUNCTIONAME = "deleteClient()";

verifySession();
async function getClientes() {
    
    try {
        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/clientes/`,configureAxiosHeaders(token));

        if (data.length <= 0) {

            return clientList.innerHTML = getErrorMessage("No existen clientes registrados")

        } else {

            clientList.innerHTML =
                getGenericTable(["Cedula", "Dirección", "Email", "Nombre", "Telefono", "Acciones"], CLIENT_ROW_ID);

            let rows = ``;

            for (client of data) {
                rows +=
                    `
                <tr>
                <td>${client.cedula_cliente}</td>
                <td>${client.direccion_cliente}</td>
                <td>${client.email_cliente}</td>
                <td>${client.nombre_cliente}</td>
                <td>${client.telefono_cliente}</td>
                <td>
                    <a href="./ActualizarCliente.html?id=${client.cedula_cliente}">
                        <div class="action-buttons">  
                            <i class="bi bi-pen-fill"></i>
                            <p>Editar</p>
                        </div>
                    </a>
                        <div class="action-buttons">
                            <i class="bi bi-archive-fill" onclick="deleteUser(${client.cedula_cliente})"></i>
                            <p>Eliminar</p>
                        </div>
                    </td>
                </tr>
                `
            }

            document.querySelector(`#${CLIENT_ROW_ID}`).innerHTML = rows;
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

async function getClienteByCedula(e) {

    e.preventDefault();

    const cedula = searchUser.value;

    if (cedula.trim().length == 0) {
        return alert("Debe ingresar la cédula para poder realizar una búsqueda.")
    }

    try {
        const token = getSessionToken(); 
        const { data} = await axios.get(`${BACKEND_URI}/clientes/${cedula}`,configureAxiosHeaders(token));

        if (data == null) {
                return alert("No se encuentra un usuario registrado con la cédula indicada.")
        } else {
            clientList.innerHTML =
                getGenericTable(["Cedula", "Dirección", "Email", "Nombre", "Telefono", "Acciones"], CLIENT_ROW_ID);
        }

        let row =
            `
            <tr>
            <td>${data.cedula_cliente}</td>
            <td>${data.direccion_cliente}</td>
            <td>${data.email_cliente}</td>
            <td>${data.nombre_cliente}</td>
            <td>${data.telefono_cliente}</td>
            <td>
                <a href="./ActualizarCliente.html?id=${data.cedula_cliente}">
                    <div class="action-buttons">  
                        <i class="bi bi-pen-fill"></i>
                        <p>Editar</p>
                    </div>
                </a>
                <div class="action-buttons">
                    <i class="bi bi-archive-fill" onclick="deleteUser(${data.cedula_cliente})"></i>
                    <p>Eliminar</p>
                </div>
            </td>
        </tr> 
            `
        return document.querySelector(`#${CLIENT_ROW_ID}`).innerHTML = row;

    } catch (error) {
        console.log(error);
        if (error.message === "Network Error") {
            alert("Ha ocurrido un error de conexión con el servidor, intente de nuevo mas tarde")
        } else {
            alert("Ha ocurrido un error desconocido, intente de nuevo mas tarde")
        }
    }
}


const createClient = async (e) => {
    e.preventDefault();

    const userData = {
        "cedula_cliente": cedulaInput.value,
        "direccion_cliente": direccionInput.value,
        "email_cliente": emailInput.value,
        "nombre_cliente": nombreInput.value,
        "telefono_cliente":telefonoInput.value
    }

    try {
        const token = getSessionToken();
        const { data } = await axios.post(`${BACKEND_URI}/clientes/`, userData,configureAxiosHeaders(token));

        if (data) {
            alert("El cliente ha sido creado.");
            return setTimeout(() => { window.location.href = "./ConsultarClientes.html"; }, 1000);
        }

    } catch (error) {
        if (error.message === "Network Error") {
            alert("Ha ocurrido un error de conexión con el servidor, intente de nuevo mas tarde")
        } else if (error.response.status === 400) {
            alert(error.response.data.message)   
        }
        else {
            alert("Ha ocurrido un error desconocido, intente de nuevo mas tarde")
        }
    }
}

const deleteUser = async (cedula) => {
    try {
        const token = getSessionToken();
        const { data } = await axios.delete(`${BACKEND_URI}/clientes/${cedula}`,configureAxiosHeaders(token));

        if (data) {
            return getClientes();
        }
    } catch (error) {
        if (error.message === "Network Error") {
            alert("Ha ocurrido un error de conexión con el servidor, intente de nuevo mas tarde")
        } else if (error.message === "Request failed with status code 404") {
            alert("El registro que quiere eliminar ya no se encuentra disponible")
        }
        else {
            alert("Ha ocurrido un error desconocido, intente de nuevo mas tarde")
        }
    }
}

const getClientInfo = async () => {

    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);

    let cedula = urlParams.get("id").trim();

    if (isNaN(cedula)) {
        alert("El id que se está buscando tiene una sintaxis inválida");
        return setTimeout(() => { window.location.href = "./ConsultarUsuario.html"; }, 1000);
    }

    const token = getSessionToken();
    const { data } = await axios.get(`${BACKEND_URI}/clientes/${cedula}`,configureAxiosHeaders(token));
    
    cedulaInput.value = data.cedula_cliente;
    direccionInput.value = data.direccion_cliente;
    emailInput.value = data.email_cliente;
    nombreInput.value = data.nombre_cliente;
    telefonoInput.value = data.telefono_cliente;
}

const updateClient = async (e) => {
    
    e.preventDefault();

    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);

    let cedula = urlParams.get("id").trim();

    const userData = {
        "direccion_cliente": direccionInput.value,
        "email_cliente": emailInput.value,
        "nombre_cliente": nombreInput.value,
        "telefono_cliente":telefonoInput.value
    }

    try {
        const token = getSessionToken();
        const { data } = await axios.put(`${BACKEND_URI}/clientes/${cedula}`, userData,configureAxiosHeaders(token));

        if (data) {
            alert("El cliente se ha actualizado.");
            return setTimeout(() => { window.location.href = "./ConsultarClientes.html"; }, 1000);
        }

    } catch (error) {
        if (error.message === "Network Error") {
            alert("Ha ocurrido un error de conexión con el servidor, intente de nuevo mas tarde")
        } else if (error.response.status === 400) {
            alert(error.response.data.message)   
        }
        else {
            alert("Ha ocurrido un error desconocido, intente de nuevo mas tarde")
        }
    }
}