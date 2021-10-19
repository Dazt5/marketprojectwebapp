const FRONTED_URI = "http://127.0.0.1:5501";
const BACKEND_URI = "http://127.0.0.1:5000"


function configureAxiosHeaders(token) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
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

const getSpiner = () => (`        
    < div id = "user-list" >
        <div class="spinner"></div>
    </div >
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
