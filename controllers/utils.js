const BACKEND_URI = "http://localhost:5000";


function configureAxiosHeaders(token) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }
}

function getErrorPopupMessage(message) {
    return Swal.fire(
        'Error',
        message,
        'error'
    );
}

function getInfoPopupMessage(message) {
    return Swal.fire(
        'Información',
        message,
        'question'
    );
}

function getSuccessPopupMessage(message) {
    return Swal.fire(
        'Operación Exitosa',
        message,
        'success'
    );
}

function axiosExceptionHandler(error) {
    if (!error.response) {
        getErrorPopupMessage("Ha ocurrido un error de conexión")
    } else if (error.response.status === 500) {
        getErrorMessage(error.response.data.message);
    } else if (error.response.status === 400 || error.respose.status === 409) {
        getErrorMessage(error.response.data.message);
    } else {
        getErrorMessage("Ha ocurrido un error desconocido");
    }

}

function getErrorMessage(message) {
    return `
        <div class="alert">
            <div class="alert-card">
                <div class="alert-card-header">
                    <i class="bi bi-exclamation-circle-fill"></i>
                </div>
                <div class="alert-card-body">
                    <p>${message}</p>
                </div>
            </div>
        </div>
    `
}

const getSpinner = () => (`        
    <div>
        <div class="spinner"></div>
    </div>
`)

const getGenericTable = (headers, tbodyIdName) => {
    let tableHeader = '';
    headers.forEach(header => {
        tableHeader += `<th>${header}</th>\n`
    });

    return `
        <table class="table table-dark">
            <thead>
                <tr>
                    ${tableHeader}
                </tr>
            </thead>
            <tbody id="${tbodyIdName}">
            </tbody>
        </table>
        `;
}

const getSessionToken = () => window.localStorage.getItem("token")

const verifySession = async () => {
    try {
        const token = getSessionToken();

        if (!token) {
            window.location.href = "../";
        }

        await axios.get(`${BACKEND_URI}/user/`, configureAxiosHeaders(token));
    } catch (error) {
        if (error.response.status === 403 || error.response.status === 401) {
            window.location.href = "../";
        }
    }
}

const closeSession = async () => {
    localStorage.removeItem("token");
    window.location.href = "../";
}
