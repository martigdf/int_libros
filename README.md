# int_libros

**Descripción resumida del Proyecto**
: esta enfocado en la **gestión y publicación de libros**, donde los usuarios pueden:
- **Publicar libros** para compartir con la comunidad.
- **Solicitar préstamos** de libros publicados por otros usuarios.
- **Aceptar o rechazar solicitudes** de préstamo de manera sencilla.
- **Visualizar y gestionar** los libros que han publicado, incluyendo la opción de **eliminarlos** si es necesario.

El sistema también incluye un **panel de administración** para la gestión general de usuarios y publicaciones.


## 🚀 **Iniciar el entorno de desarrollo**

**Todo lo realizado esta en main.**

✅ Archivo .env-example con ejemplo de .env 
<br>

✅ Para levantar contenedores, ejecuta (en la terminal): 

```bash
docker-compose up --build
```
<br>

✅ Para levantar el entorno de desarrollo, ejecuta (desde el contenedor Backend):

```bash
npm run dev
```
<br>

✅ Para levantar el entorno de desarrollo, ejecuta (desde el contenedor Frontend):

```bash
npm run start
```
<br>
**Recordar tener configurado el .env**
<br>

✅ Para poder visualizar la documentación swagger dirigirse a:

```bash
http://localhost/backend/docs
```
<br>

✅ Para visualizar en pgadmin la base de datos dirigirse a: 

```bash
http://localhost:8080
```
<br>

✅ Loguearse en pgadmin con los datos:
```bash
username: admin@admin.com
password: admin
```
<br>

✅ Asegúrate de tener instaladas las dependencias con:

```bash
npm install
```
<br>

**Las rutas creadas:**
```bash
/login
/register
/home 
/book/:id
/publish-book
/my-books
/myreque-list
/myreceived-list
/user-profile/:id

/panel-admin
/panel-admin/view-books
/panel-admin/usuarios-listados
/panel-admin/modify-user/:id
```
---
