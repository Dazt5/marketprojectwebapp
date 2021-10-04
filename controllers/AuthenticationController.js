const usuarioInput = document.querySelector('#usuario');
const passwordInput = document.querySelector('#password');

const login = async (e) => {
    
    e.preventDefault();

    const userData = {
        "usuario": usuarioInput.value,
        "password": passwordInput.value
    }

    try {
    
        const {data} = await axios.post('http://localhost:5000/auth/login',userData)

        if (data) {
            alert("Inicio de sesión satisfactorio");
            window.localStorage.setItem("token", data.token);
            return setTimeout(() => { window.location.href = "./usuarios/ConsultarUsuario.html"; }, 1000);
        }

    } catch (error) {
        alert(error.response.data.message)
    }
}
