function Login() {
  return ( 
    <div className="login">
      <h2>Iniciar Sesión</h2>
      <form className="login-form">
        <input type="text" placeholder="Usuario" />
        <input type="password" placeholder="Contraseña" />
        <button type="submit">Ingresar</button>
      </form>
    </div>
   );
}

export default Login;