const userList = document.querySelector('#user-list');
const searchUser = document.querySelector('#search-user');
const cedulaInput = document.querySelector('#cedula');
const usuarioInput = document.querySelector('#usuario');
const nombreInput = document.querySelector('#nombre');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');

/*  Constants */
const USER_ROW_ID = "user-row";
const UPDATE_USER_PATH = "./ActualizarUsuario.html";
const DELETE_USER_FUNCTIONAME = "deleteUser()";

verifySession();

async function getUsuarios() {

    //Try-catch para capturar el posible error que se pueda producir, "Error 4xx o 5xx"
    try {

        //Petición HTTP al servidor.
        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/user/`,configureAxiosHeaders(token));

        if (data.length <= 0) {

            userList.innerHTML = getErrorMessage("No existen usuarios registrados")

        } else {

            //getGenericTable = función genérica que me crea los headers y el template para la table
            //está definida en el archivo utils.js
            userList.innerHTML =
                getGenericTable(["Cédula", "Usuario", "Correo", "Nombre", "Acciones"], USER_ROW_ID);

            let rows = ``;
            //For in
            for (user of data) {
                //Template Strings
                rows +=
                    ` 
                <tr>
                    <td>${user.cedulaUsuario}</td>
                    <td>${user.usuario}</td>
                    <td>${user.emailUsuario}</td>
                    <td>${user.nombreUsuario}</td>
                    <td>
                        <a href="./ActualizarUsuario.html?id=${user.cedulaUsuario}">
                            <div class="action-buttons">  
                                <i class="bi bi-pen-fill"></i>
                                <p>Editar</p>
                            </div>
                        </a>
                        <div class="action-buttons">
                            <i class="bi bi-archive-fill" onclick="deleteUser(${user.cedulaUsuario})"></i>
                            <p>Eliminar</p>
                        </div>
                    </td>
                </tr>
                `; 
            }
            document.querySelector(`#${USER_ROW_ID}`).innerHTML = rows;
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

//Arrow function.
const getUsuarioByCedula = async (e) => {
    e.preventDefault();
    const cedula = searchUser.value;

    if (cedula.trim().length == 0) {
        return alert("Debe ingresar la cédula para poder realizar una búsqueda.")
    }

    try {
        //Petición HTTP al servidor.
        const token = getSessionToken();
        const { data } = await axios.get(`${BACKEND_URI}/user/${cedula}`,configureAxiosHeaders(token));

        if (data == null) {
            return alert("No se encuentra un usuario registrado con la cédula indicada.")
        } else {

            userList.innerHTML =
                getGenericTable(["Cédula", "Usuario", "Correo", "Nombre", "Acciones"], USER_ROW_ID);

            let row =
                `
                <tr>
                    <td>${data.cedulaUsuario}</td>
                    <td>${data.usuario}</td>
                    <td>${data.emailUsuario}</td>
                    <td>${data.nombreUsuario}</td>
                    <td>
                        <a href="./ActualizarUsuario.html?id=${data.cedulaUsuario}">
                            <div class="action-buttons">  
                                <i class="bi bi-pen-fill"></i>
                                <p>Editar</p>
                            </div>
                        </a>
                        <div class="action-buttons" >
                            <i class="bi bi-archive-fill" onclick="deleteUser(${data.cedulaUsuario})"></i>
                            <p>Eliminar</p>
                        </div>
                    </td>
                </tr> 
            `
            return document.querySelector(`#${USER_ROW_ID}`).innerHTML = row;
        }

    } catch (error) {
        console.log(error);
        if (error.message === "Network Error") {
            alert("Ha ocurrido un error de conexión con el servidor, intente de nuevo mas tarde")
        } else {
            alert("Ha ocurrido un error desconocido, intente de nuevo mas tarde")
        }
    }
}

//Eliminar usuario
const deleteUser = async (cedula) => {

    try {
        //Petición HTTP tipo DELETE al servidor.
        const token = getSessionToken();
        const { data } = await axios.delete(`${BACKEND_URI}/user/${cedula}`,configureAxiosHeaders(token));

        if (data) {
            return getUsuarios();
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

//Obtener el usuario a actualizar.
const getUserInfo = async () => {

    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);

    let cedula = urlParams.get("id").trim();

    if (isNaN(cedula)) {
        alert("El id que se está buscando tiene una sintaxis inválida");
        return setTimeout(() => { window.location.href = "./ConsultarUsuario.html"; }, 1000);
    }
    const token = getSessionToken();
    const { data } = await axios.get(`${BACKEND_URI}/user/${cedula}`,configureAxiosHeaders(token));

    cedulaInput.value = data.cedulaUsuario;
    usuarioInput.value = data.usuario;
    nombreInput.value = data.nombreUsuario;
    emailInput.value = data.emailUsuario;
    passwordInput.value = data.password;
}

//Actualizar el usuario.
const updateUser = async (e) => {

    e.preventDefault();

    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);

    let cedula = urlParams.get("id").trim();

    const userData = {
        "emailUsuario": emailInput.value,
        "nombreUsuario": nombreInput.value,
        "usuario": usuarioInput.value,
        "password": passwordInput.value
    };

    try {

        //Petición HTTP al servidor.
        const token = getSessionToken();
        const { data } = await axios.put(`${BACKEND_URI}/user/${cedula}`, userData, configureAxiosHeaders(token));

        if (data) {
            alert("El usuario se ha actualizado.");
            return setTimeout(() => { window.location.href = "./ConsultarUsuario.html"; }, 1000);
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

const createUser = async (e) => {
    e.preventDefault();
    const userData = {
        "cedulaUsuario":cedulaInput.value,
        "emailUsuario": emailInput.value,
        "nombreUsuario": nombreInput.value,
        "usuario": usuarioInput.value,
        "password": passwordInput.value
    };
    try {
        //Petición HTTP al servidor.
        const token = getSessionToken();
        const { data } = await axios.post(`${BACKEND_URI}/user/`, userData, configureAxiosHeaders(token));
        if (data) {
            alert("El usuario se ha creado.");
            return setTimeout(() => { window.location.href = "./ConsultarUsuario.html"; }, 1000);
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